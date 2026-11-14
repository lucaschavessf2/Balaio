import Link from 'next/link'
import EstadoErro from '@/components/feedback/EstadoErro'
import EstadoVazio from '@/components/feedback/EstadoVazio'
import { Foto, Migalhas } from '@/components/ui/Basicos'
import { IconePacote, IconeSetaDireita } from '@/components/ui/Icones'
import InativarPeca from '@/components/painel/InativarPeca'
import { pecasPorArtesao } from '@/services/api/pecas.servico'
import { emReais } from '@/utils/formato'
import { exigirArtesao } from '@/services/autenticacao'
import { listarPedidos } from '@/services/api/pedidos.servico'
import DisponibilidadeRapida from '@/components/painel/DisponibilidadeRapida'
import type { Peca } from '@/types/dominio'
import { ESTADOS_ENCERRADOS } from '@/utils/vendas'

const situacoes: Record<string, { texto: string; classe: string }> = {
  publicada: { texto: 'Publicada', classe: 'selo-disponivel' },
  rascunho: { texto: 'Rascunho', classe: 'selo-neutro' },
}

function resumoDasPecas(pecas: Peca[]): string {
  const inativadas = pecas.filter((peca) => peca.inativadoEm).length
  const rascunhos = pecas.filter((peca) => !peca.inativadoEm && peca.situacao === 'rascunho').length
  const naLoja = pecas.length - inativadas - rascunhos
  return [
    pecas.length === 1 ? '1 peça' : `${pecas.length} peças`,
    naLoja > 0 && `${naLoja} na loja`,
    rascunhos > 0 && (rascunhos === 1 ? '1 rascunho' : `${rascunhos} rascunhos`),
    inativadas > 0 && (inativadas === 1 ? '1 inativada' : `${inativadas} inativadas`),
  ].filter(Boolean).join(' · ')
}

export default async function MinhasPecas() {
  const { artesao } = await exigirArtesao()
  const [{ dados: pecas, erro }, { dados: pedidos }] = await Promise.all([
    pecasPorArtesao(artesao.slug),
    listarPedidos(),
  ])
  const pecasLista = pecas ?? []
  const mapaPecas = new Map(pecasLista.map((peca) => [peca.slug, peca]))
  const pecasUnicasVendidas = new Set(
    (pedidos ?? []).filter((pedido) => !ESTADOS_ENCERRADOS.has(pedido.estado)).flatMap((pedido) =>
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

      {erro && <EstadoErro mensagem={erro.mensagem} />}

      {!erro && pecasLista.length === 0 && (
        <EstadoVazio
          icone={<IconePacote tamanho={34} />}
          titulo="Sua loja ainda não tem peças"
          descricao="Cadastre a primeira peça com fotos, técnica e território para ela aparecer na vitrine."
          acao={<Link href="/dashboard/pieces/new" className="botao botao-primario">Cadastrar peça</Link>}
        />
      )}

      {!erro && pecasLista.length > 0 && (
        <>
          <p className="subtitulo-pagina">{resumoDasPecas(pecasLista)}</p>

          <div className="lista-pecas-painel escalonado">
            {pecasLista.map((peca) => {
              const chave = peca.situacao ?? 'publicada'
              const situacao = situacoes[chave] ?? situacoes.publicada
              const linkEdicao = `/dashboard/pieces/${peca.slug}`

              return (
                <article className="peca-painel" data-inativada={peca.inativadoEm ? true : undefined} key={peca.slug}>
                  <div className="peca-painel-topo">
                    <div className="peca-painel-figura">
                      <Foto nome={peca.nome} imagem={peca.imagem} decorativa />
                    </div>
                    <div className="encolhivel">
                      <h2 className="peca-painel-nome">
                        <Link href={linkEdicao}>{peca.nome}</Link>
                      </h2>
                      <p className="autoria">{peca.tecnica}</p>
                    </div>
                    <div className="peca-painel-valores">
                      <span className="peca-painel-preco">{emReais(peca.preco)}</span>
                      {peca.inativadoEm ? (
                        <span className="selo selo-neutro">
                          <span className="selo-ponto" />
                          Inativada
                        </span>
                      ) : (
                        <span className={`selo ${situacao.classe}`}>
                          <span className="selo-ponto" />
                          {situacao.texto}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="peca-painel-rodape">
                    <div className="peca-painel-disponibilidade">
                      <span className="dado-rotulo">Disponibilidade</span>
                      <DisponibilidadeRapida
                        slug={peca.slug}
                        inicial={peca.disponibilidade}
                        prazoInicial={peca.prazoProducaoDias}
                        vendida={pecasUnicasVendidas.has(peca.slug) || Boolean(peca.vendidaEmPedido)}
                      />
                    </div>

                    <div className="peca-painel-acoes">
                      <Link href={linkEdicao} className="botao botao-secundario">Editar</Link>
                      {!peca.inativadoEm && chave === 'publicada' && (
                        <Link href={`/pieces/${peca.slug}`} className="botao botao-fantasma">Ver na loja</Link>
                      )}
                      <Link href={`/dashboard/pieces/new?base=${encodeURIComponent(peca.slug)}`} className="botao botao-fantasma">
                        Cadastrar semelhante
                      </Link>
                      <InativarPeca slug={peca.slug} nome={peca.nome} inativada={Boolean(peca.inativadoEm)} />
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        </>
      )}
    </>
  )
}
