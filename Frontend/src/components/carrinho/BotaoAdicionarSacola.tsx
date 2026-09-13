'use client'

import { useRouter } from 'next/navigation'
import { useSacola } from '@/store/sacola'
import { avisar } from '@/components/feedback/Avisos'
import { IconeSacola } from '@/components/ui/Icones'
import { type Disponibilidade } from '@/types/dominio'

export default function BotaoAdicionarSacola({
  slug,
  disponibilidade,
  texto = 'Adicionar à sacola',
  className = 'botao botao-primario botao-largo abaixo-4',
}: {
  slug: string
  disponibilidade: Disponibilidade
  texto?: string
  className?: string
}) {
  const { adicionar } = useSacola()
  const roteador = useRouter()

  function clicar() {
    const resultado = adicionar(slug, disponibilidade === 'unica')
    if (resultado === 'ja-esta') {
      avisar.info('Essa peça única já está na sua sacola')
      return
    }
    avisar.comAcao('Peça adicionada à sacola', 'Ver sacola', () => roteador.push('/cart'))
  }

  return (
    <button type="button" onClick={clicar} className={className}>
      <IconeSacola />
      {texto}
    </button>
  )
}
