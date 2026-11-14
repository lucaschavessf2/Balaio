const { test } = require('node:test')
const assert = require('node:assert/strict')
const { mkdtempSync, readFileSync, rmSync, writeFileSync } = require('node:fs')
const { tmpdir } = require('node:os')
const path = require('node:path')
const { createHmac, randomBytes, randomUUID } = require('node:crypto')
const { criarServidor } = require('./server.cjs')

test('contexto interno assinado isola perfis reais sem credenciais ou sessões Fake', async (t) => {
  process.env.NODE_ENV = 'test'
  const chaveAnterior = process.env.BALAIO_FAKE_INTERNAL_KEY
  const chave = randomBytes(32).toString('base64url')
  process.env.BALAIO_FAKE_INTERNAL_KEY = chave
  const pasta = mkdtempSync(path.join(tmpdir(), 'balaio-contexto-'))
  const arquivo = path.join(pasta, 'db.json')
  const a = { sub: randomUUID(), nome: 'Pessoa A', email: 'carlos@exemplo.com', papel: 'comprador' }
  const b = { sub: randomUUID(), nome: 'Pessoa B', email: 'b@exemplo.com', papel: 'artesao' }
  const seed = JSON.parse(readFileSync(path.join(__dirname, 'seed.json'), 'utf8'))
  seed.pedidos.push(
    { id: 'REAL-A', compradorId: a.sub, usuarioId: a.sub, compradorNome: a.nome, total: 10 },
    { id: 'REAL-B', compradorId: b.sub, usuarioId: b.sub, compradorNome: b.nome, total: 20 },
    { id: 'SEM-DONO', compradorId: '', usuarioId: 'fixture', compradorNome: 'Sem pessoa associada', total: 30 },
  )
  writeFileSync(arquivo, JSON.stringify(seed))
  let servidor
  const abrir = async () => {
    servidor = criarServidor(arquivo).listen(0, '127.0.0.1')
    await new Promise((resolve) => servidor.once('listening', resolve))
  }
  await abrir()
  t.after(async () => {
    await new Promise((resolve) => servidor.close(resolve))
    rmSync(pasta, { recursive: true, force: true })
    if (chaveAnterior === undefined) delete process.env.BALAIO_FAKE_INTERNAL_KEY
    else process.env.BALAIO_FAKE_INTERNAL_KEY = chaveAnterior
  })
  const assinar = (url, metodo = 'GET', pessoa = a, alteracoes = {}, segredo = chave) => {
    const contexto = Buffer.from(JSON.stringify({ ...pessoa, metodo, caminho: '/api/v1' + url, exp: Math.floor(Date.now() / 1000) + 30, ...alteracoes })).toString('base64url')
    return { 'x-balaio-contexto': contexto, 'x-balaio-assinatura': createHmac('sha256', segredo).update(contexto).digest('hex') }
  }
  const request = async (url, metodo = 'GET', body, headers = assinar(url, metodo)) => {
    const res = await fetch(`http://127.0.0.1:${servidor.address().port}/api/v1${url}`, {
      method: metodo,
      headers: { 'Content-Type': 'application/json', ...headers },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    })
    return { status: res.status, cookie: res.headers.get('set-cookie'), headers: res.headers, ...await res.json() }
  }
  const antes = JSON.parse(readFileSync(arquivo, 'utf8'))
  const perfilA = await request('/usuario')
  assert.equal(perfilA.status, 200)
  assert.equal(perfilA.dados.id, a.sub, 'o e-mail da fixture não apropria a conta da fixture')
  assert.equal(perfilA.dados.email, a.email)
  assert.deepEqual(perfilA.dados.enderecos, [])
  assert.equal(perfilA.cookie, null)
  assert.equal(perfilA.headers.get('x-balaio-contexto'), null)
  assert.equal(perfilA.headers.get('x-balaio-assinatura'), null)
  assert.equal((await request('/usuario', 'GET', undefined, assinar('/usuario', 'GET', b))).dados.id, b.sub)

  const casosInvalidos = [
    assinar('/usuario', 'GET', a, {}, randomBytes(32).toString('hex')),
    assinar('/usuario', 'GET', a, { exp: Math.floor(Date.now() / 1000) - 1 }),
    assinar('/usuario', 'GET', a, { exp: Math.floor(Date.now() / 1000) + 60 }),
    assinar('/outro-destino'),
    assinar('/usuario?origem=diferente'),
    assinar('/usuario', 'PATCH'),
    assinar('/usuario', 'GET', a, { sub: 'u-carlos' }),
    assinar('/usuario', 'GET', a, { sub: '' }),
    assinar('/usuario', 'GET', a, { papel: 'superadmin' }),
    assinar('/usuario', 'GET', a, { nome: null }),
    { 'x-balaio-contexto': 'JSON-invalido', 'x-balaio-assinatura': '0'.repeat(64) },
    { 'x-balaio-contexto': assinar('/usuario')['x-balaio-contexto'] },
    { 'x-balaio-assinatura': '0'.repeat(64) },
  ]
  for (const headers of casosInvalidos) assert.equal((await request('/usuario', 'GET', undefined, headers)).status, 401)
  const jsonInvalido = Buffer.from('{').toString('base64url')
  assert.equal((await request('/usuario', 'GET', undefined, {
    'x-balaio-contexto': jsonInvalido,
    'x-balaio-assinatura': createHmac('sha256', chave).update(jsonInvalido).digest('hex'),
  })).status, 401)
  for (const url of ['/estado', '/artesao/me', '/perfisExternos', '/auth/login', '/pedidos/REAL-A/conversa']) {
    assert.equal((await request(url, 'GET', undefined, assinar(url))).status, 401, url)
  }
  for (const headers of [
    {}, { Authorization: 'Bearer jwt-real-nao-validado' },
    { 'x-balaio-usuario-id': a.sub, 'x-user-id': a.sub, 'x-user-role': 'admin' },
  ]) assert.equal((await request('/usuario', 'GET', undefined, headers)).status, 401)

  const patch = await request('/usuario', 'PATCH', {
    nome: 'Nome editado na Fake', email: 'editado@exemplo.com', telefone: '81999990000', tipoComprador: 'colecionador',
    id: b.sub, papel: 'admin', senha: 'senha-real-nao-armazenar', senhaHash: 'hash-nao-armazenar',
  }, { ...assinar('/usuario', 'PATCH'), Cookie: 'balaio_sessao=%INVALIDO', Authorization: 'Bearer jwt-real-nao-armazenar' })
  assert.equal(patch.status, 200, 'cookie e Authorization não são lidos quando há contexto válido')
  assert.equal(patch.dados.id, a.sub)
  assert.equal(patch.dados.papel, 'comprador')
  assert.equal(patch.cookie, null)
  const endereco = await request('/usuario/enderecos', 'POST', {
    apelido: 'Casa', rua: 'Rua A, 10', bairro: 'Centro', cep: '50000-000', senha: 'nao-armazenar-no-endereco',
  })
  assert.equal(endereco.status, 201)
  assert.equal(endereco.cookie, null)
  assert.equal(endereco.dados.senha, undefined)
  const caminhoEndereco = `/usuario/enderecos/${endereco.dados.id}`
  assert.equal((await request(caminhoEndereco, 'PATCH', { rua: 'Rua A, 20' })).dados.rua, 'Rua A, 20')
  assert.equal((await request('/usuario/enderecos', 'GET', undefined, assinar('/usuario/enderecos', 'GET', b))).dados.length, 0)
  assert.equal((await request(caminhoEndereco, 'PATCH', { rua: 'Tentativa B' }, assinar(caminhoEndereco, 'PATCH', b))).status, 404)
  assert.equal((await request(caminhoEndereco, 'DELETE', undefined, assinar(caminhoEndereco, 'DELETE', b))).status, 404)

  assert.deepEqual((await request('/pedidos')).dados.map((pedido) => pedido.id), ['REAL-A'])
  assert.deepEqual((await request('/pedidos', 'GET', undefined, assinar('/pedidos', 'GET', b))).dados.map((pedido) => pedido.id), ['REAL-B'])
  assert.equal((await request('/pedidos/REAL-A')).status, 200)
  assert.equal((await request('/pedidos/REAL-B')).status, 404)
  assert.equal((await request('/pedidos/SEM-DONO')).status, 404)
  const filtro = `/pedidos?compradorId=${b.sub}`
  assert.deepEqual((await request(filtro)).dados, [], 'query do cliente não troca a identidade autenticada')
  const legado = await request('/auth/login', 'POST', { email: 'carlos@exemplo.com', senha: 'balaio123' }, {})
  assert.equal(legado.status, 200)
  assert.notEqual(legado.dados.id, a.sub)
  assert.equal((await request('/usuario', 'GET', undefined, { ...assinar('/usuario'), Cookie: legado.cookie.split(';')[0] })).dados.id, a.sub)
  assert.equal((await request('/usuario', 'GET', undefined, { ...casosInvalidos[0], Cookie: legado.cookie.split(';')[0] })).status, 401, 'assinatura inválida não recua para sessão Fake')
  for (const url of ['/perfisExternos', '/perfisExternos/' + a.sub, '/perfis%45xternos', '/perfisExternos%2f' + a.sub, '/PERFISEXTERNOS/', '/db', '/%64b', '/pedidos/REAL-A/perfisExternos']) {
    assert.equal((await request(url, 'GET', undefined, {})).status, 404)
  }
  for (const url of ['/perfisExternos', '/db']) {
    const res = await fetch(`http://127.0.0.1:${servidor.address().port}${url}`)
    assert.equal(res.status, 404)
  }

  const disco = JSON.parse(readFileSync(arquivo, 'utf8'))
  assert.equal(disco.perfisExternos.length, 2)
  assert.ok(disco.perfisExternos.every((perfil) => !('senha' in perfil) && !('senhaHash' in perfil) && !('senhaSal' in perfil)))
  assert.ok(!disco.usuarios.some((usuario) => [a.sub, b.sub].includes(usuario.id)))
  assert.ok(!disco.sessoes.some((sessao) => [a.sub, b.sub].includes(sessao.usuarioId)))
  assert.equal(disco.sessoes.length, antes.sessoes.length + 1, 'somente o login legado cria sessão Fake')
  assert.ok(!JSON.stringify(disco).includes('nao-armazenar'))
  assert.deepEqual(disco.usuario, antes.usuario, 'edição externa não muda a identidade de demonstração legada')

  await new Promise((resolve) => servidor.close(resolve))
  await abrir()
  const persistido = (await request('/usuario', 'GET', undefined, assinar('/usuario', 'GET', { ...a, nome: 'Nome do gateway', papel: 'admin' }))).dados
  assert.equal(persistido.id, a.sub)
  assert.equal(persistido.nome, 'Nome editado na Fake', 'o gateway não sobrescreve edições persistidas')
  assert.equal(persistido.email, 'editado@exemplo.com')
  assert.equal(persistido.telefone, '81999990000')
  assert.equal(persistido.papel, 'admin', 'papel sempre vem do contexto atual')
  assert.equal(persistido.enderecos[0].rua, 'Rua A, 20')
  assert.equal((await request(caminhoEndereco, 'DELETE')).status, 200)
  assert.deepEqual((await request('/usuario/enderecos')).dados, [])
})

