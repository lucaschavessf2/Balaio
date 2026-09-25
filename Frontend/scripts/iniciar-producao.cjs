const { spawn } = require('node:child_process')

const servicos = [
  { nome: 'fake-api', script: 'fake-api/server.cjs' },
  { nome: 'next', script: 'server.js' },
]

let encerrando = false

const filhos = servicos.map(({ nome, script }) => {
  const filho = spawn(process.execPath, [script], { stdio: 'inherit', env: process.env })
  filho.on('exit', (codigo, sinal) => {
    if (encerrando) return
    console.error(`[${nome}] encerrou (código ${codigo ?? '-'}, sinal ${sinal ?? '-'}). Derrubando o container.`)
    encerrar(codigo || 1)
  })
  return filho
})

function encerrar(codigoSaida) {
  encerrando = true
  for (const filho of filhos) if (filho.exitCode === null) filho.kill('SIGTERM')
  setTimeout(() => process.exit(codigoSaida), 5000).unref()
  Promise.all(filhos.map((filho) => filho.exitCode !== null || new Promise((ok) => filho.once('exit', ok))))
    .then(() => process.exit(codigoSaida))
}

for (const sinal of ['SIGTERM', 'SIGINT']) process.on(sinal, () => encerrar(0))
