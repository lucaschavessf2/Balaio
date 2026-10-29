'use client'

import type { ReactNode } from 'react'
import Pagina from '@/components/layout/Pagina'
import MenuDrawer from '@/components/navegacao/MenuDrawer'
import MenuAdminLateral from '@/components/admin/MenuAdminLateral'
import type { ChaveAdmin, ContagensAdmin } from '@/components/admin/itensAdmin'

type Props = { ativo: ChaveAdmin; children: ReactNode; contagens: ContagensAdmin }

export default function LayoutAdmin({ ativo, children, contagens }: Props) {
  return (
    <Pagina>
      <MenuDrawer titulo="Curadoria" rotulo="Menu da curadoria">
        <MenuAdminLateral ativo={ativo} contagens={contagens} />
      </MenuDrawer>
      <div className="painel-layout">
        <MenuAdminLateral ativo={ativo} contagens={contagens} />
        <div className="encolhivel">{children}</div>
      </div>
    </Pagina>
  )
}
