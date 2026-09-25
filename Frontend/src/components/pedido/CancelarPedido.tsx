'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { IconeAviso } from '@/components/ui/Icones'
import { cancelarPedido } from '@/services/api/pedidos.servico'

export default function CancelarPedido({ pedidoId }: { pedidoId: string }) {
  const roteador = useRouter()
  const [confirmando, definirConfirmando] = useState(false)
  const [cancelando, definirCancelando] = useState(false)
  const [erro, definirErro] = useState<string | null>(null)

  async function cancelar() {
    definirErro(null)
    definirCancelando(true)
    const resposta = await cancelarPedido(pedidoId)
    definirCancelando(false)
    if (!resposta.dados) {
      definirErro(resposta.erro?.mensagem ?? 'Não foi possível cancelar o pedido. Tente novamente.')
      return
    }
    roteador.refresh()
  }

  if (confirmando) {
    return (
      <div className="cancelamento-confirmacao" role="region" aria-labelledby="titulo-confirmar-cancelamento">
        <span className="cancelamento-confirmacao-icone" aria-hidden="true">
          <IconeAviso tamanho={20} />
        </span>
        <div>
          <h3 id="titulo-confirmar-cancelamento">Tem certeza que deseja cancelar?</h3>
          <p>Essa ação não poderá ser desfeita. Se houver uma peça única, ela voltará para a vitrine.</p>
          {erro && <p className="cancelamento-erro" role="alert">{erro}</p>}
          <div className="cancelamento-acoes">
            <button
              type="button"
              className="botao botao-fantasma"
              disabled={cancelando}
              onClick={() => {
                definirErro(null)
                definirConfirmando(false)
              }}
            >
              Voltar
            </button>
            <button type="button" className="botao botao-perigo" disabled={cancelando} onClick={() => void cancelar()}>
              {cancelando ? 'Cancelando…' : 'Sim, cancelar pedido'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <button type="button" className="botao botao-perigo" onClick={() => definirConfirmando(true)}>
      Cancelar pedido
    </button>
  )
}
