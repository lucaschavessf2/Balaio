import assert from 'node:assert/strict'
import { after, before, test } from 'node:test'
import { createServer, type IncomingMessage } from 'node:http'
import { createHmac, randomBytes } from 'node:crypto'
import { encaminharApi } from '../src/services/api/proxy'
import { destinoInicial, destinoSeguro, lerSessaoDoCookie, sessaoDoUsuario } from '../src/services/sessao/cookie'
import { papelDaRota, rotaProtegida } from '../src/services/sessao/rotas'
import { validarSenha } from '../src/utils/validacao'

const eventos: { destino: string; caminho: string; headers: IncomingMessage['headers']; corpo: string }[] = []
let statusUsuario = 200
let statusFake = 200
const contaReal = { id: '160bf59e-eabe-4d15-9f94-ef881dfac9ed', nome: 'Conta real', email: 'conta@teste.invalid', papel: 'comprador' }
const servidores = ['gateway', 'fake'].map((destino) => createServer(async (req, res) => {
  let corpo = ''
  for await (const pedaco of req) corpo += pedaco
  eventos.push({ destino, caminho: req.url!, headers: req.headers, corpo })
  res.setHeader('Content-Type', 'application/json')
  if (destino === 'fake' && statusFake !== 200) {
    res.statusCode = statusFake
    res.end(JSON.stringify({ dados: null, erro: { codigo: 'NAO_AUTENTICADO', mensagem: 'Contexto inválido' } }))
    return
  }
  if (req.url === '/api/v1/usuario') {
    res.statusCode = statusUsuario
    res.end(JSON.stringify({ dados: res.statusCode === 200 ? contaReal : null, erro: res.statusCode === 200 ? null : { codigo: 'NAO_AUTENTICADO', mensagem: 'Sem sessão' } }))
    return
  }
  res.setHeader('Set-Cookie', destino === 'gateway'
    ? 'balaio_sessao=jwt.exemplo.assinatura; Path=/api/v1; HttpOnly; SameSite=Lax; Max-Age=3600'
    : ['balaio_sessao=opaco-antigo; Path=/; HttpOnly; SameSite=Lax', 'balaio_demo_sessao=opaco-antigo; Path=/api/v1; HttpOnly', 'balaio_cliente=visitante; Path=/; HttpOnly'])
  res.end(JSON.stringify({ dados: { destino }, erro: null }))
}))

before(async () => {
  for (const servidor of servidores) await new Promise<void>((resolve) => servidor.listen(0, '127.0.0.1', resolve))
  const base = (indice: number) => `http://127.0.0.1:${(servidores[indice].address() as { port: number }).port}/api/v1`
  process.env.API_GATEWAY_URL = base(0)
  process.env.API_URL = base(1)
  process.env.AUTH_ALLOWED_ORIGINS = 'http://localhost:4321'
  process.env.BALAIO_FAKE_INTERNAL_KEY = randomBytes(32).toString('base64url')
})
after(async () => { for (const servidor of servidores) await new Promise<void>((resolve) => servidor.close(() => resolve())) })

const chamar = (caminho: string, metodo = 'GET', headers: HeadersInit = {}, corpo?: unknown) => encaminharApi(new Request(`http://localhost:4321/api/v1${caminho}`, {
  method: metodo, headers: { Origin: 'http://localhost:4321', 'Content-Type': 'application/json', ...headers },
  body: corpo === undefined ? undefined : JSON.stringify(corpo),
}))

function verificarLimpezaDemo(resposta: Response) {
  const cookies = resposta.headers.getSetCookie().filter((cookie) => cookie.startsWith('balaio_demo_sessao='))
  assert.equal(cookies.length, 2)
  for (const caminho of ['/api/v1', '/']) {
    assert.ok(cookies.some((cookie) => cookie.startsWith('balaio_demo_sessao=;') && cookie.includes(`Path=${caminho};`) && cookie.includes('HttpOnly') && cookie.includes('Max-Age=0')))
  }
}

