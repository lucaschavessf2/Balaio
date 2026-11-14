'use client'

import { useEffect, useRef, useState } from 'react'
import EstadoVazio from '@/components/feedback/EstadoVazio'
import { avisar } from '@/components/feedback/Avisos'
import { IconeAviso } from '@/components/ui/Icones'
import { enviar } from '@/services/api/cliente'
import { type Mediacao } from '@/types/dominio'

export default function ListaMediacoes({ iniciais }: { iniciais: Mediacao[] }) {
  const [lista, definirLista] = useState<Mediacao[]>(iniciais)
  const [abertas, definirAbertas] = useState<string[]>([])
  const [processando, definirProcessando] = useState<string[]>([])
  const emAndamento = useRef(new Set<string>())

  useEffect(() => {
    definirLista(iniciais)
  }, [iniciais])

  async function abrirMediacao(m: Mediacao) {
    if (m.emAnalise || m.estado === 'emAnalise' || abertas.includes(m.id) || emAndamento.current.has(m.id)) return
    emAndamento.current.add(m.id)
    definirProcessando((atuais) => [...atuais, m.id])
    try {
      const resposta = await enviar<Mediacao>(`/admin/mediacoes/${m.id}`, { estado: 'emAnalise' }, 'PATCH')
      if (resposta.erro || !resposta.dados) { avisar.erro('Não foi possível atualizar', resposta.erro?.mensagem); return }
      definirLista((atual) => atual.map((item) => item.id === m.id ? resposta.dados! : item))
      definirAbertas((atuais) => [...new Set([...atuais, m.id])])
      avisar.info('Mediação em análise', 'Registre a decisão quando houver elementos suficientes.')
    } catch {
      avisar.erro('Não foi possível atualizar', 'Tente novamente.')
    } finally {
      emAndamento.current.delete(m.id)
      definirProcessando((atuais) => atuais.filter((id) => id !== m.id))
    }
  }

  async function decidirMediacao(m: Mediacao, decisao: string) {
    const resposta = await enviar<Mediacao>(`/admin/mediacoes/${m.id}/decisao`, { decisao })
    if (resposta.erro || !resposta.dados) {
      avisar.erro('Não foi possível registrar a decisão', resposta.erro?.mensagem)
      return
    }
    definirLista((atual) => atual.map((item) => item.id === m.id ? resposta.dados! : item))
    avisar.info('Decisão registrada', resposta.dados.estado === 'decisao_pendente'
      ? 'O comando ao serviço de pedidos está pendente de confirmação.' : 'O serviço de pedidos recebeu a decisão.')
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
        const emAnalise = m.emAnalise || m.estado === 'emAnalise' || abertas.includes(m.id)
        const decidida = m.estado === 'decidida'
        const pendente = m.estado === 'decisao_pendente'
        return (
          <li className="cartao-curadoria" key={m.id}>
            <header className="cartao-curadoria-topo">
              <span className={`selo ${emAnalise ? 'selo-neutro' : 'selo-unica'}`}>
                <span className="selo-ponto" />
                {decidida ? 'Decidida' : pendente ? 'Decisão pendente' : emAnalise ? 'Em análise' : 'Aguardando abertura'}
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
              {decidida || pendente ? (
                <p className="campo-ajuda">{pendente ? 'Entrega ao serviço de pedidos em processamento.' : `Decisão: ${m.decisao ?? 'registrada'}`}</p>
              ) : emAnalise ? (
                <form onSubmit={(evento) => { evento.preventDefault(); const dados = new FormData(evento.currentTarget); void decidirMediacao(m, String(dados.get('decisao'))) }}>
                  <label htmlFor={`decisao-${m.id}`}>Decisão</label>
                  <select id={`decisao-${m.id}`} name="decisao" required defaultValue="">
                    <option value="" disabled>Selecione</option>
                    <option value="cancelar_reembolsar">Cancelar e reembolsar (simulado)</option>
                    <option value="negar">Negar solicitação</option>
                    <option value="manter_conversa">Manter conversa</option>
                  </select>
                  <button type="submit" className="botao botao-primario">Registrar decisão</button>
                </form>
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
