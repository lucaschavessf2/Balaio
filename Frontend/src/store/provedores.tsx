'use client'

import type { ReactNode } from 'react'
import { SacolaProvider } from '@/store/sacola'
import { FavoritosProvider } from '@/store/favoritos'
import { DadosProvider } from '@/store/dados'

export default function Provedores({ children }: { children: ReactNode }) {
  return (
    <SacolaProvider>
      <FavoritosProvider><DadosProvider>{children}</DadosProvider></FavoritosProvider>
    </SacolaProvider>
  )
}
