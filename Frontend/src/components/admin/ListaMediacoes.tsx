'use client'

import { useEffect, useState } from 'react'
import { EstadoVazio } from '@/components/ui/Basicos'
import { avisar } from '@/components/feedback/Avisos'
import { IconeAviso } from '@/components/ui/Icones'
import { lerMediacoesLocais } from '@/components/admin/mediacoesLocais'
import { type Mediacao } from '@/types/dominio'

export default function ListaMediacoes({ iniciais }: { iniciais: Mediacao[] }) {
  const [lista, definirLista] = useState<Mediacao[]>(iniciais)
  const [abertas, definirAbertas] = useState<string[]>([])

  useEffect(() => {
    const locais = lerMediacoesLocais().filter((local) => !iniciais.some((m) => m.id === local.id))
    if (locais.length > 0) definirLista([...locais, ...iniciais])
  }, [iniciais])

  function abrirMediacao(m: Mediacao) {
    definirAbertas([...abertas, m.id])
    avisar.info('Mediação aberta', 'As duas partes foram notificadas e têm 48h para responder.')
  }

  if (lista.length === 0) {
    return (
      <EstadoVazio
        icone={<IconeAviso tamanho={34} />}
        titulo="Nenhuma mediação aberta"
        descricao="Quando um comprador ou artesão pedir ajuda para resolver um pedido, ele aparece aqui."
      />
    )
  }

  return (
    <ul className="lista-curadoria">
      {lista.map((m) => {
        const emAnalise = abertas.includes(m.id)
        return (
          <li className="cartao-curadoria" key={m.id}>
            <header className="cartao-curadoria-topo">
              <span className={`selo ${emAnalise ? 'selo-neutro' : 'selo-unica'}`}>
                <span className="selo-ponto" />
                {emAnalise ? 'Em análise' : 'Aguardando abertura'}
              </span>
              <span className="dado-rotulo">
                {m.id} · aberta {m.aberta}
              </span>
            </header>

            <div className="cartao-curadoria-corpo">
              <p className="cartao-curadoria-peca">{m.assunto}</p>
              <p className="autoria">
                {m.partes} · pedido {m.pedido}
              </p>
            </div>

            <footer className="acoes-linha acoes-empilhaveis cartao-curadoria-acoes">
              {emAnalise ? (
                <p className="campo-ajuda">As duas partes foram notificadas e têm 48h para responder.</p>
              ) : (
                <button type="button" className="botao botao-primario" onClick={() => abrirMediacao(m)}>
                  Abrir mediação
                </button>
              )}
            </footer>
          </li>
        )
      })}
    </ul>
  )
}
