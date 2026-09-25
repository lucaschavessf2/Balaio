import type { Coletivo } from '@/types/dominio'
import { buscar } from './cliente'
import { type RespostaApi } from './tipos'

export async function listarColetivos(): Promise<RespostaApi<Coletivo[]>> {
  return buscar<Coletivo[]>('/coletivos')
}

export async function obterColetivo(slug: string): Promise<RespostaApi<Coletivo>> {
  return buscar<Coletivo>(`/coletivos/${encodeURIComponent(slug)}`)
}
