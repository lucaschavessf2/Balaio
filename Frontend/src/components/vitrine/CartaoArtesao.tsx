import Link from 'next/link'
import { Estrelas, Foto } from '@/components/ui/Basicos'
import { IconeSelo } from '@/components/ui/Icones'
import type { Artesao } from '@/types/dominio'

export default function CartaoArtesao({ artesao, totalPecas }: { artesao: Artesao; totalPecas?: number }) {
  return (
    <Link href={`/artisans/${artesao.slug}`} className="cartao-comunidade cartao-artesao">
      <span className="cartao-comunidade-figura">
        <Foto nome={artesao.atelie} imagem={artesao.imagem} decorativa />
        {artesao.selo && (
          <span className="cartao-artesao-selo">
            <IconeSelo tamanho={14} />
            Selo de origem
          </span>
        )}
      </span>
      <span className="cartao-comunidade-corpo">
        <span className="territorio">{artesao.territorio}</span>
        <span className="cartao-comunidade-nome">{artesao.nome}</span>
        <span className="autoria">{artesao.atelie}</span>
        <span className="cartao-comunidade-rodape">
          {artesao.avaliacaoMedia > 0 && <Estrelas nota={artesao.avaliacaoMedia} />}
          {totalPecas !== undefined && (
            <span className="autoria">
              {totalPecas} {totalPecas === 1 ? 'peça' : 'peças'}
            </span>
          )}
        </span>
      </span>
    </Link>
  )
}
