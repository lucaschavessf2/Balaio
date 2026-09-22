const jsonServer = require('json-server')
const bodyParser = require('body-parser')
const { existsSync, copyFileSync, readFileSync } = require('node:fs')
const path = require('node:path')
const { randomUUID } = require('node:crypto')

const ok = (dados, paginacao) => ({ dados, erro: null, ...(paginacao ? { paginacao } : {}) })
const erro = (res, status, mensagem, codigo = status === 404 ? 'RECURSO_NAO_ENCONTRADO' : 'REQUISICAO_INVALIDA') => res.status(status).json({ dados: null, erro: { codigo, mensagem } })
const normalizar = (texto) => String(texto).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
const preco = (peca) => peca.preco * (1 - (peca.desconto || 0) / 100)
const gerarSlug = (texto) => normalizar(texto).replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
const emailValido = (email) => typeof email === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
const FOTO_VALIDA = /^(\/fotos\/[\w./-]+|data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+)$/
const CAMPOS_PERFIL = ['nome', 'atelie', 'historia', 'territorio', 'tecnica', 'imagem']
const CONFIGURACOES_PADRAO = { cepOrigem: '', prazoPadraoDias: 15, aceitaEncomendas: true, encomendasPausadas: false, chavePix: '' }
const LIMITE_CHAVE_PIX = 140
const semSenha = ({ senha, ...usuario }) => usuario // eslint-disable-line @typescript-eslint/no-unused-vars

