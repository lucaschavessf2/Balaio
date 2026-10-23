import 'server-only'
import type { Peca } from '@/types/dominio'
import { buscar, montarQuery } from './cliente'
import type { FiltrosPeca } from './pecas.servico'
import type { RespostaApi } from './tipos'

const API_GATEWAY = (process.env.API_GATEWAY_URL ?? 'http://127.0.0.1:8080/api/v1').replace(/\/$/, '')

export function listarPecasDoCatalogo(filtros: FiltrosPeca = {}): Promise<RespostaApi<Peca[]>> {
  return buscar<Peca[]>(
    '/pecas' + montarQuery({ ...filtros, desconto: filtros.desconto ? 'true' : undefined }),
    undefined,
    API_GATEWAY,
  )
}