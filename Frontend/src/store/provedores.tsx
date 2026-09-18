'use client'

import type { ReactNode } from 'react'
import { SacolaProvider } from '@/store/sacola'
import { FavoritosProvider } from '@/store/favoritos'
import { DadosProvider } from '@/store/dados'
import { SessaoProvider } from '@/store/sessao'
import type { Sessao } from '@/services/sessao/cookie'

export default function Provedores({ sessao, children }: { sessao: Sessao | null; children: ReactNode }) {
  return (
    <SessaoProvider inicial={sessao}>
      <SacolaProvider>
        <FavoritosProvider><DadosProvider>{children}</DadosProvider></FavoritosProvider>
      </SacolaProvider>
    </SessaoProvider>
  )
}
