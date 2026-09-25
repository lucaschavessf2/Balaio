'use client'

import { useState, type FormEvent } from 'react'
import { Retrato } from '@/components/ui/Basicos'
import { IconeEnviar } from '@/components/ui/Icones'
import { enviarMensagem } from '@/services/api/pedidos.servico'
import { avisar } from '@/components/feedback/Avisos'
import { type Mensagem } from '@/types/dominio'

type Props = {
  pedidoId: string
  iniciais: Mensagem[]
  atelie?: string
  imagem?: string
  id?: string
}

export default function ConversaPedido({ iniciais, atelie, imagem, id, pedidoId }: Props) {
  const [salvando, definirSalvando] = useState(false)
  const [mensagens, definirMensagens] = useState(iniciais)
  const [rascunho, definirRascunho] = useState('')
  const [erroEnvio, definirErroEnvio] = useState<string | null>(null)

  async function enviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    const texto = rascunho.trim()
    if (!texto || salvando) return
    definirSalvando(true)
    definirErroEnvio(null)
    const resposta = await enviarMensagem(pedidoId, { autor: 'comprador', texto, hora: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) })
    definirSalvando(false)
    if (resposta.erro || !resposta.dados) {
      const mensagem = resposta.erro?.mensagem ?? 'Tente novamente em instantes.'
      definirErroEnvio(mensagem)
      avisar.erro('Mensagem não enviada', mensagem)
      return
    }
    definirMensagens((atuais) => [...atuais, resposta.dados!])
    definirRascunho('')
  }

  return (
    <aside className="cartao painel-conversa" id={id}>
      <div className="linha-flex" style={{ paddingBottom: 14, borderBottom: '1px solid var(--linha)' }}>
        <Retrato imagem={imagem} tamanho={44} />
        <div className="encolhivel">
          <p className="texto-forte">{atelie}</p>
          <p className="autoria">Conversa deste pedido</p>
        </div>
      </div>

      <div className="conversa">
        {mensagens.map((m, i) => (
          <div key={i} className={`balao ${m.autor === 'comprador' ? 'balao-meu' : 'balao-deles'}`}>
            {m.texto}
            <span className="balao-hora">{m.hora}</span>
          </div>
        ))}
      </div>

      {erroEnvio && <p className="campo-erro acima-3" role="alert">{erroEnvio} Sua mensagem foi mantida.</p>}

      <form className="conversa-envio" onSubmit={enviar}>
        <label className="so-leitor" htmlFor="mensagem">
          Escreva sua mensagem
        </label>
        <input
          id="mensagem"
          className="campo-select"
          placeholder="Escreva sua mensagem..."
          style={{ flex: 1, minHeight: 48 }}
          value={rascunho}
          onChange={(evento) => definirRascunho(evento.target.value)}
        />
        <button disabled={salvando} type="submit" className="botao botao-primario" style={{ padding: '0 16px' }} aria-label="Enviar mensagem">
          <IconeEnviar />
        </button>
      </form>
    </aside>
  )
}
