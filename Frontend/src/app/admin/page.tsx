import LayoutAdmin from '@/components/admin/LayoutAdmin'
import { Migalhas } from '@/components/ui/Basicos'
import FilaCuradoria from '@/components/admin/FilaCuradoria'
import EstadoErro from '@/components/feedback/EstadoErro'
import { listarMediacoes } from '@/services/api/pedidos.servico'
import { listarFilaCuradoria } from '@/services/api/curadoria.servico'
import { listarArtesaos } from '@/services/api/artesaos.servico'
import { tokenDaSessao } from '@/services/autenticacao'

export default async function Admin() {
  const token = await tokenDaSessao()
  const [fila, mediacoes, artesaos] = await Promise.all([
    listarFilaCuradoria(token),
    listarMediacoes(),
    listarArtesaos(),
  ])

  return (
    <LayoutAdmin ativo="curadoria">
      <Migalhas trilha={[{ texto: 'Administração', href: '/admin' }, { texto: 'Curadoria' }]} />

      <h1 className="titulo-pagina">Fila de curadoria</h1>
      <p className="subtitulo-pagina">
        A curadoria concede o selo de artesão verificado: origem verificável e autoria real. O selo é um
        reconhecimento; o artesão vende normalmente enquanto aguarda a análise.
      </p>

      {fila.erro || mediacoes.erro || artesaos.erro || !fila.dados || !mediacoes.dados || !artesaos.dados ? (
        <EstadoErro mensagem={fila.erro?.mensagem ?? mediacoes.erro?.mensagem ?? artesaos.erro?.mensagem} />
      ) : (
        <FilaCuradoria
          filaInicial={fila.dados}
          mediacoesAbertas={mediacoes.dados.length}
          artesaosVerificados={artesaos.dados.filter((artesao) => artesao.selo).length}
        />
      )}
    </LayoutAdmin>
  )
}
