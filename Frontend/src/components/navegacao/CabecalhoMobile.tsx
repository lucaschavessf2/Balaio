import Link from 'next/link'
import AlternadorTema from '@/components/layout/AlternadorTema'
import { IconeCoracao } from '@/components/ui/Icones'
import ContadorFavoritos from '@/components/favoritos/ContadorFavoritos'

export default function CabecalhoMobile() {
  return (
    <header className="cabecalho cabecalho-mobile">
      <div className="container cabecalho-mobile-linha">
        <Link href="/" className="marca marca-compacta" aria-label="Balaio, artesanato de Pernambuco">
          <img className="marca-logo" src="/balaio-logo.svg" alt="" width={36} height={36} />
          <span className="marca-nome">Balaio</span>
        </Link>

        <div className="cabecalho-acoes">
          <AlternadorTema />
          <Link href="/favorites" className="cabecalho-link" aria-label="Peças salvas" title="Peças salvas">
            <IconeCoracao />
            <ContadorFavoritos esconderZero decorativo />
          </Link>
        </div>
      </div>
    </header>
  )
}
