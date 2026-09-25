import type { ReactNode } from 'react'
import Pagina from '@/components/layout/Pagina'
import MenuDrawer from '@/components/navegacao/MenuDrawer'
import MenuAdminLateral from '@/components/admin/MenuAdminLateral'
import type { ChaveAdmin } from '@/components/admin/itensAdmin'
import { listarMediacoes } from '@/services/api/pedidos.servico'
import { listarFilaCuradoria } from '@/services/api/curadoria.servico'
import { tokenDaSessao } from '@/services/autenticacao'

type Props = { ativo: ChaveAdmin; children: ReactNode }

export default async function LayoutAdmin({ ativo, children }: Props) {
  const token = await tokenDaSessao()
  const [{ dados: fila }, { dados: mediacoes }] = await Promise.all([listarFilaCuradoria(token), listarMediacoes()])
  const contagens = { curadoria: fila?.length ?? 0, mediacoes: mediacoes?.length ?? 0 }
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
