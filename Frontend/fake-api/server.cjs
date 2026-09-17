const jsonServer = require('json-server')
const { existsSync, copyFileSync } = require('node:fs')
const path = require('node:path')
const { randomBytes, randomUUID, scryptSync, timingSafeEqual } = require('node:crypto')

const ok = (dados, paginacao) => ({ dados, erro: null, ...(paginacao ? { paginacao } : {}) })
const erro = (res, status, mensagem, codigo) => res.status(status).json({ dados: null, erro: { codigo: codigo ?? (status === 404 ? 'RECURSO_NAO_ENCONTRADO' : 'REQUISICAO_INVALIDA'), mensagem } })
const normalizar = (texto) => String(texto).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
const preco = (peca) => peca.preco * (1 - (peca.desconto || 0) / 100)
const COOKIE_SESSAO = 'balaio_sessao'
const emailValido = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
const senhaProtegida = (senha, sal = randomBytes(16).toString('hex')) => ({ sal, hash: scryptSync(senha, sal, 64).toString('hex') })
const senhaConfere = (senha, usuario) => {
  if (!usuario.senhaSal || !usuario.senhaHash) return false
  const esperado = Buffer.from(usuario.senhaHash, 'hex')
  const recebido = scryptSync(senha, usuario.senhaSal, 64)
  return esperado.length === recebido.length && timingSafeEqual(esperado, recebido)
}
const usuarioPublico = (usuario) => {
  const publico = { ...usuario }
  delete publico.senhaHash
  delete publico.senhaSal
  return publico
}
const cookies = (req) => Object.fromEntries(String(req.headers.cookie || '').split(';').map((item) => item.trim().split('=').map(decodeURIComponent)).filter(([chave]) => chave))

