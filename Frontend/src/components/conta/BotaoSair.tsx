'use client'

import { useRouter } from 'next/navigation'
import { avisar } from '@/components/feedback/Avisos'
import { IconeSair } from '@/components/ui/Icones'

export default function BotaoSair() {
  const roteador = useRouter()

  function sair() {
    avisar.sucesso('Você saiu da conta', 'Até a próxima visita!')
    roteador.push('/login')
  }

  return (
    <button type="button" className="menu-item" onClick={sair}>
      <IconeSair />
      Sair da conta
    </button>
  )
}
