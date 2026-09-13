import type { ReactNode } from 'react'
import Pagina from '@/components/layout/Pagina'
import MenuDrawer from '@/components/navegacao/MenuDrawer'
import MenuAdminLateral from '@/components/admin/MenuAdminLateral'
import type { ChaveAdmin } from '@/components/admin/itensAdmin'

type Props = { ativo: ChaveAdmin; children: ReactNode }

export default function LayoutAdmin({ ativo, children }: Props) {
  return (
    <Pagina>
      <MenuDrawer titulo="Curadoria" rotulo="Menu da curadoria">
        <MenuAdminLateral ativo={ativo} />
      </MenuDrawer>
      <div className="painel-layout">
        <MenuAdminLateral ativo={ativo} />
        <div className="encolhivel">{children}</div>
      </div>
    </Pagina>
  )
}
