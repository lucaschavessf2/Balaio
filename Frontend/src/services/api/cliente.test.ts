import assert from 'node:assert/strict'
import { afterEach, beforeEach, test } from 'node:test'
import { buscar, enviar } from './cliente'
import {
  atualizarPeca, excluirPeca, listarPecas, listarPecasPublicas, obterPeca, obterPecaHistorico,
  pecasPorArtesao, pecasPorTipo, pecasRelacionadas,
} from './pecas.servico'

const fake = 'http://fake-api:3001/api/v1'
const gateway = 'http://api-gateway:8080/api/v1'
const fetchOriginal = globalThis.fetch
const windowOriginal = Object.getOwnPropertyDescriptor(globalThis, 'window')
const apiOriginal = process.env.API_URL
const gatewayOriginal = process.env.GATEWAY_API_URL

type Chamada = { url: string; opcoes: RequestInit }

function responder(corpo: unknown = { dados: [], erro: null }, status = 200) {
  const chamadas: Chamada[] = []
  globalThis.fetch = async (entrada, opcoes = {}) => {
    chamadas.push({ url: String(entrada), opcoes })
    return new Response(JSON.stringify(corpo), { status })
  }
  return chamadas
}

beforeEach(() => {
  Reflect.deleteProperty(globalThis, 'window')
  process.env.API_URL = fake
  process.env.GATEWAY_API_URL = gateway
})

afterEach(() => {
  globalThis.fetch = fetchOriginal
  if (windowOriginal) Object.defineProperty(globalThis, 'window', windowOriginal)
  else Reflect.deleteProperty(globalThis, 'window')
  if (apiOriginal === undefined) delete process.env.API_URL
  else process.env.API_URL = apiOriginal
  if (gatewayOriginal === undefined) delete process.env.GATEWAY_API_URL
  else process.env.GATEWAY_API_URL = gatewayOriginal
})

test('a origem padrão continua na Fake API mesmo com Gateway configurado', async () => {
  const chamadas = responder()
  await buscar('/pecas')
  assert.equal(chamadas[0].url, `${fake}/pecas`)
  assert.equal(chamadas[0].opcoes.cache, 'no-store')
})

test('a Fake API mantém o endereço local padrão no servidor', async () => {
  delete process.env.API_URL
  const chamadas = responder()
  await buscar('/pecas')
  assert.equal(chamadas[0].url, 'http://127.0.0.1:3001/api/v1/pecas')
})

test('o navegador usa o rewrite da Fake API sem expor os endereços internos', async () => {
  Object.defineProperty(globalThis, 'window', { value: {}, configurable: true })
  const chamadas = responder()
  await buscar('/pecas')
  assert.equal(chamadas[0].url, '/api/v1/pecas')
})

test('o Gateway lê a configuração em execução e aceita barra final', async () => {
  const chamadas = responder()
  process.env.GATEWAY_API_URL = `${gateway}/`
  await buscar('/pecas', { origem: 'gateway' })
  process.env.GATEWAY_API_URL = 'http://outro-gateway:8080/api/v1'
  await buscar('/pecas', { origem: 'gateway' })
  assert.deepEqual(chamadas.map(({ url }) => url), [
    `${gateway}/pecas`, 'http://outro-gateway:8080/api/v1/pecas',
  ])
  assert.equal('origem' in chamadas[0].opcoes, false)
})

test('selecionar Gateway no navegador falha antes de executar fetch', async () => {
  Object.defineProperty(globalThis, 'window', { value: {}, configurable: true })
  const chamadas = responder()
  const resposta = await buscar('/pecas', { origem: 'gateway' })
  assert.equal(resposta.erro?.codigo, 'ORIGEM_INDISPONIVEL')
  assert.equal(resposta.dados, null)
  assert.equal(chamadas.length, 0)
})

test('Gateway ausente ou vazio falha explicitamente sem recorrer à Fake API', async () => {
  const chamadas = responder()
  for (const valor of [undefined, '', '   ']) {
    if (valor === undefined) delete process.env.GATEWAY_API_URL
    else process.env.GATEWAY_API_URL = valor
    const resposta = await buscar('/pecas', { origem: 'gateway' })
    assert.equal(resposta.erro?.codigo, 'GATEWAY_NAO_CONFIGURADO')
    assert.equal(resposta.dados, null)
  }
  assert.equal(chamadas.length, 0)
})

