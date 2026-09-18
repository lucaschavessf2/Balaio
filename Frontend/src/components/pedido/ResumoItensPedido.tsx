import Link from 'next/link'
import { Foto } from '@/components/ui/Basicos'
import { obterPeca } from '@/services/api/pecas.servico'
import type { Pedido } from '@/types/dominio'
import { emReais } from '@/utils/formato'

export default async function ResumoItensPedido({ pedido }: { pedido: Pedido }) {
  const itens = pedido.itens ?? [{ slug: pedido.pecaSlug, quantidade: 1 }]
  const detalhados = await Promise.all(itens.map(async (item) => ({ ...item, peca: (await obterPeca(item.slug)).dados })))
  return <>
    {detalhados.map(({ slug, quantidade, peca }) => <div className="item-sacola" key={slug}>
      <div className="item-sacola-figura"><Foto nome={peca?.nome ?? slug} imagem={peca?.imagem} decorativa /></div>
      <div><Link className="texto-forte" href={`/pieces/${slug}`}>{peca?.nome ?? slug}</Link><p className="autoria">Quantidade: {quantidade}</p></div>
    </div>)}
    <p className="resumo resumo-total"><span>Total do pedido, com frete</span><strong>{emReais(pedido.total)}</strong></p>
    {pedido.simulado && <p className="campo-ajuda">Compra de demonstração. Nenhuma cobrança foi realizada.</p>}
  </>
}
