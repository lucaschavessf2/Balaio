'use client'

import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Retrato } from '@/components/ui/Basicos'
import { IconeEnviar } from '@/components/ui/Icones'
import { avisar } from '@/components/feedback/Avisos'
import { criarPergunta, responderPergunta, type PerguntaPublica } from '@/services/api/perguntas.servico'

type Props = {
  iniciais: PerguntaPublica[]
  slug: string
  artesaoNome?: string
  artesaoImagem?: string
}

export default function PerguntasPublicas({ iniciais, slug, artesaoNome, artesaoImagem }: Props) {
  const [perguntas, definirPerguntas] = useState(iniciais)
  const [texto, definirTexto] = useState('')
  const [erro, definirErro] = useState<string | null>(null)
  const [respondendo, definirRespondendo] = useState<string | null>(null)
  const [rascunhoResposta, definirRascunhoResposta] = useState('')
  const campoResposta = useRef<HTMLInputElement>(null)

  useEffect(() => definirPerguntas(iniciais), [iniciais])

  useEffect(() => {
    if (respondendo) campoResposta.current?.focus()
  }, [respondendo])

  const todas = perguntas

  async function enviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    const limpo = texto.trim()
    if (!limpo) {
      definirErro('Escreva sua pergunta antes de enviar')
      return
    }
    definirErro(null)
    const resposta = await criarPergunta(slug, limpo)
    if (!resposta.dados) return avisar.erro('Não foi possível enviar', resposta.erro?.mensagem)
    definirPerguntas([...perguntas, resposta.dados])
    definirTexto('')
    avisar.sucesso('Pergunta enviada', 'Ela já aparece aqui com o seu nome.')
  }

  async function responder(evento: FormEvent<HTMLFormElement>, pergunta: PerguntaPublica) {
    evento.preventDefault()
    const limpo = rascunhoResposta.trim()
    if (!limpo) return
    const resposta = await responderPergunta(slug, pergunta.id, limpo)
    if (!resposta.dados) return avisar.erro('Não foi possível responder', resposta.erro?.mensagem)
    definirPerguntas(perguntas.map((item) => item.id === pergunta.id ? resposta.dados! : item))
    definirRespondendo(null)
    definirRascunhoResposta('')
    avisar.sucesso('Resposta publicada', 'Ela fica visível para quem visitar a peça.')
  }

  return (
    <>
      <h2 className="secao-titulo">Perguntas e respostas ({todas.length})</h2>

      <ul
        className={`lista-perguntas${todas.length > 3 ? ' lista-perguntas-rolavel' : ''}`}
        tabIndex={todas.length > 3 ? 0 : undefined}
        aria-label={todas.length > 3 ? 'Lista de perguntas, role para ver todas' : undefined}
      >
        {todas.map((p) => (
          <li className="fio-pergunta" key={p.id}>
            <div className="pergunta-bloco">
              <span className="pergunta-inicial" aria-hidden>{(p.autor ?? '?').charAt(0)}</span>
              <div className="encolhivel">
                <p className="pergunta-autor">
                  {p.autor ?? 'Visitante'}
                </p>
                <p className="balao balao-pergunta">{p.pergunta}</p>
              </div>
            </div>

            {p.resposta ? (
              <div className="resposta-artesao">
                <Retrato imagem={artesaoImagem} tamanho={28} />
                <div className="encolhivel">
                  <p className="resposta-autor">
                    {artesaoNome}
                    <span className="selo selo-encomenda">artesão</span>
                  </p>
                  <p className="balao balao-resposta">{p.resposta}</p>
                </div>
              </div>
            ) : respondendo === p.pergunta ? (
              <form className="conversa-envio resposta-envio" onSubmit={(e) => responder(e, p)}>
                <label className="so-leitor" htmlFor={`responder-${p.pergunta.slice(0, 20)}`}>
                  Escreva a resposta do artesão
                </label>
                <input
                  id={`responder-${p.pergunta.slice(0, 20)}`}
                  ref={campoResposta}
                  className="campo-select"
                  placeholder="Responda como artesão"
                  value={rascunhoResposta}
                  enterKeyHint="send"
                  onChange={(evento) => definirRascunhoResposta(evento.target.value)}
                />
                <button type="submit" className="botao botao-primario" aria-label="Publicar resposta">
                  <IconeEnviar />
                </button>
                <button
                  type="button"
                  className="botao botao-fantasma"
                  onClick={() => {
                    definirRespondendo(null)
                    definirRascunhoResposta('')
                  }}
                >
                  Cancelar
                </button>
              </form>
            ) : (
              <p className="pergunta-aguardando">
                <span className="selo selo-neutro">Aguardando resposta do artesão</span>
                <button
                  type="button"
                  className="botao-texto"
                  onClick={() => {
                    definirRespondendo(p.pergunta)
                    definirRascunhoResposta('')
                  }}
                >
                  Responder
                </button>
              </p>
            )}
          </li>
        ))}
      </ul>

      <form className="conversa-envio acima-4" onSubmit={enviar} noValidate>
        <label className="so-leitor" htmlFor="nova-pergunta">
          Escreva sua pergunta
        </label>
        <input
          id="nova-pergunta"
          className="campo-select"
          placeholder="Pergunte sobre a peça, o prazo ou o envio"
          value={texto}
          enterKeyHint="send"
          onChange={(evento) => {
            definirTexto(evento.target.value)
            if (erro) definirErro(null)
          }}
        />
        <button type="submit" className="botao botao-primario" aria-label="Enviar pergunta">
          <IconeEnviar />
        </button>
      </form>

      {erro && (
        <p className="campo-erro acima-2" role="status">
          {erro}
        </p>
      )}

      <p className="campo-ajuda acima-2">Sua pergunta e a resposta ficam visíveis para todos.</p>
    </>
  )
}
