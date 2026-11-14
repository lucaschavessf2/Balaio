import 'server-only'
import type { Peca } from '@/types/dominio'
import { buscar, montarQuery } from './cliente'
import { urlDoGateway } from './gateway'
import { listarPecas, type FiltrosPeca } from './pecas.servico'
import type { RespostaApi } from './tipos'

export function listarPecasDoCatalogo(filtros: FiltrosPeca = {}): Promise<RespostaApi<Peca[]>> {
  const gateway = urlDoGateway()
  if (!gateway) return listarPecas(filtros)
  return buscar<Peca[]>(
    '/pecas' + montarQuery({ ...filtros, desconto: filtros.desconto ? 'true' : undefined }),
    undefined,
    gateway,
  )
}
