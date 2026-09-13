import { tecnicas, territorios, categorias } from '@/constants/referencias'
import { etiquetasEmAlta } from '@/mocks/videos'
import { API_FAKE, buscar } from './cliente'
import { sucesso, type RespostaApi } from './tipos'

export type Referencias = {
  tecnicas: string[]
  territorios: string[]
  categorias: string[]
  etiquetas: string[]
}

export async function obterReferencias(): Promise<RespostaApi<Referencias>> {
  if (!API_FAKE) return buscar<Referencias>('/referencias')
  return sucesso({
    tecnicas: [...tecnicas],
    territorios: [...territorios],
    categorias: [...categorias],
    etiquetas: [...etiquetasEmAlta],
  })
}
