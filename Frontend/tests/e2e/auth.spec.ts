import { test, expect, type APIRequestContext, type Page } from '@playwright/test'

const controle = 'http://127.0.0.1:18080'
const senha = 'SenhaDeTeste123!'
type Evento = { destino: string; caminho: string; metodo: string; vazouJwt?: boolean; recebeuAuthorization?: boolean; recebeuDemo?: boolean; recebeuSessao?: boolean; recebeuSenha?: boolean; recebeuChaveInterna?: boolean; recebeuContextoInterno?: boolean }
const paginasPrivadas = ['/checkout', '/dashboard', '/admin']
const linksPrivados = 'a[href^="/checkout"], a[href^="/confirmation"], a[href^="/dashboard"], a[href^="/admin"], a[href^="/orders/"]'
const origem = { Origin: 'http://127.0.0.1:14321' }
const eventosDoTeste = async (request: APIRequestContext): Promise<Evento[]> => (await (await request.get(`${controle}/__test/eventos`)).json()).dados
const acessoPrivado = (evento: Evento) => /^\/api\/v1\/(?:demo(?:\/|$)|pedidos(?:\/|$)|checkout(?:\/|$)|artesao(?:\/|$)|admin(?:\/|$)|usuario(?:\/|$))/.test(evento.caminho)

async function semDemonstracaoOuAviso(page: Page) {
  await expect(page.getByLabel('Conta de demonstração', { exact: true })).toHaveCount(0)
  await expect(page.locator('#conteudo')).not.toContainText(/demonstração|simulado|backend|em breve|não integrad/i)
  await expect(page.getByText(/Conta Fake:|Modo demonstração/i)).toHaveCount(0)
  await expect(page.locator(linksPrivados)).toHaveCount(0)
}

async function login(page: Page, papel = 'comprador') {
  await page.goto('/login')
  await page.locator('#email').fill(`${papel}@auth.test`)
  await page.locator('#senha').fill(senha)
  await page.locator('#conteudo').getByRole('button', { name: 'Entrar', exact: true }).click()
  await expect(page).toHaveURL(/\/account$/)
  await expect(page.locator('.conta-capa-nome')).toHaveText(`Conta real ${papel}`)
}
async function cadastrarConta(page: Page, nome: string) {
  const email = `${nome.toLowerCase().replace(/\s/g, '-')}-${Date.now()}@auth.test`
  const resposta = await page.request.post('/api/v1/auth/cadastro', { data: { nome, email, senha, perfil: 'comprador' }, headers: origem })
  expect(resposta.status()).toBe(201)
  await page.goto('/account')
  await expect(page.locator('.conta-capa-nome')).toHaveText(nome)
  return (await resposta.json()).dados as { id: string; nome: string; email: string; papel: string }
}

async function preencherEndereco(page: Page, apelido: string, rua: string) {
  await page.locator('#end-apelido').fill(apelido)
  await page.locator('#end-rua').fill(rua)
  await page.locator('#end-bairro').fill('Centro, Recife, PE')
  await page.locator('#end-cep').fill('50000-000')
  await page.getByRole('button', { name: 'Salvar endereço', exact: true }).click()
}

test.beforeEach(async ({ request }) => { await request.post(`${controle}/__test/reset`) })
test.afterEach(async ({ request }) => {
  const eventos = (await eventosDoTeste(request)).filter((evento) => evento.destino === 'fake')
  expect(eventos.some((evento) => evento.vazouJwt || evento.recebeuAuthorization || evento.recebeuDemo || evento.recebeuSessao || evento.recebeuSenha || evento.recebeuChaveInterna), 'credenciais reais nunca chegam à Fake API').toBe(false)
})

