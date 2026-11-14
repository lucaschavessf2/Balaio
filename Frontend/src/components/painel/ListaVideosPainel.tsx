import EstadoVazio from '@/components/feedback/EstadoVazio'
import AcoesVideo from '@/components/painel/AcoesVideo'
import { IconePlay } from '@/components/ui/Icones'
import ImagemComFallback from '@/components/ui/ImagemComFallback'
import type { Video } from '@/types/dominio'
import { emMilhares } from '@/utils/formato'
import { fallbackDe } from '@/utils/imagem'

const DURACAO_DESCONHECIDA = '0:00'

function resumoDosVideos(videos: Video[]): string {
  const rascunhos = videos.filter((video) => video.situacao === 'rascunho').length
  const publicados = videos.length - rascunhos
  return [
    publicados > 0 && (publicados === 1 ? '1 publicado' : `${publicados} publicados`),
    rascunhos > 0 && (rascunhos === 1 ? '1 rascunho' : `${rascunhos} rascunhos`),
  ].filter(Boolean).join(' · ')
}

export default function ListaVideosPainel({
  videos,
  nomesDasPecas,
}: {
  videos: Video[]
  nomesDasPecas: Map<string, string>
}) {
  if (videos.length === 0) {
    return (
      <EstadoVazio
        icone={<IconePlay tamanho={34} />}
        titulo="Você ainda não tem vídeos"
        descricao="Publique o primeiro mostrando a sua bancada. Ele aparece aqui e no Ateliê ao vivo."
      />
    )
  }

  return (
    <>
      <p className="autoria abaixo-3">{resumoDosVideos(videos)}</p>
      <ul className="lista-videos-painel escalonado">
        {videos.map((video) => {
          const rascunho = video.situacao === 'rascunho'
          const peca = video.peca ? nomesDasPecas.get(video.peca) : undefined
          return (
            <li className="video-painel" key={video.id}>
              <div className="video-painel-capa">
                <ImagemComFallback src={video.capa} reserva={fallbackDe(video.capa)} alt="" loading="lazy" />
                {video.duracao !== DURACAO_DESCONHECIDA && <span className="video-painel-duracao">{video.duracao}</span>}
              </div>

              <div className="video-painel-info">
                <div className="video-painel-topo">
                  <span className={`selo ${rascunho ? 'selo-neutro' : 'selo-disponivel'}`}>
                    <span className="selo-ponto" />
                    {rascunho ? 'Rascunho' : 'Publicado'}
                  </span>
                  {!rascunho && <span className="dado-rotulo">{video.publicadoEm}</span>}
                </div>
                <p className="video-painel-legenda">{video.legenda}</p>
                {peca && <p className="autoria">Peça: {peca}</p>}
                <p className="autoria">
                  {rascunho
                    ? 'Ainda não aparece no Ateliê ao vivo.'
                    : `${emMilhares(video.visualizacoes)} visualizações · ${emMilhares(video.curtidas)} curtidas · ${emMilhares(video.comentarios)} comentários`}
                </p>
                <AcoesVideo id={video.id} publicado={!rascunho} />
              </div>
            </li>
          )
        })}
      </ul>
    </>
  )
}
