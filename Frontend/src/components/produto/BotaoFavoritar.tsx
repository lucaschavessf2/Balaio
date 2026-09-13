'use client'

import { useRouter } from 'next/navigation'
import { useFavoritos } from '@/store/favoritos'
import { avisar } from '@/components/feedback/Avisos'
import { IconeCoracao } from '@/components/ui/Icones'

export default function BotaoFavoritar({ slug, nome }: { slug: string; nome: string }) {
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
      className="botao-favoritar"
      onClick={clicar}
      aria-pressed={salvo}
      aria-label={salvo ? `Remover ${nome} das peças salvas` : `Guardar ${nome} nas peças salvas`}
    >
      <IconeCoracao preenchido={salvo} tamanho={20} />
    </button>
  )
}
