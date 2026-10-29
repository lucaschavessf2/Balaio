// Executado apenas pelo Route Handler. As URLs nunca são enviadas ao navegador.
import { createHmac } from 'node:crypto'
import { rotaPublicaFake, rotaContaFake } from './rotas-proxy'

const AUTENTICACAO = new Set(['/auth/cadastro', '/auth/login', '/auth/entrar', '/auth/logout'])
export const usaBackendReal = (metodo: string, caminho: string) =>
  (metodo === 'POST' && AUTENTICACAO.has(caminho)) || (metodo === 'GET' && caminho === '/usuario')

function erro(status: number, codigo: string, mensagem: string) {
  return Response.json({ dados: null, erro: { codigo, mensagem } }, {
    status, headers: { 'Cache-Control': 'no-store' },
  })
}

function limparSessaoLegada(resposta: Response, secure: boolean) {
  for (const path of ['/api/v1', '/']) {
    resposta.headers.append('set-cookie', `balaio_demo_sessao=; HttpOnly; Path=${path}; Max-Age=0; SameSite=Lax${secure ? '; Secure' : ''}`)
  }
  return resposta
}

function destinoConfigurado(real: boolean) {
  const valor = real
    ? process.env.API_GATEWAY_URL ?? 'http://127.0.0.1:8080/api/v1'
    : process.env.API_URL ?? 'http://127.0.0.1:3001/api/v1'
  const url = new URL(valor)
  if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password || url.search || url.hash) {
    throw new Error('Destino da API inválido')
  }
  if (real && url.href.replace(/\/$/, '') === new URL(process.env.API_URL ?? 'http://127.0.0.1:3001/api/v1').href.replace(/\/$/, '')) {
    throw new Error('Gateway e simulador precisam de destinos distintos')
  }
  return url.href.replace(/\/$/, '')
}

function origemPermitida(requisicao: Request) {
  const origem = requisicao.headers.get('origin')
  const origens = (process.env.AUTH_ALLOWED_ORIGINS ?? 'http://localhost:4321,http://127.0.0.1:4321')
    .split(',').map((item) => item.trim()).filter(Boolean)
  if (origem !== null && !origens.includes(origem)) return false
  const porCookie = /(?:^|;)\s*balaio_sessao=/.test(requisicao.headers.get('cookie') ?? '')
  return ['GET', 'HEAD'].includes(requisicao.method) || !porCookie || origem !== null
}

async function contextoDaConta(requisicao: Request, metodo: string, caminho: string): Promise<Headers | Response> {
  if (!origemPermitida(requisicao)) return erro(403, 'SEM_PERMISSAO', 'Origem não permitida.')
  const chave = process.env.BALAIO_FAKE_INTERNAL_KEY
  if (!chave || chave.length < 32) return erro(503, 'API_INDISPONIVEL', 'Não foi possível acessar os dados da conta.')
  const credenciais = new Headers()
  const cookies = (requisicao.headers.get('cookie') ?? '').split(';').map((item) => item.trim())
    .filter((item) => item.startsWith('balaio_sessao='))
  if (cookies.length) credenciais.set('cookie', cookies.join('; '))
  for (const nome of ['authorization', 'origin']) {
    const valor = requisicao.headers.get(nome)
    if (valor) credenciais.set(nome, valor)
  }
  const resposta = await fetch(`${destinoConfigurado(true)}/usuario`, {
    headers: credenciais, cache: 'no-store', redirect: 'manual', signal: AbortSignal.timeout(10000),
  })
  if (!resposta.ok) {
    if (![401, 403].includes(resposta.status)) return erro(502, 'API_INDISPONIVEL', 'Não foi possível validar sua sessão.')
    const falha = erro(resposta.status, resposta.status === 401 ? 'NAO_AUTENTICADO' : 'SEM_PERMISSAO',
      resposta.status === 401 ? 'Entre na sua conta para continuar.' : 'Acesso não permitido.')
    if (resposta.status === 401) falha.headers.set('X-Balaio-Sessao', 'invalida')
    return falha
  }
  const { dados, erro: falha } = await resposta.json()
  if (falha || !dados || typeof dados.id !== 'string'
    || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(dados.id)
    || typeof dados.nome !== 'string' || !dados.nome || dados.nome.length > 200
    || typeof dados.email !== 'string' || !dados.email || dados.email.length > 320
    || !['comprador', 'artesao', 'admin'].includes(dados.papel)) {
    return erro(502, 'API_INDISPONIVEL', 'Não foi possível validar sua sessão.')
  }
  const contexto = Buffer.from(JSON.stringify({
    sub: dados.id, nome: dados.nome, email: dados.email, papel: dados.papel,
    metodo, caminho, exp: Math.floor(Date.now() / 1000) + 30,
  })).toString('base64url')
  return new Headers({
    'x-balaio-contexto': contexto,
    'x-balaio-assinatura': createHmac('sha256', chave).update(contexto).digest('hex'),
  })
}

