import { Migalhas } from '@/components/ui/Basicos'
import EstadoErro from '@/components/feedback/EstadoErro'
import FormPublicarVideo from '@/components/forms/FormPublicarVideo'
import ListaVideosPainel from '@/components/painel/ListaVideosPainel'
import { IconeAviso, IconeGrafico } from '@/components/ui/Icones'
import { listarVideos } from '@/services/api/videos.servico'
import { pecasPorArtesao } from '@/services/api/pecas.servico'
import { exigirArtesao } from '@/services/autenticacao'

const dicas = [
  'Filme na horizontal do celular apoiado, ou na vertical se for mostrar as mãos de perto.',
  'Luz do dia perto da janela resolve mais que qualquer equipamento.',
  'Comece pelo detalhe que só quem faz conhece. É isso que prende quem assiste.',
  'Vídeos de até um minuto são assistidos até o fim com mais frequência.',
]

export default async function VideosDoAtelie() {
  const { artesao } = await exigirArtesao()
  const [{ dados: todosVideos, erro: erroVideos }, { dados: pecasArtesao }] = await Promise.all([
    listarVideos(true),
    pecasPorArtesao(artesao.slug),
  ])
  const meus = (todosVideos ?? []).filter((video) => video.artesao === artesao.slug).reverse()
  const pecas = (pecasArtesao ?? []).map((peca) => ({ slug: peca.slug, nome: peca.nome }))

  return (
    <>
      <Migalhas trilha={[{ texto: 'Painel do artesão', href: '/dashboard' }, { texto: 'Vídeos' }]} />
      <h1 className="titulo-pagina">Vídeos do ateliê</h1>
      <p className="subtitulo-pagina">
        Mostrar o processo é o que mais aproxima quem compra. Um minuto da sua bancada vale mais que dez fotos.
      </p>

      <div className="videos-painel">
        <section className="videos-painel-lista" aria-labelledby="seus-videos-titulo">
          <div className="videos-painel-cabeca">
            <h2 className="secao-titulo" id="seus-videos-titulo">Seus vídeos</h2>
            <a href="#novo-video" className="prateleira-ver-todos videos-painel-novo">Publicar um vídeo</a>
          </div>
          {erroVideos ? (
            <EstadoErro mensagem={erroVideos.mensagem} />
          ) : (
            <ListaVideosPainel videos={meus} nomesDasPecas={new Map(pecas.map((peca) => [peca.slug, peca.nome]))} />
          )}
        </section>

        <section className="videos-painel-formulario" aria-labelledby="novo-video">
          <h2 className="secao-titulo" id="novo-video">Publicar um vídeo</h2>
          <FormPublicarVideo pecas={pecas} />
        </section>

        <aside className="videos-painel-dicas">
          <div className="cartao abaixo-4">
            <h2 className="secao-titulo linha-flex" style={{ gap: 10 }}>
              <IconeGrafico tamanho={20} />
              Como gravar
            </h2>
            <ul style={{ paddingLeft: 18, color: 'var(--tinta-suave)', display: 'grid', gap: 10, margin: 0 }}>
              {dicas.map((dica) => (
                <li key={dica}>{dica}</li>
              ))}
            </ul>
          </div>

          <p className="aviso">
            <IconeAviso />
            <span>
              O vídeo precisa ser do <strong>seu trabalho</strong> e mostrar a sua produção. Conteúdo de terceiros é
              retirado do ar.
            </span>
          </p>
        </aside>
      </div>
    </>
  )
}
