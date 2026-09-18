const jsonServer = require('json-server')
const { existsSync, copyFileSync } = require('node:fs')
const path = require('node:path')
const { randomUUID } = require('node:crypto')

const ok = (dados, paginacao) => ({ dados, erro: null, ...(paginacao ? { paginacao } : {}) })
const erro = (res, status, mensagem) => res.status(status).json({ dados: null, erro: { codigo: status === 404 ? 'RECURSO_NAO_ENCONTRADO' : 'REQUISICAO_INVALIDA', mensagem } })
const normalizar = (texto) => String(texto).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
const preco = (peca) => peca.preco * (1 - (peca.desconto || 0) / 100)

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
      compradorNome: ler('usuario').nome, data: new Date().toLocaleDateString('pt-BR'),
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
