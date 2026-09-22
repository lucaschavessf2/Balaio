import LayoutAdmin from '@/components/admin/LayoutAdmin'
import { Migalhas } from '@/components/ui/Basicos'
import FilaCuradoria from '@/components/admin/FilaCuradoria'
import { listarFilaCuradoria, listarMediacoes } from '@/services/api/pedidos.servico'
import { listarPecas } from '@/services/api/pecas.servico'

export default async function Admin() {
  const [{ dados: fila }, { dados: mediacoes }, { dados: pecas }] = await Promise.all([
    listarFilaCuradoria(),
    listarMediacoes(),
    listarPecas(),
  ])

  return (
    <LayoutAdmin ativo="curadoria">
      <Migalhas trilha={[{ texto: 'Administração', href: '/admin' }, { texto: 'Curadoria' }]} />

      <h1 className="titulo-pagina">Fila de curadoria</h1>
      <p className="subtitulo-pagina">
        A curadoria protege o que diferencia a plataforma: origem verificável e autoria real. Nada entra no catálogo sem
        passar por aqui.
      </p>

      <FilaCuradoria
        filaInicial={fila ?? []}
        mediacoesAbertas={(mediacoes ?? []).length}
        artesaosAtivos={new Set((pecas ?? []).filter((peca) => (peca.situacao ?? 'publicada') === 'publicada').map((peca) => peca.artesao)).size}
      />
    </LayoutAdmin>
  )
}