function criarServidor(arquivo = path.join(__dirname, 'db.json')) {
  if (!existsSync(arquivo)) copyFileSync(path.join(__dirname, 'seed.json'), arquivo)
  const server = jsonServer.create()
  const router = jsonServer.router(arquivo)
  const db = router.db
  server.use(jsonServer.defaults({ static: path.join(__dirname, '../public'), logger: process.env.NODE_ENV !== 'test' }))
  server.use(jsonServer.bodyParser)
  const ler = (nome) => db.get(nome).value()
  const encontrar = (nome, id) => ler(nome).find((item) => item.id === id)
  const inserir = (nome, item) => { db.get(nome).push(item).write(); return item }

  if (!db.has('usuarios').value()) db.set('usuarios', []).write()
  if (!db.has('sessoes').value()) db.set('sessoes', []).write()
  const demonstracao = ler('usuario')
  if (demonstracao?.email && !ler('usuarios').some((usuario) => usuario.email === demonstracao.email.toLowerCase())) {
    const senha = senhaProtegida('balaio123')
    inserir('usuarios', { id: randomUUID(), ...demonstracao, email: demonstracao.email.toLowerCase(), perfil: 'comprador', senhaSal: senha.sal, senhaHash: senha.hash })
  }

  const tokenDaRequisicao = (req) => {
    const autorizacao = req.headers.authorization
    if (autorizacao?.startsWith('Bearer ')) return autorizacao.slice(7)
    return cookies(req)[COOKIE_SESSAO]
  }
  const usuarioDaRequisicao = (req) => {
    const sessao = ler('sessoes').find((item) => item.id === tokenDaRequisicao(req))
    return sessao ? encontrar('usuarios', sessao.usuarioId) : null
  }
  const abrirSessao = (res, usuario) => {
    const sessao = { id: randomBytes(32).toString('hex'), usuarioId: usuario.id, criadaEm: new Date().toISOString() }
    inserir('sessoes', sessao)
    res.cookie(COOKIE_SESSAO, sessao.id, { httpOnly: true, sameSite: 'lax', maxAge: 7 * 24 * 60 * 60 * 1000, path: '/' })
  }
  const exigirUsuario = (req, res) => {
    const usuario = usuarioDaRequisicao(req)
    if (!usuario) erro(res, 401, 'Entre na sua conta para continuar.', 'NAO_AUTENTICADO')
    return usuario
  }

  server.post('/api/v1/auth/cadastro', (req, res) => {
    const nome = String(req.body.nome || '').trim()
    const email = String(req.body.email || '').trim().toLowerCase()
    const senhaInformada = String(req.body.senha || '')
    const perfil = req.body.perfil === 'artesao' ? 'artesao' : 'comprador'
    if (!nome || !emailValido(email) || senhaInformada.length < 8) return erro(res, 400, 'Informe nome, e-mail válido e senha com pelo menos 8 caracteres.')
    if (ler('usuarios').some((usuario) => usuario.email === email)) return erro(res, 409, 'Já existe uma conta com este e-mail.', 'EMAIL_EM_USO')
    const senha = senhaProtegida(senhaInformada)
    const usuario = {
      id: randomUUID(), nome, email, perfil, imagem: '/fotos/jarra-cabocla.svg',
      ...(perfil === 'artesao' ? { territorio: String(req.body.territorio || ''), tecnica: String(req.body.tecnica || '') } : {}),
      senhaSal: senha.sal, senhaHash: senha.hash,
    }
    inserir('usuarios', usuario)
    db.set('usuario', usuarioPublico(usuario)).write()
    abrirSessao(res, usuario)
    res.status(201).json(ok(usuarioPublico(usuario)))
  })

  server.post('/api/v1/auth/login', (req, res) => {
    const email = String(req.body.email || '').trim().toLowerCase()
    const usuario = ler('usuarios').find((item) => item.email === email)
    if (!usuario || !senhaConfere(String(req.body.senha || ''), usuario)) return erro(res, 401, 'E-mail ou senha inválidos.', 'CREDENCIAIS_INVALIDAS')
    abrirSessao(res, usuario)
    res.json(ok(usuarioPublico(usuario)))
  })

  server.post('/api/v1/auth/logout', (req, res) => {
    const token = tokenDaRequisicao(req)
    if (token) db.get('sessoes').remove({ id: token }).write()
    res.clearCookie(COOKIE_SESSAO, { path: '/' })
    res.json(ok({ encerrada: true }))
  })

  server.get('/api/v1/usuario', (req, res) => {
    const usuario = exigirUsuario(req, res)
    if (usuario) res.json(ok(usuarioPublico(usuario)))
  })

  server.patch('/api/v1/usuario', (req, res) => {
    const usuario = exigirUsuario(req, res)
    if (!usuario) return
    const nome = String(req.body.nome ?? usuario.nome).trim()
    const email = String(req.body.email ?? usuario.email).trim().toLowerCase()
    if (!nome || !emailValido(email)) return erro(res, 400, 'Informe um nome e um e-mail válido.')
    if (ler('usuarios').some((item) => item.id !== usuario.id && item.email === email)) return erro(res, 409, 'Já existe uma conta com este e-mail.', 'EMAIL_EM_USO')
    const alteracoes = { nome, email, telefone: String(req.body.telefone ?? usuario.telefone ?? '').trim(), tipoComprador: String(req.body.tipoComprador ?? usuario.tipoComprador ?? 'final') }
    db.get('usuarios').find({ id: usuario.id }).assign(alteracoes).write()
    const atualizado = encontrar('usuarios', usuario.id)
    db.set('usuario', usuarioPublico(atualizado)).write()
    res.json(ok(usuarioPublico(atualizado)))
  })

  server.get('/api/v1/eventos', (req, res) => {
    const lista = [...ler('eventos')]
    if (req.query.lat !== undefined && req.query.lng !== undefined) {
      const lat = Number(req.query.lat), lng = Number(req.query.lng)
      if (!Number.isFinite(lat) || !Number.isFinite(lng) || Math.abs(lat) > 90 || Math.abs(lng) > 180) return erro(res, 400, 'Coordenadas inválidas.')
      const rad = (n) => n * Math.PI / 180
      const distancia = (e) => Math.sin(rad(e.lat - lat) / 2) ** 2 + Math.cos(rad(lat)) * Math.cos(rad(e.lat)) * Math.sin(rad(e.lng - lng) / 2) ** 2
      lista.sort((a, b) => distancia(a) - distancia(b))
    }
    res.json(ok(lista))
  })

  server.get('/api/v1/pecas', (req, res) => {
    let lista = ler('pecas').filter((p) => !p.situacao || p.situacao === 'publicada')
    const q = normalizar(req.query.q || '').trim()
    if (q) lista = lista.filter((p) => normalizar([p.nome, p.artesao, encontrar('artesaos', p.artesao)?.nome, p.territorio, p.tecnica, p.categoria].join(' ')).includes(q))
    for (const campo of ['tecnica', 'territorio', 'categoria', 'disponibilidade']) {
      if (req.query[campo]) lista = lista.filter((p) => p[campo] === req.query[campo])
    }
    if (req.query.ordenar === 'preco-asc') lista.sort((a, b) => preco(a) - preco(b))
    if (req.query.ordenar === 'preco-desc') lista.sort((a, b) => preco(b) - preco(a))
    if (req.query.ordenar === 'avaliacao') lista.sort((a, b) => (b.avaliacao || 0) - (a.avaliacao || 0))
    if (req.query.ordenar === 'recentes') lista.reverse()
    const tamanho = Math.min(100, Math.max(1, Math.floor(Number(req.query.tamanho) || lista.length || 1)))
    const total = lista.length
    const totalPaginas = Math.max(1, Math.ceil(total / tamanho))
    const pagina = Math.min(totalPaginas, Math.max(1, Math.floor(Number(req.query.pagina) || 1)))
    res.json(ok(lista.slice((pagina - 1) * tamanho, pagina * tamanho), { pagina, tamanho, total, totalPaginas }))
  })
  server.get('/api/v1/pecas/:id/relacionadas', (req, res) => {
    const peca = encontrar('pecas', req.params.id)
    if (!peca) return erro(res, 404, 'Peça não encontrada.')
    const limite = Math.max(1, Math.min(100, Number(req.query.limite) || 3))
    res.json(ok(ler('pecas').filter((p) => (!p.situacao || p.situacao === 'publicada') && p.id !== peca.id && p.tecnica === peca.tecnica).slice(0, limite)))
  })
  server.get('/api/v1/videos', (req, res) => res.json(ok(ler('videos').filter((v) => req.query.painel === 'true' || !v.situacao || v.situacao === 'publicada'))))
  server.post('/api/v1/pecas', (req, res) => {
    const peca = { ...req.body, id: req.body.slug }
    if (!peca.slug || !peca.nome || !encontrar('artesaos', peca.artesao)) return erro(res, 400, 'Informe nome, slug e artesão válido.')
    if (encontrar('pecas', peca.id)) return erro(res, 409, 'Esta peça já existe.')
    if (peca.situacao !== 'rascunho' && (!Number.isFinite(peca.preco) || peca.preco <= 0)) return erro(res, 400, 'Preço inválido.')
    if (peca.situacao === 'curadoria') {
      db.get('curadoria').push({ id: randomUUID(), pecaSlug: peca.slug, peca: peca.nome, artesao: encontrar('artesaos', peca.artesao).nome, enviadoEm: 'agora', motivo: 'Nova publicação' }).value()
    }
    res.status(201).json(ok(inserir('pecas', peca)))
  })
  server.post('/api/v1/admin/curadoria/:id/decisao', (req, res) => {
    const item = encontrar('curadoria', req.params.id)
    if (!item) return erro(res, 404, 'Item não encontrado.')
    if (!['aprovada', 'ajuste'].includes(req.body.decisao)) return erro(res, 400, 'Decisão inválida.')
    if (item.pecaSlug) db.get('pecas').find({ id: item.pecaSlug }).assign({ situacao: req.body.decisao === 'aprovada' ? 'publicada' : 'rascunho' }).value()
    db.get('curadoria').remove({ id: item.id }).write()
    res.json(ok({ ...item, decisao: req.body.decisao }))
  })
  server.get('/api/v1/artesaos/:id/pecas', (req, res) => {
    if (!encontrar('artesaos', req.params.id)) return erro(res, 404, 'Artesão não encontrado.')
    res.json(ok(ler('pecas').filter((p) => p.artesao === req.params.id)))
  })
  for (const [recurso, filho, colecao, chave] of [['pedidos', 'conversa', 'mensagens', 'pedidoId'], ['videos', 'comentarios', 'comentarios', 'videoId']]) {
    server.get(`/api/v1/${recurso}/:id/${filho}`, (req, res) => {
      if (!encontrar(recurso, req.params.id)) return erro(res, 404, 'Recurso não encontrado.')
      res.json(ok(ler(colecao).filter((item) => item[chave] === req.params.id)))
    })
    server.post(`/api/v1/${recurso}/:id/${filho}`, (req, res) => {
      if (!encontrar(recurso, req.params.id)) return erro(res, 404, 'Recurso não encontrado.')
      if (typeof req.body.texto !== 'string' || !req.body.texto.trim()) return erro(res, 400, 'Informe o texto.')
      const item = { ...req.body, texto: req.body.texto.trim(), id: randomUUID(), [chave]: req.params.id }
      res.status(201).json(ok(inserir(colecao, item)))
    })
  }
  server.post('/api/v1/checkout', (req, res) => {
    const { itens, freteId, endereco, meio } = req.body
    const frete = ler('fretes').find((f) => f.id === freteId)
    if (!Array.isArray(itens) || !itens.length || !frete || !endereco || !['pix', 'cartao', 'boleto'].includes(meio)) return erro(res, 400, 'Confira os itens, endereço, frete e pagamento.')
    if (['cep', 'endereco', 'cidade', 'estado'].some((campo) => typeof endereco[campo] !== 'string' || !endereco[campo].trim())) return erro(res, 400, 'Endereço incompleto.')
    if (new Set(itens.map((item) => item?.slug)).size !== itens.length) return erro(res, 400, 'Há peças duplicadas na compra.')
    let subtotal = 0
    for (const item of itens) {
      if (!item) return erro(res, 400, 'Item inválido.')
      const peca = encontrar('pecas', item.slug)
      if (!peca || !Number.isInteger(item.quantidade) || item.quantidade < 1 || item.quantidade > 3 || (peca.disponibilidade === 'unica' && item.quantidade !== 1)) return erro(res, 400, 'Peça ou quantidade inválida.')
      subtotal += preco(peca) * item.quantidade
    }
    const pedido = {
      id: `PE-${Date.now()}-${randomUUID().slice(0, 8)}`, pecaSlug: itens[0].slug, itens,
      compradorNome: (usuarioDaRequisicao(req) ?? ler('usuario')).nome, data: new Date().toLocaleDateString('pt-BR'),
      total: Math.round((subtotal + frete.valor) * 100) / 100, estado: 'confirmado', avaliado: false,
      endereco, meio, freteId, simulado: true,
      etapas: [{ estado: 'confirmado', titulo: 'Pedido confirmado', detalhe: 'Compra de demonstração registrada.', concluida: true, atual: true }],
    }
    res.status(201).json(ok(inserir('pedidos', pedido)))
  })
  server.post('/api/v1/pedidos/:id/avaliacao', (req, res) => {
    const pedido = encontrar('pedidos', req.params.id)
    if (!pedido) return erro(res, 404, 'Pedido não encontrado.')
    if (pedido.estado !== 'entregue' || pedido.avaliado) return erro(res, 409, 'Este pedido ainda não pode ser avaliado ou já foi avaliado.')
    if (!Number.isInteger(req.body.nota) || req.body.nota < 1 || req.body.nota > 5) return erro(res, 400, 'Escolha uma nota entre 1 e 5.')
    const avaliacao = { ...req.body, id: randomUUID(), pedidoId: pedido.id }
    db.get('avaliacoes').push(avaliacao).value()
    db.get('pedidos').find({ id: pedido.id }).assign({ avaliado: true }).write()
    res.status(201).json(ok(avaliacao))
  })
  server.post('/api/v1/admin/mediacoes', (req, res, next) => {
    if (!encontrar('pedidos', req.body.pedido)) return erro(res, 404, 'Pedido não encontrado.')
    if (!req.body.relato?.trim() || !req.body.assunto?.trim()) return erro(res, 400, 'Informe o assunto e o relato.')
    if (ler('mediacoes').some((m) => m.pedido === req.body.pedido)) return erro(res, 409, 'Já existe uma mediação para este pedido.')
    next()
  })
  server.use(jsonServer.rewriter({
    '/api/v1/artesao/conversas': '/conversasArtesao',
    '/api/v1/artesao/pedidos-pendentes': '/pedidosPendentes',
    '/api/v1/admin/curadoria*': '/curadoria$1',
    '/api/v1/admin/mediacoes*': '/mediacoes$1',
    '/api/v1/*': '/$1',
  }))
  server.use((req, res, next) => {
    if (req.method === 'POST' && ['pecas', 'artesaos', 'coletivos', 'eventos'].includes(req.path.slice(1))) {
      if (!req.body.slug || !req.body.nome) return erro(res, 400, 'Informe slug e nome.')
      if (encontrar(req.path.slice(1), req.body.slug)) return erro(res, 409, 'Este identificador já existe.')
      req.body.id = req.body.slug
    }
    next()
  })
  router.render = (req, res) => {
    if (res.statusCode >= 400) return erro(res, res.statusCode, 'Recurso não encontrado ou operação inválida.')
    res.json(ok(res.locals.data))
  }
  server.use(router)
  // Inclui erros de JSON inválido no mesmo contrato consumido pelo frontend.
  server.use((error, req, res, next) => { // eslint-disable-line @typescript-eslint/no-unused-vars
    erro(res, error.status || 500, error.status === 400 ? 'JSON inválido.' : 'Falha ao processar a requisição.')
  })
  return server
}

if (require.main === module) {
  const porta = Number(process.env.FAKE_API_PORT || 3001)
  criarServidor().listen(porta, '127.0.0.1', () => console.log(`Fake API: http://127.0.0.1:${porta}/api/v1`))
}
module.exports = { criarServidor }
