import Link from 'next/link'
import { notFound } from 'next/navigation'
import Pagina from '@/components/layout/Pagina'
import CartaoPeca from '@/components/produto/CartaoPeca'
import { Estrelas, Migalhas, Retrato } from '@/components/ui/Basicos'
import { IconeConversa, IconeMapa, IconeSelo } from '@/components/ui/Icones'
import { obterArtesao } from '@/services/api/artesaos.servico'
import { pecasPorArtesao } from '@/services/api/pecas.servico'
import { listarPedidos } from '@/services/api/pedidos.servico'

export const dynamic = 'force-dynamic'

const depoimentos = [
  {
    autor: 'Clarissa de Recife',
    nota: 5,
    texto: 'O leão é deslumbrante. A textura do barro é perceptível em cada caracol. Chegou perfeitamente embalado e com o certificado.',
  },
  {
    autor: 'Carlos de Olinda',
    nota: 5,
    texto: 'Excelente atendimento e envio rápido direto de Tracunhaém. Ter uma peça dessa tradição em casa traz paz e história.',
  },
]

export default async function PerfilArtesao({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const { dados: artesao, erro } = await obterArtesao(slug)
  if (erro && erro.codigo !== 'RECURSO_NAO_ENCONTRADO') throw new Error(erro.mensagem)
  if (!artesao) notFound()

  const [{ dados: pecasArtesao }, { dados: todosPedidos }] = await Promise.all([
    pecasPorArtesao(artesao.slug),
    listarPedidos(),
  ])
  const pecas = pecasArtesao ?? []
  const slugsDoArtesao = new Set(pecas.map((p) => p.slug))
  const pedidoComArtesao = (todosPedidos ?? []).find((p) => slugsDoArtesao.has(p.pecaSlug))

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
          {pedidoComArtesao ? (
            <Link href={`/orders/${pedidoComArtesao.id}`} className="botao botao-primario">
              <IconeConversa />
              Falar com o artesão
            </Link>
          ) : (
            pecas[0] && (
              <Link href={`/pieces/${pecas[0].slug}#nova-pergunta`} className="botao botao-primario">
                <IconeConversa />
                Perguntar sobre uma peça
              </Link>
            )
          )}
        </div>
      </header>

      <ul className="metricas-loja">
        <li>
          <strong>{pecas.length}</strong>
          {pecas.length === 1 ? 'peça à venda' : 'peças à venda'}
        </li>
        <li>
          <strong>★ {artesao.avaliacaoMedia.toFixed(1)}</strong>
          avaliação média
        </li>
        <li>
          <strong>{artesao.obrasComercializadas}+</strong>
          obras comercializadas
        </li>
      </ul>

      <div className="duas-colunas secao">
        <section>
          <h2 className="secao-titulo">Nossa história</h2>
          <p className="texto-suave abaixo-4">{artesao.historia}</p>

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
        <div className="grade-pecas">
          {pecas.map((p) => (
            <CartaoPeca key={p.slug} peca={p} />
          ))}
        </div>
      </section>

      <section className="secao">
        <h2 className="secao-titulo">Depoimentos de colecionadores</h2>
        <div className="grade-dois">
          {depoimentos.map((d) => (
            <article className="depoimento" key={d.autor}>
              <div className="depoimento-topo">
                <strong>{d.autor}</strong>
                <Estrelas nota={d.nota} />
              </div>
              <p className="autoria">{d.texto}</p>
            </article>
          ))}
        </div>
      </section>
    </Pagina>
  )
}
