import type { ReactNode } from 'react'
import { IconeBusca, IconeCasa, IconePlay, IconeSacola } from '@/components/ui/Icones'

export type ItemNavegacao = {
  chave: string
  texto: string
  href: string
  icone: ReactNode
  mostraContadorSacola?: boolean
}

export const itensNavegacao: ItemNavegacao[] = [
  { chave: 'inicio', texto: 'Início', href: '/', icone: <IconeCasa tamanho={22} /> },
  { chave: 'busca', texto: 'Buscar', href: '/search', icone: <IconeBusca tamanho={22} /> },
  { chave: 'atelie', texto: 'Ateliê', href: '/videos', icone: <IconePlay tamanho={22} /> },
  {
    chave: 'sacola',
    texto: 'Sacola',
    href: '/cart',
    icone: <IconeSacola tamanho={22} />,
    mostraContadorSacola: true,
  },
]