test('a resposta paginada do Gateway preserva o envelope público', async () => {
  const envelope = {
    dados: [{ slug: 'peca-do-catalogo', nome: 'Peça do catálogo' }],
    erro: null,
    paginacao: { pagina: 1, tamanho: 9, total: 24, totalPaginas: 3 },
  }
  responder(envelope)
  assert.deepEqual(await buscar('/pecas?pagina=1&tamanho=9', { origem: 'gateway' }), envelope)
})

test('erros HTTP do Gateway preservam código, mensagem e campos sem fallback', async () => {
  const erro = { codigo: 'FILTRO_INVALIDO', mensagem: 'Filtro inválido.', campos: { tamanho: 'Máximo 100.' } }
  const chamadas = responder({ dados: null, erro }, 400)
  const resposta = await buscar('/pecas?tamanho=101', { origem: 'gateway' })
  assert.deepEqual(resposta, { dados: null, erro })
  assert.deepEqual(chamadas.map(({ url }) => url), [`${gateway}/pecas?tamanho=101`])
})

test('falhas de rede do Gateway não disparam uma segunda chamada à Fake API', async () => {
  const urls: string[] = []
  globalThis.fetch = async (entrada) => {
    urls.push(String(entrada))
    throw new TypeError('fetch failed')
  }
  const resposta = await buscar('/pecas', { origem: 'gateway' })
  assert.equal(resposta.erro?.codigo, 'ERRO_REDE')
  assert.deepEqual(urls, [`${gateway}/pecas`])
})

test('respostas HTTP sem envelope mantêm o código de status no erro', async () => {
  globalThis.fetch = async () => new Response('indisponível', { status: 503 })
  const resposta = await buscar('/pecas', { origem: 'gateway' })
  assert.equal(resposta.erro?.codigo, 'HTTP_503')
  assert.equal(resposta.dados, null)
})

test('respostas de sucesso sem envelope são rejeitadas', async () => {
  for (const corpo of [null, [], { dados: [] }, { erro: null }]) {
    responder(corpo)
    const resposta = await buscar('/pecas', { origem: 'gateway' })
    assert.equal(resposta.erro?.codigo, 'RESPOSTA_INVALIDA')
  }
})

test('o cliente preserva o timeout de dez segundos para ambas as origens', async (contexto) => {
  const sinal = new AbortController().signal
  const timeout = contexto.mock.method(AbortSignal, 'timeout', () => sinal)
  const chamadas = responder()
  await buscar('/pecas')
  await buscar('/pecas', { origem: 'gateway' })
  assert.deepEqual(timeout.mock.calls.map(({ arguments: argumentos }) => argumentos), [[10000], [10000]])
  assert.ok(chamadas.every(({ opcoes }) => opcoes.signal === sinal))
})

test('o signal e as opções informadas pelo chamador são preservados', async (contexto) => {
  const sinal = new AbortController().signal
  const timeout = contexto.mock.method(AbortSignal, 'timeout')
  const chamadas = responder()
  await buscar('/pecas', {
    origem: 'gateway', signal: sinal, method: 'GET', credentials: 'include',
    headers: { Authorization: 'Bearer teste' },
  })
  assert.equal(timeout.mock.callCount(), 0)
  assert.equal(chamadas[0].opcoes.signal, sinal)
  assert.equal(chamadas[0].opcoes.credentials, 'include')
  assert.equal(chamadas[0].opcoes.method, 'GET')
  assert.deepEqual(chamadas[0].opcoes.headers, { 'Content-Type': 'application/json', Authorization: 'Bearer teste' })
})

test('enviar mantém a Fake API por padrão e encaminha seleção explícita de Gateway', async () => {
  const chamadas = responder()
  await enviar('/pecas', { nome: 'Nova peça' })
  await enviar('/pecas/slug', { nome: 'Alterada' }, 'PATCH', 'gateway')
  assert.deepEqual(chamadas.map(({ url }) => url), [`${fake}/pecas`, `${gateway}/pecas/slug`])
  assert.equal(chamadas[0].opcoes.method, 'POST')
  assert.equal(chamadas[1].opcoes.method, 'PATCH')
  assert.equal(chamadas[1].opcoes.body, JSON.stringify({ nome: 'Alterada' }))
})

