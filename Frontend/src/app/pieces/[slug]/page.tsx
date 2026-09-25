import Link from 'next/link'
import { notFound } from 'next/navigation'
import Pagina from '@/components/layout/Pagina'
import CartaoPeca from '@/components/produto/CartaoPeca'
import { Estrelas, Migalhas, Retrato, SeloDisponibilidade } from '@/components/ui/Basicos'
import BotaoAdicionarSacola from '@/components/carrinho/BotaoAdicionarSacola'
import BotaoFavoritar from '@/components/produto/BotaoFavoritar'
import GaleriaPeca from '@/components/produto/GaleriaPeca'
import CalculoFrete from '@/components/produto/CalculoFrete'
import DetalhesPeca from '@/components/produto/DetalhesPeca'
import PerguntasPublicas from '@/components/produto/PerguntasPublicas'
import Prateleira from '@/components/ui/Prateleira'
import FaixaBeneficios from '@/components/vitrine/FaixaBeneficios'
import { IconeEtiqueta, IconeMapa, IconeSelo, IconeSetaDireita } from '@/components/ui/Icones'
import { obterArtesao } from '@/services/api/artesaos.servico'
import { obterPeca, pecasPorArtesao, pecasPorTipo, pecasRelacionadas } from '@/services/api/pecas.servico'
import { listarPerguntas } from '@/services/api/perguntas.servico'
import type { Peca } from '@/types/dominio'
import { emReais, precoComDesconto } from '@/utils/formato'
import { hrefListagem } from '@/utils/filtrosUrl'

export const dynamic = 'force-dynamic'

const LIMITE_CARROSSEL = 10

function semRepetir(listas: Peca[][], atual: string): Peca[][] {
  const vistas = new Set([atual])
  return listas.map((lista) =>
    lista.filter((peca) => {
      if (vistas.has(peca.slug)) return false
      vistas.add(peca.slug)
      return true
    }),
  )
}

