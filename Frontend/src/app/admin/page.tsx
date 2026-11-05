import Link from 'next/link'
import LayoutAdmin from '@/components/admin/LayoutAdmin'
import { Migalhas } from '@/components/ui/Basicos'
import FilaCuradoria from '@/components/admin/FilaCuradoria'
import { montarFilaCuradoria } from '@/components/admin/montarFilaCuradoria'
import EstadoErro from '@/components/feedback/EstadoErro'
import { IconeSetaDireita } from '@/components/ui/Icones'
import { listarFilaCuradoria } from '@/services/api/curadoria.servico'
import { listarArtesaos } from '@/services/api/artesaos.servico'
import { listarColetivos } from '@/services/api/coletivos.servico'
import { pecasPorArtesao } from '@/services/api/pecas.servico'
import { tokenDaSessao } from '@/services/autenticacao'

export default async function Admin() {
  const token = await tokenDaSessao()
  const [fila, artesaos, coletivos] = await Promise.all([
    listarFilaCuradoria(token),
    listarArtesaos(),
    listarColetivos(),
  ])
  const pecasDaFila = await Promise.all((fila.dados ?? []).map((item) => pecasPorArtesao(item.artesaoSlug)))
  const falha = [fila, artesaos, coletivos, ...pecasDaFila].find((resposta) => resposta.erro || !resposta.dados)

  return (
    <LayoutAdmin ativo="curadoria">
      <Migalhas trilha={[{ texto: 'Administração', href: '/admin' }, { texto: 'Curadoria' }]} />

      <div className="admin-topo">
        <h1 className="titulo-pagina">Fila de curadoria</h1>
        <Link href="/admin/criteria" className="prateleira-ver-todos">
          Ver critérios
          <IconeSetaDireita tamanho={14} />
        </Link>
      </div>

      {falha ? (
        <EstadoErro mensagem={falha.erro?.mensagem} />
      ) : (
        <FilaCuradoria
          filaInicial={montarFilaCuradoria(
            fila.dados ?? [],
            pecasDaFila.map((resposta) => resposta.dados ?? []),
            coletivos.dados ?? [],
          )}
          artesaosVerificados={(artesaos.dados ?? []).filter((artesao) => artesao.selo).length}
        />
      )}
    </LayoutAdmin>
  )
}
