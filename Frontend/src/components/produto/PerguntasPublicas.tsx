'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Retrato } from '@/components/ui/Basicos'
import { IconeEnviar } from '@/components/ui/Icones'
import { avisar } from '@/components/feedback/Avisos'
import { useSessao } from '@/store/sessao'
import { rotaDeLogin } from '@/services/sessao/cookie'

export type PerguntaPublica = { pergunta: string; autor?: string; resposta?: string }

type Guardado = { perguntas: PerguntaPublica[]; respostas: Record<string, string> }

const CHAVE_PERGUNTAS = 'al-perguntas'
const VAZIO: Guardado = { perguntas: [], respostas: {} }

function lerMapa() {
  try {
    const bruto = window.localStorage.getItem(CHAVE_PERGUNTAS)
    return bruto ? JSON.parse(bruto) : {}
  } catch {
    return {}
  }
}

function lerGuardado(slug: string): Guardado {
  const item = lerMapa()?.[slug]
  if (Array.isArray(item)) {
    return { perguntas: item.filter((p) => p && typeof p.pergunta === 'string'), respostas: {} }
  }
  return {
    perguntas: Array.isArray(item?.perguntas)
      ? item.perguntas.filter((p: PerguntaPublica) => p && typeof p.pergunta === 'string')
      : [],
    respostas: item?.respostas && typeof item.respostas === 'object' ? item.respostas : {},
  }
}

function guardar(slug: string, dados: Guardado) {
  try {
    window.localStorage.setItem(CHAVE_PERGUNTAS, JSON.stringify({ ...lerMapa(), [slug]: dados }))
  } catch {}
}

type Props = {
  iniciais: PerguntaPublica[]
  slug: string
  artesaoSlug?: string
  artesaoNome?: string
  artesaoImagem?: string
}

export default function PerguntasPublicas({ iniciais, slug, artesaoSlug, artesaoNome, artesaoImagem }: Props) {
  const caminho = usePathname()
  const { sessao } = useSessao()
  const ehDonoDaPeca = Boolean(sessao?.artesao && sessao.artesao === artesaoSlug)
  const [guardado, definirGuardado] = useState<Guardado>(VAZIO)
  const [texto, definirTexto] = useState('')
  const [erro, definirErro] = useState<string | null>(null)
  const [respondendo, definirRespondendo] = useState<string | null>(null)
  const [rascunhoResposta, definirRascunhoResposta] = useState('')
  const campoResposta = useRef<HTMLInputElement>(null)

  useEffect(() => {
    definirGuardado(lerGuardado(slug))
  }, [slug])

  useEffect(() => {
    if (respondendo) campoResposta.current?.focus()
  }, [respondendo])

  const todas = [...iniciais, ...guardado.perguntas].map((p) => ({
    ...p,
    resposta: p.resposta ?? guardado.respostas[p.pergunta],
  }))

  function enviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    if (!sessao) return
    const limpo = texto.trim()
    if (!limpo) {
      definirErro('Escreva sua pergunta antes de enviar')
      return
    }
    definirErro(null)
    const nova = { pergunta: limpo, autor: sessao.nome }
    const proximo = { ...guardado, perguntas: [...guardado.perguntas, nova] }
    definirGuardado(proximo)
    guardar(slug, proximo)
    definirTexto('')
    avisar.sucesso('Pergunta enviada', 'Ela já aparece aqui com o seu nome.')
  }

  function responder(evento: FormEvent<HTMLFormElement>, pergunta: string) {
    evento.preventDefault()
    const limpo = rascunhoResposta.trim()
    if (!limpo || !ehDonoDaPeca) return
    const proximo = { ...guardado, respostas: { ...guardado.respostas, [pergunta]: limpo } }
    definirGuardado(proximo)
    guardar(slug, proximo)
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
          <li className="fio-pergunta" key={p.pergunta}>
            <div className="pergunta-bloco">
              {sessao && p.autor === sessao.nome ? (
                <Retrato imagem={sessao.imagem} tamanho={28} />
              ) : (
                <span className="pergunta-inicial" aria-hidden>
                  {(p.autor ?? '?').charAt(0)}
                </span>
              )}
              <div className="encolhivel">
                <p className="pergunta-autor">
                  {p.autor ?? 'Visitante'}
                  {sessao && p.autor === sessao.nome && <span className="selo selo-neutro">você</span>}
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
              <form className="conversa-envio resposta-envio" onSubmit={(e) => responder(e, p.pergunta)}>
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
                {ehDonoDaPeca && (
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
                )}
              </p>
            )}
          </li>
        ))}
      </ul>

      {sessao ? (
        <>
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
      ) : (
        <p className="campo-ajuda acima-4">
          <Link href={rotaDeLogin(caminho)}>Entre na sua conta</Link> para perguntar ao artesão.
        </p>
      )}
    </>
  )
}
