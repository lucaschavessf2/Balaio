import { categorias, tecnicas, territorios, tipos } from '@/constants/referencias'
import { rotuloDisponibilidade, rotuloOrdenacao } from '@/constants/rotulos'
import type { Ordenacao } from '@/services/api/pecas.servico'
import type { Disponibilidade } from '@/types/dominio'

export const LIMITE_BUSCA = 80
export const ORDENACAO_PADRAO: Ordenacao = 'recentes'

export type FiltrosListagem = {
  q?: string
  tipo?: string
  tecnica?: string
  territorio?: string
  categoria?: string
  disponibilidade?: Disponibilidade
  desconto?: boolean
  ordenar: Ordenacao
  pagina: number
}

export type ChaveFiltro = 'q' | 'tipo' | 'tecnica' | 'territorio' | 'categoria' | 'disponibilidade' | 'desconto'

type Parametros = Record<string, string | string[] | undefined>

const primeiro = (valor: string | string[] | undefined) => (Array.isArray(valor) ? valor[0] : valor)

function aceito<T extends string>(valor: string | undefined, permitidos: readonly T[]): T | undefined {
  return permitidos.find((permitido) => permitido === valor)
}

export const disponibilidades = Object.keys(rotuloDisponibilidade) as Disponibilidade[]
export const ordenacoes = Object.keys(rotuloOrdenacao) as Ordenacao[]

export function lerFiltros(parametros: Parametros): FiltrosListagem {
  const q = primeiro(parametros.q)?.trim().slice(0, LIMITE_BUSCA)
  const pagina = Math.floor(Number(primeiro(parametros.pagina)))
  return {
    q: q || undefined,
    tipo: aceito(primeiro(parametros.tipo), tipos),
    tecnica: aceito(primeiro(parametros.tecnica), tecnicas),
    territorio: aceito(primeiro(parametros.territorio), territorios),
    categoria: aceito(primeiro(parametros.categoria), categorias),
    disponibilidade: aceito(primeiro(parametros.disponibilidade), disponibilidades),
    desconto: primeiro(parametros.desconto) === 'true' || undefined,
    ordenar: aceito(primeiro(parametros.ordenar), ordenacoes) ?? ORDENACAO_PADRAO,
    pagina: Number.isFinite(pagina) && pagina > 1 ? pagina : 1,
  }
}

export function hrefListagem(filtros: Partial<FiltrosListagem>): string {
  const parametros = new URLSearchParams()
  const { ordenar, pagina, desconto, ...resto } = filtros
  for (const [chave, valor] of Object.entries(resto)) {
    if (valor) parametros.set(chave, String(valor))
  }
  if (desconto) parametros.set('desconto', 'true')
  if (ordenar && ordenar !== ORDENACAO_PADRAO) parametros.set('ordenar', ordenar)
  if (pagina && pagina > 1) parametros.set('pagina', String(pagina))
  const texto = parametros.toString()
  return texto ? `/search?${texto}` : '/search'
}

export function hrefCom(filtros: FiltrosListagem, mudanca: Partial<FiltrosListagem>): string {
  return hrefListagem({ ...filtros, pagina: 1, ...mudanca })
}

export function hrefSem(filtros: FiltrosListagem, chave: ChaveFiltro): string {
  return hrefListagem({ ...filtros, [chave]: undefined, pagina: 1 })
}

export type FiltroAtivo = { chave: ChaveFiltro; rotulo: string; valor: string }

export function filtrosAtivos(filtros: FiltrosListagem): FiltroAtivo[] {
  const ativos: FiltroAtivo[] = []
  if (filtros.q) ativos.push({ chave: 'q', rotulo: 'Busca', valor: `"${filtros.q}"` })
  if (filtros.tipo) ativos.push({ chave: 'tipo', rotulo: 'Tipo', valor: filtros.tipo })
  if (filtros.tecnica) ativos.push({ chave: 'tecnica', rotulo: 'Técnica', valor: filtros.tecnica })
  if (filtros.territorio) ativos.push({ chave: 'territorio', rotulo: 'Território', valor: filtros.territorio })
  if (filtros.categoria) ativos.push({ chave: 'categoria', rotulo: 'Categoria', valor: filtros.categoria })
  if (filtros.disponibilidade) {
    ativos.push({ chave: 'disponibilidade', rotulo: 'Disponibilidade', valor: rotuloDisponibilidade[filtros.disponibilidade] })
  }
  if (filtros.desconto) ativos.push({ chave: 'desconto', rotulo: 'Preço', valor: 'Com desconto' })
  return ativos
}
