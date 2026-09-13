import { videos, comentariosDoVideo, type Comentario, type Video } from '@/mocks/videos'
import { API_FAKE, buscar } from './cliente'
import { falha, sucesso, type RespostaApi } from './tipos'

export async function listarVideos(): Promise<RespostaApi<Video[]>> {
  if (!API_FAKE) return buscar<Video[]>('/videos')
  return sucesso(videos)
}

export async function obterVideo(id: string): Promise<RespostaApi<Video>> {
  if (!API_FAKE) return buscar<Video>(`/videos/${id}`)
  const video = videos.find((v) => v.id === id)
  return video ? sucesso(video) : falha('RECURSO_NAO_ENCONTRADO', 'Vídeo não encontrado.')
}

export async function comentariosDe(id: string): Promise<RespostaApi<Comentario[]>> {
  if (!API_FAKE) return buscar<Comentario[]>(`/videos/${id}/comentarios`)
  return sucesso(comentariosDoVideo(id))
}
