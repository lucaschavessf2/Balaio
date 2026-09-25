import Link from 'next/link'
import { Foto, Migalhas } from '@/components/ui/Basicos'
import { IconeSetaDireita } from '@/components/ui/Icones'
import InativarPeca from '@/components/painel/InativarPeca'
import { pecasPorArtesao } from '@/services/api/pecas.servico'
import { emReais } from '@/utils/formato'
import { exigirArtesao } from '@/services/autenticacao'
import { listarPedidos } from '@/services/api/pedidos.servico'
import DisponibilidadeRapida from '@/components/painel/DisponibilidadeRapida'

const situacoes: Record<string, { texto: string; classe: string }> = {
  publicada: { texto: 'Publicada', classe: 'selo-disponivel' },
  curadoria: { texto: 'Em curadoria', classe: 'selo-encomenda' },
  rascunho: { texto: 'Rascunho', classe: 'selo-neutro' },
}


export default async function MinhasPecas() {
  const { artesao } = await exigirArtesao()
  const [{ dados: pecas }, { dados: pedidos }] = await Promise.all([
    pecasPorArtesao(artesao.slug),
    listarPedidos(),
  ])
  const pecasLista = pecas ?? []
  const mapaPecas = new Map(pecasLista.map((peca) => [peca.slug, peca]))
  const estadosEncerrados = new Set(['recusado', 'cancelado', 'reembolsado'])
  const pecasUnicasVendidas = new Set(
    (pedidos ?? []).filter((pedido) => !estadosEncerrados.has(pedido.estado)).flatMap((pedido) =>
      (pedido.itens ?? [{ slug: pedido.pecaSlug }])
        .filter((item) => mapaPecas.get(item.slug)?.disponibilidade === 'unica')
        .map((item) => item.slug),
    ),
  )

  return (
    <>
      <Migalhas trilha={[{ texto: 'Painel do artesão', href: '/dashboard' }, { texto: 'Minhas peças' }]} />

      <div className="catalogo-topo" style={{ marginBottom: 8 }}>
        <h1 className="titulo-pagina" style={{ margin: 0 }}>
          Minhas peças
        </h1>
        <Link href="/dashboard/pieces/new" className="botao botao-primario">
          Cadastrar peça
          <IconeSetaDireita />
        </Link>
      </div>
      <p className="subtitulo-pagina">
        Tudo o que você já publicou, o que está em curadoria e o que ficou como rascunho.
      </p>

      {pecasLista.map((peca) => {
        const chave = peca.situacao ?? 'publicada'
        const situacao = situacoes[chave]

        return (
          <article className="linha-pedido" key={peca.slug}>
            <div className="linha-flex encolhivel" style={{ flexWrap: 'nowrap' }}>
              <div className="linha-pedido-figura">
                <Foto nome={peca.nome} imagem={peca.imagem} decorativa />
              </div>
              <div className="encolhivel">
                <p className="dado-valor">{peca.nome}</p>
                <p className="autoria">{peca.tecnica}</p>
              </div>
            </div>

            <div className="dado">
              <span className="dado-rotulo">Preço</span>
              <span className="dado-valor preco-destaque">{emReais(peca.preco)}</span>
            </div>

            <div className="dado">
              <span className="dado-rotulo">Disponibilidade</span>
              <DisponibilidadeRapida
                slug={peca.slug}
                inicial={peca.disponibilidade}
                prazoInicial={peca.prazoProducaoDias}
                vendida={pecasUnicasVendidas.has(peca.slug) || Boolean(peca.vendidaEmPedido)}
              />
            </div>

            <div className="dado">
              <span className="dado-rotulo">Situação</span>
              <span className={`selo ${situacao.classe}`}>
                <span className="selo-ponto" />
                {situacao.texto}
              </span>
              {peca.inativadoEm && <span className="selo selo-neutro">Inativada</span>}
            </div>

            <div className="acoes-linha">
              {!peca.inativadoEm && <Link href={`/pieces/${peca.slug}`} className="botao botao-fantasma">Ver na loja</Link>}
              <Link href={`/dashboard/pieces/${peca.slug}`} className="botao botao-secundario">Editar</Link>
              <InativarPeca slug={peca.slug} nome={peca.nome} inativada={Boolean(peca.inativadoEm)} />
              <Link href="/dashboard/pieces/new" className="botao botao-secundario">
                Cadastrar semelhante
              </Link>
            </div>
          </article>
        )
      })}
    </>
  )
}
