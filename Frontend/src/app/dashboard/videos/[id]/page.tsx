import { notFound } from 'next/navigation'
import FormEditarVideo from '@/components/forms/FormEditarVideo'
import { Migalhas } from '@/components/ui/Basicos'
import ImagemComFallback from '@/components/ui/ImagemComFallback'
import { pecasPorArtesao } from '@/services/api/pecas.servico'
import { listarVideos } from '@/services/api/videos.servico'
import { exigirArtesao } from '@/services/autenticacao'
import { fallbackDe } from '@/utils/imagem'

type Props = { params: Promise<{ id: string }> }

export default async function EditarVideo({ params }: Props) {
  const { artesao } = await exigirArtesao()
  const { id } = await params
  const [{ dados: videos, erro }, { dados: pecasArtesao }] = await Promise.all([
    listarVideos(true),
    pecasPorArtesao(artesao.slug),
  ])
  if (erro) throw new Error(erro.mensagem)
  const video = videos?.find((item) => item.id === id && item.artesao === artesao.slug)
  if (!video) notFound()
  const pecas = (pecasArtesao ?? []).map((peca) => ({ slug: peca.slug, nome: peca.nome }))

  return (
    <>
      <Migalhas
        trilha={[
          { texto: 'Painel do artesão', href: '/dashboard' },
          { texto: 'Vídeos', href: '/dashboard/videos' },
          { texto: 'Editar vídeo' },
        ]}
      />
      <h1 className="titulo-pagina">Editar vídeo</h1>
      <div className="editar-video-capa">
        <div className="video-painel-capa">
          <ImagemComFallback src={video.capa} reserva={fallbackDe(video.capa)} alt="" loading="lazy" />
        </div>
        <p className="autoria">O arquivo do vídeo não pode ser trocado aqui. Para usar outro, publique um novo vídeo.</p>
      </div>
      <FormEditarVideo key={video.id} video={video} pecas={pecas} />
    </>
  )
}
