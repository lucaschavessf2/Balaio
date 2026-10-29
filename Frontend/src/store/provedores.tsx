'use client'

import type { ReactNode } from 'react'
import { SacolaProvider } from '@/store/sacola'
import { FavoritosProvider } from '@/store/favoritos'
import { DadosProvider } from '@/store/dados'
import { SessaoProvider, useSessao } from '@/store/sessao'
import ProtecaoRotas from '@/components/auth/ProtecaoRotas'

function EstadoDaVisita({ children }: { children: ReactNode }) {
  const { versao } = useSessao()
  return <SacolaProvider key={`sacola-${versao}`}>
    <FavoritosProvider key={`favoritos-${versao}`}><DadosProvider><ProtecaoRotas>{children}</ProtecaoRotas></DadosProvider></FavoritosProvider>
  </SacolaProvider>
}

export default function Provedores({ children }: { children: ReactNode }) {
  return (
    <SessaoProvider>
      <EstadoDaVisita>{children}</EstadoDaVisita>
    </SessaoProvider>
  )
}
