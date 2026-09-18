import Link from 'next/link'
import LayoutPainel from '@/components/painel/LayoutPainel'
import { Migalhas } from '@/components/ui/Basicos'
import FormPublicarVideo from '@/components/forms/FormPublicarVideo'
import { IconeAviso, IconeGrafico, IconeSetaDireita } from '@/components/ui/Icones'
import ImagemComFallback from '@/components/ui/ImagemComFallback'
import { emMilhares } from '@/mocks/videos'
import { fallbackDe } from '@/mocks/imagens'
import { listarVideos } from '@/services/api/videos.servico'
import { pecasPorArtesao } from '@/services/api/pecas.servico'

const dicas = [
  'Filme na horizontal do celular apoiado, ou na vertical se for mostrar as mãos de perto.',
  'Luz do dia perto da janela resolve mais que qualquer equipamento.',
  'Comece pelo detalhe que só quem faz conhece. É isso que prende quem assiste.',
  'Vídeos de até um minuto são assistidos até o fim com mais frequência.',
]

function resumirLegenda(legenda: string): string {
  return legenda.length > 60 ? `${legenda.slice(0, 60)}…` : legenda
}

export default async function PublicarVideo() {
  const [{ dados: todosVideos }, { dados: pecasArtesao }] = await Promise.all([
    listarVideos(true),
    pecasPorArtesao('mestre-nuca'),
  ])
  const meus = (todosVideos ?? []).filter((v) => v.artesao === 'mestre-nuca')
  const pecas = (pecasArtesao ?? []).map((p) => ({ slug: p.slug, nome: p.nome }))

  return (
    <LayoutPainel ativo="videos">
      <Migalhas trilha={[{ texto: 'Painel do artesão', href: '/dashboard' }, { texto: 'Vídeos' }]} />
      <h1 className="titulo-pagina">Publicar um vídeo</h1>
      <p className="subtitulo-pagina">
        Mostrar o processo é o que mais aproxima quem compra. Um minuto da sua bancada vale mais que dez fotos.
      </p>

      <div className="duas-colunas">
        <div>
          <FormPublicarVideo pecas={pecas} />

          <section className="cartao">
            <h2 className="secao-titulo">Seus vídeos</h2>

            {meus.map((v) => (
              <div className="linha-video" key={v.id}>
                <ImagemComFallback src={v.capa} reserva={fallbackDe(v.capa)} alt="" loading="lazy" width={54} height={54} />
                <div className="encolhivel">
                  <p className="dado-valor">{resumirLegenda(v.legenda)}</p>
                  <p className="autoria">
                    {emMilhares(v.visualizacoes)} visualizações · {emMilhares(v.curtidas)} curtidas ·{' '}
                    {v.publicadoEm}
                  </p>
                </div>
                <Link href={`/videos#${v.id}`} className="ver-peca">
                  Ver <IconeSetaDireita tamanho={14} />
                </Link>
              </div>
            ))}
          </section>
        </div>

        <aside>
          <div className="cartao abaixo-4">
            <h2 className="secao-titulo linha-flex" style={{ gap: 10 }}>
              <IconeGrafico tamanho={20} />
              Como gravar
            </h2>
            <ul style={{ paddingLeft: 18, color: 'var(--tinta-suave)', display: 'grid', gap: 10, margin: 0 }}>
              {dicas.map((d) => (
                <li key={d}>{d}</li>
              ))}
            </ul>
          </div>

          <p className="aviso">
            <IconeAviso />
            <span>
              O vídeo também passa por <strong>curadoria</strong>, pelos mesmos critérios das peças: precisa ser do
              seu trabalho e mostrar a sua produção.
            </span>
          </p>
        </aside>
      </div>
    </LayoutPainel>
  )
}