function criarServidor(arquivo = path.join(__dirname, 'db.json')) {
  if (!existsSync(arquivo)) copyFileSync(path.join(__dirname, 'seed.json'), arquivo)
  const server = jsonServer.create()
  const router = jsonServer.router(arquivo)
  const db = router.db
  const seed = JSON.parse(readFileSync(path.join(__dirname, 'seed.json'), 'utf8'))
  const artesaoDaPecaNoBanco = (slug) => db.get('pecas').find({ id: slug }).value()?.artesao
  for (const colecao of Object.keys(seed)) {
    if (!db.has(colecao).value()) db.set(colecao, seed[colecao]).write()
  }
  const usuarios = db.get('usuarios')
  for (const conta of seed.usuarios) {
    if (!usuarios.find({ id: conta.id }).value() && !usuarios.find({ email: conta.email }).value()) usuarios.push(conta).value()
  }
  const vendedores = new Set(usuarios.value().filter((u) => u.papel === 'artesao').map((u) => u.artesao))
  db.get('pecas').remove((p) => !vendedores.has(p.artesao)).value()
  const artesaoPeloNome = (nome) => db.get('artesaos').value().find((a) => a.atelie === nome || a.nome === nome)?.slug
  for (const item of db.get('curadoria').value()) {
    item.artesaoSlug = item.artesaoSlug ?? artesaoDaPecaNoBanco(item.pecaSlug) ?? artesaoPeloNome(item.artesao)
  }
  db.get('curadoria').remove((c) => !vendedores.has(c.artesaoSlug)).value()
  for (const peca of db.get('pecas').value().filter((p) => !p.tipo)) {
    const original = seed.pecas.find((s) => s.id === peca.id)
    if (original) peca.tipo = original.tipo
  }
  if (!db.get('referencias.tipos').value()) db.set('referencias.tipos', seed.referencias.tipos).value()
  for (const pedido of db.get('pedidos').value().filter((p) => !p.compradorId)) {
    const dono = db.get('usuarios').value().find((u) => u.nome === pedido.compradorNome)
    if (dono) pedido.compradorId = dono.id
  }
  db.write()
  server.use(jsonServer.defaults({ static: path.join(__dirname, '../public'), logger: process.env.NODE_ENV !== 'test' }))
  server.post('/api/v1/pecas', bodyParser.json({ limit: '45mb' }))
  server.use(jsonServer.bodyParser)
  const ler = (nome) => db.get(nome).value()
  const encontrar = (nome, id) => ler(nome).find((item) => item.id === id)
  const inserir = (nome, item) => { db.get(nome).push(item).write(); return item }

  server.all(['/api/v1/usuarios*', '/api/v1/configuracoesAtelie*'], (req, res) => erro(res, 404, 'Recurso não encontrado.'))
  const configuracoesDe = (slug) => ({ ...CONFIGURACOES_PADRAO, ...(ler('configuracoesAtelie').find((c) => c.id === slug) ?? {}), id: slug })
  server.get('/api/v1/artesaos/:id/configuracoes', (req, res) => {
    if (!encontrar('artesaos', req.params.id)) return erro(res, 404, 'Artesão não encontrado.')
    res.json(ok(configuracoesDe(req.params.id)))
  })
  server.patch('/api/v1/artesaos/:id/configuracoes', (req, res) => {
    if (!encontrar('artesaos', req.params.id)) return erro(res, 404, 'Artesão não encontrado.')
    const alteracoes = {}
    for (const campo of Object.keys(CONFIGURACOES_PADRAO)) {
      if (req.body[campo] !== undefined) alteracoes[campo] = req.body[campo]
    }
    if (Object.keys(alteracoes).length === 0) return erro(res, 400, 'Nenhum campo de configuração informado.')
    if ('cepOrigem' in alteracoes && (typeof alteracoes.cepOrigem !== 'string' || !/^\d{5}-?\d{3}$/.test(alteracoes.cepOrigem))) return erro(res, 400, 'CEP de origem inválido.')
    if ('prazoPadraoDias' in alteracoes && (!Number.isInteger(alteracoes.prazoPadraoDias) || alteracoes.prazoPadraoDias < 1 || alteracoes.prazoPadraoDias > 120)) return erro(res, 400, 'O prazo padrão precisa estar entre 1 e 120 dias.')
    for (const campo of ['aceitaEncomendas', 'encomendasPausadas']) {
      if (campo in alteracoes && typeof alteracoes[campo] !== 'boolean') return erro(res, 400, 'Preferência de encomendas inválida.')
    }
    if ('chavePix' in alteracoes && (typeof alteracoes.chavePix !== 'string' || !alteracoes.chavePix.trim() || alteracoes.chavePix.length > LIMITE_CHAVE_PIX)) return erro(res, 400, 'Informe uma chave Pix válida.')
    const atualizado = { ...configuracoesDe(req.params.id), ...alteracoes }
    db.get('configuracoesAtelie').remove({ id: req.params.id }).value()
    inserir('configuracoesAtelie', atualizado)
    res.json(ok(atualizado))
  })
  server.post('/api/v1/auth/entrar', (req, res) => {
    const email = String(req.body.email ?? '').trim().toLowerCase()
    const usuario = ler('usuarios').find((u) => u.email === email && u.senha === req.body.senha)
    if (!usuario) return erro(res, 401, 'E-mail ou senha incorretos.', 'CREDENCIAIS_INVALIDAS')
    res.json(ok(semSenha(usuario)))
  })
  server.post('/api/v1/auth/cadastro', (req, res) => {
    const { nome, senha, papel, territorio, tecnica } = req.body
    const email = String(req.body.email ?? '').trim().toLowerCase()
    if (typeof nome !== 'string' || !nome.trim() || !emailValido(email)) return erro(res, 400, 'Informe nome e e-mail válidos.')
    if (typeof senha !== 'string' || senha.length < 8) return erro(res, 400, 'A senha precisa de no mínimo 8 caracteres.')
    if (!['comprador', 'artesao'].includes(papel)) return erro(res, 400, 'Perfil inválido.')
    if (ler('usuarios').some((u) => u.email === email)) return erro(res, 409, 'Já existe uma conta com este e-mail.', 'EMAIL_EM_USO')
    const usuario = { id: randomUUID(), nome: nome.trim(), email, senha, papel, imagem: '/fotos/ImagemBase.webp' }
    if (papel === 'artesao') {
      const base = gerarSlug(nome) || 'artesao'
      let slug = base
      for (let n = 2; encontrar('artesaos', slug); n++) slug = `${base}-${n}`
      db.get('artesaos').push({
        slug, id: slug, nome: usuario.nome, atelie: `Ateliê de ${usuario.nome}`, territorio: territorio || '', tecnica: tecnica || '',
        historia: '', obrasComercializadas: 0, avaliacaoMedia: 0, selo: false, imagem: usuario.imagem,
      }).value()
      usuario.artesao = slug
    }
    res.status(201).json(ok(semSenha(inserir('usuarios', usuario))))
  })
  server.patch('/api/v1/conta/:id', (req, res) => {
    const usuario = encontrar('usuarios', req.params.id)
    if (!usuario) return erro(res, 404, 'Conta não encontrada.')
    const nome = String(req.body.nome ?? '').trim()
    const email = String(req.body.email ?? '').trim().toLowerCase()
    if (!nome || !emailValido(email)) return erro(res, 400, 'Informe nome e e-mail válidos.')
    if (ler('usuarios').some((u) => u.email === email && u.id !== usuario.id)) return erro(res, 409, 'Já existe uma conta com este e-mail.', 'EMAIL_EM_USO')
    const telefone = String(req.body.telefone ?? '').trim()
    const atualizado = db.get('usuarios').find({ id: usuario.id }).assign({ nome, email, telefone }).write()
    res.json(ok(semSenha(atualizado)))
  })
  server.post('/api/v1/conta/:id/senha', (req, res) => {
    const usuario = encontrar('usuarios', req.params.id)
    if (!usuario) return erro(res, 404, 'Conta não encontrada.')
    if (usuario.senha !== req.body.senhaAtual) return erro(res, 401, 'A senha atual não confere.', 'SENHA_ATUAL_INVALIDA')
    if (typeof req.body.novaSenha !== 'string' || req.body.novaSenha.length < 8) return erro(res, 400, 'A nova senha precisa de no mínimo 8 caracteres.')
    db.get('usuarios').find({ id: usuario.id }).assign({ senha: req.body.novaSenha }).write()
    res.json(ok({ id: usuario.id }))
  })

  const artesaoDaPeca = (slug) => encontrar('pecas', slug)?.artesao
  const artesaoDoPedido = (id) => artesaoDaPeca((encontrar('pedidos', id) ?? ler('pedidosPendentes').find((p) => p.id === id))?.pecaSlug)
  server.get('/api/v1/artesao/pedidos-pendentes', (req, res) => {
    res.json(ok(ler('pedidosPendentes').filter((p) => !req.query.artesao || artesaoDaPeca(p.pecaSlug) === req.query.artesao)))
  })
  server.get('/api/v1/artesao/conversas', (req, res) => {
    res.json(ok(ler('conversasArtesao').filter((c) => !req.query.artesao || artesaoDoPedido(c.id) === req.query.artesao)))
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
    let lista = ler('pecas').filter((p) => !p.inativadoEm && (!p.situacao || p.situacao === 'publicada'))
    const q = normalizar(req.query.q || '').trim()
    if (q) lista = lista.filter((p) => normalizar([p.nome, p.artesao, encontrar('artesaos', p.artesao)?.nome, p.territorio, p.tecnica, p.categoria, p.tipo].join(' ')).includes(q))
    if (req.query.desconto === 'true') lista = lista.filter((p) => (p.desconto || 0) > 0)
    for (const campo of ['tecnica', 'territorio', 'categoria', 'disponibilidade', 'tipo']) {
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
  server.get('/api/v1/pecas/:id/historico', (req, res) => {
    const peca = encontrar('pecas', req.params.id)
    if (!peca) return erro(res, 404, 'Peça não encontrada.')
    res.json(ok(peca))
  })
  server.get('/api/v1/pecas/:id/relacionadas', (req, res) => {
    const peca = encontrar('pecas', req.params.id)
    if (!peca) return erro(res, 404, 'Peça não encontrada.')
    const limite = Math.max(1, Math.min(100, Number(req.query.limite) || 3))
    res.json(ok(ler('pecas').filter((p) => !p.inativadoEm && (!p.situacao || p.situacao === 'publicada') && p.id !== peca.id && p.tecnica === peca.tecnica).slice(0, limite)))
  })
  server.get('/api/v1/pecas/:id', (req, res) => {
    const peca = encontrar('pecas', req.params.id)
    if (!peca || peca.inativadoEm) return erro(res, 404, 'Peça não encontrada.')
    res.json(ok(peca))
  })
  server.get('/api/v1/videos', (req, res) => res.json(ok(ler('videos').filter((v) => req.query.painel === 'true' || !v.situacao || v.situacao === 'publicada'))))
  server.post('/api/v1/pecas', (req, res) => {
    const peca = { ...req.body, id: req.body.slug }
    if (!peca.slug || !peca.nome || !encontrar('artesaos', peca.artesao)) return erro(res, 400, 'Informe nome, slug e artesão válido.')
    if (!ler('referencias').tipos.includes(peca.tipo)) return erro(res, 400, 'Escolha um tipo de peça válido.')
    if (encontrar('pecas', peca.id)) return erro(res, 409, 'Esta peça já existe.')
    if (peca.situacao !== 'rascunho' && (!Number.isFinite(peca.preco) || peca.preco <= 0)) return erro(res, 400, 'Preço inválido.')
    if (peca.situacao === 'curadoria') {
      db.get('curadoria').push({ id: randomUUID(), pecaSlug: peca.slug, peca: peca.nome, artesao: encontrar('artesaos', peca.artesao).nome, artesaoSlug: peca.artesao, enviadoEm: 'agora', motivo: 'Nova publicação' }).value()
    }
    res.status(201).json(ok(inserir('pecas', peca)))
  })
  server.patch('/api/v1/pecas/:id', (req, res) => {
    const peca = encontrar('pecas', req.params.id)
    if (!peca) return erro(res, 404, 'Peça não encontrada.')
    const campos = ['nome', 'territorio', 'tecnica', 'categoria', 'tipo', 'historia', 'preco', 'disponibilidade', 'prazoProducaoDias', 'imagem', 'fotos', 'ordemFotos', 'situacao', 'inativadoEm']
    const alteracoes = Object.fromEntries(campos.filter((campo) => req.body[campo] !== undefined).map((campo) => [campo, req.body[campo]]))
    if (alteracoes.nome !== undefined && (!String(alteracoes.nome).trim() || String(alteracoes.nome).length > 180)) return erro(res, 400, 'Informe um nome válido para a peça.')
    if (alteracoes.preco !== undefined && (!Number.isFinite(alteracoes.preco) || alteracoes.preco < 0)) return erro(res, 400, 'Preço inválido.')
    res.json(ok(db.get('pecas').find({ id: req.params.id }).assign(alteracoes).write()))
  })
  server.post('/api/v1/admin/curadoria/:id/decisao', (req, res) => {
    const item = encontrar('curadoria', req.params.id)
    if (!item) return erro(res, 404, 'Item não encontrado.')
    if (!['aprovada', 'ajuste'].includes(req.body.decisao)) return erro(res, 400, 'Decisão inválida.')
    if (item.pecaSlug) db.get('pecas').find({ id: item.pecaSlug }).assign({ situacao: req.body.decisao === 'aprovada' ? 'publicada' : 'rascunho' }).value()
    db.get('curadoria').remove({ id: item.id }).write()
    res.json(ok({ ...item, decisao: req.body.decisao }))
  })
  server.patch('/api/v1/artesaos/:id', (req, res) => {
    if (!encontrar('artesaos', req.params.id)) return erro(res, 404, 'Artesão não encontrado.')
    const perfil = {}
    for (const campo of CAMPOS_PERFIL) {
      if (req.body[campo] !== undefined) perfil[campo] = typeof req.body[campo] === 'string' ? req.body[campo].trim() : req.body[campo]
    }
    if (Object.values(perfil).some((valor) => typeof valor !== 'string')) return erro(res, 400, 'Os campos do perfil precisam ser texto.')
    if (perfil.nome === '' || perfil.atelie === '') return erro(res, 400, 'Informe o nome do ateliê e o seu nome de artesão.')
    if (perfil.historia && perfil.historia.length > 2000) return erro(res, 400, 'A história pode ter no máximo 2000 caracteres.')
    if (perfil.imagem !== undefined && !FOTO_VALIDA.test(perfil.imagem)) return erro(res, 400, 'Foto em formato inválido. Use JPG, PNG ou WebP.', 'FOTO_INVALIDA')
    res.json(ok(db.get('artesaos').find({ id: req.params.id }).assign(perfil).write()))
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
    const { itens, freteId, endereco, meio, compradorId } = req.body
    const comprador = encontrar('usuarios', compradorId)
    if (!comprador) return erro(res, 401, 'Entre na sua conta para finalizar a compra.', 'NAO_AUTENTICADO')
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
      compradorId: comprador.id, compradorNome: comprador.nome, data: new Date().toLocaleDateString('pt-BR'),
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
