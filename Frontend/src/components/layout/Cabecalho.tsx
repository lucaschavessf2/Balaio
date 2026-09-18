import Link from 'next/link'
import { Suspense } from 'react'
import BarraDepartamentos from '@/components/layout/BarraDepartamentos'
import { IconeBusca, IconeGrade, IconeSacola } from '@/components/ui/Icones'
import AlternadorTema from '@/components/layout/AlternadorTema'
import ContadorSacola from '@/components/carrinho/ContadorSacola'
import LinkConta from '@/components/layout/LinkConta'

export default function Cabecalho() {
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

          <LinkConta />

          <Link href="/cart" className="cabecalho-link sacola">
            <IconeSacola />
            Sacola
            <ContadorSacola />
          </Link>
        </div>
      </div>
      <Suspense>
        <BarraDepartamentos />
      </Suspense>
    </header>
  )
}
