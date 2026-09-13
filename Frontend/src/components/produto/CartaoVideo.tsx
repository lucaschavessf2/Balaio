'use client'

import Link from 'next/link'
import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Retrato } from '@/components/ui/Basicos'
import ImagemComFallback from '@/components/ui/ImagemComFallback'
import { avisar } from '@/components/feedback/Avisos'
import { IconeConversa, IconeCoracao, IconeMarcador, IconeSelo, IconeSetaDireita } from '@/components/ui/Icones'
import { emMilhares, type Comentario, type Video } from '@/mocks/videos'
import { fallbackDe } from '@/mocks/imagens'
import { emReais } from '@/utils/formato'

type Autor = { slug: string; nome: string; imagem: string; territorio: string }
type PecaVinculada = { slug: string; nome: string; preco: number; imagem: string }

type Props = {
  video: Video
  artesao?: Autor
  peca?: PecaVinculada
  comentarios: Comentario[]
}

export default function CartaoVideo({ video, artesao, peca, comentarios }: Props) {
  const [curtido, definirCurtido] = useState(false)
  const [salvo, definirSalvo] = useState(false)
  const [aberto, definirAberto] = useState(false)
  const [visivel, definirVisivel] = useState(false)
  const [lista, definirLista] = useState(comentarios)
  const [rascunho, definirRascunho] = useState('')
  const campoComentario = useRef<HTMLInputElement>(null)
  const refArtigo = useRef<HTMLElement>(null)
  const refComentarios = useRef<HTMLDialogElement>(null)

  const painelId = `comentarios-${video.id}`
  const totalComentarios = video.comentarios + (lista.length - comentarios.length)

  useEffect(() => {
    const artigo = refArtigo.current
    if (!artigo) return
    const observador = new IntersectionObserver(
      (entradas) => {
        for (const entrada of entradas) definirVisivel(entrada.intersectionRatio >= 0.6)
      },
      { threshold: [0.6] },
    )
    observador.observe(artigo)
    return () => observador.disconnect()
  }, [])

  useEffect(() => {
    if (visivel) return
    const dialogo = refComentarios.current
    if (!dialogo?.open) return
    dialogo.close()
    definirAberto(false)
  }, [visivel])

  useEffect(() => {
    const listaLarga = window.matchMedia('(min-width: 900px)')
    function trocarModo() {
      const dialogo = refComentarios.current
      if (!dialogo || !dialogo.open) return
      dialogo.close()
      if (listaLarga.matches) dialogo.show()
      else dialogo.showModal()
      definirAberto(true)
    }
    listaLarga.addEventListener('change', trocarModo)
    return () => listaLarga.removeEventListener('change', trocarModo)
  }, [])

  function fecharComentarios() {
    refComentarios.current?.close()
    definirAberto(false)
  }

  function alternarComentarios() {
    const dialogo = refComentarios.current
    if (!dialogo) return
    if (dialogo.open) {
      fecharComentarios()
      return
    }
    if (window.matchMedia('(min-width: 900px)').matches) dialogo.show()
    else dialogo.showModal()
    definirAberto(true)
  }

  function alternarSalvo() {
    const proximoSalvo = !salvo
    definirSalvo(proximoSalvo)
    if (proximoSalvo) avisar.sucesso('Vídeo salvo para ver depois')
  }

  function responder(autor: string) {
    definirRascunho(`@${autor} `)
    campoComentario.current?.focus()
  }

  function enviarComentario(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    const texto = rascunho.trim()
    if (!texto) return
    definirLista([...lista, { autor: 'Você', texto, quando: 'agora', curtidas: 0 }])
    definirRascunho('')
  }

  return (
    <article className={`video${aberto ? ' video-aberto' : ''}`} id={video.id} ref={refArtigo} data-ativo={visivel}>
      <div className="video-principal">
        <div className="video-tela">
          <ImagemComFallback className="video-capa" src={video.capa} reserva={fallbackDe(video.capa)} alt="" loading="lazy" />

          <span className="video-progresso" aria-hidden>
            <span className="video-progresso-preenchido" />
          </span>

          <span className="video-duracao">{video.duracao}</span>

          <button type="button" className="video-play" aria-label="Reproduzir vídeo">
            <svg viewBox="0 0 24 24" width="26" height="26" fill="currentColor" aria-hidden>
              <path d="M8 5.5v13l11-6.5z" />
            </svg>
          </button>

          <div className="video-rodape">
            {artesao && (
              <Link href={`/artisans/${artesao.slug}`} className="video-autor">
                <Retrato imagem={artesao.imagem} tamanho={40} />
                <span className="encolhivel">
                  <span className="video-autor-nome">{artesao.nome}</span>
                  <span className="video-autor-local">
                    {artesao.territorio} · {video.publicadoEm}
                  </span>
                </span>
              </Link>
            )}

            <p className="video-legenda">{video.legenda}</p>

            <p className="video-etiquetas">
              {video.etiquetas.map((e) => (
                <span key={e}>#{e}</span>
              ))}
            </p>

            {peca && (
              <Link href={`/pieces/${peca.slug}`} className="video-peca">
                <ImagemComFallback src={peca.imagem} reserva={fallbackDe(peca.imagem)} alt="" loading="lazy" />
                <span className="encolhivel">
                  <span className="video-peca-nome">{peca.nome}</span>
                  <span className="video-peca-preco">{emReais(peca.preco)}</span>
                </span>
                <IconeSetaDireita tamanho={16} />
              </Link>
            )}
          </div>
        </div>

        <div className="acoes-video">
            <button
              type="button"
              className={`acao-video${curtido ? ' acao-video-ativa' : ''}`}
              onClick={() => definirCurtido((v) => !v)}
              aria-pressed={curtido}
            >
              <span className="acao-video-bolha">
                <IconeCoracao tamanho={22} preenchido={curtido} />
              </span>
              <span className="acao-video-numero">{emMilhares(video.curtidas + (curtido ? 1 : 0))}</span>
              <span className="so-leitor">{curtido ? 'Descurtir vídeo' : 'Curtir vídeo'}</span>
            </button>

            <button
              type="button"
              className={`acao-video${aberto ? ' acao-video-ativa' : ''}`}
              onClick={alternarComentarios}
              aria-haspopup="dialog"
              aria-controls={painelId}
            >
              <span className="acao-video-bolha">
                <IconeConversa tamanho={22} />
              </span>
              <span className="acao-video-numero">{emMilhares(totalComentarios)}</span>
              <span className="so-leitor">{aberto ? 'Fechar comentários' : 'Ver comentários'}</span>
            </button>

            <button
              type="button"
              className={`acao-video${salvo ? ' acao-video-ativa' : ''}`}
              onClick={alternarSalvo}
              aria-pressed={salvo}
            >
              <span className="acao-video-bolha">
                <IconeMarcador tamanho={22} preenchido={salvo} />
              </span>
              <span className="acao-video-numero">{salvo ? 'Salvo' : 'Salvar'}</span>
            </button>
          </div>
      </div>

      <dialog
        className="comentarios"
        id={painelId}
        ref={refComentarios}
        aria-label={`Comentários do vídeo de ${artesao?.nome ?? 'artesão'}`}
        onClose={() => {
          if (!refComentarios.current?.open) definirAberto(false)
        }}
      >
        <div className="comentarios-topo">
            <div className="encolhivel">
              <h3 className="secao-titulo" style={{ fontSize: 17, margin: 0 }}>
                {emMilhares(totalComentarios)} comentários
              </h3>
              <p className="video-metricas">
                {emMilhares(video.visualizacoes)} visualizações · {video.duracao} · {video.publicadoEm}
              </p>
            </div>
            <button type="button" className="botao-texto" onClick={fecharComentarios}>
              Fechar
            </button>
          </div>

          <ul className="lista-comentarios">
            {lista.map((c) => (
              <li className="comentario" key={c.autor + c.quando + c.texto}>
                <span className="comentario-inicial" aria-hidden>
                  {c.autor.charAt(0)}
                </span>
                <div className="encolhivel">
                  <p className="comentario-cabeca">
                    <span className="comentario-autor">{c.autor}</span>
                    {c.artesao && (
                      <span className="selo selo-neutro">
                        <IconeSelo tamanho={11} />
                        artesão
                      </span>
                    )}
                    <span className="dado-rotulo">{c.quando}</span>
                  </p>
                  <p className="comentario-texto">{c.texto}</p>
                  <p className="comentario-acoes">
                    <span>{c.curtidas} curtidas</span>
                    <button type="button" onClick={() => responder(c.autor)}>
                      Responder
                    </button>
                  </p>

                  {c.resposta && artesao && (
                    <div className="resposta">
                      <Retrato imagem={artesao.imagem} tamanho={28} />
                      <div className="encolhivel">
                        <p className="comentario-cabeca">
                          <span className="comentario-autor">{artesao.nome}</span>
                          <span className="selo selo-encomenda">autor do vídeo</span>
                          <span className="dado-rotulo">{c.resposta.quando}</span>
                        </p>
                        <p className="comentario-texto">{c.resposta.texto}</p>
                      </div>
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>

          <form className="novo-comentario" onSubmit={enviarComentario}>
            <label className="so-leitor" htmlFor={`escrever-${video.id}`}>
              Escrever um comentário
            </label>
            <input
              id={`escrever-${video.id}`}
              ref={campoComentario}
              placeholder="Comente algo gentil ou faça uma pergunta..."
              value={rascunho}
              onChange={(evento) => definirRascunho(evento.target.value)}
            />
            <button type="submit" className="botao botao-primario" style={{ padding: '0 18px' }}>
              Enviar
            </button>
          </form>
      </dialog>
    </article>
  )
}