test('cookie JSON forjado não permite acessar rotas nem executar loaders privados SSR', async ({ page, context, request }) => {
  await context.addCookies([{ name: 'balaio-sessao', value: encodeURIComponent(JSON.stringify({ id: 'admin', nome: 'Forjado', papel: 'admin' })), domain: '127.0.0.1', path: '/' }])
  const resposta = await request.get('/orders')
  expect(await resposta.text()).not.toContain('usuarioId')
  await page.goto('/orders')
  await expect(page).toHaveURL(/\/login\?proximo=/)
  const eventos = await eventosDoTeste(request)
  expect(eventos.filter((evento) => evento.destino === 'fake' && acessoPrivado(evento))).toEqual([])
})
test('cadastro real, cookie HttpOnly, reload e logout sem JWT em storage', async ({ page, context, request }) => {
  await page.goto('/login/register')
  await page.locator('#cadastro-nome').fill('Cadastro Browser')
  await page.locator('#cadastro-email').fill(`browser-${Date.now()}@auth.test`)
  await page.locator('#cadastro-senha').fill(senha)
  await page.getByRole('button', { name: 'Criar minha conta' }).click()
  await expect(page).toHaveURL(/\/account$/)
  const cookies = await context.cookies('http://127.0.0.1:14321/api/v1/usuario')
  const jwt = cookies.find((cookie) => cookie.name === 'balaio_sessao')!
  expect(Boolean(jwt)).toBe(true)
  expect(jwt.httpOnly && jwt.sameSite === 'Lax' && jwt.path === '/api/v1').toBe(true)
  expect(cookies.some((cookie) => cookie.name === 'balaio_demo_sessao')).toBe(false)
  const claims = JSON.parse(Buffer.from(jwt.value.split('.')[1], 'base64url').toString())
  expect(claims.exp - claims.iat).toBe(3600)
  expect(await page.evaluate(() => document.cookie.includes('balaio_sessao='))).toBe(false)
  expect(await page.evaluate(() => JSON.stringify([localStorage, sessionStorage]).includes('eyJ'))).toBe(false)
  await page.reload()
  await expect(page.locator('.conta-capa-nome')).toHaveText('Cadastro Browser')
  await page.getByRole('button', { name: 'Sair da conta', exact: true }).click()
  await expect(page).toHaveURL(/\/login(?:\?|$)/)
  expect((await context.cookies()).some((cookie) => cookie.name === 'balaio_sessao')).toBe(false)
  await page.goto('/account')
  await expect(page).toHaveURL(/\/login\?proximo=/)
  const eventos = (await (await request.get(`${controle}/__test/eventos`)).json()).dados
  expect(eventos.some((evento: { destino: string; caminho: string }) => evento.destino === 'fake' && /\/auth\/(cadastro|login|entrar)/.test(evento.caminho))).toBe(false)
})
test('login inválido mostra 401; alias entrar estabelece a sessão real', async ({ page, request }) => {
  await page.goto('/login')
  await page.locator('#email').fill('comprador@auth.test')
  await page.locator('#senha').fill('senha-incorreta')
  await page.locator('#conteudo').getByRole('button', { name: 'Entrar', exact: true }).click()
  await expect(page.getByRole('alert').filter({ hasText: 'E-mail ou senha inválidos' })).toBeVisible()
  const resposta = await page.request.post('/api/v1/auth/entrar', { data: { email: 'comprador@auth.test', senha }, headers: { Origin: 'http://127.0.0.1:14321' } })
  expect(resposta.status()).toBe(200)
  await page.goto('/account')
  await expect(page.locator('.conta-capa-nome')).toHaveText('Conta real comprador')
  const eventos = (await (await request.get(`${controle}/__test/eventos`)).json()).dados
  expect(eventos.some((evento: { destino: string; caminho: string }) => evento.destino === 'gateway' && evento.caminho.endsWith('/auth/entrar'))).toBe(true)
})
test('403 mantém cookie e não vira logout; erro de rede bloqueia dados e permite tentar novamente', async ({ page, request, context }) => {
  await login(page)
  await request.post(`${controle}/__test/config`, { data: { statusUsuario: 403 } })
  await page.evaluate(() => window.dispatchEvent(new Event('focus')))
  await expect(page.getByRole('heading', { name: 'Acesso não permitido' })).toBeVisible()
  expect((await context.cookies()).some((cookie) => cookie.name === 'balaio_sessao')).toBe(true)
  await request.post(`${controle}/__test/config`, { data: { statusUsuario: 503 } })
  await page.evaluate(() => window.dispatchEvent(new Event('focus')))
  await expect(page.getByText('Não foi possível validar sua sessão.', { exact: false })).toBeVisible()
  await request.post(`${controle}/__test/config`, { data: { statusUsuario: 0 } })
  await page.getByRole('button', { name: 'Tentar novamente' }).click()
  await expect(page.locator('.conta-capa-nome')).toHaveText('Conta real comprador')
})
test('expiração invalida sessão real em aba ociosa', async ({ page, request }) => {
  await page.clock.install()
  await login(page)
  await request.post(`${controle}/__test/config`, { data: { expirar: true } })
  await page.clock.fastForward(30001)
  await expect(page).toHaveURL(/\/login\?proximo=/)
})

