'use client'

import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Retrato } from '@/components/ui/Basicos'
import { IconeEnviar, IconeSetaEsquerda } from '@/components/ui/Icones'
import type { ConversaArtesao, Mensagem } from '@/types/dominio'
import { conversaDoPedido, enviarMensagem } from '@/services/api/pedidos.servico'
import { avisar } from '@/components/feedback/Avisos'

type Props = { fios: ConversaArtesao[]; conversaInicial: Mensagem[] }

export default function CaixaConversas({ fios, conversaInicial }: Props) {
  const [fioAtivo, definirFioAtivo] = useState(fios[0]?.id)
  const [fioAberto, definirFioAberto] = useState(false)
  const [lidas, definirLidas] = useState<string[]>([])
  const [mensagens, definirMensagens] = useState<Record<string, Mensagem[]>>(() =>
    fios[0] ? { [fios[0].id]: conversaInicial } : {},
  )
  const [rascunho, definirRascunho] = useState('')
  const refTituloFio = useRef<HTMLParagraphElement>(null)
  const jaAbriuFio = useRef(false)

  const fio = fios.find((f) => f.id === fioAtivo)

  useEffect(() => {
    const listaLarga = window.matchMedia('(min-width: 1000px)').matches
    if (fioAberto) {
      jaAbriuFio.current = true
      if (!listaLarga) refTituloFio.current?.focus()
    } else if (jaAbriuFio.current) {
      document.getElementById(`fio-${fioAtivo}`)?.focus()
    }
  }, [fioAberto, fioAtivo])

  function estaNaoLida(f: ConversaArtesao) {
    return f.naoLida && !lidas.includes(f.id) && f.id !== fioAtivo
  }

  async function selecionar(id: string) {
    definirFioAtivo(id)
    definirFioAberto(true)
    if (!lidas.includes(id)) definirLidas([...lidas, id])
    if (!mensagens[id]) {
      const resposta = await conversaDoPedido(id)
      if (resposta.dados) definirMensagens((atuais) => ({ ...atuais, [id]: resposta.dados! }))
    }
  }

  function voltar() {
    definirFioAberto(false)
  }

  function conversaDo(id: string): Mensagem[] {
    if (mensagens[id]) return mensagens[id]
    const dados = fios.find((f) => f.id === id)
    return dados ? [{ autor: 'comprador', texto: dados.previa, hora: dados.quando }] : []
  }

  async function enviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    const texto = rascunho.trim()
    if (!texto || !fioAtivo) return
    const nova: Mensagem = { autor: 'artesao', texto, hora: 'agora' }
    const resposta = await enviarMensagem(fioAtivo, nova)
    if (!resposta.dados) return avisar.erro('Não foi possível enviar', resposta.erro?.mensagem)
    definirMensagens({ ...mensagens, [fioAtivo]: [...conversaDo(fioAtivo), resposta.dados] })
    definirRascunho('')
  }

  return (
    <div className={`caixa-conversas${fioAberto ? ' caixa-conversas-detalhe' : ''}`}>
      <ul className="lista-fios">
        {fios.map((f) => (
          <li key={f.id}>
            <button
              type="button"
              id={`fio-${f.id}`}
              className={`fio${estaNaoLida(f) ? ' fio-nao-lido' : ''}${f.id === fioAtivo ? ' fio-ativo' : ''}`}
              onClick={() => selecionar(f.id)}
              aria-pressed={f.id === fioAtivo}
            >
              <Retrato imagem={f.retrato} tamanho={44} />
              <span className="encolhivel" style={{ flex: 1, display: 'block' }}>
                <span className="linha-flex linha-entre" style={{ gap: 10 }}>
                  <span style={{ fontWeight: 600 }}>{f.pessoa}</span>
                  <span className="dado-rotulo">{f.quando}</span>
                </span>
                <span className="territorio" style={{ textTransform: 'none', letterSpacing: 0, display: 'block' }}>
                  {f.assunto}
                </span>
                <span className="previa" style={{ display: 'block' }}>
                  {f.previa}
                </span>
              </span>
              {estaNaoLida(f) && <span className="menu-marcador menu-marcador-alerta">nova</span>}
            </button>
          </li>
        ))}
      </ul>

      {fio && (
        <div className="cartao painel-conversa">
          <button type="button" className="botao botao-fantasma voltar-conversas" onClick={voltar}>
            <IconeSetaEsquerda />
            Todas as conversas
          </button>
          <div style={{ paddingBottom: 12, borderBottom: '1px solid var(--linha)' }}>
            <p className="texto-forte" tabIndex={-1} ref={refTituloFio}>
              {fio.pessoa}
            </p>
            <p className="autoria">
              Pedido #{fio.id} · {fio.assunto}
            </p>
          </div>

          <div className="conversa">
            {conversaDo(fio.id).map((m, i) => (
              <div key={i} className={`balao ${m.autor === 'artesao' ? 'balao-meu' : 'balao-deles'}`}>
                {m.texto}
                <span className="balao-hora">{m.hora}</span>
              </div>
            ))}
          </div>

          <form className="conversa-envio" onSubmit={enviar}>
            <label className="so-leitor" htmlFor="resposta">
              Escreva sua resposta
            </label>
            <input
              id="resposta"
              className="campo-select"
              placeholder="Escreva sua resposta..."
              style={{ flex: 1, minHeight: 48 }}
              value={rascunho}
              onChange={(evento) => definirRascunho(evento.target.value)}
            />
            <button type="submit" className="botao botao-primario" style={{ padding: '0 16px' }} aria-label="Enviar resposta">
              <IconeEnviar />
            </button>
          </form>
        </div>
      )}
    </div>
  )
}
