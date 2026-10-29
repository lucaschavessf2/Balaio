const regras: [string[], RegExp][] = [
  [['GET', 'HEAD'], /^\/(pecas|artesaos|coletivos|eventos|videos)(\/[^/]+)?$/],
  [['GET'], /^\/pecas\/[^/]+\/(historico|relacionadas|perguntas)$/],
  [['GET'], /^\/artesaos\/[^/]+\/pecas$/],
  [['GET', 'POST'], /^\/videos\/[^/]+\/comentarios$/],
  [['GET', 'HEAD'], /^\/(referencias|fretes)$/],
  [['GET', 'HEAD'], /^\/arquivos\/pecas\/[^/]+$/],
  [['GET'], /^\/estado$/],
  [['PUT'], /^\/estado\/(favoritos|sacola|historicoBusca|videosCurtidos|videosSalvos)$/],
  [['POST'], /^\/(eventos|auth\/recuperacao)$/],
]

export function rotaPublicaFake(metodo: string, caminho: string, query: URLSearchParams): boolean {
  if (caminho === '/videos' && query.getAll('painel').includes('true')) return false
  return regras.some(([metodos, padrao]) => metodos.includes(metodo) && padrao.test(caminho))
}

export function rotaContaFake(metodo: string, caminho: string): boolean {
  return (metodo === 'GET' && (caminho === '/conta/perfil' || /^\/pedidos(?:\/[^/]+)?$/.test(caminho)))
    || (metodo === 'PATCH' && caminho === '/usuario')
    || (['GET', 'POST'].includes(metodo) && caminho === '/usuario/enderecos')
    || (['PATCH', 'DELETE'].includes(metodo) && /^\/usuario\/enderecos\/[^/]+$/.test(caminho))
}
