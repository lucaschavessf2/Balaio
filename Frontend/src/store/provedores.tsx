'use client'

import type { ReactNode } from 'react'
import { SacolaProvider } from '@/store/sacola'
import { FavoritosProvider } from '@/store/favoritos'

export default function Provedores({ children }: { children: ReactNode }) {
  return (
    <SacolaProvider>
      <FavoritosProvider>{children}</FavoritosProvider>
    </SacolaProvider>
  )
}