test('listarPecas preserva filtros e paginação ao selecionar a origem por chamada', async () => {
  const chamadas = responder()
  await listarPecas({ pagina: 1, tamanho: 9, q: 'barro & arte', desconto: true, ordenar: 'recentes' }, 'gateway')
  await listarPecas({ pagina: 2, tamanho: 12, desconto: false, q: '' })
  const urlGateway = new URL(chamadas[0].url)
  assert.equal(urlGateway.origin, 'http://api-gateway:8080')
  assert.equal(urlGateway.pathname, '/api/v1/pecas')
  assert.deepEqual(Object.fromEntries(urlGateway.searchParams), {
    pagina: '1', tamanho: '9', q: 'barro & arte', desconto: 'true', ordenar: 'recentes',
  })
  const urlFake = new URL(chamadas[1].url)
  assert.equal(urlFake.origin, 'http://fake-api:3001')
  assert.deepEqual(Object.fromEntries(urlFake.searchParams), { pagina: '2', tamanho: '12' })
})

test('as demais operações de peças permanecem na Fake API com Gateway configurado', async () => {
  const chamadas = responder()
  await obterPeca('peça especial')
  await obterPecaHistorico('slug')
  await pecasRelacionadas('slug')
  await pecasPorArtesao('artesao')
  await atualizarPeca('slug', { nome: 'Alterada' })
  await excluirPeca('slug')
  assert.equal(chamadas.length, 6)
  assert.ok(chamadas.every(({ url }) => url.startsWith(`${fake}/`)))
  assert.equal(chamadas[0].url, `${fake}/pecas/pe%C3%A7a%20especial`)
})

test('a listagem pública no servidor usa Gateway e preserva filtros, paginação e timeout', async (contexto) => {
  const sinal = new AbortController().signal
  const timeout = contexto.mock.method(AbortSignal, 'timeout', () => sinal)
  const envelope = {
    dados: Array.from({ length: 9 }, (_, indice) => ({ slug: `peca-publica-${indice}` })),
    erro: null,
    paginacao: { pagina: 2, tamanho: 9, total: 24, totalPaginas: 3 },
  }
  const chamadas = responder(envelope)
  const resposta = await listarPecasPublicas({
    pagina: 2, tamanho: 9, q: 'barro & arte', tecnica: 'Cerâmica & Barro',
    territorio: 'Caruaru', categoria: 'Casa & Mesa', tipo: 'Jarras & Vasos',
    disponibilidade: 'encomenda', desconto: true, ordenar: 'preco-asc',
  })
  assert.equal(chamadas.length, 1)
  const url = new URL(chamadas[0].url)
  assert.equal(`${url.origin}${url.pathname}`, `${gateway}/pecas`)
  assert.deepEqual(Object.fromEntries(url.searchParams), {
    pagina: '2', tamanho: '9', q: 'barro & arte', tecnica: 'Cerâmica & Barro',
    territorio: 'Caruaru', categoria: 'Casa & Mesa', tipo: 'Jarras & Vasos',
    disponibilidade: 'encomenda', desconto: 'true', ordenar: 'preco-asc',
  })
  assert.equal(chamadas[0].opcoes.method ?? 'GET', 'GET')
  assert.equal(chamadas[0].opcoes.body, undefined)
  assert.equal(chamadas[0].opcoes.cache, 'no-store')
  assert.equal(chamadas[0].opcoes.signal, sinal)
  assert.deepEqual(timeout.mock.calls.map(({ arguments: argumentos }) => argumentos), [[10000]])
  assert.deepEqual(resposta, envelope)
})

test('a listagem pública mantém compatibilidade SSR com Gateway ausente ou vazio', async () => {
  const chamadas = responder()
  for (const valor of [undefined, '', '   ']) {
    if (valor === undefined) delete process.env.GATEWAY_API_URL
    else process.env.GATEWAY_API_URL = valor
    const resposta = await listarPecasPublicas({ pagina: 1, tamanho: 12 })
    assert.equal(resposta.erro, null)
  }
  assert.deepEqual(chamadas.map(({ url }) => url), Array(3).fill(`${fake}/pecas?pagina=1&tamanho=12`))
})

