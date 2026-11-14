const { spawn } = require('node:child_process')
const { randomBytes } = require('node:crypto')
const { existsSync } = require('node:fs')
const path = require('node:path')

const raiz = path.resolve(__dirname, '..')
const arquivoAmbiente = path.join(raiz, '.env.local')
if (existsSync(arquivoAmbiente)) process.loadEnvFile(arquivoAmbiente)

const chaveInterna = process.env.BALAIO_FAKE_INTERNAL_KEY || randomBytes(32).toString('base64url')
if (chaveInterna.length < 32) throw new Error('BALAIO_FAKE_INTERNAL_KEY precisa ter no mínimo 32 caracteres.')
const ambiente = { ...process.env, BALAIO_FAKE_INTERNAL_KEY: chaveInterna }
const servicos = [
  { nome: 'fake-api', argumentos: ['fake-api/server.cjs'] },
  { nome: 'next', argumentos: [require.resolve('next/dist/bin/next'), 'dev', '-p', '4321'] },
]

let encerrando = false
const filhos = servicos.map(({ nome, argumentos }) => {
  const filho = spawn(process.execPath, argumentos, { cwd: raiz, stdio: 'inherit', env: ambiente })
  filho.on('error', (erro) => {
    console.error(`[${nome}] falhou ao iniciar: ${erro.message}`)
    if (!encerrando) encerrar(1)
  })
  filho.on('exit', (codigo, sinal) => {
    if (encerrando) return
    console.error(`[${nome}] encerrou (código ${codigo ?? '-'}, sinal ${sinal ?? '-'}). Encerrando os serviços.`)
    encerrar(codigo || 1)
  })
  return filho
})

function encerrar(codigoSaida) {
  if (encerrando) return
  encerrando = true
  for (const filho of filhos) {
    if (!filho.pid || filho.exitCode !== null || filho.signalCode !== null) continue
    // No Windows o Next dev tem um processo filho que precisa encerrar junto.
    if (process.platform === 'win32') {
      const encerramento = spawn('taskkill', ['/pid', String(filho.pid), '/T', '/F'], { stdio: 'ignore', windowsHide: true })
      encerramento.on('error', () => filho.kill('SIGTERM'))
    } else filho.kill('SIGTERM')
  }
  setTimeout(() => {
    for (const filho of filhos) if (filho.pid && filho.exitCode === null && filho.signalCode === null) filho.kill('SIGKILL')
    process.exit(codigoSaida)
  }, 5000).unref()
  Promise.all(filhos.map((filho) => !filho.pid || filho.exitCode !== null || filho.signalCode !== null || new Promise((resolve) => filho.once('exit', resolve))))
    .then(() => process.exit(codigoSaida))
}

for (const sinal of ['SIGTERM', 'SIGINT']) process.on(sinal, () => encerrar(0))
