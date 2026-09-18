import { buscar } from './cliente'
import type { OpcaoFrete } from '@/mocks/frete'

export const listarFretes = () => buscar<OpcaoFrete[]>('/fretes')
