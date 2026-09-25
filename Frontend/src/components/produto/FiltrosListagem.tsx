'use client'

import Link from 'next/link'
import { useEffect, useRef, type MouseEvent } from 'react'
import { IconeCheck, IconeFiltro, IconeSetaBaixo } from '@/components/ui/Icones'
import { categorias, tecnicas, territorios, tipos } from '@/constants/referencias'
import { rotuloDisponibilidade } from '@/constants/rotulos'
import {
  disponibilidades,
  filtrosAtivos,
  hrefCom,
  hrefListagem,
  type ChaveFiltro,
  type FiltrosListagem as Filtros,
} from '@/utils/filtrosUrl'

type Opcao = { valor: string; rotulo: string }

type Grupo = { chave: Exclude<ChaveFiltro, 'q' | 'desconto'>; titulo: string; opcoes: Opcao[] }

const comoOpcoes = (lista: readonly string[]): Opcao[] => lista.map((valor) => ({ valor, rotulo: valor }))

const grupos: Grupo[] = [
  { chave: 'tipo', titulo: 'Tipo de peça', opcoes: comoOpcoes(tipos) },
  { chave: 'tecnica', titulo: 'Técnica', opcoes: comoOpcoes(tecnicas) },
  { chave: 'categoria', titulo: 'Categoria', opcoes: comoOpcoes(categorias) },
  { chave: 'territorio', titulo: 'Território', opcoes: comoOpcoes(territorios) },
  {
    chave: 'disponibilidade',
    titulo: 'Disponibilidade',
    opcoes: disponibilidades.map((valor) => ({ valor, rotulo: rotuloDisponibilidade[valor] })),
  },
]

export default function FiltrosListagem({ filtros, total }: { filtros: Filtros; total: number }) {
  const dialogo = useRef<HTMLDialogElement>(null)
  const ativos = filtrosAtivos(filtros).filter((filtro) => filtro.chave !== 'q').length

  useEffect(() => {
    const telaLarga = window.matchMedia('(min-width: 1000px)')
    function fecharQuandoVirarColuna(evento: MediaQueryListEvent) {
      if (evento.matches) dialogo.current?.close()
    }
    telaLarga.addEventListener('change', fecharQuandoVirarColuna)
    return () => telaLarga.removeEventListener('change', fecharQuandoVirarColuna)
  }, [])

  function fecharSeForaDoCard(evento: MouseEvent<HTMLDialogElement>) {
    const alvo = dialogo.current
    if (!alvo || !alvo.open) return
    const area = alvo.getBoundingClientRect()
    const foraDoCard =
      evento.clientX < area.left || evento.clientX > area.right || evento.clientY < area.top || evento.clientY > area.bottom
    if (foraDoCard) alvo.close()
  }

  return (
    <>
      <button type="button" className="abre-filtros" onClick={() => dialogo.current?.showModal()}>
        <IconeFiltro tamanho={18} />
        Filtros
        {ativos > 0 && <span className="filtro-contagem">{ativos}</span>}
      </button>

      <dialog className="filtros" ref={dialogo} aria-label="Filtros do catálogo" onClick={fecharSeForaDoCard}>
        <div className="filtros-cabecalho">
          <h2 className="linha-flex" style={{ gap: 8 }}>
            <IconeFiltro tamanho={18} />
            Filtros
          </h2>
          {ativos > 0 && (
            <Link href={hrefListagem({ q: filtros.q, ordenar: filtros.ordenar })} className="botao-texto" scroll={false}>
              Limpar ({ativos})
            </Link>
          )}
        </div>

        <div className="filtros-grupo filtros-grupo-fixo">
          <Link
            href={hrefCom(filtros, { desconto: filtros.desconto ? undefined : true })}
            className={`chip-filtro${filtros.desconto ? ' chip-filtro-ativo' : ''}`}
            aria-current={filtros.desconto ? 'true' : undefined}
            scroll={false}
          >
            {filtros.desconto && <IconeCheck tamanho={12} />}
            Só peças com desconto
          </Link>
        </div>

        {grupos.map((grupo) => {
          const selecionado = filtros[grupo.chave]
          return (
            <details className="filtros-grupo" open key={grupo.chave}>
              <summary className="filtros-titulo">
                {grupo.titulo}
                {selecionado && <span className="filtro-contagem">1</span>}
                <span className="seta-grupo">
                  <IconeSetaBaixo />
                </span>
              </summary>
              <div className="chips-filtro">
                {grupo.opcoes.map((opcao) => {
                  const ativo = selecionado === opcao.valor
                  return (
                    <Link
                      key={opcao.valor}
                      href={hrefCom(filtros, { [grupo.chave]: ativo ? undefined : opcao.valor })}
                      className={`chip-filtro${ativo ? ' chip-filtro-ativo' : ''}`}
                      aria-current={ativo ? 'true' : undefined}
                      scroll={false}
                    >
                      {ativo && <IconeCheck tamanho={12} />}
                      {opcao.rotulo}
                    </Link>
                  )
                })}
              </div>
            </details>
          )
        })}

        <div className="filtros-rodape">
          <button type="button" className="botao botao-primario botao-largo" onClick={() => dialogo.current?.close()}>
            Ver {total} {total === 1 ? 'peça' : 'peças'}
          </button>
        </div>
      </dialog>
    </>
  )
}
