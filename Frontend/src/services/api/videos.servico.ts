import type { Comentario, Video } from '@/types/dominio'
import { buscar, enviar } from './cliente'
import { type RespostaApi } from './tipos'

export async function listarVideos(painel = false): Promise<RespostaApi<Video[]>> {
  return buscar<Video[]>(`/videos${painel ? '?painel=true' : ''}`)
}

export function criarVideo(video: Video & { situacao: 'publicada' | 'rascunho' }): Promise<RespostaApi<Video>> {
  return enviar('/videos', video)
}

export type AlteracoesVideo = Partial<Pick<Video, 'legenda' | 'etiquetas' | 'peca' | 'situacao'>>

export function atualizarVideo(id: string, alteracoes: AlteracoesVideo): Promise<RespostaApi<Video>> {
  return enviar(`/videos/${encodeURIComponent(id)}`, alteracoes, 'PATCH')
}

export function removerVideo(id: string): Promise<RespostaApi<Video>> {
  return buscar<Video>(`/videos/${encodeURIComponent(id)}`, { method: 'DELETE' })
}

export function comentarVideo(id: string, comentario: Comentario): Promise<RespostaApi<Comentario>> {
  return enviar(`/videos/${encodeURIComponent(id)}/comentarios`, comentario)
}

export async function obterVideo(id: string): Promise<RespostaApi<Video>> {
  return buscar<Video>(`/videos/${encodeURIComponent(id)}`)
}

export async function comentariosDe(id: string): Promise<RespostaApi<Comentario[]>> {
  return buscar<Comentario[]>(`/videos/${encodeURIComponent(id)}/comentarios`)
}