for (const caminho of ['/auth/cadastro', '/auth/login', '/auth/entrar', '/auth/logout']) {
  test(`${caminho} usa exclusivamente gateway e preserva cookie HttpOnly`, async () => {
    eventos.length = 0
    const resposta = await chamar(caminho, 'POST', { Cookie: 'balaio_sessao=real; balaio_demo_sessao=simulado; balaio-sessao=forjado', 'X-User-Id': 'admin', 'X-Role': 'admin' }, { email: 'conta@teste.invalid', senha: 'SenhaSomenteTeste123' })
    assert.equal(resposta.status, 200)
    assert.equal(eventos.length, 1)
    assert.equal(eventos[0].destino, 'gateway')
    assert.equal(eventos[0].headers.cookie, 'balaio_sessao=real')
    assert.equal(eventos[0].headers['x-user-id'], undefined)
    assert.equal(eventos[0].headers['x-role'], undefined)
    assert.equal(eventos[0].headers.origin, 'http://localhost:4321')
    const cookies = resposta.headers.getSetCookie()
    const sessao = cookies.find((cookie) => cookie.startsWith('balaio_sessao=jwt.'))
    assert.ok(sessao && sessao.endsWith('Path=/') && sessao.includes('HttpOnly') && !sessao.includes('Path=/api/v1'))
    assert.ok(cookies.some((cookie) => cookie.startsWith('balaio_sessao=;') && cookie.includes('Path=/api/v1;') && cookie.includes('Max-Age=0')))
    verificarLimpezaDemo(resposta)
  })
}

test('GET /usuario vai somente ao gateway e conserva 401 e 403 sem consultar Fake', async () => {
  try {
    for (const status of [200, 401, 403]) {
      eventos.length = 0
      statusUsuario = status
      const resposta = await chamar('/usuario', 'GET', { Authorization: 'Bearer jwt-real', Cookie: 'balaio_sessao=real; balaio_demo_sessao=antigo; balaio_cliente=visitante' })
      assert.equal(resposta.status, status)
      assert.equal(eventos.length, 1)
      assert.equal(eventos[0].destino, 'gateway')
      assert.equal(eventos[0].headers.authorization, 'Bearer jwt-real')
      assert.equal(eventos[0].headers.cookie, 'balaio_sessao=real')
      verificarLimpezaDemo(resposta)
    }
  } finally { statusUsuario = 200 }
})

test('itens da conta usam Fake com identidade confirmada no gateway, sem JWT ou senha no simulador', async () => {
  const rotas: [string, string, unknown?][] = [
    ['/conta/perfil', 'GET'], ['/usuario', 'PATCH', { nome: 'Nome local', telefone: '81999999999' }],
    ['/usuario/enderecos', 'GET'], ['/usuario/enderecos', 'POST', { apelido: 'Casa', rua: 'Rua 1', bairro: 'Centro', cep: '50000-000' }],
    ['/usuario/enderecos/endereco', 'PATCH', { principal: true }], ['/usuario/enderecos/endereco', 'DELETE'],
    ['/pedidos', 'GET'], ['/pedidos/pedido', 'GET'],
  ]
  for (const [caminho, metodo, corpo] of rotas) {
    eventos.length = 0
    const resposta = await chamar(caminho, metodo, {
      Cookie: 'balaio_sessao=JWTREAL; balaio_demo_sessao=ANTIGO; balaio_cliente=visitante',
      Authorization: 'Bearer JWTREAL', 'X-User-Id': 'admin', 'X-Role': 'admin',
      'X-Balaio-Contexto': 'forjado', 'X-Balaio-Assinatura': 'forjada',
    }, corpo)
    assert.equal(resposta.status, 200, `${metodo} ${caminho}`)
    assert.equal(eventos.length, 2)
    const [gateway, fake] = eventos
    assert.equal(gateway.destino, 'gateway')
    assert.equal(gateway.caminho, '/api/v1/usuario')
    assert.equal(gateway.headers.cookie, 'balaio_sessao=JWTREAL')
    assert.equal(gateway.headers.authorization, 'Bearer JWTREAL')
    assert.equal(gateway.corpo, '')
    assert.equal(fake.destino, 'fake')
    assert.equal(fake.caminho, `/api/v1${caminho === '/conta/perfil' ? '/usuario' : caminho}`)
    for (const nome of ['authorization', 'cookie', 'x-user-id', 'x-role']) assert.equal(fake.headers[nome], undefined)
    const valor = fake.headers['x-balaio-contexto'] as string
    const contexto = JSON.parse(Buffer.from(valor, 'base64url').toString())
    assert.deepEqual({ sub: contexto.sub, nome: contexto.nome, email: contexto.email, papel: contexto.papel }, {
      sub: contaReal.id, nome: contaReal.nome, email: contaReal.email, papel: contaReal.papel,
    })
    assert.equal(contexto.metodo, metodo)
    assert.equal(contexto.caminho, fake.caminho)
    assert.ok(contexto.exp > Date.now() / 1000 && contexto.exp <= Math.floor(Date.now() / 1000) + 30)
    assert.equal(fake.headers['x-balaio-assinatura'], createHmac('sha256', process.env.BALAIO_FAKE_INTERNAL_KEY!).update(valor).digest('hex'))
    assert.ok(!JSON.stringify(fake).includes('JWTREAL'))
    assert.equal(resposta.headers.get('x-balaio-contexto'), null)
    assert.ok(!resposta.headers.getSetCookie().some((cookie) => cookie.startsWith('balaio_sessao=')))
    verificarLimpezaDemo(resposta)
  }
})

