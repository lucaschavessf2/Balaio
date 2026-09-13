import Link from 'next/link'
import Pagina from '@/components/layout/Pagina'
import CartaoVideo from '@/components/produto/CartaoVideo'
import { Migalhas } from '@/components/ui/Basicos'
import { IconePincel } from '@/components/ui/Icones'
import { listarVideos, comentariosDe } from '@/services/api/videos.servico'
import { listarArtesaos } from '@/services/api/artesaos.servico'
import { listarPecas } from '@/services/api/pecas.servico'

export const metadata = {
  title: 'Ateliê ao vivo | Balaio',
  description: 'Vídeos curtos em que os artesãos mostram o processo por trás de cada peça.',
}

export default async function Videos() {
  const [{ dados: videos }, { dados: artesaos }, { dados: pecas }] = await Promise.all([
    listarVideos(),
    listarArtesaos(),
    listarPecas(),
  ])
  const listaVideos = videos ?? []
  const mapaArtesaos = new Map((artesaos ?? []).map((a) => [a.slug, a]))
  const mapaPecas = new Map((pecas ?? []).map((p) => [p.slug, p]))
  const entradasComentarios = await Promise.all(
    listaVideos.map(async (v) => [v.id, (await comentariosDe(v.id)).dados ?? []] as const),
  )
  const mapaComentarios = new Map(entradasComentarios)

  return (
    <Pagina>
      <Migalhas trilha={[{ texto: 'Início', href: '/' }, { texto: 'Ateliê ao vivo' }]} />

      <h1 className="so-leitor">Ateliê ao vivo</h1>

      <div className="feed-videos feed-imersivo">
        {listaVideos.map((video) => {
          const artesao = mapaArtesaos.get(video.artesao)
          const peca = video.peca ? mapaPecas.get(video.peca) : undefined

          return (
            <CartaoVideo
              key={video.id}
              video={video}
              comentarios={mapaComentarios.get(video.id) ?? []}
              artesao={
                artesao && {
                  slug: artesao.slug,
                  nome: artesao.nome,
                  imagem: artesao.imagem,
                  territorio: artesao.territorio,
                }
              }
              peca={peca && { slug: peca.slug, nome: peca.nome, preco: peca.preco, imagem: peca.imagem }}
            />
          )
        })}

        <div className="video-fim">
          <p className="texto-forte">Você chegou ao fim por enquanto</p>
          <p>Novos vídeos entram toda semana.</p>
          <Link href="/dashboard/videos" className="botao botao-primario">
            <IconePincel />
            Publicar vídeo
          </Link>
          {listaVideos[0] && (
            <Link href={`#${listaVideos[0].id}`} className="botao botao-fantasma">
              Voltar ao início
            </Link>
          )}
        </div>
      </div>
    </Pagina>
  )
}
