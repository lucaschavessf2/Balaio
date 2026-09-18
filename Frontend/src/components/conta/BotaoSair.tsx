'use client'

import { useRouter } from 'next/navigation'
import { avisar } from '@/components/feedback/Avisos'
import { IconeSair } from '@/components/ui/Icones'
import { useSessao } from '@/store/sessao'

export default function BotaoSair() {
  const roteador = useRouter()
  const { encerrarSessao } = useSessao()

  function sair() {
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
