'use client'

import Link from 'next/link'
import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Retrato } from '@/components/ui/Basicos'
import ImagemComFallback from '@/components/ui/ImagemComFallback'
import { comentarVideo, comentariosDe } from '@/services/api/videos.servico'
import { avisar } from '@/components/feedback/Avisos'
import { IconeConversa, IconeCoracao, IconeMarcador, IconeSelo, IconeSetaDireita } from '@/components/ui/Icones'
import { emMilhares, emReais } from '@/utils/formato'
import type { Comentario, Video } from '@/types/dominio'
import { fallbackDe } from '@/utils/imagem'
import { obterEstado, salvarVideosCurtidos, salvarVideosSalvos } from '@/services/api/estado.servico'
import { useEstadoCliente } from '@/store/estadoCliente'

type Autor = { slug: string; nome: string; imagem: string; territorio: string }
type PecaVinculada = { slug: string; nome: string; preco: number; imagem: string }
type LeituraComentarios = 'inicial' | 'carregando' | 'pronto' | 'erro'

const atualizacoes = new Map<string, Promise<void>>()

function serializarAtualizacao(chave: string, atualizar: () => Promise<void>): Promise<void> {
  const anterior = atualizacoes.get(chave) ?? Promise.resolve()
  const atual = anterior.catch(() => {}).then(atualizar)
  atualizacoes.set(chave, atual)
  const limpar = () => {
    if (atualizacoes.get(chave) === atual) atualizacoes.delete(chave)
  }
  void atual.then(limpar, limpar)
  return atual
}

type Props = {
  video: Video
  artesao?: Autor
  peca?: PecaVinculada
}

