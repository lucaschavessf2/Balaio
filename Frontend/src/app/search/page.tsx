import Link from 'next/link'
import Pagina from '@/components/layout/Pagina'
import CartaoPeca from '@/components/produto/CartaoPeca'
import ChipsFiltrosAtivos from '@/components/produto/ChipsFiltrosAtivos'
import FiltrosListagem from '@/components/produto/FiltrosListagem'
import OrdenarListagem from '@/components/produto/OrdenarListagem'
import PaginacaoListagem from '@/components/produto/PaginacaoListagem'
import { Migalhas } from '@/components/ui/Basicos'
import EstadoVazio from '@/components/feedback/EstadoVazio'
import EstadoErro from '@/components/feedback/EstadoErro'
import { IconeBusca } from '@/components/ui/Icones'
import { tecnicas } from '@/constants/referencias'
import { rotuloDisponibilidade } from '@/constants/rotulos'
import { listarPecas } from '@/services/api/pecas.servico'
import { filtrosAtivos, hrefListagem, lerFiltros, type FiltrosListagem as Filtros } from '@/utils/filtrosUrl'

const POR_PAGINA = 12

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> }

function tituloDaListagem(filtros: Filtros): string {
  if (filtros.q) return `Resultados para "${filtros.q}"`
  if (filtros.tipo) return filtros.tipo
  if (filtros.desconto) return 'Ofertas do ateliê'
  if (filtros.disponibilidade) return rotuloDisponibilidade[filtros.disponibilidade]
  return filtros.tecnica ?? filtros.categoria ?? filtros.territorio ?? 'Todo o catálogo'
}

export default async function Busca({ searchParams }: Props) {
  const filtros = lerFiltros(await searchParams)
  const { dados, erro, paginacao } = await listarPecas({ ...filtros, tamanho: POR_PAGINA })
  const resultados = dados ?? []
  const total = paginacao?.total ?? resultados.length
  const titulo = tituloDaListagem(filtros)
  const temFiltro = filtrosAtivos(filtros).some((filtro) => filtro.chave !== 'q')
  const inicio = paginacao ? (paginacao.pagina - 1) * paginacao.tamanho + 1 : 1

  return (
    <Pagina>
      <Migalhas
        trilha={[
          { texto: 'Início', href: '/' },
          { texto: 'Catálogo', href: '/search' },
          ...(titulo !== 'Todo o catálogo' ? [{ texto: titulo }] : []),
        ]}
      />

      <h1 className="titulo-pagina">{titulo}</h1>
      <p className="subtitulo-pagina">
        Busque por tipo, técnica, território ou pelo nome da peça e do artesão.
      </p>

      {erro ? (
        <EstadoErro mensagem={erro.mensagem} />
      ) : (
        <div className="catalogo secao">
          <FiltrosListagem filtros={filtros} total={total} />

          <div className="catalogo-conteudo">
            <div className="catalogo-topo" role="status">
              <p>
                {total === 0 ? (
                  <strong>Nenhuma peça</strong>
                ) : (
                  <>
                    Exibindo{' '}
                    <strong>
                      {inicio}–{inicio + resultados.length - 1} de {total} {total === 1 ? 'peça' : 'peças'}
                    </strong>
                  </>
                )}
              </p>
              <OrdenarListagem filtros={filtros} />
            </div>

            <ChipsFiltrosAtivos filtros={filtros} />

            {resultados.length === 0 ? (
              <EstadoVazio
                icone={<IconeBusca tamanho={34} />}
                titulo={temFiltro ? 'Nenhuma peça com esses filtros' : 'Não encontramos peças com esse termo'}
                descricao={
                  temFiltro
                    ? 'Tente tirar algum filtro. O catálogo cresce toda semana.'
                    : 'Tente uma técnica, um território ou o nome de um artesão.'
                }
                acao={
                  temFiltro ? (
                    <Link href={hrefListagem({ q: filtros.q })} className="botao botao-primario">
                      Limpar filtros
                    </Link>
                  ) : (
                    <div className="acoes-linha" style={{ justifyContent: 'center' }}>
                      {tecnicas.slice(0, 3).map((tecnica) => (
                        <Link key={tecnica} href={hrefListagem({ tecnica })} className="botao botao-secundario">
                          {tecnica}
                        </Link>
                      ))}
                    </div>
                  )
                }
              />
            ) : (
              <>
                <div className="grade-pecas">
                  {resultados.map((peca) => (
                    <CartaoPeca key={peca.slug} peca={peca} />
                  ))}
                </div>
                {paginacao && <PaginacaoListagem filtros={filtros} paginacao={paginacao} />}
              </>
            )}
          </div>
        </div>
      )}
    </Pagina>
  )
}
