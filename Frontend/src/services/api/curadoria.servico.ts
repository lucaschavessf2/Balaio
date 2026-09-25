import type { EstadoSelo, SolicitacaoSeloNaFila } from '@/types/dominio'
import { buscar, enviar } from './cliente'
import type { RespostaApi } from './tipos'

const autorizacao = (token?: string) => token ? { headers: { Authorization: `Bearer ${token}` } } : undefined

export type DecisaoSelo = 'aprovada' | 'ajuste'

export function listarFilaCuradoria(token?: string): Promise<RespostaApi<SolicitacaoSeloNaFila[]>> {
  return buscar<SolicitacaoSeloNaFila[]>('/admin/curadoria', autorizacao(token))
}

export function decidirSolicitacaoSelo(id: string, decisao: DecisaoSelo, motivo = ''): Promise<RespostaApi<SolicitacaoSeloNaFila>> {
  return enviar<SolicitacaoSeloNaFila>(`/admin/curadoria/${encodeURIComponent(id)}/decisao`, { decisao, motivo })
}

export function obterMeuSelo(token?: string): Promise<RespostaApi<EstadoSelo>> {
  return buscar<EstadoSelo>('/artesao/selo', autorizacao(token))
}

export function solicitarSelo(mensagem: string): Promise<RespostaApi<EstadoSelo>> {
  return enviar<EstadoSelo>('/artesao/selo', { mensagem })
}