test('sessão ausente, negada ou indisponível não acessa os dados Fake e só 401 real invalida a sessão', async () => {
  try {
    for (const status of [401, 403, 503]) {
      statusUsuario = status
      eventos.length = 0
      const resposta = await chamar('/conta/perfil', 'GET', { Cookie: 'balaio_sessao=JWTREAL' })
      assert.equal(resposta.status, status === 503 ? 502 : status)
      assert.equal(resposta.headers.get('x-balaio-sessao'), status === 401 ? 'invalida' : null)
      assert.deepEqual(eventos.map((e) => e.destino), ['gateway'])
    }
    statusUsuario = 200
    statusFake = 401
    assert.equal((await chamar('/conta/perfil')).status, 502)
  } finally { statusUsuario = 200; statusFake = 200 }
})

test('mutações da conta exigem Origin autorizado com cookie; Bearer puro funciona sem Origin', async () => {
  for (const origin of [null, 'null', 'https://externa.invalid', 'http://localhost:4321.externa.invalid']) {
    eventos.length = 0
    const headers = new Headers({ Cookie: 'balaio_sessao=JWTREAL', 'Content-Type': 'application/json' })
    if (origin !== null) headers.set('Origin', origin)
    const resposta = await encaminharApi(new Request('http://localhost:4321/api/v1/usuario', { method: 'PATCH', headers, body: JSON.stringify({ nome: 'Nome' }) }))
    assert.equal(resposta.status, 403)
    assert.equal(eventos.length, 0)
  }
  eventos.length = 0
  const resposta = await encaminharApi(new Request('http://localhost:4321/api/v1/usuario', {
    method: 'PATCH', headers: { Authorization: 'Bearer JWTREAL', 'Content-Type': 'application/json' }, body: JSON.stringify({ nome: 'Nome' }),
  }))
  assert.equal(resposta.status, 200)
  assert.deepEqual(eventos.map((e) => e.destino), ['gateway', 'fake'])
})

