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
  const { adicionar, pronto, erro } = useSacola()
  const roteador = useRouter()

  function clicar() {
    if (erro) { avisar.erro('Não foi possível carregar a sacola', erro); return }
    const resultado = adicionar(slug, disponibilidade === 'unica')
    if (resultado === 'ja-esta') {
      avisar.info(disponibilidade === 'unica' ? 'Essa peça única já está na sua sacola' : 'Você já tem 3 unidades desta peça na sacola')
      return
    }
    avisar.comAcao('Peça adicionada à sacola', 'Ver sacola', () => roteador.push('/cart'))
  }

  return (
    <button type="button" onClick={clicar} disabled={!pronto} className={className}>
      <IconeSacola />
      {texto}
    </button>
  )
}
