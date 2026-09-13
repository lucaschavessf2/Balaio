import Link from 'next/link'
import { notFound } from 'next/navigation'
import Pagina from '@/components/layout/Pagina'
import CartaoPeca from '@/components/produto/CartaoPeca'
import { Migalhas, Retrato } from '@/components/ui/Basicos'
import { IconeSelo, IconeSetaDireita } from '@/components/ui/Icones'
import { coletivos } from '@/mocks/coletivos'
import { obterColetivo } from '@/services/api/coletivos.servico'
import { obterArtesao } from '@/services/api/artesaos.servico'
import { pecasPorArtesao } from '@/services/api/pecas.servico'
import type { Artesao } from '@/types/dominio'

export function generateStaticParams() {
  return coletivos.map((c) => ({ slug: c.slug }))
}

export default async function PerfilColetivo({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const { dados: coletivo } = await obterColetivo(slug)
  if (!coletivo) notFound()

  const membrosResp = await Promise.all(coletivo.membros.map((m) => obterArtesao(m)))
  const membros = membrosResp.map((r) => r.dados).filter((a): a is Artesao => a !== null)
  const pecasResp = await Promise.all(membros.map((a) => pecasPorArtesao(a.slug)))
  const pecas = pecasResp.flatMap((r) => r.dados ?? []).slice(0, 6)
  const obras = membros.reduce((total, a) => total + a.obrasComercializadas, 0)

  return (
    <Pagina>
      <Migalhas
        trilha={[
          { texto: 'Início', href: '/' },
          { texto: 'Como funciona', href: '/how-it-works' },
          { texto: coletivo.nome },
        ]}
      />

      <header className="capa-artesao capa-loja">
        <Retrato imagem={coletivo.imagem} grande />
        <div className="encolhivel" style={{ flex: '1 1 260px' }}>
          <div className="linha-flex">
            <h1>{coletivo.nome}</h1>
            <span className="selo selo-encomenda">
              <IconeSelo tamanho={13} />
              Perfil coletivo
            </span>
          </div>
          <p style={{ opacity: 0.9, marginTop: 6 }}>
            {coletivo.territorio} · desde {coletivo.fundado}
          </p>
        </div>
      </header>

      <ul className="metricas-loja">
        <li>
          <strong>{membros.length}</strong>
          {membros.length === 1 ? 'ateliê associado' : 'ateliês associados'}
        </li>
        <li>
          <strong>{obras}+</strong>
          obras comercializadas
        </li>
        <li>
          <strong>{coletivo.tecnicas.length}</strong>
          {coletivo.tecnicas.length === 1 ? 'técnica viva' : 'técnicas vivas'}
        </li>
      </ul>

      <div className="duas-colunas secao">
        <section>
          <h2 className="secao-titulo">Por que existe</h2>
          <p className="texto-suave">{coletivo.historia}</p>
        </section>

        <section>
          <h2 className="secao-titulo">Território e apoio</h2>
          <div className="cartao">
            <p className="campo-rotulo abaixo-2">Técnicas do território</p>
            <div className="acoes-linha">
              {coletivo.tecnicas.map((t) => (
                <span className="selo selo-neutro" key={t}>
                  {t}
                </span>
              ))}
            </div>
            <p className="campo-rotulo" style={{ margin: '16px 0 8px' }}>
              Apoio institucional
            </p>
            <p className="autoria">{coletivo.apoio.join(' · ')}</p>
          </div>
        </section>
      </div>

      <section className="secao">
        <h2 className="secao-titulo">Peças do coletivo</h2>
        <div className="grade-pecas">
          {pecas.map((p) => (
            <CartaoPeca key={p.slug} peca={p} />
          ))}
        </div>
      </section>

      <section className="secao">
        <h2 className="secao-titulo">Ateliês que fazem parte</h2>
        <div className="grade-membros">
          {membros.map((a) => (
            <Link href={`/artisans/${a.slug}`} className="cartao membro-card" key={a.slug}>
              <Retrato imagem={a.imagem} tamanho={44} />
              <div className="encolhivel">
                <p className="texto-forte">{a.atelie}</p>
                <p className="autoria">{a.nome}</p>
              </div>
              <IconeSetaDireita tamanho={16} />
            </Link>
          ))}
        </div>
      </section>
    </Pagina>
  )
}
