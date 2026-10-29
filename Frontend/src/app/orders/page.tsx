'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import EstadoCarregando from '@/components/feedback/EstadoCarregando'
import EstadoErro from '@/components/feedback/EstadoErro'
import EstadoVazio from '@/components/feedback/EstadoVazio'
import Pagina from '@/components/layout/Pagina'
import { Foto, Migalhas } from '@/components/ui/Basicos'
import { IconePacote } from '@/components/ui/Icones'
import { usePedidosConta } from '@/hooks/usePedidosConta'
import { obterPecaHistorico } from '@/services/api/pecas.servico'
import { listarArtesaos } from '@/services/api/artesaos.servico'
import { useSessao } from '@/store/sessao'
import type { Artesao, Peca, Pedido } from '@/types/dominio'
import { emReais } from '@/utils/formato'
import { rotuloEstadoPedido } from '@/constants/rotulos'

type DetalhesPedidos = { pedidos: Pedido[]; pecas: Peca[]; artesaos: Artesao[] }

export default function MeusPedidos() {
  const { sessao, estado: estadoSessao } = useSessao()
  const { pedidos, erro, carregando } = usePedidosConta()
  const [detalhes, definirDetalhes] = useState<DetalhesPedidos | null>(null)

  useEffect(() => {
    if (!pedidos?.length) return
    let ativo = true
    const slugs = [...new Set(pedidos.flatMap((pedido) => [pedido.pecaSlug, ...(pedido.itens ?? []).map((item) => item.slug)]))]
    void Promise.all([
      Promise.all(slugs.map((slug) => obterPecaHistorico(slug))),
      listarArtesaos(),
    ]).then(([pecas, artesaos]) => {
      if (ativo) definirDetalhes({
        pedidos,
        pecas: pecas.flatMap((resposta) => resposta.dados ? [resposta.dados] : []),
        artesaos: artesaos.dados ?? [],
      })
    })
    return () => { ativo = false }
  }, [pedidos])

  if (!sessao || estadoSessao !== 'autenticada') return null
  const listaPedidos = pedidos ?? []
  const carregandoDetalhes = listaPedidos.length > 0 && detalhes?.pedidos !== pedidos
  const mapaPecas = new Map((detalhes?.pedidos === pedidos ? detalhes.pecas : []).map((peca) => [peca.slug, peca]))
  const mapaArtesaos = new Map((detalhes?.pedidos === pedidos ? detalhes.artesaos : []).map((artesao) => [artesao.slug, artesao]))

  return (
    <Pagina>
      <Migalhas trilha={[{ texto: 'Início', href: '/' }, { texto: 'Meus pedidos' }]} />

      <h1 className="titulo-pagina">Meus pedidos</h1>
      <p className="subtitulo-pagina">
        Acompanhe o que está sendo produzido, o que está a caminho e o que já chegou.
      </p>

      {carregando || carregandoDetalhes ? <EstadoCarregando rotulo="Carregando seus pedidos…" cartoes={3} /> : erro ? (
        <EstadoErro mensagem={erro} />
      ) : listaPedidos.length === 0 ? (
        <EstadoVazio
          icone={<IconePacote tamanho={34} />}
          titulo="Você ainda não fez nenhum pedido"
          descricao="Quando comprar sua primeira peça, ela aparece aqui com todas as etapas da produção e do envio."
          acao={
            <Link href="/" className="botao botao-primario">
              Explorar o catálogo
            </Link>
          }
        />
      ) : listaPedidos.map((pedido) => {
        const peca = mapaPecas.get(pedido.pecaSlug)
        const artesao = peca ? mapaArtesaos.get(peca.artesao) : undefined
        const estado = rotuloEstadoPedido[pedido.estado]
        const entregue = pedido.estado === 'entregue'
        const encerrado = ['recusado', 'cancelado', 'reembolsado'].includes(pedido.estado)

        return (
          <article className="cartao-pedido" key={pedido.id}>
            <header className="cartao-pedido-topo">
              <span className={`selo ${estado.classe}`}>
                <span className="selo-ponto" />
                {estado.texto}
              </span>
              <span className="dado-rotulo">{pedido.data}</span>
            </header>

            <div className="cartao-pedido-corpo">
              <div className="cartao-pedido-figura">
                {peca && <Foto nome={peca.nome} imagem={peca.imagem} decorativa />}
              </div>
              <div className="encolhivel">
                <p className="texto-forte">{peca?.nome ?? pedido.pecaSlug}{(pedido.itens?.length ?? 0) > 1 ? ` e mais ${pedido.itens!.length - 1} peça(s)` : ''}</p>
                <p className="autoria">{artesao ? `por ${artesao.nome} · ` : ''}Pedido #{pedido.id}</p>
                <p className={`cartao-pedido-status${entregue ? ' status-bom' : ''}`}>
                  {encerrado
                    ? pedido.motivoEncerramento ?? 'Este pedido foi encerrado.'
                    : entregue
                      ? 'Entregue no seu endereço'
                      : (pedido.previsaoEntrega ? `Previsão de entrega: ${pedido.previsaoEntrega}` : 'Aguardando previsão de entrega')}
                </p>
                <p className="preco-destaque">{emReais(pedido.total)}</p>
              </div>
            </div>
          </article>
        )
      })}
    </Pagina>
  )
}
