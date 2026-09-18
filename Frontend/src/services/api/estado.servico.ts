import { buscar, enviar } from './cliente'
import type { ItemSacola } from '@/store/sacola'

export type EstadoCliente = { id: string; favoritos: string[]; sacola: ItemSacola[]; historicoBusca: string[] }

export const obterEstado = () => buscar<EstadoCliente>('/estado')
export const salvarFavoritos = (favoritos: string[]) => enviar<string[]>('/estado/favoritos', { favoritos }, 'PUT')
export const salvarSacola = (sacola: ItemSacola[]) => enviar<ItemSacola[]>('/estado/sacola', { sacola }, 'PUT')
export const salvarHistoricoBusca = (historicoBusca: string[]) => enviar<string[]>('/estado/historicoBusca', { historicoBusca }, 'PUT')