test('contrato HTTP, filtros, relações, CRUD e persistência', async (t) => {
  process.env.NODE_ENV = 'test'
  const pasta = mkdtempSync(path.join(tmpdir(), 'balaio-api-'))
  const arquivo = path.join(pasta, 'db.json')
  const servidor = criarServidor(arquivo).listen(0, '127.0.0.1')
  await new Promise((resolve) => servidor.once('listening', resolve))
  t.after(async () => {
    await new Promise((resolve) => servidor.close(resolve))
    rmSync(pasta, { recursive: true, force: true })
  })
  const base = `http://127.0.0.1:${servidor.address().port}/api/v1`
  const request = async (url, body, method = 'POST', headers = {}) => {
    const opcoes = body === undefined && Object.keys(headers).length === 0
      ? undefined
      : { method: body === undefined ? method : method, headers: { 'Content-Type': 'application/json', ...headers }, ...(body === undefined ? {} : { body: JSON.stringify(body) }) }
    const res = await fetch(base + url, opcoes)
    return { status: res.status, cookie: res.headers.get('set-cookie'), ...await res.json() }
  }
  for (const recurso of ['pecas', 'artesaos', 'coletivos', 'eventos', 'videos', 'pedidos', 'artesao/conversas', 'artesao/pedidos-pendentes', 'artesao/vendas', 'admin/mediacoes']) {
    const res = await request('/' + recurso)
    assert.equal(res.status, 200, recurso)
    assert.equal(res.erro, null, recurso)
    assert.ok(res.dados.length > 0, recurso)
  }
  assert.ok((await request('/referencias')).dados.tecnicas.length)
  assert.equal((await request('/usuario')).status, 401)
  assert.equal((await request('/auth/cadastro', { nome: '', email: 'invalido', senha: '123' })).status, 400)
  const cadastro = await request('/auth/cadastro', { nome: 'Ally Show', email: 'ALLYSHOW@gmail.com', senha: 'senhaforte', perfil: 'comprador' })
  assert.equal(cadastro.status, 201)
  assert.equal(cadastro.dados.email, 'allyshow@gmail.com')
  assert.ok(!('senhaHash' in cadastro.dados))
  const cookie = cadastro.cookie.split(';')[0]
  assert.equal((await request('/usuario', undefined, 'GET', { Cookie: cookie })).dados.nome, 'Ally Show')
  const endereco = await request('/usuario/enderecos', { apelido: 'Casa', rua: 'Rua do teste, 1', bairro: 'Centro', cep: '50000-000' }, 'POST', { Cookie: cookie })
  assert.equal(endereco.status, 201)
  assert.equal((await request(`/usuario/enderecos/${endereco.dados.id}`, { rua: 'Rua atualizada, 2' }, 'PATCH', { Cookie: cookie })).dados.rua, 'Rua atualizada, 2')
  assert.equal((await request('/usuario', { nome: 'Ally Atualizado', email: 'allyshow@gmail.com', telefone: '81999990000' }, 'PATCH', { Cookie: cookie })).dados.nome, 'Ally Atualizado')
  assert.equal((await request('/auth/cadastro', { nome: 'Outro', email: 'allyshow@gmail.com', senha: 'senhaforte' })).status, 409)
  assert.equal((await request('/auth/logout', {}, 'POST', { Cookie: cookie })).status, 200)
  assert.equal((await request('/usuario', undefined, 'GET', { Cookie: cookie })).status, 401)
  assert.equal((await request('/auth/login', { email: 'allyshow@gmail.com', senha: 'errada' })).status, 401)
  const login = await request('/auth/login', { email: 'allyshow@gmail.com', senha: 'senhaforte' })
  assert.equal(login.status, 200)
  assert.ok(login.cookie)
  assert.equal((await request('/auth/recuperacao', { email: 'allyshow@gmail.com' })).status, 201)
  const vendedor = await request('/auth/cadastro', { nome: 'Artesã Teste', email: 'artesa@teste.com', senha: 'senhaforte', perfil: 'artesao', territorio: 'Cariri', tecnica: 'Xilogravura' })
  assert.equal(vendedor.status, 201)
  assert.ok(vendedor.dados.artesaoId)
  const cookieVendedor = vendedor.cookie.split(';')[0]
  assert.equal((await request('/artesao/me', undefined, 'GET', { Cookie: cookieVendedor })).dados.nome, 'Artesã Teste')
  assert.equal((await request('/artesao/me', { atelie: 'Novo Ateliê' }, 'PATCH', { Cookie: cookieVendedor })).dados.atelie, 'Novo Ateliê')
  const estado = await request('/estado')
  const cookieCliente = estado.cookie.split(';')[0]
  assert.deepEqual((await request('/estado/favoritos', { favoritos: ['teste'] }, 'PUT', { Cookie: cookieCliente })).dados, ['teste'])
  assert.deepEqual((await request('/estado/videosCurtidos', { videosCurtidos: ['v-001'] }, 'PUT', { Cookie: cookieCliente })).dados, ['v-001'])
  assert.deepEqual((await request('/estado', undefined, 'GET', { Cookie: cookieCliente })).dados.videosCurtidos, ['v-001'])
  const todas = await request('/pecas')
  const pagina = await request('/pecas?pagina=2&tamanho=3&ordenar=preco-asc')
  assert.equal(pagina.dados.length, 3)
  assert.equal(pagina.paginacao.total, todas.dados.length)
  assert.equal(pagina.paginacao.pagina, 2)
  const preco = (p) => p.preco * (1 - (p.desconto || 0) / 100)
  assert.deepEqual(pagina.dados.map(preco), [...pagina.dados.map(preco)].sort((a, b) => a - b))
  assert.ok((await request('/pecas?q=ceramica')).dados.length)
  assert.equal((await request('/pecas?q=inexistente')).paginacao.total, 0)
  const primeira = todas.dados[0]
  const pergunta = await request(`/pecas/${primeira.slug}/perguntas`, { pergunta: 'Como foi feita?' }, 'POST', { Cookie: login.cookie.split(';')[0] })
  assert.equal(pergunta.status, 201)
  assert.equal((await request(`/pecas/${primeira.slug}/perguntas`)).dados[0].pergunta, 'Como foi feita?')
  const relacionadas = await request(`/pecas/${primeira.slug}/relacionadas?limite=1`)
  assert.equal(relacionadas.dados.length, 1)
  assert.notEqual(relacionadas.dados[0].slug, primeira.slug)
  assert.ok((await request(`/artesaos/${primeira.artesao}/pecas`)).dados.every((p) => p.artesao === primeira.artesao))
  assert.equal((await request('/pecas/inexistente')).status, 404)
  assert.equal((await request('/pedidos/inexistente/conversa')).status, 404)
  const evento = (await request('/eventos')).dados[0]
  const novo = await request('/eventos', { ...evento, id: undefined, slug: 'evento-teste', nome: 'Evento de teste' })
  assert.equal(novo.status, 201)
  assert.equal((await request('/eventos/evento-teste')).dados.nome, 'Evento de teste')
  assert.equal((await request('/eventos', { ...evento, slug: 'evento-teste' })).status, 409)
  assert.equal((await request('/eventos/evento-teste', { nome: 'Atualizado' }, 'PATCH')).dados.nome, 'Atualizado')
  const outraDoNuca = todas.dados.find((item) => item.artesao === primeira.artesao && item.slug !== primeira.slug && item.disponibilidade !== 'unica')
  const compra = { itens: [{ slug: primeira.slug, quantidade: 1 }, { slug: outraDoNuca.slug, quantidade: 2 }], freteId: 'padrao', meio: 'pix', endereco: { cep: '52021030', endereco: 'Rua de teste', cidade: 'Recife', estado: 'PE' } }
  const cookieComprador = login.cookie.split(';')[0]
  const pecaDeOutroArtesao = todas.dados.find((item) => item.artesao !== primeira.artesao && item.disponibilidade === 'unica')
  const compraMista = await request('/checkout', { ...compra, itens: [{ slug: primeira.slug, quantidade: 1 }, { slug: pecaDeOutroArtesao.slug, quantidade: 1 }] }, 'POST', { Cookie: cookieComprador })
  assert.equal(compraMista.status, 400)
  assert.ok((await request('/pecas')).dados.some((item) => item.slug === primeira.slug), 'checkout misto não reserva peça de Nuca')
  assert.ok((await request('/pecas')).dados.some((item) => item.slug === pecaDeOutroArtesao.slug), 'checkout misto não reserva peça única de outro artesão')
  const pedido = await request('/checkout', compra, 'POST', { Cookie: cookieComprador })
  assert.equal(pedido.status, 201)
  assert.equal(pedido.dados.compradorId, login.dados.id)
  assert.equal((await request('/checkout', { ...compra, compradorId: 'ninguem' })).status, 401)
  assert.equal(pedido.dados.total, Math.round((preco(primeira) + 2 * preco(outraDoNuca) + 38.9) * 100) / 100)
  assert.equal(pedido.dados.itens.length, 2)
  assert.ok(!(await request('/pecas')).dados.some((item) => item.slug === primeira.slug), 'peça única vendida saiu da vitrine')
  assert.ok((await request('/pedidos', undefined, 'GET', { Cookie: cookieComprador })).dados.some((item) => item.id === pedido.dados.id))
  assert.ok(!(await request('/pedidos', undefined, 'GET', { Cookie: cookieVendedor })).dados.some((item) => item.id === pedido.dados.id))
  const demo = await request('/auth/entrar', { email: 'nuca@exemplo.com', senha: 'balaio123' })
  assert.equal((await request(`/pedidos/${pedido.dados.id}/estado`, { estado: 'producao' }, 'PATCH')).status, 403)
  const comoNuca = { Cookie: demo.cookie.split(';')[0] }
  assert.ok((await request(`/artesao/vendas?artesao=${primeira.artesao}`)).dados.some((item) => item.id === pedido.dados.id))
  assert.ok(!(await request(`/artesao/vendas?artesao=${vendedor.dados.artesaoId}`)).dados.some((item) => item.id === pedido.dados.id))
  assert.equal((await request(`/pedidos/${pedido.dados.id}/estado`, { estado: 'producao' }, 'PATCH', { Cookie: cookieVendedor })).status, 403)
  assert.equal((await request(`/pedidos/${pedido.dados.id}/recusar`, { motivo: 'Não posso atender.' }, 'PATCH', { Cookie: cookieVendedor })).status, 403)
  assert.equal((await request(`/pedidos/${pedido.dados.id}/estado`, { estado: 'entregue' }, 'PATCH', comoNuca)).status, 409)
  const emProducao = await request(`/pedidos/${pedido.dados.id}/estado`, { estado: 'producao' }, 'PATCH', comoNuca)
  assert.equal(emProducao.dados.estado, 'producao')
  assert.equal(emProducao.dados.etapas.find((etapa) => etapa.estado === 'producao').atual, true)
  assert.equal((await request(`/pedidos/${pedido.dados.id}/estado`, { estado: 'confirmado' }, 'PATCH', comoNuca)).status, 409)
  assert.equal((await request(`/pedidos/${pedido.dados.id}/cancelar`, {}, 'PATCH', { Cookie: cookieComprador })).status, 409)
  const outraUnica = todas.dados.find((item) => item.disponibilidade === 'unica' && item.slug !== primeira.slug)
  const paraCancelar = await request('/checkout', { ...compra, itens: [{ slug: outraUnica.slug, quantidade: 1 }] }, 'POST', { Cookie: cookieComprador })
  assert.equal(paraCancelar.status, 201)
  const cancelado = await request(`/pedidos/${paraCancelar.dados.id}/cancelar`, {}, 'PATCH', { Cookie: cookieComprador })
  assert.equal(cancelado.dados.estado, 'cancelado')
  assert.equal((await request(`/pedidos/${paraCancelar.dados.id}/cancelar`, {}, 'PATCH', { Cookie: cookieComprador })).dados.estado, 'cancelado')
  assert.ok((await request('/pecas')).dados.some((item) => item.slug === outraUnica.slug), 'peça única cancelada voltou à vitrine')
  const reservaPosterior = await request('/checkout', { ...compra, itens: [{ slug: outraUnica.slug, quantidade: 1 }] }, 'POST', { Cookie: cookieComprador })
  assert.equal(reservaPosterior.status, 201)
  assert.equal((await request(`/pedidos/${paraCancelar.dados.id}/cancelar`, {}, 'PATCH', { Cookie: cookieComprador })).status, 200)
  assert.ok(!(await request('/pecas')).dados.some((item) => item.slug === outraUnica.slug), 'replay antigo não libera reserva posterior')
  assert.equal((await request(`/pedidos/${reservaPosterior.dados.id}/cancelar`, {}, 'PATCH', { Cookie: cookieComprador })).status, 200)
  assert.equal((await request('/checkout', { ...compra, itens: [] }, 'POST', { Cookie: cookieComprador })).status, 400)
  const mensagem = await request(`/pedidos/${pedido.dados.id}/conversa`, { texto: 'Olá!', autor: 'comprador', hora: 'agora' })
  assert.equal(mensagem.status, 201)
  assert.equal((await request(`/pedidos/${pedido.dados.id}/conversa`)).dados.length, 1)
  assert.equal((await request('/pedidos/PE-2026-8720/conversa')).dados.length, 0)
  const disco = JSON.parse(readFileSync(arquivo, 'utf8'))
  for (const [nome, colecao] of Object.entries(disco)) {
    if (Array.isArray(colecao)) assert.ok(colecao.every((item) => item.id !== undefined), `${nome} contém item sem id`)
  }
  assert.ok(disco.usuarios.some((usuario) => usuario.email === 'allyshow@gmail.com' && usuario.senhaHash))
  assert.ok(!disco.usuarios.some((usuario) => 'senha' in usuario))
  assert.ok(disco.pedidos.some((p) => p.id === pedido.dados.id))
  assert.equal(disco.eventos.find((e) => e.slug === 'evento-teste').nome, 'Atualizado')
  assert.equal((await request('/eventos/evento-teste', {}, 'DELETE')).status, 200)
  assert.equal((await request('/eventos/evento-teste')).status, 404)
  const origem = base.replace('/api/v1', '')
  const comoVendedor = { Cookie: cookieVendedor }
  const pecaNova = { nome: 'Peça Teste', tecnica: primeira.tecnica, territorio: primeira.territorio, categoria: primeira.categoria, tipo: primeira.tipo, historia: ['Feita à mão.'], preco: 150, disponibilidade: 'disponivel', situacao: 'publicada', fotos: [] }
  assert.equal((await request('/pecas', pecaNova)).status, 401)
  assert.equal((await request('/pecas', pecaNova, 'POST', { Cookie: cookieComprador })).status, 403)
  const invalidas = [
    { tipo: 'Inexistente' }, { tecnica: 'Inventada' }, { disponibilidade: 'xyz' }, { situacao: 'curadoria' },
    { nome: 'a'.repeat(121) }, { preco: 0 }, { disponibilidade: 'encomenda' },
    { fotos: [{ id: 'f', nome: 'x', url: 'javascript:alert(1)' }] },
    { fotos: [{ id: 'f', nome: 'x.gif', url: 'data:image/gif;base64,R0lGOD' }] },
  ]
  for (const invalida of invalidas) {
    assert.equal((await request('/pecas', { ...pecaNova, ...invalida }, 'POST', comoVendedor)).status, 400, JSON.stringify(invalida).slice(0, 60))
  }
  const png = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=='
  const criada = await request('/pecas', { ...pecaNova, artesao: primeira.artesao, fotos: [{ id: 'f1', nome: 'capa.png', url: png }] }, 'POST', comoVendedor)
  assert.equal(criada.status, 201)
  assert.equal(criada.dados.artesao, vendedor.dados.artesaoId, 'artesão vem da sessão, não do corpo')
  assert.equal(criada.dados.slug, 'peca-teste')
  assert.match(criada.dados.imagem, /^\/api\/v1\/arquivos\/pecas\/peca-teste-[\w-]+\.png$/)
  const capa = await fetch(origem + criada.dados.imagem)
  assert.equal(capa.status, 200)
  assert.equal(capa.headers.get('content-type'), 'image/png')
  assert.ok(!readFileSync(arquivo, 'utf8').includes('iVBORw0KGgoAAAANSUhEUgAAAAEAAAAB'), 'a foto fica em arquivo, fora do banco')
  assert.ok((await request('/pecas')).dados.some((p) => p.slug === 'peca-teste'), 'peça publicada entra direto na loja')
  assert.equal((await request('/pecas', pecaNova, 'POST', comoVendedor)).dados.slug, 'peca-teste-2')
  const rascunho = await request('/pecas', { ...pecaNova, nome: 'Rascunho Teste', preco: 0, situacao: 'rascunho' }, 'POST', comoVendedor)
  assert.equal(rascunho.status, 201)
  assert.ok(!(await request('/pecas')).dados.some((p) => p.slug === rascunho.dados.slug))
  assert.equal((await request(`/pecas/${rascunho.dados.slug}`, { situacao: 'publicada' }, 'PATCH', comoVendedor)).status, 400)
  assert.equal((await request(`/pecas/${rascunho.dados.slug}`, { preco: 90, situacao: 'publicada' }, 'PATCH', comoVendedor)).dados.situacao, 'publicada')
  assert.ok((await request('/pecas')).dados.some((p) => p.slug === rascunho.dados.slug), 'rascunho publicado entra na loja')
  assert.equal((await request(`/pecas/${primeira.slug}`, { preco: 1 }, 'PATCH')).status, 401)
  assert.equal((await request(`/pecas/${primeira.slug}`, { preco: 1 }, 'PATCH', comoVendedor)).status, 404)
  assert.equal((await request(`/pecas/${primeira.slug}`, {}, 'DELETE', comoVendedor)).status, 404)
  assert.equal((await request(`/pecas/${primeira.slug}`, { ...primeira, preco: 1 }, 'PUT')).status, 405)
  assert.equal((await request(`/artesaos/${vendedor.dados.artesaoId}`, { selo: true }, 'PUT', comoVendedor)).status, 405)
  assert.equal((await request('/curadoria', { artesaoSlug: 'x' }, 'POST')).status, 405)
  assert.equal((await request('/pecas/peca-teste', { preco: 321 }, 'PATCH', comoVendedor)).dados.preco, 321)
  assert.equal((await request('/pecas/peca-teste', { disponibilidade: 'encomenda' }, 'PATCH', comoVendedor)).status, 400)
  assert.equal((await request('/pecas/peca-teste', { disponibilidade: 'encomenda', prazoProducaoDias: 12 }, 'PATCH', comoVendedor)).dados.prazoProducaoDias, 12)
  const fotoDe3MB = 'data:image/jpeg;base64,' + 'A'.repeat(4 * 1024 * 1024)
  const edicaoPesada = await request('/pecas/peca-teste', { fotos: [1, 2, 3].map((n) => ({ id: `g${n}`, nome: 'g.jpg', url: fotoDe3MB })) }, 'PATCH', comoVendedor)
  assert.equal(edicaoPesada.status, 200, 'edição aceita mais de 10 MB de fotos')
  assert.equal(edicaoPesada.dados.fotos.length, 3)
  assert.equal((await fetch(origem + criada.dados.imagem)).status, 404, 'foto substituída é apagada')
  const fotoDe6MB = 'data:image/jpeg;base64,' + 'A'.repeat(8 * 1024 * 1024)
  assert.equal((await request('/pecas/peca-teste', { fotos: [{ id: 'x', nome: 'x.jpg', url: fotoDe6MB }] }, 'PATCH', comoVendedor)).status, 400)
  assert.equal((await request('/pecas/peca-teste', {}, 'DELETE', comoVendedor)).status, 200)
  assert.equal((await request('/pecas/peca-teste')).status, 404)
  assert.equal((await fetch(origem + edicaoPesada.dados.imagem)).status, 404, 'fotos da peça excluída são apagadas')

  const admin = await request('/auth/login', { email: 'admin@exemplo.com', senha: 'balaio123' })
  const comoAdmin = { Cookie: admin.cookie.split(';')[0] }
  assert.equal((await request('/admin/curadoria')).status, 401)
  assert.equal((await request('/admin/curadoria', undefined, 'GET', comoVendedor)).status, 403)
  const fila = (await request('/admin/curadoria', undefined, 'GET', comoAdmin)).dados
  assert.ok(fila.some((s) => s.artesaoSlug === 'ze-do-cariri'))
  const pedidoSelo = fila.find((s) => s.artesaoSlug === vendedor.dados.artesaoId)
  assert.ok(pedidoSelo, 'novo artesão entra na fila do selo')
  assert.equal(pedidoSelo.pecasPublicadas, 2)
  assert.equal((await request('/artesao/selo', {}, 'POST', comoVendedor)).status, 409)
  assert.equal((await request(`/admin/curadoria/${pedidoSelo.id}/decisao`, { decisao: 'aprovada' }, 'POST', comoVendedor)).status, 403)
  assert.equal((await request(`/admin/curadoria/${pedidoSelo.id}/decisao`, { decisao: 'ajuste' }, 'POST', comoAdmin)).status, 400)
  assert.equal((await request(`/admin/curadoria/${pedidoSelo.id}/decisao`, { decisao: 'ajuste', motivo: 'Informe sua associação.' }, 'POST', comoAdmin)).status, 200)
  const aposAjuste = (await request('/artesao/selo', undefined, 'GET', comoVendedor)).dados
  assert.equal(aposAjuste.selo, false)
  assert.equal(aposAjuste.solicitacao.situacao, 'ajuste')
  assert.equal(aposAjuste.solicitacao.motivo, 'Informe sua associação.')
  assert.ok((await request('/pecas')).dados.some((p) => p.artesao === vendedor.dados.artesaoId), 'ajuste no selo não tira peças da loja')
  const novaSolicitacao = await request('/artesao/selo', { mensagem: 'Associação do Cariri.' }, 'POST', comoVendedor)
  assert.equal(novaSolicitacao.status, 201)
  assert.equal(novaSolicitacao.dados.solicitacao.situacao, 'pendente')
  assert.equal((await request(`/admin/curadoria/${novaSolicitacao.dados.solicitacao.id}/decisao`, { decisao: 'aprovada' }, 'POST', comoAdmin)).status, 200)
  assert.equal((await request(`/admin/curadoria/${novaSolicitacao.dados.solicitacao.id}/decisao`, { decisao: 'aprovada' }, 'POST', comoAdmin)).status, 409)
  assert.equal((await request(`/artesaos/${vendedor.dados.artesaoId}`)).dados.selo, true)
  assert.equal((await request('/artesao/selo', {}, 'POST', comoVendedor)).status, 409)
  assert.equal((await request('/pedidos/PE-2026-8720/avaliacao', { nota: 0 })).status, 400)
  assert.equal((await request('/pedidos/PE-2026-8720/avaliacao', { nota: 5, comentario: 'Ótima peça', aspectos: [] })).status, 201)
  assert.equal((await request('/pedidos/PE-2026-8720')).dados.avaliado, true)
  assert.equal((await request('/pedidos/PE-2026-8720/avaliacao', { nota: 5 })).status, 409)
  const mediacao = { id: 'MED-teste', pedido: pedido.dados.id, assunto: 'Ajuda', relato: 'Preciso de ajuda', solucao: 'conversa' }
  assert.equal((await request('/admin/mediacoes', mediacao)).status, 201)
  assert.equal((await request('/admin/mediacoes', mediacao)).status, 409)
  assert.equal((await request('/eventos?lat=-8&lng=-35')).dados.length, (await request('/eventos')).dados.length)
  assert.equal((await request('/eventos?lat=200&lng=0')).status, 400)

  assert.equal(demo.status, 200)
  assert.equal(demo.dados.artesao, 'mestre-nuca')
  assert.equal(demo.dados.senha, undefined)
  const pecaDoNuca = todas.dados.find((item) => item.artesao === 'mestre-nuca' && item.disponibilidade !== 'unica')
  const paraRecusar = await request('/checkout', { ...compra, itens: [{ slug: pecaDoNuca.slug, quantidade: 1 }] }, 'POST', { Cookie: cookieComprador })
  const rejeitado = await request(`/pedidos/${paraRecusar.dados.id}/recusar`, { motivo: 'Não consigo atender dentro do prazo.' }, 'PATCH', { Cookie: demo.cookie.split(';')[0] })
  assert.equal(rejeitado.dados.estado, 'recusado')
  assert.equal(rejeitado.dados.motivoEncerramento, 'Não consigo atender dentro do prazo.')
  assert.equal((await request(`/pedidos/${paraRecusar.dados.id}/recusar`, { motivo: 'Não consigo atender dentro do prazo.' }, 'PATCH', comoNuca)).status, 200)
  assert.equal((await request(`/pedidos/${paraRecusar.dados.id}/recusar`, { motivo: 'Outro motivo de recusa.' }, 'PATCH', comoNuca)).status, 409)
  const recusado = await request('/auth/entrar', { email: 'nuca@exemplo.com', senha: 'errada123' })
  assert.equal(recusado.status, 401)
  assert.equal(recusado.erro.codigo, 'CREDENCIAIS_INVALIDAS')
  assert.equal((await request('/auth/cadastro', { nome: 'Ana', email: 'ana@x.com', senha: 'curta', papel: 'artesao' })).status, 400)
  const cadastroArtesao = await request('/auth/cadastro', { nome: 'Mestre Nuca', email: 'Nova@Exemplo.com', senha: 'segredo123', papel: 'artesao', territorio: 'Mata Norte', tecnica: 'Xilogravura' })
  assert.equal(cadastroArtesao.status, 201)
  assert.equal(cadastroArtesao.dados.artesao, 'mestre-nuca-2')
  assert.equal((await request('/artesaos/mestre-nuca-2')).dados.nome, 'Mestre Nuca')
  assert.equal((await request('/auth/cadastro', { nome: 'Outra', email: 'nova@exemplo.com', senha: 'segredo123', papel: 'comprador' })).erro.codigo, 'EMAIL_EM_USO')
  assert.equal((await request('/auth/entrar', { email: 'nova@exemplo.com', senha: 'segredo123' })).dados.papel, 'artesao')
  assert.equal((await request('/usuarios')).status, 404)
  const perfil = await request('/artesaos/mestre-dila', { atelie: '  Ateliê Novo  ', historia: 'Goiva desde menino.', territorio: 'Bezerros, Agreste', imagem: 'data:image/png;base64,iVBORw0KGgo=', selo: false }, 'PATCH')
  assert.equal(perfil.status, 200)
  assert.equal(perfil.dados.atelie, 'Ateliê Novo')
  assert.equal(perfil.dados.selo, true)
  assert.equal((await request('/artesaos/mestre-dila')).dados.territorio, 'Bezerros, Agreste')
  const fotoInvalida = await request('/artesaos/mestre-dila', { imagem: 'data:image/gif;base64,R0lGOD' }, 'PATCH')
  assert.equal(fotoInvalida.status, 400)
  assert.equal(fotoInvalida.erro.codigo, 'FOTO_INVALIDA')
  assert.equal((await request('/artesaos/mestre-dila', { nome: ' ' }, 'PATCH')).status, 400)
  assert.equal((await request('/artesaos/inexistente', { nome: 'X' }, 'PATCH')).status, 404)
  const padrao = await request('/artesaos/mestre-dila/configuracoes')
  assert.equal(padrao.dados.prazoPadraoDias, 15)
  const envio = await request('/artesaos/mestre-dila/configuracoes', { cepOrigem: '55640-000', prazoPadraoDias: 20 }, 'PATCH')
  assert.equal(envio.status, 200)
  assert.equal(envio.dados.aceitaEncomendas, true)
  const pix = await request('/artesaos/mestre-dila/configuracoes', { chavePix: 'dila@exemplo.com' }, 'PATCH')
  assert.equal(pix.dados.cepOrigem, '55640-000')
  assert.equal(pix.dados.chavePix, 'dila@exemplo.com')
  assert.equal((await request('/artesaos/mestre-dila/configuracoes', { cepOrigem: '123' }, 'PATCH')).status, 400)
  assert.equal((await request('/artesaos/mestre-dila/configuracoes', { prazoPadraoDias: 500 }, 'PATCH')).status, 400)
  assert.equal((await request('/artesaos/mestre-dila/configuracoes', {}, 'PATCH')).status, 400)
  assert.equal((await request('/configuracoesAtelie')).status, 404)
  assert.equal((await request('/artesaos/mestre-dila')).dados.chavePix, undefined)
  assert.ok((await request('/artesao/pedidos-pendentes?artesao=dona-bia-do-ipojuca')).dados.length > 0)
  assert.equal((await request('/artesao/pedidos-pendentes?artesao=mestre-dila')).dados.length, 0)
  assert.ok((await request('/artesao/conversas?artesao=mestre-nuca')).dados.some((c) => c.id === 'PE-2026-8941'))
  assert.equal((await request('/auth/entrar', { email: 'admin@exemplo.com', senha: 'balaio123' })).dados.papel, 'admin')
  assert.equal((await request('/auth/cadastro', { nome: 'Intruso', email: 'x@exemplo.com', senha: 'segredo123', papel: 'admin' })).status, 400)
  assert.ok((await request('/pedidos?compradorId=u-carlos')).dados.every((p) => p.compradorId === 'u-carlos'))
  assert.equal((await request('/pedidos?compradorId=u-nuca')).dados.length, 0)
  const conta = cadastroArtesao.dados.id
  const autorizacaoConta = { Cookie: cadastroArtesao.cookie.split(';')[0] }
  assert.equal((await request(`/conta/${conta}`, { nome: 'Nuca Filho', email: 'carlos@exemplo.com' }, 'PATCH', autorizacaoConta)).status, 409)
  assert.equal((await request(`/conta/${conta}`, { nome: 'Nuca Filho', email: 'nova@exemplo.com', telefone: '81' }, 'PATCH', autorizacaoConta)).dados.nome, 'Nuca Filho')
  assert.equal((await request(`/conta/${conta}/senha`, { senhaAtual: 'errada', novaSenha: 'outra12345' }, 'POST', autorizacaoConta)).status, 401)
  assert.equal((await request(`/conta/${conta}/senha`, { senhaAtual: 'segredo123', novaSenha: 'outra12345' }, 'POST', autorizacaoConta)).status, 200)
  assert.equal((await request('/auth/entrar', { email: 'nova@exemplo.com', senha: 'outra12345' })).status, 200)

  const sessaoBia = await request('/auth/entrar', { email: 'dona-bia-do-ipojuca@exemplo.com', senha: 'balaio123' })
  const autorizacaoBia = { Cookie: sessaoBia.cookie.split(';')[0] }
  const [aceitavel, recusavel] = (await request('/artesao/pedidos-pendentes?artesao=dona-bia-do-ipojuca', undefined, 'GET', autorizacaoBia)).dados
  const aceito = await request(`/pedidos/${aceitavel.id}/estado`, { estado: 'producao' }, 'PATCH', autorizacaoBia)
  assert.equal(aceito.status, 200)
  assert.equal(aceito.dados.estado, 'producao')
  assert.match(aceito.dados.data, /^\d{2}\/\d{2}\/\d{4}$/)
  const pedidoRecusado = await request(`/pedidos/${recusavel.id}/recusar`, { motivo: 'Sem material no momento.' }, 'PATCH', autorizacaoBia)
  assert.equal(pedidoRecusado.status, 200)
  assert.match(pedidoRecusado.dados.data, /^\d{2}\/\d{2}\/\d{4}$/)
  assert.equal((await request('/artesao/pedidos-pendentes?artesao=dona-bia-do-ipojuca', undefined, 'GET', autorizacaoBia)).dados.length, 0)

  const sessaoNuca = await request('/auth/entrar', { email: 'nuca@exemplo.com', senha: 'balaio123' })
  const autorizacaoNuca = { Cookie: sessaoNuca.cookie.split(';')[0] }
  const sessaoDila = await request('/auth/entrar', { email: 'mestre-dila@exemplo.com', senha: 'balaio123' })
  const autorizacaoDila = { Cookie: sessaoDila.cookie.split(';')[0] }
  assert.equal((await request('/videos/v-001', { legenda: 'Sem login' }, 'PATCH')).status, 401)
  assert.equal((await request('/videos/v-001', { legenda: 'De outro ateliê' }, 'PATCH', autorizacaoDila)).status, 404)
  assert.equal((await request('/videos/v-001', { legenda: 'Trocada' }, 'PUT', autorizacaoNuca)).status, 405)
  assert.equal((await request('/videos/v-001', { legenda: '   ' }, 'PATCH', autorizacaoNuca)).status, 400)
  assert.equal((await request('/videos/v-001', { peca: 'painel-xilogravura-sertaneja' }, 'PATCH', autorizacaoNuca)).status, 400)
  const editado = await request('/videos/v-001', { legenda: 'Legenda nova', etiquetas: ['barro'], situacao: 'rascunho', artesao: 'mestre-dila', curtidas: 9 }, 'PATCH', autorizacaoNuca)
  assert.equal(editado.status, 200)
  assert.equal(editado.dados.legenda, 'Legenda nova')
  assert.equal(editado.dados.publicadoEm, 'Rascunho')
  assert.equal(editado.dados.artesao, 'mestre-nuca')
  assert.notEqual(editado.dados.curtidas, 9)
  assert.ok(!(await request('/videos')).dados.some((video) => video.id === 'v-001'))
  assert.equal((await request('/videos/v-001', { situacao: 'publicada' }, 'PATCH', autorizacaoNuca)).dados.publicadoEm, 'agora')
  assert.equal((await request('/videos/v-001', undefined, 'DELETE', autorizacaoDila)).status, 404)
  assert.ok((await request('/videos/v-001/comentarios')).dados.length > 0)
  assert.equal((await request('/videos/v-001', undefined, 'DELETE', autorizacaoNuca)).status, 200)
  assert.equal((await request('/videos/v-001/comentarios')).status, 404)
  assert.ok(!(await request('/videos')).dados.some((video) => video.id === 'v-001'))
})

