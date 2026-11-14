'use client'

import { useRef, useState } from 'react'
import EstadoVazio from '@/components/feedback/EstadoVazio'
import { avisar } from '@/components/feedback/Avisos'
import { IconeAviso } from '@/components/ui/Icones'
import { enviar } from '@/services/api/cliente'
import { type Mediacao } from '@/types/dominio'

export default function ListaMediacoes({ iniciais }: { iniciais: Mediacao[] }) {
  const [abertas, definirAbertas] = useState<string[]>([])
  const [processando, definirProcessando] = useState<string[]>([])
  const emAndamento = useRef(new Set<string>())

  async function abrirMediacao(m: Mediacao) {
    if (m.emAnalise || abertas.includes(m.id) || emAndamento.current.has(m.id)) return
    emAndamento.current.add(m.id)
    definirProcessando((atuais) => [...atuais, m.id])
    try {
      const resposta = await enviar<Mediacao>(`/admin/mediacoes/${m.id}`, { emAnalise: true }, 'PATCH')
      if (resposta.erro || !resposta.dados) { avisar.erro('Não foi possível atualizar', resposta.erro?.mensagem); return }
      definirAbertas((atuais) => [...new Set([...atuais, m.id])])
      avisar.info('Mediação aberta', 'As duas partes foram notificadas e têm 48h para responder.')
    } catch {
      avisar.erro('Não foi possível atualizar', 'Tente novamente.')
    } finally {
      emAndamento.current.delete(m.id)
      definirProcessando((atuais) => atuais.filter((id) => id !== m.id))
    }
  }

  if (iniciais.length === 0) {
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
      {iniciais.map((m) => {
        const emAnalise = m.emAnalise || abertas.includes(m.id)
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
                <button type="button" className="botao botao-primario" disabled={processando.includes(m.id)} onClick={() => abrirMediacao(m)}>
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
