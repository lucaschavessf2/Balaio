import { Campo } from '@/components/ui/Basicos'
import Seletor from '@/components/ui/Seletor'
import type { Video } from '@/types/dominio'

export type PecaVinculavel = { slug: string; nome: string }

export default function CamposVideo({
  pecas,
  erroLegenda,
  video,
}: {
  pecas: PecaVinculavel[]
  erroLegenda: string | null
  video?: Video
}) {
  return (
    <>
      <Campo
        rotulo="Legenda"
        ajuda="Conte o que está acontecendo na cena. Fale como falaria na feira."
        erro={erroLegenda ?? undefined}
        id="video-legenda"
      >
        <textarea
          id="video-legenda"
          name="legenda"
          defaultValue={video?.legenda}
          placeholder="A juba do leão é feita cacho por cacho, com faca de ponta fina..."
        />
      </Campo>

      <Campo rotulo="Etiquetas" ajuda="Separe por espaço. Ajudam quem procura pela técnica." id="video-etiquetas">
        <input
          id="video-etiquetas"
          name="etiquetas"
          defaultValue={video?.etiquetas.join(' ')}
          placeholder="ceramica tracunhaem passoapasso"
        />
      </Campo>

      <Campo rotulo="Vincular a uma peça" ajuda="Quem assistir pode ir direto para a peça e comprar." id="video-peca">
        <Seletor
          id="video-peca"
          name="peca"
          defaultValue={video?.peca ?? ''}
          opcoes={[
            { valor: '', rotulo: 'Nenhuma peça vinculada' },
            ...pecas.map((peca) => ({ valor: peca.slug, rotulo: peca.nome })),
          ]}
        />
      </Campo>
    </>
  )
}
