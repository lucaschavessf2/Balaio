'use client'

import { usePathname } from 'next/navigation'
import type { ReactNode } from 'react'
import MenuDrawer from '@/components/navegacao/MenuDrawer'
import MenuPainelLateral from '@/components/painel/MenuPainelLateral'
import type { ChavePainel } from '@/components/painel/itensPainel'

type Props = { children: ReactNode }

function itemAtivo(caminho: string): ChavePainel {
  if (caminho.startsWith('/dashboard/pieces')) return 'pecas'
  if (caminho.startsWith('/dashboard/sales')) return 'vendas'
  if (caminho.startsWith('/dashboard/messages')) return 'conversas'
  if (caminho.startsWith('/dashboard/videos')) return 'videos'
  if (caminho.startsWith('/dashboard/settings')) return 'config'
  return 'pedidos'
}

export default function LayoutPainel({ children }: Props) {
  const ativo = itemAtivo(usePathname())

  return (
    <>
      <MenuDrawer titulo="Painel do artesão" rotulo="Menu do painel">
        <MenuPainelLateral ativo={ativo} />
      </MenuDrawer>
      <div className="painel-layout">
        <MenuPainelLateral ativo={ativo} />
        <div className="encolhivel">{children}</div>
      </div>
    </>
  )
}