export default async function DetalhePeca({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const { dados: peca, erro } = await obterPeca(slug)
  if (erro && erro.codigo !== 'RECURSO_NAO_ENCONTRADO') throw new Error(erro.mensagem)
  if (!peca) notFound()

  const [artesaoResposta, doArtesaoResposta, mesmoTipoResposta, relacionadasResposta] = await Promise.all([
    obterArtesao(peca.artesao),
    pecasPorArtesao(peca.artesao),
    pecasPorTipo(peca.tipo, { excluir: peca.slug, limite: LIMITE_CARROSSEL }),
    pecasRelacionadas(peca.slug, LIMITE_CARROSSEL),
  ])
  const artesao = artesaoResposta.dados
  const perguntas = (await listarPerguntas(peca.slug)).dados ?? []
  const [doArtesao, mesmoTipo, mesmaTecnica] = semRepetir(
    [
      (doArtesaoResposta.dados ?? []).filter((p) => !p.situacao || p.situacao === 'publicada'),
      mesmoTipoResposta.dados ?? [],
      relacionadasResposta.dados ?? [],
    ],
    peca.slug,
  )
  const precoFinal = peca.desconto ? precoComDesconto(peca) : peca.preco

  return (
    <Pagina>
      <Migalhas
        trilha={[
          { texto: 'Início', href: '/' },
          { texto: peca.categoria, href: hrefListagem({ categoria: peca.categoria }) },
          { texto: peca.tipo, href: hrefListagem({ tipo: peca.tipo }) },
          { texto: peca.nome },
        ]}
      />

      <div className="duas-colunas">
        <div>
          <GaleriaPeca
            imagem={peca.imagem}
            fotos={peca.fotos}
            ordemFotos={peca.ordemFotos}
            nome={peca.nome}
            desconto={peca.desconto}
          />
        </div>

        <div className="coluna-compra">
          <SeloDisponibilidade tipo={peca.disponibilidade} prazoDias={peca.prazoProducaoDias} />
          <h1 className="titulo-pagina acima-3">{peca.nome}</h1>
          <p className="linha-classificacao autoria">
            {artesao && (
              <>
                por <Link href={`/artisans/${artesao.slug}`}>{artesao.nome}</Link> ·
              </>
            )}
            <Link href={hrefListagem({ tipo: peca.tipo })}>{peca.tipo}</Link> ·
            <Link href={hrefListagem({ tecnica: peca.tecnica })}>{peca.tecnica}</Link>
          </p>

          {peca.avaliacao && (
            <p className="acima-3">
              <Estrelas nota={peca.avaliacao} /> <span className="autoria">({peca.totalAvaliacoes} avaliações)</span>
            </p>
          )}

          <div className="caixa-compra">
            {peca.desconto ? (
              <p className="preco-pagina">
                <span className="preco-riscado">{emReais(peca.preco)}</span> {emReais(precoFinal)}
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

            <div className="caixa-compra-acoes">
              <div className="barra-fixa barra-fixa-compra">
                <p className="barra-fixa-info">
                  <span className="barra-fixa-valor">{emReais(precoFinal)}</span>
                </p>
                <BotaoAdicionarSacola slug={peca.slug} disponibilidade={peca.disponibilidade} />
              </div>
              <BotaoFavoritar slug={peca.slug} nome={peca.nome} variante="rotulado" />
            </div>

            <FaixaBeneficios compacta />
          </div>

          <CalculoFrete territorio={peca.territorio} />
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

        <DetalhesPeca peca={peca} />
      </div>

      {artesao && (
        <section className="secao sobre-artesao" aria-labelledby="sobre-artesao-titulo">
          <Retrato imagem={artesao.imagem} grande />
          <div className="encolhivel">
            <p className="territorio">Quem fez esta peça</p>
            <h2 className="titulo-pagina" id="sobre-artesao-titulo" style={{ margin: '4px 0' }}>
              {artesao.nome}
            </h2>
            <p className="autoria">
              {artesao.atelie} · {artesao.territorio}
            </p>
            <div className="sobre-artesao-metricas">
              {artesao.avaliacaoMedia > 0 && (
                <span>
                  <strong>{artesao.avaliacaoMedia.toFixed(1)}</strong>
                  nota média
                </span>
              )}
              <span>
                <strong>{artesao.obrasComercializadas}</strong>
                peças vendidas
              </span>
              <span>
                <strong>{doArtesao.length + 1}</strong>
                peças na loja
              </span>
              {artesao.selo && (
                <span className="selo selo-disponivel" style={{ alignSelf: 'center' }}>
                  <IconeSelo tamanho={14} />
                  Selo de origem
                </span>
              )}
            </div>
            {artesao.historia && <p className="texto-historia">{artesao.historia}</p>}
            <Link href={`/artisans/${artesao.slug}`} className="botao botao-secundario acima-3">
              Ver perfil do ateliê
              <IconeSetaDireita />
            </Link>
          </div>
        </section>
      )}

      {doArtesao.length > 0 && (
        <Prateleira
          titulo={`Mais de ${artesao?.nome ?? 'quem fez esta peça'}`}
          verTodos={artesao ? { href: `/artisans/${artesao.slug}`, texto: 'Ver ateliê' } : undefined}
        >
          {doArtesao.map((p) => (
            <CartaoPeca key={p.slug} peca={p} />
          ))}
        </Prateleira>
      )}

      {mesmoTipo.length > 0 && (
        <Prateleira titulo={`Outras peças em ${peca.tipo}`} verTodos={{ href: hrefListagem({ tipo: peca.tipo }) }}>
          {mesmoTipo.map((p) => (
            <CartaoPeca key={p.slug} peca={p} />
          ))}
        </Prateleira>
      )}

      {mesmaTecnica.length > 0 && (
        <Prateleira titulo={`Mais em ${peca.tecnica}`} verTodos={{ href: hrefListagem({ tecnica: peca.tecnica }) }}>
          {mesmaTecnica.map((p) => (
            <CartaoPeca key={p.slug} peca={p} />
          ))}
        </Prateleira>
      )}

      <section className="secao">
        <PerguntasPublicas
          iniciais={perguntas}
          slug={peca.slug}
          artesaoSlug={peca.artesao}
          artesaoNome={artesao?.nome}
          artesaoImagem={artesao?.imagem}
        />
      </section>
    </Pagina>
  )
}
