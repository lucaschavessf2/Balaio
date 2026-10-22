'use client'

import type { ReactNode } from 'react'
import { SacolaProvider } from '@/store/sacola'
import { FavoritosProvider } from '@/store/favoritos'
import { DadosProvider } from '@/store/dados'
import { SessaoProvider, useSessao } from '@/store/sessao'
import { EstadoClienteProvider } from '@/store/estadoCliente'
import { HistoricoBuscaProvider } from '@/store/historicoBusca'
import type { Sessao } from '@/services/sessao/cookie'

export default function Provedores({ sessao, children }: { sessao: Sessao | null; children: ReactNode }) {
  return (
    <SessaoProvider inicial={sessao}>
      <DadosProvider>
        <EstadoDaSessao>{children}</EstadoDaSessao>
      </DadosProvider>
    </SessaoProvider>
  )
}

function EstadoDaSessao({ children }: { children: ReactNode }) {
  const { sessao } = useSessao()
  const identidade = sessao ? `usuario:${sessao.id}` : 'visitante'

  return (
    <EstadoClienteProvider key={identidade}>
      <SacolaProvider>
        <FavoritosProvider>
          <HistoricoBuscaProvider>{children}</HistoricoBuscaProvider>
        </FavoritosProvider>
      </SacolaProvider>
    </EstadoClienteProvider>
  )
}
