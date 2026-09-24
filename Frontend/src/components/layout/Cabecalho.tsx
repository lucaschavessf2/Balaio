import Link from 'next/link'
import { Suspense } from 'react'
import BarraDepartamentos from '@/components/layout/BarraDepartamentos'
import BuscaCabecalho from '@/components/layout/BuscaCabecalho'
import { IconeGrade, IconeSacola } from '@/components/ui/Icones'
import AlternadorTema from '@/components/layout/AlternadorTema'
import ContadorSacola from '@/components/carrinho/ContadorSacola'
import LinkConta from '@/components/layout/LinkConta'
import { listarArtesaos } from '@/services/api/artesaos.servico'
import { listarPecas } from '@/services/api/pecas.servico'
import { obterReferencias } from '@/services/api/referencias.servico'

export default async function Cabecalho() {
  const [pecasResp, refs, autores] = await Promise.all([listarPecas(), obterReferencias(), listarArtesaos()])
  const base = refs.dados ? [...refs.dados.tipos, ...refs.dados.tecnicas, ...refs.dados.territorios, ...refs.dados.categorias] : []
  const sugestoes = Array.from(new Set([
    ...(pecasResp.dados ?? []).map((peca) => peca.nome),
    ...base,
    ...(autores.dados ?? []).map((artesao) => artesao.nome),
  ]))

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

        <BuscaCabecalho sugestoes={sugestoes} />

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
