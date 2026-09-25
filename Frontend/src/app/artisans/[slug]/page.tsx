import Link from 'next/link'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Pagina from '@/components/layout/Pagina'
import CartaoPeca from '@/components/produto/CartaoPeca'
import EstadoErro from '@/components/feedback/EstadoErro'
import { EstadoVazio, Migalhas, Retrato } from '@/components/ui/Basicos'
import { IconeConversa, IconeMapa, IconePacote, IconeSelo } from '@/components/ui/Icones'
import { obterArtesao } from '@/services/api/artesaos.servico'
import { pecasPorArtesao } from '@/services/api/pecas.servico'

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const { dados: artesao } = await obterArtesao(slug)
  if (!artesao) return { title: 'Artesão não encontrado | Balaio' }
  const descricao = artesao.historia.trim() || `Conheça ${artesao.nome}, seu trabalho em ${artesao.tecnica} e suas peças no Balaio.`
  return {
    title: `${artesao.nome} | ${artesao.atelie} | Balaio`,
    description: descricao,
    openGraph: { title: `${artesao.nome} | ${artesao.atelie}`, description: descricao },
  }
}

export default async function PerfilArtesao({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const { dados: artesao, erro } = await obterArtesao(slug)
  if (erro && erro.codigo !== 'RECURSO_NAO_ENCONTRADO') throw new Error(erro.mensagem)
  if (!artesao) notFound()

  const { dados: pecasArtesao, erro: erroPecas } = await pecasPorArtesao(artesao.slug)
  if (erroPecas) return <Pagina><EstadoErro mensagem={erroPecas.mensagem} /></Pagina>
  const pecas = (pecasArtesao ?? []).filter((peca) => !peca.inativadoEm && (!peca.situacao || peca.situacao === 'publicada'))

  return (
    <Pagina>
      <Migalhas
        trilha={[{ texto: 'Início', href: '/' }, { texto: 'Artesãos', href: '/search' }, { texto: artesao.nome }]}
      />

      <header className="capa-artesao capa-loja">
        <Retrato imagem={artesao.imagem} grande />
        <div className="encolhivel" style={{ flex: '1 1 260px' }}>
          <div className="linha-flex">
            <h1>{artesao.atelie}</h1>
            {artesao.selo && (
              <span className="selo selo-encomenda">
                <IconeSelo tamanho={13} />
                Selo de origem
              </span>
            )}
          </div>
          <p style={{ opacity: 0.9, marginTop: 6 }}>
            {artesao.nome} · {artesao.territorio} · {artesao.tecnica}
          </p>
        </div>
        <div className="acoes-linha">
          {pecas[0] && (
            <Link href={`/pieces/${pecas[0].slug}#nova-pergunta`} className="botao botao-primario">
              <IconeConversa />
              Perguntar sobre uma peça
            </Link>
          )}
        </div>
      </header>

      <ul className="metricas-loja">
        <li>
          <strong>{pecas.length}</strong>
          {pecas.length === 1 ? 'peça à venda' : 'peças à venda'}
        </li>
        <li>
          <strong>{artesao.avaliacaoMedia > 0 ? `★ ${artesao.avaliacaoMedia.toFixed(1)}` : '—'}</strong>
          {artesao.avaliacaoMedia > 0 ? 'avaliação média' : 'sem avaliações'}
        </li>
        <li>
          <strong>{artesao.obrasComercializadas > 0 ? `${artesao.obrasComercializadas}+` : '0'}</strong>
          obras comercializadas
        </li>
      </ul>

      <div className="duas-colunas secao">
        <section>
          <h2 className="secao-titulo">Nossa história</h2>
          <p className="texto-suave abaixo-4">{artesao.historia || 'Este ateliê ainda não contou sua história.'}</p>

          {artesao.selo && (
            <p className="aviso">
              <IconeSelo />
              <span>
                <strong>Selo de autenticidade garantido.</strong> Cada obra deste atelier inclui assinatura de próprio
                punho gravada e certificado oficial rastreado pela associação do território.
              </span>
            </p>
          )}
        </section>

        <section>
          <h2 className="secao-titulo">Dados da oficina</h2>
          <div className="cartao">
            <p className="campo-rotulo linha-flex abaixo-3" style={{ gap: 8 }}>
              <IconeMapa tamanho={16} />
              Território de origem
            </p>
            <div className="mapa-territorio">{artesao.territorio}</div>
          </div>
        </section>
      </div>

      <section className="secao">
        <h2 className="secao-titulo">Coleção viva do atelier</h2>
        {pecas.length ? (
          <div className="grade-pecas">
            {pecas.map((p) => <CartaoPeca key={p.slug} peca={p} />)}
          </div>
        ) : (
          <EstadoVazio
            icone={<IconePacote tamanho={34} />}
            titulo="Este ateliê ainda não tem peças disponíveis"
            descricao="Enquanto a coleção é preparada, explore outros trabalhos de artesãos pernambucanos."
            acao={<Link href="/search" className="botao botao-primario">Explorar peças</Link>}
          />
        )}
      </section>

    </Pagina>
  )
}
