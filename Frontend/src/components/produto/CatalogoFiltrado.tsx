'use client'

import { useEffect, useRef, useState, type MouseEvent } from 'react'
import CartaoPeca from '@/components/produto/CartaoPeca'
import { EstadoVazio } from '@/components/ui/Basicos'
import { IconeBusca, IconeCheck, IconeFiltro, IconeSetaBaixo } from '@/components/ui/Icones'
import { categorias, tecnicas, territorios } from '@/constants/referencias'
import { type Peca, type Tecnica } from '@/types/dominio'

type Ordenacao = 'recentes' | 'menor' | 'maior'

const TODOS = '__todos__'
const POR_PAGINA = 9

export default function CatalogoFiltrado({ pecas }: { pecas: Peca[] }) {
  const [tecnicasAtivas, definirTecnicasAtivas] = useState<Tecnica[]>([])
  const [territorio, definirTerritorio] = useState(TODOS)
  const [categoria, definirCategoria] = useState(TODOS)
  const [ordenacao, definirOrdenacao] = useState<Ordenacao>('recentes')
  const [pagina, definirPagina] = useState(1)
  const topoCatalogo = useRef<HTMLDivElement>(null)
  const dialogoFiltros = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const telaLarga = window.matchMedia('(min-width: 1000px)')
    function fecharQuandoVirarColuna(evento: MediaQueryListEvent) {
      if (evento.matches) dialogoFiltros.current?.close()
    }
    telaLarga.addEventListener('change', fecharQuandoVirarColuna)
    return () => telaLarga.removeEventListener('change', fecharQuandoVirarColuna)
  }, [])

  function fecharSeForaDoCard(evento: MouseEvent<HTMLDialogElement>) {
    const dialogo = dialogoFiltros.current
    if (!dialogo || !dialogo.open) return
    const area = dialogo.getBoundingClientRect()
    const foraDoCard =
      evento.clientX < area.left ||
      evento.clientX > area.right ||
      evento.clientY < area.top ||
      evento.clientY > area.bottom
    if (foraDoCard) dialogo.close()
  }

  function alternarTecnica(t: Tecnica) {
    definirTecnicasAtivas(
      tecnicasAtivas.includes(t) ? tecnicasAtivas.filter((ativa) => ativa !== t) : [...tecnicasAtivas, t],
    )
    definirPagina(1)
  }

  function limpar() {
    definirTecnicasAtivas([])
    definirTerritorio(TODOS)
    definirCategoria(TODOS)
    definirOrdenacao('recentes')
    definirPagina(1)
  }

  const ativos = tecnicasAtivas.length + (territorio !== TODOS ? 1 : 0) + (categoria !== TODOS ? 1 : 0)

  const filtradas = pecas.filter(
    (p) =>
      (tecnicasAtivas.length === 0 || tecnicasAtivas.includes(p.tecnica)) &&
      (territorio === TODOS || p.territorio === territorio) &&
      (categoria === TODOS || p.categoria === categoria),
  )

  const ordenadas =
    ordenacao === 'recentes'
      ? filtradas
      : [...filtradas].sort((a, b) => (ordenacao === 'menor' ? a.preco - b.preco : b.preco - a.preco))

  const totalPaginas = Math.max(1, Math.ceil(ordenadas.length / POR_PAGINA))
  const paginaAtual = Math.min(pagina, totalPaginas)
  const exibidas = ordenadas.slice((paginaAtual - 1) * POR_PAGINA, paginaAtual * POR_PAGINA)

  function irPara(numero: number) {
    definirPagina(numero)
    const reduzirMovimento = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    topoCatalogo.current?.scrollIntoView({ behavior: reduzirMovimento ? 'auto' : 'smooth', block: 'start' })
  }

  return (
    <div className="catalogo secao">
      <button type="button" className="abre-filtros" onClick={() => dialogoFiltros.current?.showModal()}>
        <IconeFiltro tamanho={18} />
        Filtros
        {ativos > 0 && <span className="filtro-contagem">{ativos}</span>}
      </button>

      <dialog className="filtros" ref={dialogoFiltros} aria-label="Filtros do catálogo" onClick={fecharSeForaDoCard}>
        <div className="filtros-cabecalho">
          <h2 className="linha-flex" style={{ gap: 8 }}>
            <IconeFiltro tamanho={18} />
            Filtros
          </h2>
          {ativos > 0 && (
            <button type="button" className="botao-texto" onClick={limpar}>
              Limpar ({ativos})
            </button>
          )}
        </div>

        <details className="filtros-grupo" open>
          <summary className="filtros-titulo">
            Técnica
            {tecnicasAtivas.length > 0 && <span className="filtro-contagem">{tecnicasAtivas.length}</span>}
            <span className="seta-grupo">
              <IconeSetaBaixo />
            </span>
          </summary>
          <div className="chips-filtro">
            {tecnicas.map((t) => {
              const ativa = tecnicasAtivas.includes(t)
              return (
                <button
                  key={t}
                  type="button"
                  className={`chip-filtro${ativa ? ' chip-filtro-ativo' : ''}`}
                  aria-pressed={ativa}
                  onClick={() => alternarTecnica(t)}
                >
                  {ativa && <IconeCheck tamanho={12} />}
                  {t}
                </button>
              )
            })}
          </div>
        </details>

        <details className="filtros-grupo" open>
          <summary className="filtros-titulo">
            Território
            {territorio !== TODOS && <span className="filtro-contagem">1</span>}
            <span className="seta-grupo">
              <IconeSetaBaixo />
            </span>
          </summary>
          <select
            aria-label="Território"
            className="campo-select"
            value={territorio}
            onChange={(evento) => {
              definirTerritorio(evento.target.value)
              definirPagina(1)
            }}
          >
            <option value={TODOS}>Todos os territórios</option>
            {territorios.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </details>

        <details className="filtros-grupo" open>
          <summary className="filtros-titulo">
            Categoria
            {categoria !== TODOS && <span className="filtro-contagem">1</span>}
            <span className="seta-grupo">
              <IconeSetaBaixo />
            </span>
          </summary>
          <select
            aria-label="Categoria"
            className="campo-select"
            value={categoria}
            onChange={(evento) => {
              definirCategoria(evento.target.value)
              definirPagina(1)
            }}
          >
            <option value={TODOS}>Todas as categorias</option>
            {categorias.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </details>

        <div className="filtros-rodape">
          <button
            type="button"
            className="botao botao-primario botao-largo"
            onClick={() => dialogoFiltros.current?.close()}
          >
            Ver {ordenadas.length} {ordenadas.length === 1 ? 'peça' : 'peças'}
          </button>
        </div>
      </dialog>

      <div ref={topoCatalogo} className="catalogo-conteudo">
        <div className="catalogo-topo" role="status">
          <p>
            Exibindo{' '}
            <strong>
              {ordenadas.length === 0
                ? '0 peças'
                : `${(paginaAtual - 1) * POR_PAGINA + 1}–${(paginaAtual - 1) * POR_PAGINA + exibidas.length} de ${ordenadas.length} ${ordenadas.length === 1 ? 'peça' : 'peças'}`}
            </strong>{' '}
            encontradas em Pernambuco
          </p>
          <label className="linha-flex" style={{ gap: 8 }}>
            Ordenar por:
            <select
              className="campo-select"
              value={ordenacao}
              onChange={(evento) => {
                definirOrdenacao(evento.target.value as Ordenacao)
                definirPagina(1)
              }}
            >
              <option value="recentes">Mais recentes</option>
              <option value="menor">Menor preço</option>
              <option value="maior">Maior preço</option>
            </select>
          </label>
        </div>

        {ordenadas.length === 0 ? (
          <EstadoVazio
            icone={<IconeBusca tamanho={34} />}
            titulo="Nenhuma peça com esses filtros"
            descricao="Tente tirar algum filtro ou escolher outro território. O catálogo cresce toda semana."
            acao={
              <button type="button" className="botao botao-primario" onClick={limpar}>
                Limpar filtros
              </button>
            }
          />
        ) : (
          <>
            <div className="grade-pecas" key={paginaAtual}>
              {exibidas.map((peca) => (
                <CartaoPeca key={peca.slug} peca={peca} />
              ))}
            </div>

            {totalPaginas > 1 && (
              <nav className="paginacao" aria-label="Páginas do catálogo">
                <button
                  type="button"
                  className="botao botao-fantasma"
                  disabled={paginaAtual === 1}
                  onClick={() => irPara(paginaAtual - 1)}
                >
                  ← Anterior
                </button>
                {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((numero) => (
                  <button
                    key={numero}
                    type="button"
                    className={`pagina-numero${numero === paginaAtual ? ' pagina-numero-ativa' : ''}`}
                    aria-current={numero === paginaAtual ? 'page' : undefined}
                    aria-label={`Página ${numero}`}
                    onClick={() => irPara(numero)}
                  >
                    {numero}
                  </button>
                ))}
                <button
                  type="button"
                  className="botao botao-fantasma"
                  disabled={paginaAtual === totalPaginas}
                  onClick={() => irPara(paginaAtual + 1)}
                >
                  Próxima →
                </button>
              </nav>
            )}
          </>
        )}
      </div>
    </div>
  )
}
