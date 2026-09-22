const jsonServer = require('json-server')
const bodyParser = require('body-parser')
const { existsSync, copyFileSync, readFileSync } = require('node:fs')
const path = require('node:path')
const { randomBytes, randomUUID, scryptSync, timingSafeEqual } = require('node:crypto')

const ok = (dados, paginacao) => ({ dados, erro: null, ...(paginacao ? { paginacao } : {}) })
const erro = (res, status, mensagem, codigo) => res.status(status).json({ dados: null, erro: { codigo: codigo ?? (status === 404 ? 'RECURSO_NAO_ENCONTRADO' : 'REQUISICAO_INVALIDA'), mensagem } })
const normalizar = (texto) => String(texto).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
const slugificar = (texto) => normalizar(texto).replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
const preco = (peca) => peca.preco * (1 - (peca.desconto || 0) / 100)
const FOTO_VALIDA = /^(\/fotos\/[\w./-]+|data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+)$/
const CAMPOS_PERFIL = ['nome', 'atelie', 'historia', 'territorio', 'tecnica', 'imagem']
const CONFIGURACOES_PADRAO = { cepOrigem: '', prazoPadraoDias: 15, aceitaEncomendas: true, encomendasPausadas: false, chavePix: '' }
const LIMITE_CHAVE_PIX = 140
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
  delete publico.senha
  return publico
}
const cookies = (req) => Object.fromEntries(String(req.headers.cookie || '').split(';').map((item) => item.trim().split('=').map(decodeURIComponent)).filter(([chave]) => chave))

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
  for (const conta of usuarios.value()) {
    if (!conta.senhaHash) {
      const senha = senhaProtegida(String(conta.senha ?? 'balaio123'))
      conta.senhaSal = senha.sal
      conta.senhaHash = senha.hash
      delete conta.senha
    }
    conta.papel = conta.papel ?? conta.perfil ?? 'comprador'
    conta.perfil = conta.perfil ?? (conta.papel === 'artesao' ? 'artesao' : 'comprador')
    conta.artesaoId = conta.artesaoId ?? conta.artesao
    conta.artesao = conta.artesao ?? conta.artesaoId
    if (!Array.isArray(conta.enderecos)) conta.enderecos = []
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
    const alteracoes = Object.fromEntries(Object.keys(CONFIGURACOES_PADRAO).filter((campo) => req.body[campo] !== undefined).map((campo) => [campo, req.body[campo]]))
    if (!Object.keys(alteracoes).length) return erro(res, 400, 'Nenhum campo de configuração informado.')
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

  for (const [colecao, inicial] of [['usuarios', []], ['sessoes', []], ['estadosCliente', []], ['perguntas', []], ['recuperacoes', []]]) {
    if (!db.has(colecao).value()) db.set(colecao, inicial).write()
  }
  const demonstracao = ler('usuario')
  if (demonstracao?.email && !ler('usuarios').some((usuario) => usuario.email === demonstracao.email.toLowerCase())) {
    const senha = senhaProtegida('balaio123')
    inserir('usuarios', { id: randomUUID(), ...demonstracao, email: demonstracao.email.toLowerCase(), perfil: 'comprador', senhaSal: senha.sal, senhaHash: senha.hash })
  }
  const contaDemonstracao = ler('usuarios').find((usuario) => usuario.email === demonstracao?.email?.toLowerCase())
  if (contaDemonstracao) {
    db.get('pedidos').filter((pedido) => !pedido.usuarioId).each((pedido) => { pedido.usuarioId = contaDemonstracao.id }).write()
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
  const estadoDaRequisicao = (req, res) => {
    const usuario = usuarioDaRequisicao(req)
    let clienteId = usuario ? `usuario:${usuario.id}` : cookies(req).balaio_cliente
    if (!clienteId) {
      clienteId = `visitante:${randomBytes(16).toString('hex')}`
      res.cookie('balaio_cliente', clienteId, { httpOnly: true, sameSite: 'lax', maxAge: 365 * 24 * 60 * 60 * 1000, path: '/' })
    }
    let estado = encontrar('estadosCliente', clienteId)
    if (!estado) estado = inserir('estadosCliente', { id: clienteId, favoritos: [], sacola: [], historicoBusca: [], videosCurtidos: [], videosSalvos: [] })
    const faltantes = Object.fromEntries(['favoritos', 'sacola', 'historicoBusca', 'videosCurtidos', 'videosSalvos'].filter((campo) => !Array.isArray(estado[campo])).map((campo) => [campo, []]))
    if (Object.keys(faltantes).length) {
      db.get('estadosCliente').find({ id: estado.id }).assign(faltantes).write()
      estado = encontrar('estadosCliente', estado.id)
    }
    return estado
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
    const perfil = (req.body.perfil ?? req.body.papel) === 'artesao' ? 'artesao' : 'comprador'
    if (req.body.papel === 'admin') return erro(res, 400, 'Perfil inválido.')
    if (!nome || !emailValido(email) || senhaInformada.length < 8) return erro(res, 400, 'Informe nome, e-mail válido e senha com pelo menos 8 caracteres.')
    if (ler('usuarios').some((usuario) => usuario.email === email)) return erro(res, 409, 'Já existe uma conta com este e-mail.', 'EMAIL_EM_USO')
    const senha = senhaProtegida(senhaInformada)
    const usuario = {
      id: randomUUID(), nome, email, perfil, papel: perfil, imagem: '/fotos/jarra-cabocla.svg',
      enderecos: [],
      ...(perfil === 'artesao' ? { territorio: String(req.body.territorio || ''), tecnica: String(req.body.tecnica || '') } : {}),
      senhaSal: senha.sal, senhaHash: senha.hash,
    }
    if (perfil === 'artesao') {
      const base = slugificar(nome) || `artesao-${randomUUID().slice(0, 8)}`
      let slug = base, sufixo = 2
      while (encontrar('artesaos', slug)) slug = `${base}-${sufixo++}`
      const artesao = {
        id: slug, slug, nome, atelie: `Ateliê de ${nome}`, territorio: usuario.territorio,
        tecnica: usuario.tecnica, historia: '', obrasComercializadas: 0, avaliacaoMedia: 0,
        selo: false, imagem: '/fotos/ImagemBase.webp', cepOrigem: '', prazoPadraoDias: 15,
        aceitaEncomendas: true, chavePix: email,
      }
      inserir('artesaos', artesao)
      usuario.artesaoId = slug
      usuario.artesao = slug
    }
    inserir('usuarios', usuario)
    db.set('usuario', usuarioPublico(usuario)).write()
    abrirSessao(res, usuario)
    res.status(201).json(ok(usuarioPublico(usuario)))
  })

  server.post(['/api/v1/auth/login', '/api/v1/auth/entrar'], (req, res) => {
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

  server.patch('/api/v1/conta/:id', (req, res) => {
    const usuario = exigirUsuario(req, res)
    if (!usuario) return
    if (usuario.id !== req.params.id) return erro(res, 403, 'Conta de outro usuário.', 'SEM_PERMISSAO')
    const nome = String(req.body.nome ?? usuario.nome).trim()
    const email = String(req.body.email ?? usuario.email).trim().toLowerCase()
    if (!nome || !emailValido(email)) return erro(res, 400, 'Informe nome e e-mail válidos.')
    if (ler('usuarios').some((u) => u.email === email && u.id !== usuario.id)) return erro(res, 409, 'Já existe uma conta com este e-mail.', 'EMAIL_EM_USO')
    const telefone = String(req.body.telefone ?? usuario.telefone ?? '').trim()
    res.json(ok(usuarioPublico(db.get('usuarios').find({ id: usuario.id }).assign({ nome, email, telefone }).write())))
  })
  server.post('/api/v1/conta/:id/senha', (req, res) => {
    const usuario = exigirUsuario(req, res)
    if (!usuario) return
    if (usuario.id !== req.params.id) return erro(res, 403, 'Conta de outro usuário.', 'SEM_PERMISSAO')
    if (!senhaConfere(String(req.body.senhaAtual ?? ''), usuario)) return erro(res, 401, 'A senha atual não confere.', 'SENHA_ATUAL_INVALIDA')
    if (typeof req.body.novaSenha !== 'string' || req.body.novaSenha.length < 8) return erro(res, 400, 'A nova senha precisa de no mínimo 8 caracteres.')
    const senha = senhaProtegida(req.body.novaSenha)
    db.get('usuarios').find({ id: usuario.id }).assign({ senhaSal: senha.sal, senhaHash: senha.hash }).write()
    res.json(ok({ id: usuario.id }))
  })

  server.get('/api/v1/usuario/enderecos', (req, res) => {
    const usuario = exigirUsuario(req, res)
    if (usuario) res.json(ok(usuario.enderecos ?? []))
  })
  server.post('/api/v1/usuario/enderecos', (req, res) => {
    const usuario = exigirUsuario(req, res)
    if (!usuario) return
    const endereco = { ...req.body, id: randomUUID(), principal: !(usuario.enderecos ?? []).length || Boolean(req.body.principal) }
    if (!endereco.apelido?.trim() || !endereco.rua?.trim() || !endereco.cep?.trim()) return erro(res, 400, 'Informe nome, rua e CEP do endereço.')
    let enderecos = [...(usuario.enderecos ?? [])]
    if (endereco.principal) enderecos = enderecos.map((item) => ({ ...item, principal: false }))
    enderecos.push(endereco)
    db.get('usuarios').find({ id: usuario.id }).assign({ enderecos }).write()
    res.status(201).json(ok(endereco))
  })
  server.patch('/api/v1/usuario/enderecos/:id', (req, res) => {
    const usuario = exigirUsuario(req, res)
    if (!usuario) return
    const atual = (usuario.enderecos ?? []).find((item) => item.id === req.params.id)
    if (!atual) return erro(res, 404, 'Endereço não encontrado.')
    let enderecos = (usuario.enderecos ?? []).map((item) => item.id === atual.id ? { ...item, ...req.body, id: atual.id } : item)
    if (req.body.principal) enderecos = enderecos.map((item) => ({ ...item, principal: item.id === atual.id }))
    db.get('usuarios').find({ id: usuario.id }).assign({ enderecos }).write()
    res.json(ok(enderecos.find((item) => item.id === atual.id)))
  })
  server.delete('/api/v1/usuario/enderecos/:id', (req, res) => {
    const usuario = exigirUsuario(req, res)
    if (!usuario) return
    const atual = (usuario.enderecos ?? []).find((item) => item.id === req.params.id)
    if (!atual) return erro(res, 404, 'Endereço não encontrado.')
    let enderecos = (usuario.enderecos ?? []).filter((item) => item.id !== atual.id)
    if (atual.principal && enderecos.length) enderecos = enderecos.map((item, indice) => ({ ...item, principal: indice === 0 }))
    db.get('usuarios').find({ id: usuario.id }).assign({ enderecos }).write()
    res.json(ok(atual))
  })

  server.get('/api/v1/artesao/me', (req, res) => {
    const usuario = exigirUsuario(req, res)
    if (!usuario) return
    if (usuario.perfil !== 'artesao' || !usuario.artesaoId) return erro(res, 403, 'Esta conta não possui um ateliê.', 'PERFIL_INVALIDO')
    const artesao = encontrar('artesaos', usuario.artesaoId)
    if (!artesao) return erro(res, 404, 'Ateliê não encontrado.')
    res.json(ok(artesao))
  })
  server.patch('/api/v1/artesao/me', (req, res) => {
    const usuario = exigirUsuario(req, res)
    if (!usuario) return
    if (usuario.perfil !== 'artesao' || !usuario.artesaoId) return erro(res, 403, 'Esta conta não possui um ateliê.', 'PERFIL_INVALIDO')
    const permitidos = ['nome', 'atelie', 'historia', 'territorio', 'tecnica', 'imagem', 'cepOrigem', 'prazoPadraoDias', 'aceitaEncomendas', 'chavePix']
    const alteracoes = Object.fromEntries(permitidos.filter((campo) => req.body[campo] !== undefined).map((campo) => [campo, req.body[campo]]))
    db.get('artesaos').find({ id: usuario.artesaoId }).assign(alteracoes).write()
    res.json(ok(encontrar('artesaos', usuario.artesaoId)))
  })

  server.get('/api/v1/estado', (req, res) => res.json(ok(estadoDaRequisicao(req, res))))
  for (const campo of ['favoritos', 'sacola', 'historicoBusca', 'videosCurtidos', 'videosSalvos']) {
    server.put(`/api/v1/estado/${campo}`, (req, res) => {
      const estado = estadoDaRequisicao(req, res)
      const valor = req.body[campo]
      if (!Array.isArray(valor)) return erro(res, 400, 'Estado inválido.')
      db.get('estadosCliente').find({ id: estado.id }).assign({ [campo]: valor }).write()
      res.json(ok(valor))
    })
  }

  server.get('/api/v1/pecas/:id/perguntas', (req, res) => {
    if (!encontrar('pecas', req.params.id)) return erro(res, 404, 'Peça não encontrada.')
    res.json(ok(ler('perguntas').filter((item) => item.pecaSlug === req.params.id)))
  })
  server.post('/api/v1/pecas/:id/perguntas', (req, res) => {
    const usuario = exigirUsuario(req, res)
    if (!usuario) return
    if (!encontrar('pecas', req.params.id)) return erro(res, 404, 'Peça não encontrada.')
    const texto = String(req.body.pergunta || '').trim()
    if (!texto) return erro(res, 400, 'Escreva sua pergunta.')
    const pergunta = { id: randomUUID(), pecaSlug: req.params.id, pergunta: texto, autor: usuario.nome, usuarioId: usuario.id, criadaEm: new Date().toISOString() }
    res.status(201).json(ok(inserir('perguntas', pergunta)))
  })
  server.patch('/api/v1/pecas/:pecaId/perguntas/:id', (req, res) => {
    const usuario = exigirUsuario(req, res)
    if (!usuario) return
    const peca = encontrar('pecas', req.params.pecaId)
    const pergunta = encontrar('perguntas', req.params.id)
    if (!peca || !pergunta || pergunta.pecaSlug !== peca.id) return erro(res, 404, 'Pergunta não encontrada.')
    if (usuario.perfil !== 'artesao' || usuario.artesaoId !== peca.artesao) return erro(res, 403, 'Somente o artesão responsável pode responder.', 'SEM_PERMISSAO')
    const resposta = String(req.body.resposta || '').trim()
    if (!resposta) return erro(res, 400, 'Escreva a resposta.')
    db.get('perguntas').find({ id: pergunta.id }).assign({ resposta, respondidaEm: new Date().toISOString() }).write()
    res.json(ok(encontrar('perguntas', pergunta.id)))
  })

  server.post('/api/v1/auth/recuperacao', (req, res) => {
    const email = String(req.body.email || '').trim().toLowerCase()
    if (!emailValido(email)) return erro(res, 400, 'Informe um e-mail válido.')
    inserir('recuperacoes', { id: randomUUID(), email, solicitadaEm: new Date().toISOString(), expiraEm: new Date(Date.now() + 60 * 60 * 1000).toISOString() })
    res.status(201).json(ok({ recebida: true }))
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
  server.get('/api/v1/eventos/:id', (req, res) => {
    const evento = encontrar('eventos', req.params.id)
    if (!evento) return erro(res, 404, 'Evento não encontrado.')
    res.json(ok(evento))
  })
  server.delete('/api/v1/eventos/:id', (req, res) => {
    const evento = encontrar('eventos', req.params.id)
    if (!evento) return erro(res, 404, 'Evento não encontrado.')
    db.get('eventos').remove({ id: req.params.id }).write()
    res.json(ok(evento))
  })
  server.get('/api/v1/pedidos', (req, res) => {
    const usuario = usuarioDaRequisicao(req)
    const pedidos = usuario ? ler('pedidos').filter((pedido) => (pedido.compradorId ?? pedido.usuarioId) === usuario.id) : ler('pedidos')
    res.json(ok(req.query.compradorId ? pedidos.filter((pedido) => (pedido.compradorId ?? pedido.usuarioId) === req.query.compradorId) : pedidos))
  })
  server.get('/api/v1/pedidos/:id', (req, res) => {
    const pedido = encontrar('pedidos', req.params.id)
    if (!pedido) return erro(res, 404, 'Pedido não encontrado.')
    const usuario = usuarioDaRequisicao(req)
    if (usuario && (pedido.compradorId ?? pedido.usuarioId) && (pedido.compradorId ?? pedido.usuarioId) !== usuario.id) return erro(res, 404, 'Pedido não encontrado.')
    res.json(ok(pedido))
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
  server.post('/api/v1/videos', (req, res) => {
    const usuario = usuarioDaRequisicao(req)
    const video = { ...req.body, id: req.body.id || randomUUID(), ...(usuario?.artesaoId ? { artesao: usuario.artesaoId } : {}) }
    if (!video.legenda?.trim()) return erro(res, 400, 'Informe a legenda do vídeo.')
    if (encontrar('videos', video.id)) return erro(res, 409, 'Este vídeo já existe.')
    res.status(201).json(ok(inserir('videos', video)))
  })
  server.post('/api/v1/pecas', (req, res) => {
    const usuario = usuarioDaRequisicao(req)
    const peca = { ...req.body, id: req.body.slug, ...(usuario?.artesaoId ? { artesao: usuario.artesaoId } : {}) }
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
  server.delete('/api/v1/pecas/:id', (req, res) => {
    const peca = encontrar('pecas', req.params.id)
    if (!peca) return erro(res, 404, 'Peça não encontrada.')
    db.get('pecas').remove({ id: req.params.id }).write()
    res.json(ok(peca))
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
  server.get('/api/v1/artesao/pedidos-pendentes', (req, res) => {
    const artesao = String(req.query.artesao || '')
    const slugs = new Set(ler('pecas').filter((peca) => peca.artesao === artesao).map((peca) => peca.slug))
    const iniciais = ler('pedidosPendentes').filter((pedido) => !artesao || slugs.has(pedido.pecaSlug))
    const novos = ler('pedidos').filter((pedido) => pedido.estado === 'confirmado' && (!artesao || (pedido.itens ?? [{ slug: pedido.pecaSlug }]).some((item) => slugs.has(item.slug))) && !iniciais.some((item) => item.id === pedido.id)).map((pedido) => ({ id: pedido.id, pecaSlug: pedido.pecaSlug, comprador: pedido.compradorNome, quando: pedido.data, valor: pedido.total }))
    res.json(ok([...iniciais, ...novos]))
  })
  server.get('/api/v1/artesao/conversas', (req, res) => {
    const artesao = String(req.query.artesao || '')
    const slugs = new Set(ler('pecas').filter((peca) => peca.artesao === artesao).map((peca) => peca.slug))
    const iniciais = ler('conversasArtesao').filter((conversa) => !artesao || slugs.has((encontrar('pedidos', conversa.id) ?? ler('pedidosPendentes').find((pedido) => pedido.id === conversa.id))?.pecaSlug))
    const novos = ler('pedidos').filter((pedido) => (!artesao || (pedido.itens ?? [{ slug: pedido.pecaSlug }]).some((item) => slugs.has(item.slug))) && !iniciais.some((item) => item.id === pedido.id)).map((pedido) => {
      const mensagens = ler('mensagens').filter((mensagem) => mensagem.pedidoId === pedido.id)
      const ultima = mensagens.at(-1)
      return { id: pedido.id, pessoa: pedido.compradorNome, assunto: `Pedido ${pedido.id}`, previa: ultima?.texto ?? 'Nova compra recebida', quando: ultima?.hora ?? pedido.data, naoLida: false, retrato: '/fotos/jarra-cabocla.svg' }
    })
    res.json(ok([...iniciais, ...novos]))
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
    const comprador = usuarioDaRequisicao(req)
    if (!comprador || (req.body.compradorId && req.body.compradorId !== comprador.id)) return erro(res, 401, 'Entre na sua conta para finalizar a compra.', 'NAO_AUTENTICADO')
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
      compradorId: comprador.id, usuarioId: comprador.id, compradorNome: comprador.nome, data: new Date().toLocaleDateString('pt-BR'),
      total: Math.round((subtotal + frete.valor) * 100) / 100, estado: 'confirmado', avaliado: false,
      endereco, meio, freteId, simulado: true,
      etapas: [{ estado: 'confirmado', titulo: 'Pedido confirmado', detalhe: 'Compra de demonstração registrada.', concluida: true, atual: true }],
    }
    res.status(201).json(ok(inserir('pedidos', pedido)))
  })
  server.patch('/api/v1/pedidos/:id/estado', (req, res) => {
    const pedido = encontrar('pedidos', req.params.id)
    if (!pedido) return erro(res, 404, 'Pedido não encontrado.')
    const estados = ['confirmado', 'producao', 'enviado', 'entregue']
    if (!estados.includes(req.body.estado)) return erro(res, 400, 'Estado do pedido inválido.')
    const indiceAtual = estados.indexOf(req.body.estado)
    const titulos = {
      confirmado: 'Pedido confirmado',
      producao: 'Em produção',
      enviado: 'Enviado',
      entregue: 'Entregue no seu endereço',
    }
    const detalhes = {
      confirmado: 'Compra registrada.',
      producao: 'O artesão iniciou a preparação da peça.',
      enviado: 'Pedido entregue à transportadora.',
      entregue: 'Entrega concluída.',
    }
    const alteracoes = {
      estado: req.body.estado,
      etapas: estados.map((estado, indice) => ({
        estado,
        titulo: titulos[estado],
        detalhe: detalhes[estado],
        concluida: indice <= indiceAtual,
        atual: indice === indiceAtual,
      })),
    }
    if (['enviado', 'entregue'].includes(req.body.estado)) {
      alteracoes.rastreio = pedido.rastreio ?? `BR${Date.now().toString().slice(-10)}`
      alteracoes.transportadora = pedido.transportadora ?? 'Correios'
      alteracoes.previsaoEntrega = pedido.previsaoEntrega ?? 'Em até 10 dias úteis'
    }
    db.get('pedidos').find({ id: pedido.id }).assign(alteracoes).write()
    db.get('pedidosPendentes').remove({ id: pedido.id }).write()
    res.json(ok(encontrar('pedidos', pedido.id)))
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
