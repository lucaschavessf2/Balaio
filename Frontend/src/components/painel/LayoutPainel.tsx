import type { ReactNode } from 'react'
import Pagina from '@/components/layout/Pagina'
import MenuDrawer from '@/components/navegacao/MenuDrawer'
import MenuPainelLateral from '@/components/painel/MenuPainelLateral'
import type { ChavePainel } from '@/components/painel/itensPainel'

type Props = { ativo: ChavePainel; children: ReactNode }

export default function LayoutPainel({ ativo, children }: Props) {
  return (
    <Pagina comoArtesao>
      <MenuDrawer titulo="Painel do artesão" rotulo="Menu do painel">
        <MenuPainelLateral ativo={ativo} />
      </MenuDrawer>
      <div className="painel-layout">
        <MenuPainelLateral ativo={ativo} />
        <div className="encolhivel">{children}</div>
      </div>
    </Pagina>
  )
}