test('Meus pedidos abre lista vazia da conta real sem herdar pedidos globais', async ({ page }) => {
  await login(page)
  const carregados = page.waitForResponse((resposta) => new URL(resposta.url()).pathname === '/api/v1/pedidos' && resposta.status() === 200)
  await page.locator('.conta-hub').getByRole('link', { name: 'Meus pedidos' }).click()
  expect((await (await carregados).json()).dados).toEqual([])
  await expect(page).toHaveURL(/\/orders$/)
  await expect(page.getByRole('heading', { name: 'Você ainda não fez nenhum pedido' })).toBeVisible()
  await expect(page.locator('.cartao-pedido')).toHaveCount(0)
  await semDemonstracaoOuAviso(page)
  await page.reload()
  await expect(page.getByRole('heading', { name: 'Você ainda não fez nenhum pedido' })).toBeVisible()
})

test('Meus dados salva nome, email e telefone na Fake, preservando identidade real e cabeçalho', async ({ page, request, context }) => {
  const conta = await cadastrarConta(page, 'Perfil Browser')
  const cookieAntes = (await context.cookies()).find((cookie) => cookie.name === 'balaio_sessao')?.value
  await page.locator('.conta-hub').getByRole('link', { name: 'Meus dados', exact: true }).click()
  await expect(page.locator('#conta-nome')).toHaveValue(conta.nome)
  await page.locator('#conta-nome').fill('Nome de entrega atualizado')
  await page.locator('#conta-email').fill(`contato-${Date.now()}@auth.test`)
  const emailContato = await page.locator('#conta-email').inputValue()
  await page.locator('#conta-telefone').fill('81999990000')
  await page.locator('#conta-tipo').selectOption('presente')
  const salva = page.waitForResponse((resposta) => new URL(resposta.url()).pathname === '/api/v1/usuario' && resposta.request().method() === 'PATCH')
  await page.getByRole('button', { name: 'Salvar alterações', exact: true }).click()
  expect((await salva).status()).toBe(200)
  await expect(page.getByText('Dados da conta salvos', { exact: true })).toBeVisible()
  await page.reload()
  await expect(page.locator('#conta-nome')).toHaveValue('Nome de entrega atualizado')
  await expect(page.locator('#conta-email')).toHaveValue(emailContato)
  await expect(page.locator('#conta-telefone')).toHaveValue('81999990000')
  await expect(page.locator('#conta-tipo')).toHaveValue('presente')
  const real = (await (await page.request.get('/api/v1/usuario')).json()).dados
  expect(real).toMatchObject(conta)
  await expect(page.locator('.menu-perfil-gatilho')).toHaveAttribute('title', `Conectado como ${conta.nome}`)
  await page.locator('.menu-perfil-gatilho').click()
  await expect(page.locator('.menu-perfil-painel .menu-perfil-nome')).toHaveText(conta.nome)
  await expect(page.locator('.menu-perfil-painel .menu-perfil-detalhe')).toHaveText(conta.email)
  await semDemonstracaoOuAviso(page)
  expect((await context.cookies()).find((cookie) => cookie.name === 'balaio_sessao')?.value === cookieAntes).toBe(true)
  const isolamento = (await (await request.get(`${controle}/__test/isolamento`)).json()).dados
  expect(isolamento.perfisExternos).toBeGreaterThan(0)
  expect(isolamento).toMatchObject({ perfilExternoComSenha: false, sessaoFakeReal: false, usuarioFakeReal: false })
})

test('endereços permitem criar, editar, tornar principal e excluir com persistência após reload', async ({ page }) => {
  await cadastrarConta(page, 'Enderecos Browser')
  await page.locator('.conta-hub').getByRole('link', { name: 'Endereços de entrega', exact: true }).click()
  await page.getByRole('button', { name: 'Adicionar endereço', exact: true }).click()
  await page.getByRole('button', { name: 'Salvar endereço', exact: true }).click()
  await expect(page.getByText('Informe rua e número', { exact: true })).toBeVisible()
  await preencherEndereco(page, 'Casa teste', 'Rua de Teste, 10')
  await expect(page.locator('.endereco').filter({ hasText: 'Casa teste' })).toContainText('Principal')
  await page.reload()
  await expect(page.locator('.endereco').filter({ hasText: 'Casa teste' })).toContainText('Rua de Teste, 10')
  await page.getByRole('button', { name: 'Editar endereço Casa teste', exact: true }).click()
  await preencherEndereco(page, 'Casa editada', 'Rua de Teste, 20')
  await page.reload()
  await expect(page.locator('.endereco').filter({ hasText: 'Casa editada' })).toContainText('Rua de Teste, 20')
  await page.getByRole('button', { name: 'Adicionar endereço', exact: true }).click()
  await preencherEndereco(page, 'Trabalho teste', 'Rua do Trabalho, 30')
  await page.getByRole('button', { name: 'Tornar "Trabalho teste" o endereço principal', exact: true }).click()
  await expect(page.locator('.endereco').filter({ hasText: 'Trabalho teste' })).toContainText('Principal')
  await page.reload()
  await expect(page.locator('.endereco').filter({ hasText: 'Trabalho teste' })).toContainText('Principal')
  await expect(page.locator('.endereco').filter({ hasText: 'Casa editada' })).not.toContainText('Principal')
  await page.getByRole('button', { name: 'Excluir endereço Trabalho teste', exact: true }).click()
  await expect(page.locator('.endereco').filter({ hasText: 'Casa editada' })).toContainText('Principal')
  await page.getByRole('button', { name: 'Excluir endereço Casa editada', exact: true }).click()
  await page.reload()
  await expect(page.locator('.endereco')).toHaveCount(0)
  await semDemonstracaoOuAviso(page)
})

