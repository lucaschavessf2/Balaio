import Link from 'next/link'
import { IconeBusca, IconeCoracao, IconeGrade, IconePlay, IconeSacola, IconeUsuario } from '@/components/ui/Icones'
import AlternadorTema from '@/components/layout/AlternadorTema'
import ContadorSacola from '@/components/carrinho/ContadorSacola'
import ContadorFavoritos from '@/components/favoritos/ContadorFavoritos'

type Props = { comoArtesao?: boolean }

export default function Cabecalho({ comoArtesao = false }: Props) {
  return (
    <header className="cabecalho">
      <div className="container cabecalho-linha">
        <Link href="/" className="marca" aria-label="Balaio, artesanato de Pernambuco">
          <img className="marca-logo" src="/balaio-logo.svg" alt="" width={52} height={52} />
          <span>
            <span className="marca-nome">Balaio</span>
            <span className="marca-linha">Artesanato de Pernambuco</span>
          </span>
        </Link>

        <form className="cabecalho-busca" action="/search" role="search">
          <IconeBusca />
          <label className="so-leitor" htmlFor="busca-topo">
            Buscar peças
          </label>
          <input id="busca-topo" name="q" type="search" placeholder="Buscar técnica, artesão, território..." />
        </form>

        <div className="cabecalho-acoes">
          <AlternadorTema />

          <Link href="/screens" className="cabecalho-link mapa esconde-mobile" title="Mapa de todas as telas do protótipo">
            <IconeGrade />
            <span className="rotulo-acao">Telas</span>
          </Link>

          <Link href="/videos" className="cabecalho-link" title="Ateliê ao vivo">
            <IconePlay />
            <span className="rotulo-acao">Vídeos</span>
          </Link>

          <Link href="/how-it-works" className="cabecalho-link esconde-mobile">
            Como funciona
          </Link>

          <Link href="/favorites" className="cabecalho-link" title="Peças salvas">
            <IconeCoracao />
            <span className="rotulo-acao">Salvas</span>
            <ContadorFavoritos esconderZero />
          </Link>

          {comoArtesao ? (
            <Link href="/dashboard" className="cabecalho-link">
              <IconeUsuario />
              Meu painel
            </Link>
          ) : (
            <Link href="/login" className="cabecalho-link">
              <IconeUsuario />
              <span className="rotulo-acao">Entrar</span>
            </Link>
          )}

          <Link href="/cart" className="cabecalho-link sacola">
            <IconeSacola />
            Sacola
            <ContadorSacola />
          </Link>
        </div>
      </div>
    </header>
  )
}
