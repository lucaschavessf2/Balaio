import LayoutAdmin from '@/components/admin/LayoutAdmin'
import { Migalhas } from '@/components/ui/Basicos'
import ListaMediacoes from '@/components/admin/ListaMediacoes'
import { listarMediacoes } from '@/services/api/pedidos.servico'

export default async function Mediacoes() {
  const { dados: mediacoes } = await listarMediacoes()

  return (
    <LayoutAdmin ativo="mediacoes">
      <Migalhas trilha={[{ texto: 'Administração', href: '/admin' }, { texto: 'Mediações' }]} />

      <h1 className="titulo-pagina">Mediações</h1>
      <p className="subtitulo-pagina">
        Quando comprador e artesão não chegam a um acordo, a plataforma ouve os dois lados antes de decidir sobre o
        repasse.
      </p>

      <ListaMediacoes iniciais={mediacoes ?? []} />
    </LayoutAdmin>
  )
}