test('conta B não lê perfil nem altera ou remove endereço da conta A por IDs ou headers forjados', async ({ page }) => {
  const contaA = await cadastrarConta(page, 'Conta Isolada A')
  const enderecoA = await page.request.post('/api/v1/usuario/enderecos', { headers: origem, data: { apelido: 'Privado A', rua: 'Rua A, 1', bairro: 'Recife, PE', cep: '50000-000' } })
  expect(enderecoA.status()).toBe(201)
  const idEnderecoA = (await enderecoA.json()).dados.id
  expect((await page.request.patch('/api/v1/usuario', { headers: origem, data: { telefone: '81911112222' } })).status()).toBe(200)
  expect((await page.request.post('/api/v1/auth/logout', { headers: origem })).status()).toBe(200)
  const contaB = await cadastrarConta(page, 'Conta Isolada B')
  const forjados = { ...origem, 'X-Usuario-Id': contaA.id, 'X-Role': 'admin', 'X-Balaio-Contexto': 'forjado', 'X-Balaio-Assinatura': 'forjada' }
  const perfilB = await page.request.get('/api/v1/conta/perfil', { headers: forjados })
  expect(perfilB.status()).toBe(200)
  expect((await perfilB.json()).dados).toMatchObject({ id: contaB.id, nome: contaB.nome, email: contaB.email, telefone: '', enderecos: [] })
  expect((await (await page.request.get('/api/v1/usuario/enderecos', { headers: forjados })).json()).dados).toEqual([])
  expect((await page.request.get(`/api/v1/conta/perfil?usuarioId=${contaA.id}`)).status()).toBe(400)
  expect((await page.request.patch('/api/v1/usuario', { headers: forjados, data: { id: contaA.id, nome: 'Invasor' } })).status()).toBe(400)
  expect((await page.request.patch(`/api/v1/usuario/enderecos/${idEnderecoA}`, { headers: forjados, data: { rua: 'Alterada por B' } })).status()).toBe(404)
  expect((await page.request.delete(`/api/v1/usuario/enderecos/${idEnderecoA}`, { headers: forjados })).status()).toBe(404)
  await page.goto('/account/addresses')
  await expect(page.getByRole('button', { name: 'Adicionar endereço', exact: true })).toBeVisible()
  await expect(page.locator('.endereco')).toHaveCount(0)
  await expect(page.locator('#conteudo')).not.toContainText('Privado A')
})

test('401 real em dados privados exige login e impede chamada à Fake', async ({ page, request }) => {
  await login(page)
  await request.post(`${controle}/__test/reset`)
  await request.post(`${controle}/__test/config`, { data: { expirar: true } })
  const negada = page.waitForResponse((resposta) => new URL(resposta.url()).pathname === '/api/v1/conta/perfil' && resposta.status() === 401)
  await page.locator('.conta-hub').getByRole('link', { name: 'Meus dados', exact: true }).click()
  expect((await negada).headers()['x-balaio-sessao']).toBe('invalida')
  await expect(page).toHaveURL(/\/login\?proximo=/)
  expect((await eventosDoTeste(request)).filter((evento) => evento.destino === 'fake' && acessoPrivado(evento))).toEqual([])
})