test('payload manipulado, senha e consultas alternativas não seguem para a Fake API', async () => {
  for (const dados of [{ senha: 'SENHA_REAL' }, { papel: 'admin' }, { id: 'outra-conta' }, { nome: { senha: 'SENHA_REAL' } }, [], null]) {
    eventos.length = 0
    assert.equal((await chamar('/usuario', 'PATCH', {}, dados)).status, 400)
    assert.equal(eventos.length, 0)
  }
  for (const caminho of ['/pedidos?compradorId=outra-conta', '/conta/perfil?usuarioId=admin']) {
    eventos.length = 0
    assert.equal((await chamar(caminho)).status, 400)
    assert.equal(eventos.length, 0)
  }
  eventos.length = 0
  const invalido = await encaminharApi(new Request('http://localhost:4321/api/v1/usuario', { method: 'PATCH', body: '{' }))
  assert.equal(invalido.status, 400)
  assert.equal(eventos.length, 0)
})

test('ponte sem chave interna falha fechada e não cria sessão Demo', async () => {
  const anterior = process.env.BALAIO_FAKE_INTERNAL_KEY
  try {
    for (const valor of ['', 'curta']) {
      process.env.BALAIO_FAKE_INTERNAL_KEY = valor
      eventos.length = 0
      const resposta = await chamar('/conta/perfil')
      assert.equal(resposta.status, 503)
      assert.equal(eventos.length, 0)
      verificarLimpezaDemo(resposta)
    }
  } finally { process.env.BALAIO_FAKE_INTERNAL_KEY = anterior }
})

test('catálogo, sacola e favoritos continuam Fake sem JWT, cookie Demo ou identidade real', async () => {
  const rotas: [string, string, unknown?][] = [
    ['/estado', 'GET'], ['/pecas', 'GET'], ['/artesaos/mestre-nuca/pecas', 'GET'],
    ['/pecas/peca-publica/perguntas', 'GET'], ['/fretes', 'GET'],
    ['/estado/sacola', 'PUT', { sacola: [{ slug: 'peca-publica', quantidade: 1 }] }],
    ['/estado/favoritos', 'PUT', { favoritos: ['peca-publica'] }],
  ]
  for (const [caminho, metodo, corpo] of rotas) {
    eventos.length = 0
    const resposta = await chamar(caminho, metodo, {
      Cookie: 'balaio_sessao=JWTREAL; balaio_demo_sessao=DEMOANTIGO; balaio-sessao=FORJADO; balaio_cliente=visitante',
      Authorization: 'Bearer JWTREAL', 'X-Role': 'admin', 'X-User-Id': 'administrador',
    }, corpo)
    assert.equal(resposta.status, 200, caminho)
    assert.equal(eventos.length, 1, caminho)
    assert.equal(eventos[0].destino, 'fake', caminho)
    assert.equal(eventos[0].headers.cookie, 'balaio_cliente=visitante')
    for (const header of ['authorization', 'x-role', 'x-user-id']) assert.equal(eventos[0].headers[header], undefined)
    assert.ok(!JSON.stringify(eventos).includes('JWTREAL'))
    assert.ok(!JSON.stringify(eventos).includes('DEMOANTIGO'))
    assert.ok(resposta.headers.getSetCookie().every((cookie) => cookie.startsWith('balaio_cliente=') || (cookie.startsWith('balaio_demo_sessao=;') && cookie.includes('Max-Age=0'))))
    verificarLimpezaDemo(resposta)
  }
})

