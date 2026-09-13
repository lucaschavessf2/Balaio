import Link from 'next/link'
import { notFound } from 'next/navigation'
import Pagina from '@/components/layout/Pagina'
import CartaoPeca from '@/components/produto/CartaoPeca'
import { Estrelas, Migalhas, Retrato, SeloDisponibilidade } from '@/components/ui/Basicos'
import BotaoAdicionarSacola from '@/components/carrinho/BotaoAdicionarSacola'
import GaleriaPeca from '@/components/produto/GaleriaPeca'
import CalculoFrete from '@/components/produto/CalculoFrete'
import PerguntasPublicas from '@/components/produto/PerguntasPublicas'
import { IconeEtiqueta, IconeMapa, IconeSelo, IconeSetaDireita } from '@/components/ui/Icones'
import { pecas } from '@/mocks/pecas'
import { obterArtesao } from '@/services/api/artesaos.servico'
import { emReais, precoComDesconto } from '@/utils/formato'
import { obterPeca, pecasRelacionadas } from '@/services/api/pecas.servico'

export function generateStaticParams() {
  return pecas.map((p) => ({ slug: p.slug }))
}

const perguntas = [
  {
    pergunta: 'A peça acompanha algum certificado?',
    autor: 'Clarissa M. Reis',
    resposta: 'Sim, acompanha o Selo de Origem e a biografia impressa do atelier.',
  },
  {
    pergunta: 'É possível encomendar em tamanho maior?',
    autor: 'Renato Albuquerque',
    resposta: 'No momento, o atelier produz apenas neste formato tradicional de 40 cm.',
  },
]

export default async function DetalhePeca({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const { dados: peca } = await obterPeca(slug)
  if (!peca) notFound()

  const { dados: artesao } = await obterArtesao(peca.artesao)
  const relacionadas = (await pecasRelacionadas(peca.slug)).dados ?? []

  return (
    <Pagina>
      <Migalhas
        trilha={[
          { texto: 'Início', href: '/' },
          { texto: peca.categoria, href: '/search' },
          { texto: peca.nome },
        ]}
      />

      <div className="duas-colunas">
        <div>
          <GaleriaPeca imagem={peca.imagem} nome={peca.nome} desconto={peca.desconto} />
        </div>

        <div className="coluna-compra">
          <SeloDisponibilidade tipo={peca.disponibilidade} prazoDias={peca.prazoProducaoDias} />
          <h1 className="titulo-pagina acima-3">{peca.nome}</h1>
          <p className="autoria">
            Técnica: {peca.tecnica} · {peca.categoria}
          </p>

          {peca.avaliacao && (
            <p className="acima-3">
              <Estrelas nota={peca.avaliacao} /> <span className="autoria">({peca.totalAvaliacoes} avaliações)</span>
            </p>
          )}

          {peca.desconto ? (
            <p className="preco-pagina">
              <span className="preco-riscado">{emReais(peca.preco)}</span> {emReais(precoComDesconto(peca))}
            </p>
          ) : (
            <p className="preco-pagina">{emReais(peca.preco)}</p>
          )}

          {peca.desconto && (
            <p className="aviso abaixo-4">
              <IconeEtiqueta />
              <span>
                <strong>{peca.desconto}% de desconto da plataforma.</strong> O valor já sai abatido na sacola, sem
                cupom para digitar.
              </span>
            </p>
          )}

          {peca.disponibilidade === 'encomenda' && peca.prazoProducaoDias && (
            <p className="aviso abaixo-4">
              <IconeSelo />
              <span>
                Peça feita sob encomenda. O artesão leva cerca de <strong>{peca.prazoProducaoDias} dias</strong> para
                produzir antes do envio.
              </span>
            </p>
          )}

          <div className="barra-fixa barra-fixa-compra">
            <p className="barra-fixa-info">
              <span className="barra-fixa-valor">{emReais(peca.desconto ? precoComDesconto(peca) : peca.preco)}</span>
            </p>
            <BotaoAdicionarSacola slug={peca.slug} disponibilidade={peca.disponibilidade} />
          </div>

          <CalculoFrete territorio={peca.territorio} />

          {artesao && (
            <div className="cartao bloco-quem-fez">
              <p className="territorio abaixo-3">Quem fez esta peça</p>
              <div className="bloco-artesao">
                <Retrato imagem={artesao.imagem} />
                <div className="encolhivel">
                  <p className="texto-forte">{artesao.nome}</p>
                  <p className="autoria">{artesao.territorio}</p>
                  <Link href={`/artisans/${artesao.slug}`} className="ver-peca">
                    Ver perfil do atelier <IconeSetaDireita tamanho={14} />
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="duas-colunas secao">
        <section className="texto-historia">
          <h2 className="secao-titulo">História desta peça</h2>
          {peca.historia.map((paragrafo) => (
            <p key={paragrafo}>{paragrafo}</p>
          ))}
          <p className="linha-flex" style={{ gap: 8 }}>
            <IconeMapa tamanho={16} />
            Território de origem: <strong>{peca.territorio}</strong>
          </p>
        </section>

        <section>
          <PerguntasPublicas
            iniciais={perguntas}
            slug={peca.slug}
            artesaoNome={artesao?.nome}
            artesaoImagem={artesao?.imagem}
          />
        </section>
      </div>

      {relacionadas.length > 0 && (
        <section className="secao">
          <h2 className="secao-titulo">Outras peças que você pode gostar</h2>
          <div className="grade-pecas">
            {relacionadas.map((p) => (
              <CartaoPeca key={p.slug} peca={p} />
            ))}
          </div>
        </section>
      )}
    </Pagina>
  )
}