test('401 da Fake vira erro de dados sem invalidar sessão real; 403 preserva o erro legítimo', async ({ page, request, context }) => {
  await login(page)
  for (const [statusFake, statusProxy] of [[401, 502], [403, 403]]) {
    await request.post(`${controle}/__test/config`, { data: { statusFake } })
    const falha = page.waitForResponse((resposta) => new URL(resposta.url()).pathname === '/api/v1/conta/perfil')
    await page.goto('/account/details')
    const resposta = await falha
    expect(resposta.status()).toBe(statusProxy)
    expect(resposta.headers()['x-balaio-sessao']).toBeUndefined()
    await expect(page.getByRole('heading', { name: 'Meus dados', exact: true })).toBeVisible()
    await expect(page.locator('.menu-perfil-gatilho')).toHaveAttribute('title', 'Conectado como Conta real comprador')
    await expect(page.getByRole('alert')).toBeVisible()
    expect((await context.cookies()).some((cookie) => cookie.name === 'balaio_sessao')).toBe(true)
  }
  await request.post(`${controle}/__test/config`, { data: { statusFake: 0 } })
  await page.reload()
  await expect(page.locator('#conta-nome')).toBeVisible()
})

test('Alterar senha abre segurança e recuperação por email sem enviar senha real à Fake', async ({ page, request }) => {
  await login(page)
  await page.locator('.conta-hub').getByRole('link', { name: 'Alterar senha', exact: true }).click()
  await expect(page).toHaveURL(/\/account\/details#seguranca$/)
  await expect(page.locator('input[type="password"]')).toHaveCount(0)
  await page.locator('#seguranca').getByRole('link', { name: 'Alterar senha', exact: true }).click()
  await expect(page).toHaveURL(/\/login\/recover$/)
  await expect(page.locator('input[type="password"]')).toHaveCount(0)
  await semDemonstracaoOuAviso(page)
  await page.locator('#recuperar-email').fill('recuperacao-ficticia@auth.test')
  await page.getByRole('button', { name: 'Solicitar recuperação', exact: true }).click()
  await expect(page.locator('.cartao-auth-sucesso')).toBeVisible()
  await semDemonstracaoOuAviso(page)
  const eventos = await eventosDoTeste(request)
  expect(eventos.some((evento) => evento.destino === 'fake' && evento.caminho === '/api/v1/auth/recuperacao' && evento.metodo === 'POST')).toBe(true)
  expect(eventos.some((evento) => /\/conta\/.*\/senha$/.test(evento.caminho))).toBe(false)
})

test('conta, dados, endereços e pedidos não executam loaders Fake em SSR ou prefetch', async ({ request }) => {
  const variacoes: Record<string, string>[] = [{}, { RSC: '1' }, { RSC: '1', 'Next-Router-Prefetch': '1' }]
  for (const caminho of ['/account', '/account/details', '/account/addresses', '/orders']) {
    for (const headers of variacoes) {
      const resposta = await request.get(caminho, { headers })
      expect(resposta.status()).toBe(200)
      const html = await resposta.text()
      expect(html).not.toMatch(/usuarioId|compradorId|compradorNome|Conta real comprador|comprador@auth\.test/)
      expect((await eventosDoTeste(request)).filter(acessoPrivado)).toEqual([])
    }
  }
})
for (const papel of ['comprador', 'artesao', 'admin']) {
  test(`${papel} real vê itens básicos da conta sem seletor, avisos ou painéis por papel`, async ({ page, request }) => {
    await login(page, papel)
    await expect(page.locator('.conta-capa')).toContainText(`${papel}@auth.test`)
    await expect(page.locator('.conta-hub').getByRole('link', { name: 'Peças salvas' })).toBeVisible()
    for (const nome of ['Meus pedidos', 'Meus dados', 'Endereços de entrega', 'Alterar senha']) {
      await expect(page.locator('.conta-hub').getByRole('link', { name: nome, exact: nome !== 'Meus pedidos' })).toBeVisible()
    }
    await semDemonstracaoOuAviso(page)
    await page.locator('.menu-perfil-gatilho').click()
    await expect(page.locator('.menu-perfil-painel')).toBeVisible()
    await semDemonstracaoOuAviso(page)
    for (const caminho of paginasPrivadas) {
      await page.goto(caminho)
      await expect(page).toHaveURL(/\/account$/)
      await expect(page.locator('.conta-capa-nome')).toHaveText(`Conta real ${papel}`)
      await semDemonstracaoOuAviso(page)
    }
    const eventos = await eventosDoTeste(request)
    expect(eventos.filter((evento) => evento.destino === 'fake' && acessoPrivado(evento)).every((evento) => evento.caminho === '/api/v1/pedidos' && evento.metodo === 'GET' && evento.recebeuContextoInterno)).toBe(true)
    expect(eventos.filter((evento) => evento.destino === 'gateway' && acessoPrivado(evento) && evento.caminho !== '/api/v1/usuario')).toEqual([])
  })
}

test('APIs privadas restantes e Demo retornam 404 sem tocar gateway ou Fake, mesmo com sessão real e cookie antigo', async ({ request }) => {
  const autenticar = await request.post('/api/v1/auth/login', { data: { email: 'admin@auth.test', senha }, headers: { Origin: 'http://127.0.0.1:14321' } })
  expect(autenticar.status()).toBe(200)
  const jwt = (await request.storageState()).cookies.find((cookie) => cookie.name === 'balaio_sessao')!
  expect(Boolean(jwt)).toBe(true)
  await request.post(`${controle}/__test/reset`)
  const rotas: [string, string][] = [
    ['/pedidos/pedido/conversa', 'POST'], ['/pedidos/pedido/estado', 'PATCH'], ['/pedidos/pedido/avaliacao', 'POST'],
    ['/conta/outro-usuario/senha', 'POST'], ['/conta/outro-usuario', 'PATCH'],
    ['/checkout', 'POST'], ['/artesao/me', 'GET'], ['/artesao/pedidos-pendentes', 'GET'], ['/artesao/conversas', 'GET'],
    ['/artesaos/atelie/configuracoes', 'PATCH'], ['/admin/mediacoes', 'GET'], ['/admin/curadoria', 'GET'],
    ['/pecas', 'POST'], ['/pecas/peca/perguntas', 'POST'], ['/videos?painel=true', 'GET'], ['/videos', 'POST'],
    ['/demo/contas', 'GET'], ['/demo/sessao', 'POST'], ['/demo/sessao', 'DELETE'],
  ]
  for (const [caminho, method] of rotas) {
    const resposta = await request.fetch(`/api/v1${caminho}`, {
      method, headers: { Origin: 'http://127.0.0.1:14321', Cookie: `balaio_sessao=${jwt.value}; balaio_demo_sessao=opaco-antigo`, Authorization: `Bearer ${jwt.value}`, 'X-Role': 'admin' },
      data: method === 'GET' ? undefined : { id: 'admin', usuarioId: 'outra-conta' },
    })
    expect(resposta.status(), `${method} ${caminho}`).toBe(404)
    expect(await resposta.json()).toEqual({ dados: null, erro: { codigo: 'RECURSO_NAO_ENCONTRADO', mensagem: 'Recurso não encontrado.' } })
    const cookies = resposta.headersArray().filter((header) => header.name.toLowerCase() === 'set-cookie').map((header) => header.value)
    expect(cookies.filter((cookie) => cookie.startsWith('balaio_demo_sessao=;') && cookie.includes('Max-Age=0'))).toHaveLength(2)
  }
  expect(await eventosDoTeste(request)).toEqual([])
  expect((await request.storageState()).cookies.some((cookie) => cookie.name === 'balaio_demo_sessao')).toBe(false)
})

test('checkout, detalhes de pedidos e painéis não executam loaders privados em HTML ou RSC', async ({ request }) => {
  test.setTimeout(120000)
  const paginas = [...paginasPrivadas, '/orders/pedido', '/orders/pedido/review', '/orders/pedido/mediation', '/confirmation/pedido', '/dashboard/pieces', '/dashboard/pieces/new', '/dashboard/pieces/peca', '/dashboard/sales', '/dashboard/messages', '/dashboard/videos', '/dashboard/settings', '/admin/criteria', '/admin/mediations']
  const variacoes: { tipo: string; headers: Record<string, string> }[] = [
    { tipo: 'HTML', headers: {} },
    { tipo: 'RSC', headers: { RSC: '1' } },
    { tipo: 'prefetch', headers: { RSC: '1', 'Next-Router-Prefetch': '1' } },
  ]
  for (const caminho of paginas) {
    for (const { tipo, headers } of variacoes) {
      const cenario = `${tipo} ${caminho}`
      let resposta = await request.get(caminho, { headers, maxRedirects: 0 })
      // Next normaliza o hash RSC antes de executar a página.
      if (headers.RSC && resposta.status() === 307 && resposta.headers().location) {
        const normalizada = new URL(resposta.headers().location, 'http://127.0.0.1:14321')
        if (normalizada.pathname === caminho) {
          expect(normalizada.origin, cenario).toBe('http://127.0.0.1:14321')
          expect([...normalizada.searchParams.keys()]).toEqual(['_rsc'])
          resposta = await request.get(normalizada.href, { headers, maxRedirects: 0 })
        }
      }
      expect([200, 307, 308], cenario).toContain(resposta.status())
      const corpo = await resposta.text()
      if (resposta.status() >= 300) expect(resposta.headers().location, cenario).toBe('/account')
      else {
        expect(resposta.headers()['content-type'], cenario).toContain(tipo === 'HTML' ? 'text/html' : 'text/x-component')
        if (tipo === 'prefetch') {
          // O prefetch pode parar no loading/layout sem executar a página ou seu redirect.
          expect(corpo, cenario).not.toBe('')
          expect(corpo, cenario).toContain('"f":')
        } else expect(corpo, cenario).toContain('/account')
      }
      expect(corpo, cenario).not.toMatch(/usuarioId|compradorId|compradorNome|configuracoesAtelie|pedidosPendentes/)
      expect(corpo, cenario).not.toMatch(/ResumoItensPedido|PedidosPendentes|CaixaConversas|FormAvaliacao|FormMediacao|CheckoutFormulario/)
      // Nenhuma variante pode executar loaders: a fixture registra ambos os upstreams.
      expect(await eventosDoTeste(request), cenario).toEqual([])
    }
  }
  expect((await eventosDoTeste(request)).filter(acessoPrivado)).toEqual([])
})

test('atalhos públicos não oferecem publicação ou páginas privadas pendentes', async ({ page }) => {
  for (const caminho of ['/videos', '/screens']) {
    await page.goto(caminho)
    await expect(page.locator('#conteudo')).toBeVisible()
    await expect(page.locator(linksPrivados)).toHaveCount(0)
    await expect(page.getByRole('link', { name: 'Publicar vídeo', exact: true })).toHaveCount(0)
  }
})

for (const autenticada of [false, true]) {
test(`catálogo, sacola e favoritos de ${autenticada ? 'conta autenticada' : 'visitante'} persistem sem JWT ou Demo na Fake API`, async ({ page, context, request }) => {
  if (autenticada) await login(page)
  await context.addCookies([{ name: 'balaio_demo_sessao', value: 'opaco-antigo', domain: '127.0.0.1', path: '/api/v1', httpOnly: true }])
  const resposta = await page.request.get('/api/v1/pecas')
  expect(resposta.status()).toBe(200)
  const pecas = (await resposta.json()).dados as { slug: string; nome: string; situacao?: string }[]
  const peca = pecas.find((item) => !item.situacao || item.situacao === 'publicada')!
  expect(Boolean(peca)).toBe(true)
  await page.request.put('/api/v1/estado/sacola', { data: { sacola: [] } })
  await page.request.put('/api/v1/estado/favoritos', { data: { favoritos: [] } })
  const estadoCarregado = page.waitForResponse((resposta) => new URL(resposta.url()).pathname === '/api/v1/estado' && resposta.status() === 200)
  await page.goto(`/pieces/${peca.slug}`)
  await estadoCarregado
  await expect(page.getByRole('heading', { name: peca.nome, exact: true })).toBeVisible()
  await expect(page.getByRole('heading', { name: /Perguntas e respostas/ })).toBeVisible()
  await expect(page.getByRole('button', { name: /Enviar pergunta|Fazer pergunta|Responder pergunta/i })).toHaveCount(0)
  const salva = page.getByRole('button', { name: `Guardar ${peca.nome} nas peças salvas`, exact: true }).first()
  await salva.click()
  await expect(page.getByRole('button', { name: `Remover ${peca.nome} das peças salvas`, exact: true }).first()).toHaveAttribute('aria-pressed', 'true')
  await page.getByRole('button', { name: 'Adicionar à sacola', exact: true }).click()
  await expect.poll(async () => (await (await page.request.get('/api/v1/estado')).json()).dados.sacola).toEqual([{ slug: peca.slug, quantidade: 1 }])
  await page.goto('/cart')
  await expect(page.locator('.item-sacola').getByRole('link', { name: peca.nome, exact: true })).toBeVisible()
  await expect(page.locator('a[href="/checkout"]')).toHaveCount(0)
  await expect(page.getByRole('button', { name: /Finalizar|Pagar/i })).toHaveCount(0)
  await page.goto('/favorites')
  await expect(page.locator('#conteudo').getByRole('link', { name: peca.nome, exact: true })).toBeVisible()
  await page.reload()
  await expect(page.locator('#conteudo').getByRole('link', { name: peca.nome, exact: true })).toBeVisible()
  const fake = (await eventosDoTeste(request)).filter((evento) => evento.destino === 'fake')
  expect(fake.some((evento) => evento.caminho === '/api/v1/estado/sacola' && evento.metodo === 'PUT')).toBe(true)
  expect(fake.some((evento) => evento.caminho === '/api/v1/estado/favoritos' && evento.metodo === 'PUT')).toBe(true)
  expect(fake.some((evento) => evento.vazouJwt || evento.recebeuAuthorization || evento.recebeuDemo || evento.recebeuSessao)).toBe(false)
  expect(fake.filter(acessoPrivado).every((evento) => autenticada && evento.caminho === '/api/v1/pedidos' && evento.recebeuContextoInterno)).toBe(true)
  expect((await context.cookies()).some((cookie) => cookie.name === 'balaio_demo_sessao')).toBe(false)
})
}
test('logout indisponível limpa a tela, informa pendência e permite nova tentativa', async ({ page, request }) => {
  await login(page)
  await request.post(`${controle}/__test/config`, { data: { falhaLogout: true } })
  await page.getByRole('button', { name: 'Sair da conta', exact: true }).click()
  await expect(page.getByText('A saída não foi confirmada pelo servidor.', { exact: false })).toBeVisible()
  await page.evaluate(() => window.dispatchEvent(new Event('focus')))
  await expect(page.getByText('Conta real comprador', { exact: true })).toHaveCount(0)
  await request.post(`${controle}/__test/config`, { data: { falhaLogout: false } })
  await page.getByRole('button', { name: 'Sair da conta', exact: true }).click()
  await expect(page).toHaveURL(/\/login(?:\?|$)/)
})
test('resposta antiga de /usuario não restaura a sessão depois do logout', async ({ page }) => {
  await login(page)
  let liberar!: () => void
  let avisarRecebida!: () => void
  const recebida = new Promise<void>((resolve) => { avisarRecebida = resolve })
  const liberada = new Promise<void>((resolve) => { liberar = resolve })
  await page.route('**/api/v1/usuario', async (rota) => {
    const resposta = await rota.fetch()
    avisarRecebida()
    await liberada
    await rota.fulfill({ response: resposta })
  })
  await page.evaluate(() => window.dispatchEvent(new Event('focus')))
  await recebida
  await page.getByRole('button', { name: 'Sair da conta', exact: true }).click()
  await expect(page).toHaveURL(/\/login(?:\?|$)/)
  const concluida = page.waitForResponse('**/api/v1/usuario')
  liberar()
  await concluida
  await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))))
  await expect(page).toHaveURL(/\/login(?:\?|$)/)
  await expect(page.locator('.conta-capa-nome')).toHaveCount(0)
})

