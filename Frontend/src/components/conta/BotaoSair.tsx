'use client'

import { useRouter } from 'next/navigation'
import { useRef, useState } from 'react'
import { avisar } from '@/components/feedback/Avisos'
import { IconeSair } from '@/components/ui/Icones'
import { sair as sairDaConta } from '@/services/api/conta.servico'
import { useSessao } from '@/store/sessao'

export default function BotaoSair() {
  const roteador = useRouter()
  const { encerrarSessao } = useSessao()
  const [saindo, definirSaindo] = useState(false)
  const saidaEmAndamento = useRef(false)

  async function sair() {
    if (saidaEmAndamento.current) return
    saidaEmAndamento.current = true
    definirSaindo(true)
    try {
      const resposta = await sairDaConta()
      if (resposta.erro || !resposta.dados?.encerrada) {
        avisar.erro('Não foi possível sair da conta', resposta.erro?.mensagem ?? 'Tente novamente em instantes.')
        return
      }
      encerrarSessao()
      avisar.sucesso('Você saiu da conta', 'Até a próxima visita!')
      roteador.push('/login')
      roteador.refresh()
    } finally {
      saidaEmAndamento.current = false
      definirSaindo(false)
    }
  }

  return (
    <button type="button" className="menu-item menu-item-sair" disabled={saindo} onClick={sair}>
      <IconeSair />
      {saindo ? 'Saindo…' : 'Sair da conta'}
    </button>
  )
}