test('capacidades privadas retornam 404 sem upstream, mesmo com JWT, cookie Demo e flag antiga', async () => {
  const rotas: [string, string][] = [
    ['/pedidos/pedido/conversa', 'GET'],
    ['/pedidos/pedido/conversa', 'POST'], ['/pedidos/pedido/avaliacao', 'POST'],
    ['/pedidos/pedido/estado', 'PATCH'], ['/pedidos/pedido/recusar', 'PATCH'], ['/pedidos/pedido/cancelar', 'PATCH'],
    ['/checkout', 'POST'], ['/artesao/me', 'GET'], ['/artesao/conversas', 'GET'], ['/artesao/pedidos-pendentes', 'GET'],
    ['/artesaos/atelie/configuracoes', 'PATCH'], ['/artesaos/atelie/pecas', 'POST'],
    ['/admin/curadoria', 'GET'], ['/admin/curadoria/item', 'PATCH'],
    ['/admin/mediacoes', 'GET'], ['/admin/mediacoes', 'POST'], ['/admin/criterios', 'PUT'],
    ['/pecas', 'POST'], ['/pecas/peca', 'PATCH'], ['/pecas/peca', 'DELETE'],
    ['/pecas/peca/perguntas', 'POST'], ['/pecas/peca/perguntas/pergunta', 'PATCH'],
    ['/videos?painel=true', 'GET'], ['/videos', 'POST'], ['/videos/video', 'PATCH'], ['/videos/video', 'DELETE'],
    ['/demo/contas', 'GET'], ['/demo/sessao', 'GET'], ['/demo/sessao', 'POST'], ['/demo/sessao', 'DELETE'], ['/demo/desconhecido', 'GET'],
  ]
  const anterior = process.env.FAKE_API_DEMO_ENABLED
  try {
    for (const flag of ['true', 'false', undefined]) {
      if (flag === undefined) delete process.env.FAKE_API_DEMO_ENABLED
      else process.env.FAKE_API_DEMO_ENABLED = flag
      for (const [caminho, metodo] of rotas) {
        eventos.length = 0
        const resposta = await chamar(caminho, metodo, {
          Cookie: 'balaio_sessao=JWTREAL; balaio_demo_sessao=opaco-antigo', Authorization: 'Bearer JWTREAL', 'X-Role': 'admin',
        }, ['GET', 'HEAD'].includes(metodo) ? undefined : { id: 'admin', usuarioId: 'outra-conta' })
        assert.equal(resposta.status, 404, `${metodo} ${caminho}, flag=${flag}`)
        assert.deepEqual(await resposta.json(), { dados: null, erro: { codigo: 'RECURSO_NAO_ENCONTRADO', mensagem: 'Recurso não encontrado.' } })
        assert.equal(eventos.length, 0, `${metodo} ${caminho}`)
        assert.equal(resposta.headers.get('X-Balaio-Sessao'), null)
        verificarLimpezaDemo(resposta)
      }
    }
  } finally {
    if (anterior === undefined) delete process.env.FAKE_API_DEMO_ENABLED
    else process.env.FAKE_API_DEMO_ENABLED = anterior
  }
})

test('rotas privadas não validam sessão nem configuração dos upstreams e não emitem cookie Demo', async () => {
  const gateway = process.env.API_GATEWAY_URL
  const fake = process.env.API_URL
  try {
    process.env.API_GATEWAY_URL = 'configuração inválida'
    process.env.API_URL = 'configuração inválida'
    for (const origin of ['http://localhost:4321', 'https://externa.invalid', 'null', '']) {
      eventos.length = 0
      const resposta = await chamar('/demo/sessao', 'POST', { Origin: origin, Cookie: 'balaio_sessao=JWTREAL; balaio_demo_sessao=antigo' }, { id: 'admin' })
      assert.equal(resposta.status, 404)
      verificarLimpezaDemo(resposta)
      assert.equal(eventos.length, 0)
    }
    assert.equal((await chamar('/admin/curadoria')).status, 404)
  } finally { process.env.API_GATEWAY_URL = gateway; process.env.API_URL = fake }
})

test('não há fallback para Fake quando gateway está indisponível', async () => {
  const anterior = process.env.API_GATEWAY_URL
  try {
    process.env.API_GATEWAY_URL = 'http://127.0.0.1:1/api/v1'
    eventos.length = 0
    const resposta = await chamar('/auth/login', 'POST', {}, { email: 'teste', senha: 'somente-teste' })
    assert.equal(resposta.status, 502)
    assert.equal(eventos.length, 0)
  } finally { process.env.API_GATEWAY_URL = anterior }
})

test('destinos iguais e caminhos ambíguos não autenticam na Fake API', async () => {
  const anterior = process.env.API_GATEWAY_URL
  try {
    process.env.API_GATEWAY_URL = process.env.API_URL
    assert.equal((await chamar('/auth/login', 'POST', {}, {})).status, 502)
  } finally { process.env.API_GATEWAY_URL = anterior }
  assert.equal((await chamar('/auth%2flogin', 'POST', {}, {})).status, 400)
  assert.equal((await chamar('/auth/login')).status, 405)
  assert.equal((await chamar('/sessoes')).status, 404)
})

