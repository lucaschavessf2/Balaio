'use client'

import { useState } from 'react'
import { EstadoVazio, Foto } from '@/components/ui/Basicos'
import { avisar } from '@/components/feedback/Avisos'
import { IconePacote } from '@/components/ui/Icones'
import { emReais } from '@/utils/formato'

export type PedidoPendente = {
  id: string
  comprador: string
  quando: string
  valor: number
  pecaNome?: string
  pecaTecnica?: string
  pecaImagem?: string
}

export default function PedidosPendentes({
  iniciais,
  faturamentoMes,
}: {
  iniciais: PedidoPendente[]
  faturamentoMes: number
}) {
  const [pendentes, definirPendentes] = useState(iniciais)

  const metricas = [
    {
      rotulo: 'Pedidos pendentes',
      valor: String(pendentes.length),
      nota: 'Aguardando aceitação',
      classe: 'metrica-amarela',
    },
    { rotulo: 'Em produção', valor: '5', nota: 'Nas bancadas e fornos', classe: 'metrica-azul' },
    { rotulo: 'Enviados este mês', valor: '14', nota: 'Coletados com sucesso', classe: 'metrica-verde' },
    {
      rotulo: 'Faturamento do mês',
      valor: emReais(faturamentoMes),
      nota: '+12% em relação a fevereiro',
      classe: 'metrica-branca',
    },
  ]

  function aceitar(pedido: PedidoPendente) {
    definirPendentes(pendentes.filter((p) => p.id !== pedido.id))
    avisar.sucesso('Pedido aceito', 'Combine o prazo com o comprador pela conversa.')
  }

  return (
    <>
      <div className="metricas">
        {metricas.map((m) => (
          <div className={`metrica ${m.classe}`} key={m.rotulo}>
            <p className="metrica-rotulo">{m.rotulo}</p>
            <p className="metrica-valor">{m.valor}</p>
            <p className="metrica-nota">{m.nota}</p>
          </div>
        ))}
      </div>

      <section className="secao">
        <h2 className="secao-titulo">Novos pedidos recebidos</h2>

        {pendentes.length === 0 && (
          <EstadoVazio
            icone={<IconePacote tamanho={34} />}
            titulo="Nenhum pedido aguardando"
            descricao="Você aceitou todos os pedidos novos. Os próximos aparecem aqui assim que chegarem."
          />
        )}

        {pendentes.map((pedido) => (
          <article className="linha-pedido" key={pedido.id}>
            <div className="linha-flex encolhivel" style={{ flexWrap: 'nowrap' }}>
              <div className="linha-pedido-figura">
                {pedido.pecaImagem && <Foto nome={pedido.pecaNome ?? ''} imagem={pedido.pecaImagem} decorativa />}
              </div>
              <div className="encolhivel">
                <p className="dado-valor">{pedido.pecaNome}</p>
                <p className="autoria">Técnica: {pedido.pecaTecnica}</p>
              </div>
            </div>

            <div className="dado">
              <span className="dado-rotulo">Comprador</span>
              <span className="dado-valor">{pedido.comprador}</span>
            </div>

            <div className="dado">
              <span className="dado-rotulo">Recebido</span>
              <span className="dado-valor">{pedido.quando}</span>
            </div>

            <div className="dado">
              <span className="dado-rotulo">Valor</span>
              <span className="dado-valor preco-destaque">{emReais(pedido.valor)}</span>
            </div>

            <div className="acoes-linha">
              <span className="selo selo-encomenda">
                <span className="selo-ponto" />
                Pendente
              </span>
              <button type="button" className="botao botao-sucesso" onClick={() => aceitar(pedido)}>
                Aceitar pedido
              </button>
            </div>
          </article>
        ))}
      </section>
    </>
  )
}
