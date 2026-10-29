'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { avisar } from '@/components/feedback/Avisos'
import { IconeSair } from '@/components/ui/Icones'
import { sair as sairDaConta } from '@/services/api/conta.servico'
import { useSessao } from '@/store/sessao'

export default function BotaoSair() {
  const roteador = useRouter()
  const { encerrarSessao } = useSessao()
  const [enviando, definirEnviando] = useState(false)

  async function sair() {
    if (enviando) return
    definirEnviando(true)
    const { erro } = await sairDaConta()
    encerrarSessao(!erro)
    definirEnviando(false)
    if (erro) {
      avisar.erro('Não foi possível confirmar a saída', 'O estado local foi limpo. Tente sair novamente para remover o cookie da sessão.')
      return
    }
    avisar.sucesso('Você saiu da conta', 'Até a próxima visita!')
    roteador.push('/login')
    roteador.refresh()
  }

  return (
    <button type="button" className="menu-item menu-item-sair" onClick={sair} disabled={enviando}>
      <IconeSair />
      {enviando ? 'Saindo…' : 'Sair da conta'}
    </button>
  )
}