test('aliases e coleções nativas nunca chegam ao json-server', async () => {
  for (const caminho of ['/db', '/mensagens', '/mediacoes', '/pedidosPendentes', '/configuracoesAtelie', '/PEDIDOS', '/usuario/', '/auth/login/', '/AUTH/LOGIN', '/auth/%6cogin']) {
    eventos.length = 0
    const resposta = await chamar(caminho, caminho.toLowerCase().includes('login') ? 'POST' : 'GET', {}, caminho.toLowerCase().includes('login') ? { senha: 'NAO_ENCAMINHAR' } : undefined)
    assert.equal(resposta.status, 404, caminho)
    assert.equal(eventos.length, 0, caminho)
  }
})

test('expansões json-server não expõem usuários nem sessões', async () => {
  for (const query of ['?_embed=usuarios', '?_expand=usuario', '?_embed%5B%5D=usuarios']) {
    eventos.length = 0
    assert.equal((await chamar(`/artesaos/mestre-nuca${query}`)).status, 400)
    assert.equal(eventos.length, 0)
  }
})

test('JSON legado não autentica e redirects externos são rejeitados', () => {
  assert.equal(lerSessaoDoCookie(encodeURIComponent(JSON.stringify({ id: 'admin', papel: 'admin' }))), null)
  for (const proximo of ['//externa.invalid', '/\\externa.invalid', '/%2fexterna.invalid', '/\nexterna.invalid']) assert.equal(destinoSeguro(proximo), undefined)
  assert.equal(destinoSeguro('/orders?pagina=2'), '/orders?pagina=2')
  assert.equal(sessaoDoUsuario({ nome: 'A', email: 'a@b.c', imagem: '', id: 'a' }), null)
  for (const [papel, destino] of [['comprador', '/account'], ['artesao', '/dashboard'], ['admin', '/admin']] as const) {
    assert.equal(destinoInicial({ id: 'real', nome: 'Real', email: 'real@auth.test', imagem: '', papel }), destino)
  }
})

test('rotas por limites de segmento e política de senha alinhada ao domínio', () => {
  assert.equal(rotaProtegida('/account/details'), true)
  assert.equal(rotaProtegida('/accounting'), false)
  assert.equal(papelDaRota('/admin/criteria'), 'admin')
  assert.equal(papelDaRota('/dashboard/pieces'), 'artesao')
  assert.ok(validarSenha('curta123'))
  assert.equal(validarSenha('SenhaSomenteTeste123'), null)
  assert.ok(validarSenha('á'.repeat(37)))
  assert.ok(validarSenha('a'.repeat(12) + '\u0000'))
})

test('sem API_GATEWAY_URL o proxy repassa tudo à Fake API, inclusive autenticação e cookies', async () => {
  const anterior = process.env.API_GATEWAY_URL
  try {
    delete process.env.API_GATEWAY_URL
    for (const [caminho, metodo] of [['/auth/login', 'POST'], ['/checkout', 'POST'], ['/admin/curadoria', 'GET'], ['/usuario', 'GET']]) {
      eventos.length = 0
      const resposta = await chamar(caminho, metodo, { Cookie: 'balaio_sessao=opaco; balaio_cliente=visitante', Authorization: 'Bearer opaco' }, metodo === 'GET' ? undefined : {})
      assert.equal(resposta.status, 200, caminho)
      assert.deepEqual(eventos.map((e) => e.destino), ['fake'], caminho)
      assert.equal(eventos[0].headers.cookie, 'balaio_sessao=opaco; balaio_cliente=visitante')
      assert.equal(eventos[0].headers.authorization, 'Bearer opaco')
    }
  } finally { process.env.API_GATEWAY_URL = anterior }
})
