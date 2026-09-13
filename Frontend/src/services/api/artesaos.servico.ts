import { artesaos, acharArtesao } from '@/mocks/artesaos'
import { type Artesao } from '@/types/dominio'
import { API_FAKE, buscar } from './cliente'
import { falha, sucesso, type RespostaApi } from './tipos'

export async function listarArtesaos(): Promise<RespostaApi<Artesao[]>> {
  if (!API_FAKE) return buscar<Artesao[]>('/artesaos')
  return sucesso(artesaos)
}

export async function obterArtesao(slug: string): Promise<RespostaApi<Artesao>> {
  if (!API_FAKE) return buscar<Artesao>(`/artesaos/${slug}`)
  const artesao = acharArtesao(slug)
  return artesao ? sucesso(artesao) : falha('RECURSO_NAO_ENCONTRADO', 'Artesão não encontrado.')
}
