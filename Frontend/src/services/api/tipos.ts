export type Paginacao = {
  pagina: number
  tamanho: number
  total: number
  totalPaginas: number
}

export type ErroApi = {
  codigo: string
  mensagem: string
  campos?: Record<string, string>
}

export type RespostaApi<T> = {
  dados: T | null
  erro: ErroApi | null
  paginacao?: Paginacao
}

export function sucesso<T>(dados: T, paginacao?: Paginacao): RespostaApi<T> {
  return paginacao ? { dados, erro: null, paginacao } : { dados, erro: null }
}

export function falha(codigo: string, mensagem: string, campos?: Record<string, string>): RespostaApi<never> {
  return { dados: null, erro: campos ? { codigo, mensagem, campos } : { codigo, mensagem } }
}

export function paginar<T>(itens: T[], pagina = 1, tamanho = itens.length): { itens: T[]; paginacao: Paginacao } {
  const total = itens.length
  const tamanhoReal = tamanho > 0 ? tamanho : total || 1
  const totalPaginas = Math.max(1, Math.ceil(total / tamanhoReal))
  const paginaReal = Math.min(Math.max(1, pagina), totalPaginas)
  const inicio = (paginaReal - 1) * tamanhoReal
  return {
    itens: itens.slice(inicio, inicio + tamanhoReal),
    paginacao: { pagina: paginaReal, tamanho: tamanhoReal, total, totalPaginas },
  }
}