export default function CartaoVideo({ video, artesao, peca }: Props) {
  const { estado, pronto, erro, recarregar, atualizarEstado } = useEstadoCliente()
  const [salvando, definirSalvando] = useState(false)
  const [curtidaLocal, definirCurtido] = useState<boolean | null>(null)
  const [salvoLocal, definirSalvo] = useState<boolean | null>(null)
  const [aberto, definirAberto] = useState(false)
  const [visivel, definirVisivel] = useState(false)
  const [lista, definirLista] = useState<Comentario[]>([])
  const [totalLocal, definirTotalLocal] = useState<number | null>(null)
  const [leituraComentarios, definirLeituraComentarios] = useState<LeituraComentarios>('inicial')
  const [erroComentarios, definirErroComentarios] = useState<string | null>(null)
  const [rascunho, definirRascunho] = useState('')
  const campoComentario = useRef<HTMLInputElement>(null)
  const refArtigo = useRef<HTMLElement>(null)
  const refComentarios = useRef<HTMLDialogElement>(null)
  const montado = useRef(true)
  const leituraAtual = useRef<LeituraComentarios>('inicial')
  const envioEmAndamento = useRef(false)
  const curtidaEmAndamento = useRef(false)
  const salvoEmAndamento = useRef(false)

  const painelId = `comentarios-${video.id}`
  const totalComentarios = Math.max(video.comentarios, totalLocal ?? video.comentarios)
  const curtido = curtidaLocal ?? (estado?.videosCurtidos.includes(video.id) ?? false)
  const salvo = salvoLocal ?? (estado?.videosSalvos.includes(video.id) ?? false)

  useEffect(() => {
    montado.current = true
    return () => { montado.current = false }
  }, [])

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

  async function carregarComentarios() {
    if (!montado.current || leituraAtual.current === 'carregando' || leituraAtual.current === 'pronto') return
    leituraAtual.current = 'carregando'
    definirLeituraComentarios('carregando')
    definirErroComentarios(null)
    try {
      const resposta = await comentariosDe(video.id)
      if (!montado.current) return
      if (resposta.erro || !resposta.dados) {
        leituraAtual.current = 'erro'
        definirLeituraComentarios('erro')
        definirErroComentarios(resposta.erro?.mensagem ?? 'Não foi possível carregar os comentários.')
        return
      }
      definirLista(resposta.dados)
      leituraAtual.current = 'pronto'
      definirLeituraComentarios('pronto')
    } catch {
      if (!montado.current) return
      leituraAtual.current = 'erro'
      definirLeituraComentarios('erro')
      definirErroComentarios('Não foi possível carregar os comentários. Tente novamente.')
    }
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
    void carregarComentarios()
  }

  async function alternarSalvo() {
    if (!montado.current || !pronto || !estado || salvoEmAndamento.current) return
    salvoEmAndamento.current = true
    const proximoSalvo = !salvo
    definirSalvo(proximoSalvo)
    try {
      await serializarAtualizacao(`${estado.id}:videosSalvos`, async () => {
        if (!montado.current) return
        const { dados, erro } = await obterEstado()
        if (!montado.current) return
        if (!dados) {
          definirSalvo(!proximoSalvo)
          avisar.erro('Não foi possível atualizar os vídeos salvos', erro?.mensagem)
          return
        }
        const lista = proximoSalvo
          ? [...new Set([...dados.videosSalvos, video.id])]
          : dados.videosSalvos.filter((id) => id !== video.id)
        const resposta = await salvarVideosSalvos(lista)
        if (!resposta.erro && resposta.dados) atualizarEstado({ videosSalvos: resposta.dados })
        if (!montado.current) return
        if (resposta.erro || !resposta.dados) {
          definirSalvo(!proximoSalvo)
          avisar.erro('Não foi possível atualizar os vídeos salvos', resposta.erro?.mensagem)
          return
        }
        definirSalvo(null)
        if (proximoSalvo) avisar.sucesso('Vídeo salvo para ver depois')
      })
    } catch {
      if (montado.current) {
        definirSalvo(!proximoSalvo)
        avisar.erro('Não foi possível atualizar os vídeos salvos', 'Tente novamente.')
      }
    } finally {
      salvoEmAndamento.current = false
    }
  }

  async function alternarCurtida() {
    if (!montado.current || !pronto || !estado || curtidaEmAndamento.current) return
    curtidaEmAndamento.current = true
    const proximo = !curtido
    definirCurtido(proximo)
    try {
      await serializarAtualizacao(`${estado.id}:videosCurtidos`, async () => {
        if (!montado.current) return
        const { dados, erro } = await obterEstado()
        if (!montado.current) return
        if (!dados) {
          definirCurtido(!proximo)
          avisar.erro('Não foi possível registrar a curtida', erro?.mensagem)
          return
        }
        const lista = proximo
          ? [...new Set([...dados.videosCurtidos, video.id])]
          : dados.videosCurtidos.filter((id) => id !== video.id)
        const resposta = await salvarVideosCurtidos(lista)
        if (!resposta.erro && resposta.dados) atualizarEstado({ videosCurtidos: resposta.dados })
        if (!montado.current) return
        if (resposta.erro || !resposta.dados) {
          definirCurtido(!proximo)
          avisar.erro('Não foi possível registrar a curtida', resposta.erro?.mensagem)
          return
        }
        definirCurtido(null)
      })
    } catch {
      if (montado.current) {
        definirCurtido(!proximo)
        avisar.erro('Não foi possível registrar a curtida', 'Tente novamente.')
      }
    } finally {
      curtidaEmAndamento.current = false
    }
  }

  function responder(autor: string) {
    definirRascunho(`@${autor} `)
    campoComentario.current?.focus()
  }

  async function enviarComentario(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    const texto = rascunho.trim()
    if (!montado.current || !texto || envioEmAndamento.current || leituraAtual.current !== 'pronto') return
    envioEmAndamento.current = true
    definirSalvando(true)
    try {
      const resposta = await comentarVideo(video.id, { autor: 'Você', texto, quando: 'agora', curtidas: 0 })
      if (!montado.current) return
      if (resposta.erro || !resposta.dados) { avisar.erro('Não foi possível comentar', resposta.erro?.mensagem); return }
      definirLista((atuais) => [...atuais, resposta.dados!])
      definirTotalLocal((atual) => Math.max(atual ?? video.comentarios, video.comentarios) + 1)
      definirRascunho((atual) => atual.trim() === texto ? '' : atual)
    } catch {
      if (montado.current) avisar.erro('Não foi possível comentar', 'Seu texto foi mantido. Tente novamente.')
    } finally {
      envioEmAndamento.current = false
      if (montado.current) definirSalvando(false)
    }
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
              onClick={alternarCurtida}
              aria-pressed={curtido}
              disabled={!pronto || !estado}
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
              disabled={!pronto || !estado}
            >
              <span className="acao-video-bolha">
                <IconeMarcador tamanho={22} preenchido={salvo} />
              </span>
              <span className="acao-video-numero">{salvo ? 'Salvo' : 'Salvar'}</span>
            </button>
          </div>
      </div>

      {pronto && !estado && (
        <div className="acima-3">
          <p className="campo-erro" role="alert">{erro ?? 'Não foi possível carregar suas interações.'}</p>
          <button type="button" className="botao botao-secundario acima-2" onClick={recarregar}>
            Tentar novamente
          </button>
        </div>
      )}

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

          {leituraComentarios === 'carregando' && <p className="campo-ajuda acima-3" role="status">Carregando comentários…</p>}
          {leituraComentarios === 'erro' && (
            <div className="acima-3">
              <p className="campo-erro" role="alert">{erroComentarios}</p>
              <button type="button" className="botao botao-secundario acima-2" onClick={() => void carregarComentarios()}>
                Tentar novamente
              </button>
            </div>
          )}
          {leituraComentarios === 'pronto' && lista.length === 0 && (
            <p className="campo-ajuda acima-3">Nenhum comentário ainda. Comece a conversa.</p>
          )}
          <ul className="lista-comentarios" aria-busy={leituraComentarios === 'carregando'}>
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
            <button disabled={salvando || leituraComentarios !== 'pronto'} type="submit" className="botao botao-primario" style={{ padding: '0 18px' }}>
              Enviar
            </button>
          </form>
      </dialog>
    </article>
  )
}
