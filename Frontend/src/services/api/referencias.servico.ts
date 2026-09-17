import { buscar } from './cliente'
import { type RespostaApi } from './tipos'

export type Referencias = {
  tecnicas: string[]
  territorios: string[]
  categorias: string[]
  etiquetas: string[]
}

export async function obterReferencias(): Promise<RespostaApi<Referencias>> {
  return buscar<Referencias>('/referencias')
}
