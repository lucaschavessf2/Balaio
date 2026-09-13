import { coletivos, acharColetivo, type Coletivo } from '@/mocks/coletivos'
import { API_FAKE, buscar } from './cliente'
import { falha, sucesso, type RespostaApi } from './tipos'

export async function listarColetivos(): Promise<RespostaApi<Coletivo[]>> {
  if (!API_FAKE) return buscar<Coletivo[]>('/coletivos')
  return sucesso(coletivos)
}

export async function obterColetivo(slug: string): Promise<RespostaApi<Coletivo>> {
  if (!API_FAKE) return buscar<Coletivo>(`/coletivos/${slug}`)
  const coletivo = acharColetivo(slug)
  return coletivo ? sucesso(coletivo) : falha('RECURSO_NAO_ENCONTRADO', 'Coletivo não encontrado.')
}
