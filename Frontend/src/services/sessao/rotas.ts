const dentro = (caminho: string, prefixo: string) => caminho === prefixo || caminho.startsWith(`${prefixo}/`)
export const rotaProtegida = (caminho: string) =>
  ['/account', '/orders', '/checkout', '/confirmation', '/dashboard', '/admin'].some((prefixo) => dentro(caminho, prefixo))
export const rotaContaDisponivel = (caminho: string) =>
  ['/account', '/account/details', '/account/addresses', '/orders'].includes(caminho)
export const papelDaRota = (caminho: string) => dentro(caminho, '/admin') ? 'admin'
  : dentro(caminho, '/dashboard') ? 'artesao' : undefined
