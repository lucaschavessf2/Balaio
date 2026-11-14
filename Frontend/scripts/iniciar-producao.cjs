const { spawn } = require('node:child_process')
const { randomBytes } = require('node:crypto')

const chaveInterna = process.env.BALAIO_FAKE_INTERNAL_KEY || randomBytes(32).toString('base64url')
if (chaveInterna.length < 32) throw new Error('BALAIO_FAKE_INTERNAL_KEY precisa ter no mínimo 32 caracteres.')
const ambiente = { ...process.env, BALAIO_FAKE_INTERNAL_KEY: chaveInterna }

const servicos = [
  ...(process.env.FAKE_API_ENABLED === 'true' ? [{ nome: 'fake-api', script: 'fake-api/server.cjs' }] : []),
  { nome: 'next', script: 'server.js' },
]

let encerrando = false

const filhos = servicos.map(({ nome, script }) => {
  const filho = spawn(process.execPath, [script], { stdio: 'inherit', env: ambiente })
  filho.on('error', (erro) => {
    console.error(`[${nome}] falhou ao iniciar: ${erro.message}`)
    if (!encerrando) encerrar(1)
  })
  filho.on('exit', (codigo, sinal) => {
    if (encerrando) return
    console.error(`[${nome}] encerrou (código ${codigo ?? '-'}, sinal ${sinal ?? '-'}). Derrubando o container.`)
    encerrar(codigo || 1)
  })
  return filho
})

function encerrar(codigoSaida) {
  if (encerrando) return
  encerrando = true
  for (const filho of filhos) if (filho.pid && filho.exitCode === null && filho.signalCode === null) filho.kill('SIGTERM')
  setTimeout(() => {
    for (const filho of filhos) if (filho.pid && filho.exitCode === null && filho.signalCode === null) filho.kill('SIGKILL')
    process.exit(codigoSaida)
  }, 5000).unref()
  Promise.all(filhos.map((filho) => !filho.pid || filho.exitCode !== null || filho.signalCode !== null || new Promise((ok) => filho.once('exit', ok))))
    .then(() => process.exit(codigoSaida))
}

for (const sinal of ['SIGTERM', 'SIGINT']) process.on(sinal, () => encerrar(0))
