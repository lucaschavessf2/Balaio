import LayoutPainel from '@/components/painel/LayoutPainel'
import { Migalhas } from '@/components/ui/Basicos'
import CaixaConversas from '@/components/pedido/CaixaConversas'
import { listarConversasArtesao, conversaDoPedido } from '@/services/api/pedidos.servico'
import { exigirArtesao } from '@/services/sessao/servidor'

export default async function Conversas() {
  const { artesao } = await exigirArtesao()
  const { dados: fios } = await listarConversasArtesao(artesao)
  const { dados: conversa } = await conversaDoPedido((fios ?? [])[0]?.id ?? '')

  return (
    <LayoutPainel ativo="conversas">
      <Migalhas trilha={[{ texto: 'Painel do artesão', href: '/dashboard' }, { texto: 'Conversas' }]} />
      <h1 className="titulo-pagina">Central de mensagens</h1>
      <p className="subtitulo-pagina">
        Perguntas sobre peças e conversas de pedidos ficam todas aqui. Responder rápido é o que mais aumenta a
        chance de venda.
      </p>

      <CaixaConversas fios={fios ?? []} conversaInicial={conversa ?? []} />
    </LayoutPainel>
  )
}
