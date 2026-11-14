// Gateway controlado para testes do navegador; não substitui os testes Java.
// A Fake API é a implementação real do simulador, com banco temporário.
const { createServer } = require('node:http')
const { generateKeyPairSync, sign, verify, randomUUID } = require('node:crypto')
const { mkdtempSync, readFileSync } = require('node:fs')
const { tmpdir } = require('node:os')
const path = require('node:path')
const { criarServidor } = require('../../fake-api/server.cjs')
const chaves = generateKeyPairSync('rsa', { modulusLength: 3072 })
const pasta = mkdtempSync(path.join(tmpdir(), 'balaio-auth-browser-'))
const fake = criarServidor(path.join(pasta, 'db.json'))
const eventos = []
const tokens = new Set()
const contas = new Map()
let configuracao = {}
const senhaTeste = 'SenhaDeTeste123!'
for (const papel of ['comprador', 'artesao', 'admin']) {
  const email = `${papel}@auth.test`
  contas.set(email, { id: randomUUID(), nome: `Conta real ${papel}`, email, papel, perfil: papel === 'admin' ? undefined : papel, imagem: '', senha: senhaTeste })
}
const publico = (conta) => { const dados = { ...conta }; delete dados.senha; return dados }
const json = (res, status, dados, codigo) => {
  res.writeHead(status, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' })
  res.end(JSON.stringify({ dados, erro: codigo ? { codigo, mensagem: codigo === 'CREDENCIAIS_INVALIDAS' ? 'E-mail ou senha inválidos.' : 'Não foi possível concluir a solicitação.' } : null }))
}
function emitir(conta) {
  const iat = Math.floor(Date.now() / 1000)
  const partes = [Buffer.from(JSON.stringify({ alg: 'RS256', typ: 'JWT' })).toString('base64url'),
    Buffer.from(JSON.stringify({ sub: conta.id, papel: conta.papel, iss: 'balaio-browser-test', aud: 'api', iat, exp: iat + 3600, jti: randomUUID() })).toString('base64url')]
  const token = `${partes.join('.')}.${sign('RSA-SHA256', Buffer.from(partes.join('.')), chaves.privateKey).toString('base64url')}`
  tokens.add(token)
  return token
}
function validar(req) {
  const token = req.headers.authorization?.replace(/^Bearer /, '') ?? /(?:^|;)\s*balaio_sessao=([^;]+)/.exec(req.headers.cookie ?? '')?.[1]
  if (!token || configuracao.expirar) return null
  try {
    const [cabecalho, payload, assinatura] = token.split('.')
    if (!verify('RSA-SHA256', Buffer.from(`${cabecalho}.${payload}`), chaves.publicKey, Buffer.from(assinatura, 'base64url'))) return null
    const claims = JSON.parse(Buffer.from(payload, 'base64url'))
    if (claims.exp <= Date.now() / 1000) return null
    return [...contas.values()].find((conta) => conta.id === claims.sub)
  } catch { return null }
}
const cookie = (token, expirar = false) => `balaio_sessao=${token}; Path=/api/v1; HttpOnly; SameSite=Lax; Max-Age=${expirar ? 0 : 3600}`
const gateway = createServer(async (req, res) => {
  let texto = ''
  for await (const parte of req) texto += parte
  const dados = texto ? JSON.parse(texto) : {}
  if (req.url === '/__test/config') { configuracao = { ...configuracao, ...dados }; return json(res, 200, true) }
  if (req.url === '/__test/reset') { configuracao = {}; eventos.length = 0; return json(res, 200, true) }
  if (req.url === '/__test/eventos') return json(res, 200, eventos)
  if (req.url === '/__test/isolamento') {
    const banco = JSON.parse(readFileSync(path.join(pasta, 'db.json'), 'utf8'))
    return json(res, 200, {
      perfisExternos: banco.perfisExternos?.length ?? 0,
      perfilExternoComSenha: (banco.perfisExternos ?? []).some((perfil) => Object.keys(perfil).some((campo) => /senha|password|token|sessao/i.test(campo))),
      sessaoFakeReal: (banco.sessoes ?? []).some((sessao) => [...contas.values()].some((conta) => conta.id === sessao.usuarioId)),
      usuarioFakeReal: (banco.usuarios ?? []).some((usuario) => [...contas.values()].some((conta) => conta.id === usuario.id)),
    })
  }
  if (req.url === '/__test/saude') return json(res, 200, true)
  eventos.push({ destino: 'gateway', caminho: req.url, metodo: req.method })
  if (req.method === 'GET' && req.url === '/api/v1/usuario') {
    const conta = validar(req)
    if (configuracao.statusUsuario) return json(res, configuracao.statusUsuario, null, 'SEM_PERMISSAO')
    return conta ? json(res, 200, publico(conta)) : json(res, 401, null, 'NAO_AUTENTICADO')
  }
  if (req.method === 'POST' && req.url === '/api/v1/auth/logout') {
    if (configuracao.falhaLogout) return json(res, 503, null, 'INDISPONIVEL')
    res.setHeader('Set-Cookie', cookie('', true))
    return json(res, 200, { encerrada: true })
  }
  if (req.method === 'POST' && ['/api/v1/auth/login', '/api/v1/auth/entrar', '/api/v1/auth/cadastro'].includes(req.url)) {
    const cadastro = req.url.endsWith('/cadastro')
    const email = String(dados.email ?? '').trim().toLowerCase()
    if (cadastro) {
      if (!['comprador', 'artesao'].includes(dados.perfil) || String(dados.senha).length < 12) return json(res, 400, null, 'REQUISICAO_INVALIDA')
      if (contas.has(email)) return json(res, 409, null, 'EMAIL_EM_USO')
      contas.set(email, { id: randomUUID(), nome: dados.nome, email, papel: dados.perfil, perfil: dados.perfil, imagem: '', senha: dados.senha })
    }
    const conta = contas.get(email)
    if (!conta || conta.senha !== dados.senha) return json(res, 401, null, 'CREDENCIAIS_INVALIDAS')
    res.setHeader('Set-Cookie', cookie(emitir(conta)))
    return json(res, cadastro ? 201 : 200, publico(conta))
  }
  json(res, 404, null, 'RECURSO_NAO_ENCONTRADO')
})
createServer((req, res) => {
  const headers = JSON.stringify(req.headers)
  const evento = { destino: 'fake', caminho: req.url, metodo: req.method, vazouJwt: [...tokens].some((token) => headers.includes(token)), recebeuAuthorization: Boolean(req.headers.authorization), recebeuDemo: /(?:^|;)\s*balaio_demo_sessao=/.test(req.headers.cookie ?? ''), recebeuSessao: /(?:^|;)\s*balaio_sessao=/.test(req.headers.cookie ?? ''), recebeuSenha: headers.includes(senhaTeste), recebeuChaveInterna: Boolean(process.env.BALAIO_FAKE_INTERNAL_KEY && headers.includes(process.env.BALAIO_FAKE_INTERNAL_KEY)), recebeuContextoInterno: Boolean(req.headers['x-balaio-contexto'] && req.headers['x-balaio-assinatura']) }
  eventos.push(evento)
  let corpo = ''
  req.on('data', (parte) => { corpo += parte })
  req.on('end', () => { evento.recebeuSenha ||= corpo.includes(senhaTeste) || /"(?:senha|senhaAtual|novaSenha|password)"\s*:/.test(corpo); evento.vazouJwt ||= [...tokens].some((token) => corpo.includes(token)) })
  if (configuracao.statusFake && /^\/api\/v1\/(?:usuario(?:\/|$)|pedidos(?:\/|$))/.test(req.url)) return json(res, configuracao.statusFake, null, 'FALHA_FAKE')
  fake(req, res)
}).listen(13001, '127.0.0.1')
gateway.listen(18080, '127.0.0.1')
