'use client'

import { useRouter } from 'next/navigation'
import { useFavoritos } from '@/store/favoritos'
import { avisar } from '@/components/feedback/Avisos'
import { IconeCoracao } from '@/components/ui/Icones'

type Props = { slug: string; nome: string; variante?: 'flutuante' | 'rotulado' }

export default function BotaoFavoritar({ slug, nome, variante = 'flutuante' }: Props) {
  const { ehFavorito, alternar } = useFavoritos()
  const roteador = useRouter()
  const salvo = ehFavorito(slug)

  function clicar() {
    const guardou = alternar(slug)
    if (guardou) {
      avisar.comAcao('Peça guardada em Peças salvas', 'Ver salvas', () => roteador.push('/favorites'))
    } else {
      avisar.info('Peça removida das salvas')
    }
  }

  return (
    <button
      type="button"
      className={variante === 'rotulado' ? 'botao botao-secundario botao-favoritar-rotulado' : 'botao-favoritar'}
      onClick={clicar}
      aria-pressed={salvo}
      aria-label={salvo ? `Remover ${nome} das peças salvas` : `Guardar ${nome} nas peças salvas`}
    >
      <IconeCoracao preenchido={salvo} tamanho={20} />
      {variante === 'rotulado' && (salvo ? 'Salva' : 'Salvar')}
    </button>
  )
}
