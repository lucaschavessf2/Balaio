'use client'

import { useEffect, useState } from 'react'
import { listarPedidos } from '@/services/api/pedidos.servico'
import { useSessao } from '@/store/sessao'
import type { Pedido } from '@/types/dominio'

type ResultadoPedidos = { identidade: string; pedidos: Pedido[] | null; erro?: string }

export function usePedidosConta() {
  const { sessao, estado, versao, saidaPendente } = useSessao()
  const identidade = estado === 'autenticada' && sessao && !saidaPendente ? `${versao}:${sessao.id}` : null
  const [resultado, definirResultado] = useState<ResultadoPedidos | null>(null)

  useEffect(() => {
    if (!identidade) return
    let ativo = true
    void listarPedidos().then(({ dados, erro }) => {
      if (ativo) definirResultado({ identidade, pedidos: dados, erro: erro?.mensagem })
    })
    return () => { ativo = false }
  }, [identidade])

  const atual = identidade && resultado?.identidade === identidade ? resultado : null
  return { pedidos: atual?.pedidos ?? null, erro: atual?.erro, carregando: Boolean(identidade && !atual) }
}
