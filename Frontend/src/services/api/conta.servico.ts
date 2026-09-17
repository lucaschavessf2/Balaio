import { buscar } from './cliente'
import type { Usuario } from '@/mocks/usuario'
import type { OpcaoFrete } from '@/mocks/frete'

export const obterUsuario = () => buscar<Usuario>('/usuario')
export const listarFretes = () => buscar<OpcaoFrete[]>('/fretes')