test('401 privado antigo não encerra nova sessão após logout e login de outra conta', async ({ page }) => {
  await login(page)
  let liberar!: () => void
  let avisarRecebida!: () => void
  const recebida = new Promise<void>((resolve) => { avisarRecebida = resolve })
  const liberada = new Promise<void>((resolve) => { liberar = resolve })
  await page.route('**/api/v1/conta/perfil', async (rota) => {
    avisarRecebida()
    await liberada
    await rota.fulfill({ status: 401, headers: { 'Content-Type': 'application/json', 'X-Balaio-Sessao': 'invalida' }, json: { dados: null, erro: { codigo: 'NAO_AUTENTICADO', mensagem: 'Entre na sua conta para continuar.' } } })
  }, { times: 1 })
  await page.locator('.conta-hub').getByRole('link', { name: 'Meus dados', exact: true }).click()
  await recebida
  await page.locator('.menu-perfil-gatilho').click()
  await page.locator('.menu-perfil-painel').getByRole('button', { name: 'Sair da conta', exact: true }).click()
  await expect(page).toHaveURL(/\/login(?:\?|$)/)
  await page.locator('#email').fill('artesao@auth.test')
  await page.locator('#senha').fill(senha)
  await page.locator('#conteudo').getByRole('button', { name: 'Entrar', exact: true }).click()
  // O login respeita proximo=/account/details gerado ao sair desta página.
  await expect(page.locator('#conta-nome')).toHaveValue('Conta real artesao')
  await expect(page.locator('.menu-perfil-gatilho')).toHaveAttribute('title', 'Conectado como Conta real artesao')
  const antiga = page.waitForResponse((resposta) => new URL(resposta.url()).pathname === '/api/v1/conta/perfil' && resposta.status() === 401)
  liberar()
  await antiga
  await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))))
  await expect(page).toHaveURL(/\/account\/details$/)
  await expect(page.locator('#conta-nome')).toHaveValue('Conta real artesao')
  await expect(page.locator('.menu-perfil-gatilho')).toHaveAttribute('title', 'Conectado como Conta real artesao')
})