test('a listagem pública no navegador não acessa a Fake API nem expõe o Gateway', async () => {
  Object.defineProperty(globalThis, 'window', { value: {}, configurable: true })
  const chamadas = responder()
  for (const valor of [gateway, undefined, '', '   ']) {
    if (valor === undefined) delete process.env.GATEWAY_API_URL
    else process.env.GATEWAY_API_URL = valor
    const resposta = await listarPecasPublicas({ q: 'barro' })
    assert.equal(resposta.erro?.codigo, 'ORIGEM_INDISPONIVEL')
    assert.equal(resposta.dados, null)
  }
  assert.equal(chamadas.length, 0)
})

test('a listagem pública propaga erro HTTP do Gateway configurado sem fallback', async () => {
  const erro = { codigo: 'CATALOGO_INDISPONIVEL', mensagem: 'Catálogo indisponível.' }
  const chamadas = responder({ dados: null, erro }, 503)
  assert.deepEqual(await listarPecasPublicas(), { dados: null, erro })
  assert.deepEqual(chamadas.map(({ url }) => url), [`${gateway}/pecas`])
})

test('a listagem pública propaga falha de rede do Gateway configurado sem fallback', async () => {
  const urls: string[] = []
  globalThis.fetch = async (entrada) => {
    urls.push(String(entrada))
    throw new TypeError('fetch failed')
  }
  const resposta = await listarPecasPublicas()
  assert.equal(resposta.erro?.codigo, 'ERRO_REDE')
  assert.equal(resposta.dados, null)
  assert.deepEqual(urls, [`${gateway}/pecas`])
})

test('peças por tipo consulta Gateway com reserva de uma peça e aplica exclusão local', async () => {
  const dados = [{ slug: 'peca-atual' }, { slug: 'outra-peca' }, { slug: 'terceira-peca' }]
  const chamadas = responder({ dados, erro: null })
  const resposta = await pecasPorTipo('Jarras & Vasos', { excluir: 'peca-atual', limite: 2 })
  assert.equal(chamadas.length, 1)
  const url = new URL(chamadas[0].url)
  assert.equal(`${url.origin}${url.pathname}`, `${gateway}/pecas`)
  assert.deepEqual(Object.fromEntries(url.searchParams), { tipo: 'Jarras & Vasos', tamanho: '3' })
  assert.equal(resposta.erro, null)
  assert.deepEqual(resposta.dados?.map(({ slug }) => slug), ['outra-peca', 'terceira-peca'])
})

test('peças por tipo limita a doze resultados por padrão quando não há exclusão', async () => {
  const dados = Array.from({ length: 13 }, (_, indice) => ({ slug: `peca-${indice}` }))
  const chamadas = responder({ dados, erro: null })
  const resposta = await pecasPorTipo('Jarras & Vasos')
  const url = new URL(chamadas[0].url)
  assert.equal(`${url.origin}${url.pathname}`, `${gateway}/pecas`)
  assert.deepEqual(Object.fromEntries(url.searchParams), { tipo: 'Jarras & Vasos', tamanho: '13' })
  assert.equal(chamadas.length, 1)
  assert.equal(resposta.dados?.length, 12)
  assert.deepEqual(resposta.dados?.map(({ slug }) => slug), dados.slice(0, 12).map(({ slug }) => slug))
})

test('peças por tipo devolve o erro do Gateway sem transformar nem buscar na Fake API', async () => {
  const erro = { codigo: 'TIPO_INVALIDO', mensagem: 'Tipo inválido.', campos: { tipo: 'Escolha um tipo válido.' } }
  const chamadas = responder({ dados: null, erro }, 400)
  const resposta = await pecasPorTipo('inexistente', { excluir: 'slug', limite: 3 })
  assert.deepEqual(resposta, { dados: null, erro })
  assert.equal(chamadas.length, 1)
  assert.equal(new URL(chamadas[0].url).origin, 'http://api-gateway:8080')
})
