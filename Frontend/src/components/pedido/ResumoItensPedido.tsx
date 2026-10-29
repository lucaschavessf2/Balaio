'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Foto } from '@/components/ui/Basicos'
import EstadoCarregando from '@/components/feedback/EstadoCarregando'
import { obterPecaHistorico } from '@/services/api/pecas.servico'
import type { Peca, Pedido } from '@/types/dominio'
import { emReais } from '@/utils/formato'

type ItemDetalhado = { slug: string; quantidade: number; peca: Peca | null }

export default function ResumoItensPedido({ pedido }: { pedido: Pedido }) {
  const [resultado, definirResultado] = useState<{ pedido: Pedido; itens: ItemDetalhado[] } | null>(null)

  useEffect(() => {
    let ativo = true
    const itens = pedido.itens ?? [{ slug: pedido.pecaSlug, quantidade: 1 }]
    void Promise.all(itens.map(async (item) => ({ ...item, peca: (await obterPecaHistorico(item.slug)).dados }))).then((itens) => {
      if (ativo) definirResultado({ pedido, itens })
    })
    return () => { ativo = false }
  }, [pedido])

  if (resultado?.pedido !== pedido) return <EstadoCarregando rotulo="Carregando itens do pedido…" cartoes={1} />
  const detalhados = resultado.itens
  return <>
    {detalhados.map(({ slug, quantidade, peca }) => <div className="item-sacola" key={slug}>
      <div className="item-sacola-figura"><Foto nome={peca?.nome ?? slug} imagem={peca?.imagem} decorativa /></div>
      <div>{peca?.inativadoEm ? <span className="texto-forte">{peca.nome}</span> : <Link className="texto-forte" href={`/pieces/${slug}`}>{peca?.nome ?? slug}</Link>}<p className="autoria">Quantidade: {quantidade}</p></div>
    </div>)}
    <p className="resumo resumo-total"><span>Total do pedido, com frete</span><strong>{emReais(pedido.total)}</strong></p>
    {pedido.simulado && <p className="campo-ajuda">Compra de demonstração. Nenhuma cobrança foi realizada.</p>}
  </>
}