async function corpoDaConta(requisicao: Request, caminho: string): Promise<ArrayBuffer | Response | undefined> {
  if (['GET', 'HEAD'].includes(requisicao.method)) return undefined
  if (Number(requisicao.headers.get('content-length')) > 16384) return erro(413, 'REQUISICAO_INVALIDA', 'Requisição inválida.')
  const corpo = await requisicao.arrayBuffer()
  if (corpo.byteLength > 16384) return erro(413, 'REQUISICAO_INVALIDA', 'Requisição inválida.')
  let dados
  try { dados = corpo.byteLength ? JSON.parse(Buffer.from(corpo).toString('utf8')) : {} } catch {
    return erro(400, 'REQUISICAO_INVALIDA', 'Requisição inválida.')
  }
  const campos = caminho === '/usuario' ? ['nome', 'email', 'telefone', 'tipoComprador']
    : requisicao.method === 'DELETE' ? [] : ['apelido', 'rua', 'bairro', 'cep', 'principal']
  if (!dados || Array.isArray(dados) || typeof dados !== 'object'
    || Object.entries(dados).some(([campo, valor]) => !campos.includes(campo)
      || (campo === 'principal' ? typeof valor !== 'boolean' : typeof valor !== 'string'))) {
    return erro(400, 'REQUISICAO_INVALIDA', 'Requisição inválida.')
  }
  return corpo.byteLength ? corpo : undefined
}

export async function encaminharApi(requisicao: Request): Promise<Response> {
  const url = new URL(requisicao.url)
  const finalizar = (resposta: Response) => limparSessaoLegada(resposta, url.protocol === 'https:')
  const caminho = url.pathname.slice('/api/v1'.length)
  if (!url.pathname.startsWith('/api/v1/') || /%2f|%5c|%2e|\\|\/\//i.test(caminho)
    || [...url.searchParams.keys()].some((chave) => chave.startsWith('_'))) {
    return finalizar(erro(400, 'REQUISICAO_INVALIDA', 'Requisição inválida.'))
  }
  const metodo = requisicao.method.toUpperCase()
  if (AUTENTICACAO.has(caminho) && metodo !== 'POST') {
    return finalizar(erro(405, 'METODO_NAO_PERMITIDO', 'Método não permitido.'))
  }
  const real = usaBackendReal(metodo, caminho)
  const contaFake = rotaContaFake(metodo, caminho)
  if (!real && !contaFake && !rotaPublicaFake(metodo, caminho, url.searchParams)) {
    return finalizar(erro(404, 'RECURSO_NAO_ENCONTRADO', 'Recurso não encontrado.'))
  }
  if (contaFake && url.search) return finalizar(erro(400, 'REQUISICAO_INVALIDA', 'Requisição inválida.'))
  const headers = new Headers()
  for (const nome of ['accept', 'content-type', 'origin']) {
    const valor = requisicao.headers.get(nome)
    if (valor) headers.set(nome, valor)
  }
  const cookies = (requisicao.headers.get('cookie') ?? '').split(';').map((item) => item.trim())
  const permitidos = cookies.filter((item) => real
    ? item.startsWith('balaio_sessao=') : !contaFake && item.startsWith('balaio_cliente='))
  if (permitidos.length) headers.set('cookie', permitidos.join('; '))
  const autorizacao = requisicao.headers.get('authorization')
  if (real && autorizacao) headers.set('authorization', autorizacao)

  try {
    const caminhoFake = contaFake && caminho === '/conta/perfil' ? '/usuario' : caminho
    let corpo: ArrayBuffer | undefined
    if (contaFake) {
      const validado = await corpoDaConta(requisicao, caminho)
      if (validado instanceof Response) return finalizar(validado)
      corpo = validado
      const contexto = await contextoDaConta(requisicao, metodo, `/api/v1${caminhoFake}${url.search}`)
      if (contexto instanceof Response) return finalizar(contexto)
      contexto.forEach((valor, nome) => headers.set(nome, valor))
    }
    const resposta = await fetch(`${destinoConfigurado(real)}${caminhoFake}${url.search}`, {
      method: metodo, headers, cache: 'no-store', redirect: 'manual',
      body: contaFake ? corpo : ['GET', 'HEAD'].includes(metodo) ? undefined : await requisicao.arrayBuffer(),
      signal: AbortSignal.timeout(10000),
    })
    if (contaFake && resposta.status === 401) {
      return finalizar(erro(502, 'API_INDISPONIVEL', 'Não foi possível acessar os dados da conta.'))
    }
    if (resposta.status >= 300 && resposta.status < 400) {
      return finalizar(erro(502, 'API_INDISPONIVEL', 'A API retornou um redirecionamento inesperado.'))
    }
    const saida = new Headers({ 'Cache-Control': 'no-store' })
    for (const nome of ['content-type', 'content-disposition', 'www-authenticate']) {
      const valor = resposta.headers.get(nome)
      if (valor) saida.set(nome, valor)
    }
    for (const cookie of resposta.headers.getSetCookie()) {
      if (real || /^balaio_cliente=/i.test(cookie)) saida.append('set-cookie', cookie)
    }
    if (real) {
      const secure = url.protocol === 'https:' || resposta.headers.getSetCookie().some((cookie) => /;\s*Secure(?:;|$)/i.test(cookie))
      const atributos = `Path=/; Max-Age=0; SameSite=Lax${secure ? '; Secure' : ''}`
      saida.append('set-cookie', `balaio_sessao=; HttpOnly; ${atributos}`)
      saida.append('set-cookie', `balaio-sessao=; ${atributos}`)
      if (metodo === 'POST' && caminho === '/auth/logout' && resposta.ok) {
        saida.append('set-cookie', `balaio_cliente=; HttpOnly; ${atributos}`)
      }
    }
    return finalizar(new Response(resposta.body, { status: resposta.status, headers: saida }))
  } catch {
    return finalizar(erro(502, 'API_INDISPONIVEL', 'Não foi possível falar com o servidor.'))
  }
}
