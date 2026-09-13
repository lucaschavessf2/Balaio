import type { ReactNode } from 'react'
import { IconeBusca, IconeCasa, IconePlay, IconeSacola, IconeUsuario } from '@/components/ui/Icones'

export type ItemNavegacao = {
  chave: string
  texto: string
  href: string
  icone: ReactNode
  mostraContadorSacola?: boolean
}

export function itensNavegacao(comoArtesao: boolean): ItemNavegacao[] {
  return [
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
    comoArtesao
      ? { chave: 'conta', texto: 'Painel', href: '/dashboard', icone: <IconeUsuario tamanho={22} /> }
      : { chave: 'conta', texto: 'Entrar', href: '/login', icone: <IconeUsuario tamanho={22} /> },
  ]
}