test('pedido misto legado não pode ser alterado por apenas um dos artesãos', async (t) => {
  process.env.NODE_ENV = 'test'
  const pasta = mkdtempSync(path.join(tmpdir(), 'balaio-api-'))
  const arquivo = path.join(pasta, 'db.json')
  const banco = JSON.parse(readFileSync(path.join(__dirname, 'seed.json'), 'utf8'))
  const pecaNuca = banco.pecas.find((peca) => peca.artesao === 'mestre-nuca' && peca.disponibilidade === 'unica')
  const pecaOutro = banco.pecas.find((peca) => peca.artesao !== 'mestre-nuca' && peca.disponibilidade === 'unica')
  const id = 'PE-misto-legado'
  banco.pedidos.push({ id, itens: [{ slug: pecaNuca.slug, quantidade: 1 }, { slug: pecaOutro.slug, quantidade: 1 }], estado: 'confirmado', etapas: [] })
  for (const peca of [pecaNuca, pecaOutro]) {
    peca.inativadoEm = new Date().toISOString()
    peca.vendidaEmPedido = id
  }
  writeFileSync(arquivo, JSON.stringify(banco))
  const servidor = criarServidor(arquivo).listen(0, '127.0.0.1')
  await new Promise((resolve) => servidor.once('listening', resolve))
  t.after(async () => {
    await new Promise((resolve) => servidor.close(resolve))
    rmSync(pasta, { recursive: true, force: true })
  })
  const base = `http://127.0.0.1:${servidor.address().port}/api/v1`
  const login = await fetch(base + '/auth/entrar', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: 'nuca@exemplo.com', senha: 'balaio123' }) })
  assert.equal(login.status, 200)
  const cookie = login.headers.get('set-cookie').split(';')[0]
  for (const [rota, body] of [['recusar', { motivo: 'Não posso atender.' }], ['estado', { estado: 'producao' }]]) {
    const resposta = await fetch(`${base}/pedidos/${id}/${rota}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json', Cookie: cookie }, body: JSON.stringify(body) })
    assert.equal(resposta.status, 403, rota)
  }
  const salvo = JSON.parse(readFileSync(arquivo, 'utf8'))
  assert.equal(salvo.pedidos.find((pedido) => pedido.id === id).estado, 'confirmado')
  for (const peca of [pecaNuca, pecaOutro]) {
    const atual = salvo.pecas.find((item) => item.slug === peca.slug)
    assert.equal(atual.vendidaEmPedido, id)
    assert.ok(atual.inativadoEm)
  }
})

test('completa tipo das peças e referências em um banco antigo', async () => {
  process.env.NODE_ENV = 'test'
  const pasta = mkdtempSync(path.join(tmpdir(), 'balaio-api-'))
  const arquivo = path.join(pasta, 'db.json')
  const antigo = JSON.parse(readFileSync(path.join(__dirname, 'seed.json'), 'utf8'))
  for (const peca of antigo.pecas) delete peca.tipo
  delete antigo.referencias.tipos
  writeFileSync(arquivo, JSON.stringify(antigo))
  criarServidor(arquivo)
  const atualizado = JSON.parse(readFileSync(arquivo, 'utf8'))
  rmSync(pasta, { recursive: true, force: true })
  assert.ok(atualizado.pecas.every((p) => p.tipo))
  assert.equal(atualizado.referencias.tipos.length, 6)
})

test('banco antigo: peças em curadoria vão para a loja e a fila vira pedido de selo', async () => {
  process.env.NODE_ENV = 'test'
  const pasta = mkdtempSync(path.join(tmpdir(), 'balaio-api-'))
  const arquivo = path.join(pasta, 'db.json')
  const antigo = JSON.parse(readFileSync(path.join(__dirname, 'seed.json'), 'utf8'))
  antigo.pecas[0].situacao = 'curadoria'
  antigo.curadoria = [{ id: 'CUR-1', pecaSlug: antigo.pecas[0].slug, peca: antigo.pecas[0].nome, artesao: 'Couraria do Pajeú', artesaoSlug: 'ze-do-cariri', enviadoEm: 'agora', motivo: 'Nova publicação' }]
  writeFileSync(arquivo, JSON.stringify(antigo))
  criarServidor(arquivo)
  const atualizado = JSON.parse(readFileSync(arquivo, 'utf8'))
  rmSync(pasta, { recursive: true, force: true })
  assert.ok(atualizado.pecas.every((p) => ['publicada', 'rascunho'].includes(p.situacao)))
  assert.equal(atualizado.pecas[0].situacao, 'publicada')
  assert.ok(!atualizado.curadoria.some((c) => c.pecaSlug))
  const semSelo = atualizado.artesaos.filter((a) => !a.selo).map((a) => a.slug)
  assert.deepEqual(atualizado.curadoria.filter((c) => c.situacao === 'pendente').map((c) => c.artesaoSlug).sort(), semSelo.sort())
})
