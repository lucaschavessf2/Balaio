'use client'

import { useRouter } from 'next/navigation'
import { avisar } from '@/components/feedback/Avisos'
import { IconeSair } from '@/components/ui/Icones'
import { sair as sairDaConta } from '@/services/api/conta.servico'
import { useSessao } from '@/store/sessao'

export default function BotaoSair() {
  const roteador = useRouter()
  const { encerrarSessao } = useSessao()

  async function sair() {
    await sairDaConta()
    encerrarSessao()
    avisar.sucesso('Você saiu da conta', 'Até a próxima visita!')
    roteador.push('/login')
    roteador.refresh()
  }

  return (
    <button type="button" className="menu-item" onClick={sair}>
      <IconeSair />
      Sair da conta
    </button>
  )
}
