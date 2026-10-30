import assert from 'node:assert/strict'
import { afterEach, test } from 'node:test'
import { NextRequest } from 'next/server'
import { proxy } from './proxy'

const originalFetch = globalThis.fetch
afterEach(() => { globalThis.fetch = originalFetch })

const request = (path: string) => new NextRequest(`http://localhost:4321${path}`, {
  headers: { cookie: `balaio_sessao=revoked; balaio-sessao=${encodeURIComponent(JSON.stringify({ id: '1', nome: 'Ana', papel: 'admin' }))}` },
})

test('sessão revogada bloqueia área protegida e libera login mesmo com cookie local antigo', async () => {
  globalThis.fetch = async () => Response.json({ dados: null, erro: { codigo: 'NAO_AUTENTICADO' } }, { status: 401 })
  const protegida = await proxy(request('/account'))
  assert.equal(protegida.status, 307)
  assert.equal(new URL(protegida.headers.get('location')!).pathname, '/login')
  const login = await proxy(request('/login'))
  assert.equal(login.status, 200)
})

test('permissão usa papel retornado pelo backend', async () => {
  globalThis.fetch = async () => Response.json({ dados: { id: '1', nome: 'Ana', email: 'ana@example.com', papel: 'comprador', imagem: '' }, erro: null })
  const resposta = await proxy(request('/admin'))
  assert.equal(resposta.status, 307)
  assert.equal(new URL(resposta.headers.get('location')!).pathname, '/account')
})
