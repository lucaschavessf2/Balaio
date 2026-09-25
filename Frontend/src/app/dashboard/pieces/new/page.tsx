'use client'

import { useRouter } from 'next/navigation'
import { atualizarPeca, criarPeca } from '@/services/api/pecas.servico'
import { gerarSlugEvento } from '@/components/eventos/eventosLocais'
import type { Peca, Tecnica } from '@/types/dominio'
import type { TipoPeca } from '@/constants/referencias'
import { useEffect, useRef, useState, type ChangeEvent, type DragEvent, type FormEvent } from 'react'
import { Campo, Migalhas } from '@/components/ui/Basicos'
import { avisar } from '@/components/feedback/Avisos'
import { numeroDoPreco, validarObrigatorio, validarPreco, validarPrazoDias } from '@/utils/validacao'
import { IconeAviso, IconePincel } from '@/components/ui/Icones'
import EstadoCarregando from '@/components/feedback/EstadoCarregando'
import { useReferencias } from '@/hooks/useReferencias'
import { useSessao } from '@/store/sessao'
import { type Disponibilidade } from '@/types/dominio'
import { emReais } from '@/utils/formato'

const sugestao = { materiais: 180, horas: 14, valorHora: 22 }
const MAX_FOTOS = 5
const MAX_TAMANHO_ARQUIVO_MB = 5

type FotoSelecionada = {
  id: string
  nome: string
  url: string
  arquivo?: File
}

type Props = { initialPeca?: Peca }

function lerImagem(arquivo: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const leitor = new FileReader()
    leitor.onload = () => typeof leitor.result === 'string'
      ? resolve(leitor.result)
      : reject(new Error('Não foi possível ler a imagem.'))
    leitor.onerror = () => reject(new Error('Não foi possível ler a imagem.'))
    leitor.onabort = () => reject(new Error('Leitura cancelada.'))
    leitor.readAsDataURL(arquivo)
  })
}

export default function NovaPeca({ initialPeca }: Props) {
  const roteador = useRouter()
  const { sessao } = useSessao()
  const [salvando, definirSalvando] = useState(false)
  const { tecnicas, territorios, categorias, tipos, carregando } = useReferencias()
  const [disponibilidade, definirDisponibilidade] = useState<Disponibilidade>(initialPeca?.disponibilidade ?? 'disponivel')
  const [preco, definirPreco] = useState(() => initialPeca?.preco === undefined ? '' : emReais(initialPeca.preco))
  const [erros, definirErros] = useState<Record<string, string>>({})
  const fotosIniciais = initialPeca
    ? initialPeca.fotos?.length
      ? initialPeca.fotos.map((foto) => ({ ...foto }))
      : [{ id: `${initialPeca.slug}-capa`, nome: initialPeca.nome, url: initialPeca.imagem }]
    : []
  const [fotosSelecionadas, definirFotosSelecionadas] = useState<FotoSelecionada[]>(fotosIniciais)
  const formulario = useRef<HTMLFormElement>(null)
  const entradaFotos = useRef<HTMLInputElement>(null)
  const fotosAtuais = useRef<FotoSelecionada[]>(fotosIniciais)
  const urlsLocais = useRef(new Set<string>())
  const envioEmAndamento = useRef(false)
  const profundidadeArraste = useRef(0)
  const [arrastando, definirArrastando] = useState(false)
  const [erroFotos, definirErroFotos] = useState('')

  useEffect(() => {
    const urls = urlsLocais.current
    // Evita que soltar um arquivo fora do campo abra a imagem e perca o formulário.
    function impedirNavegacao(evento: globalThis.DragEvent) {
      if (Array.from(evento.dataTransfer?.types ?? []).includes('Files')) {
        evento.preventDefault()
      }
    }
    window.addEventListener('dragover', impedirNavegacao)
    window.addEventListener('drop', impedirNavegacao)
    return () => {
      window.removeEventListener('dragover', impedirNavegacao)
      window.removeEventListener('drop', impedirNavegacao)
      urls.forEach((url) => URL.revokeObjectURL(url))
      urls.clear()
    }
  }, [])
  const precoSugerido = sugestao.materiais + sugestao.horas * sugestao.valorHora

  if (carregando) {
    return (
      <>
        <Migalhas
          trilha={[
            { texto: 'Painel do artesão', href: '/dashboard' },
            { texto: 'Minhas peças', href: '/dashboard/pieces' },
            { texto: 'Nova peça' },
          ]}
        />
        <h1 className="titulo-pagina">Cadastrar uma peça</h1>
        <EstadoCarregando rotulo="Carregando o formulário…" cartoes={0} />
      </>
    )
  }

  function validar(rascunho: boolean): boolean {
    const form = formulario.current
    if (!form) return false
    const dados = new FormData(form)
    const proximosErros: Record<string, string> = {}

    const problemaNome = validarObrigatorio(String(dados.get('nome') ?? ''), 'Dê um nome à peça')
    if (problemaNome) proximosErros['peca-nome'] = problemaNome

    if (!rascunho) {
      const problemaPreco = validarPreco(String(dados.get('preco') ?? ''))
      if (problemaPreco) proximosErros['peca-preco'] = problemaPreco

      if (disponibilidade === 'encomenda') {
        const problemaPrazo = validarPrazoDias(String(dados.get('prazo') ?? ''))
        if (problemaPrazo) proximosErros['peca-prazo'] = problemaPrazo
      }
    }

    definirErros(proximosErros)
    const primeiro = Object.keys(proximosErros)[0]
    if (primeiro) {
      document.getElementById(primeiro)?.focus()
      avisar.erro('Confira os campos destacados')
      return false
    }
    return true
  }

  function atualizarFotos(fotos: FotoSelecionada[]) {
    fotosAtuais.current = fotos
    definirFotosSelecionadas(fotos)
  }

  function liberarMiniatura(url: string) {
    URL.revokeObjectURL(url)
    urlsLocais.current.delete(url)
  }

  function limparFormulario() {
    formulario.current?.reset()
    definirDisponibilidade('disponivel')
    fotosAtuais.current.forEach((foto) => liberarMiniatura(foto.url))
    atualizarFotos([])
    definirErroFotos('')
    definirErros({})
  }

  function moverFoto(indice: number, direcao: -1 | 1) {
    if (envioEmAndamento.current) return
    const novas = [...fotosAtuais.current]
    const alvo = indice + direcao
    if (!novas[indice] || alvo < 0 || alvo >= novas.length) return
    ;[novas[indice], novas[alvo]] = [novas[alvo], novas[indice]]
    atualizarFotos(novas)
  }

  function removerFoto(id: string) {
    if (envioEmAndamento.current) return
    const foto = fotosAtuais.current.find((item) => item.id === id)
    if (!foto) return
    atualizarFotos(fotosAtuais.current.filter((item) => item.id !== id))
    liberarMiniatura(foto.url)
    definirErroFotos('')
  }

  // O seletor e o arrastar/soltar usam exatamente as mesmas validações.
  function adicionarFotos(arquivos: File[]) {
    if (envioEmAndamento.current || !arquivos.length) return
    definirErroFotos('')
    let erro = ''
    if (fotosAtuais.current.length + arquivos.length > MAX_FOTOS) {
      erro = `Você pode adicionar até ${MAX_FOTOS} fotos. Já selecionou ${fotosAtuais.current.length}.`
    } else {
      const invalido = arquivos.find((arquivo) => !arquivo.type.startsWith('image/'))
      const grande = arquivos.find((arquivo) => arquivo.size > MAX_TAMANHO_ARQUIVO_MB * 1024 * 1024)
      const vazio = arquivos.find((arquivo) => arquivo.size === 0)
      if (invalido) erro = `O arquivo "${invalido.name}" não é uma imagem aceita.`
      else if (grande) erro = `O arquivo "${grande.name}" excede o limite de ${MAX_TAMANHO_ARQUIVO_MB} MB.`
      else if (vazio) erro = `O arquivo "${vazio.name}" está vazio.`
    }
    if (erro) {
      definirErroFotos(erro)
      avisar.erro(erro)
      return
    }
    const novas = arquivos.map((arquivo) => {
      const url = URL.createObjectURL(arquivo)
      urlsLocais.current.add(url)
      return { id: crypto.randomUUID(), nome: arquivo.name, url, arquivo }
    })
    atualizarFotos([...fotosAtuais.current, ...novas])
    avisar.sucesso(`${novas.length} ${novas.length === 1 ? 'foto adicionada' : 'fotos adicionadas'}`)
  }

  function selecionarFotos(evento: ChangeEvent<HTMLInputElement>) {
    const arquivos = Array.from(evento.currentTarget.files ?? [])
    // O input fica disponível inclusive para selecionar novamente o mesmo arquivo.
    evento.currentTarget.value = ''
    adicionarFotos(arquivos)
  }

  function receberFotosArrastadas(evento: DragEvent<HTMLDivElement>) {
    evento.preventDefault()
    evento.stopPropagation()
    profundidadeArraste.current = 0
    definirArrastando(false)
    if (envioEmAndamento.current) return
    const arquivos = Array.from(evento.dataTransfer.files)
    if (!arquivos.length) {
      definirErroFotos('Arraste arquivos de imagem do seu computador. Links de imagens não são aceitos.')
      return
    }
    adicionarFotos(arquivos)
  }

  async function salvar(rascunho: boolean) {
    if (envioEmAndamento.current || !validar(rascunho) || !sessao?.artesao) return
    const dados = new FormData(formulario.current!)
    envioEmAndamento.current = true
    definirSalvando(true)
    try {
      // blob: é usado só nas miniaturas. A fake API recebe imagens serializáveis.
      const fotosParaEnviar = await Promise.all(fotosAtuais.current.map(async (foto, indice) => ({
        id: foto.id,
        nome: foto.nome,
        url: foto.arquivo ? await lerImagem(foto.arquivo) : foto.url,
        ordem: indice,
      })))
      const peca = {
        slug: initialPeca?.slug ?? gerarSlugEvento(String(dados.get('nome'))), nome: String(dados.get('nome')).trim(),
        artesao: sessao.artesao, tecnica: String(dados.get('tecnica')) as Tecnica,
        territorio: String(dados.get('territorio')), categoria: String(dados.get('categoria')),
        tipo: String(dados.get('tipo')) as TipoPeca,
        historia: [String(dados.get('historia') || '')],
        preco: numeroDoPreco(String(dados.get('preco') || '0')) || 0,
        disponibilidade, prazoProducaoDias: disponibilidade === 'encomenda' ? Number(dados.get('prazo')) : undefined,
        imagem: fotosParaEnviar[0]?.url ?? '/fotos/ImagemBase.webp',
        fotos: fotosParaEnviar,
        ordemFotos: fotosParaEnviar.map((foto) => foto.id),
        situacao: initialPeca?.situacao ?? (rascunho ? 'rascunho' : 'curadoria'),
      }
      const resposta = initialPeca
        ? await atualizarPeca(initialPeca.slug, peca)
        : await criarPeca(peca)
      if (resposta.erro) { avisar.erro('Não foi possível salvar', resposta.erro.mensagem); return }
      if (!initialPeca) limparFormulario()
      avisar.sucesso(initialPeca ? 'Peça atualizada' : rascunho ? 'Rascunho salvo' : 'Peça enviada para curadoria')
      roteador.refresh()
    } catch {
      avisar.erro('Não foi possível salvar', 'Confira a conexão e tente novamente. Suas fotos foram mantidas.')
    } finally {
      envioEmAndamento.current = false
      definirSalvando(false)
    }
  }
  function enviarParaCuradoria(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    void salvar(false)
  }
  function salvarRascunho() { void salvar(true) }

  return (
    <>
      <Migalhas
        trilha={[
          { texto: 'Painel do artesão', href: '/dashboard' },
          { texto: 'Minhas peças', href: '/dashboard/pieces' },
          { texto: initialPeca ? 'Editar peça' : 'Nova peça' },
        ]}
      />
      <h1 className="titulo-pagina">{initialPeca ? 'Editar peça' : 'Cadastrar uma peça'}</h1>
      <p className="subtitulo-pagina">
        Preencha com calma. Quanto mais você contar sobre a origem e a técnica, mais fácil o comprador reconhecer o
        valor do seu trabalho.
      </p>

      <div className="duas-colunas">
        <form ref={formulario} onSubmit={enviarParaCuradoria} noValidate>
          <section className="cartao abaixo-5">
            <h2 className="secao-titulo">O básico</h2>

            <Campo rotulo="Nome da peça" ajuda="Como você chamaria essa peça na feira." erro={erros['peca-nome']} id="peca-nome">
              <input id="peca-nome" name="nome" placeholder="Ex.: Leão Imperial de Tracunhaém" defaultValue={initialPeca?.nome} />
            </Campo>

            <div className="grade-dois">
              <Campo rotulo="Técnica" id="peca-tecnica">
                <select id="peca-tecnica" name="tecnica" defaultValue={initialPeca?.tecnica ?? tecnicas[0]}>
                  {tecnicas.map((t) => (
                    <option key={t}>{t}</option>
                  ))}
                </select>
              </Campo>

              <Campo rotulo="Tipo de peça" ajuda="É por aqui que o comprador filtra na loja." id="peca-tipo">
                <select id="peca-tipo" name="tipo" defaultValue={initialPeca?.tipo ?? tipos[0]}>
                  {tipos.map((t) => (
                    <option key={t}>{t}</option>
                  ))}
                </select>
              </Campo>
            </div>

            <div className="grade-dois">
              <Campo rotulo="Categoria" id="peca-categoria">
                <select id="peca-categoria" name="categoria" defaultValue={initialPeca?.categoria ?? categorias[0]}>
                  {categorias.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </Campo>

              <Campo rotulo="Território de origem" id="peca-territorio">
                <select id="peca-territorio" name="territorio" defaultValue={initialPeca?.territorio ?? territorios[0]}>
                  {territorios.map((t) => (
                    <option key={t}>{t}</option>
                  ))}
                </select>
              </Campo>
            </div>

            <Campo
              rotulo="História da peça"
              ajuda="Conte de onde vem, como é feita, quanto tempo leva. É isso que diferencia do industrializado."
              id="peca-historia"
            >
              <textarea id="peca-historia" name="historia" placeholder="Cada linha da juba é esculpida uma a uma, num ritual de paciência que dura dias..." defaultValue={initialPeca?.historia.join('\n')} />
            </Campo>
          </section>

          <section className="cartao abaixo-5">
            <h2 className="secao-titulo">Fotos</h2>
            <div
              className="area-upload"
              style={{
                display: 'block', padding: 16,
                outline: arrastando ? '2px solid var(--tinta)' : undefined,
                outlineOffset: 3,
              }}
              onDragEnter={(evento) => {
                evento.preventDefault()
                if (envioEmAndamento.current || !Array.from(evento.dataTransfer.types).includes('Files')) return
                profundidadeArraste.current += 1
                definirArrastando(true)
              }}
              onDragOver={(evento) => {
                evento.preventDefault()
                evento.dataTransfer.dropEffect = salvando ? 'none' : 'copy'
              }}
              onDragLeave={(evento) => {
                evento.preventDefault()
                profundidadeArraste.current = Math.max(0, profundidadeArraste.current - 1)
                if (profundidadeArraste.current === 0) definirArrastando(false)
              }}
              onDrop={receberFotosArrastadas}
              aria-busy={salvando}
            >
              <IconePincel tamanho={26} />
              <p style={{ fontWeight: 600 }} aria-live="polite">
                {arrastando ? 'Solte as imagens aqui' : `${fotosSelecionadas.length} de ${MAX_FOTOS} fotos selecionadas`}
              </p>
              <p id="ajuda-fotos" className="campo-ajuda">
                Arraste imagens do seu computador ou use o botão abaixo.
                Até {MAX_FOTOS} fotos de {MAX_TAMANHO_ARQUIVO_MB} MB cada.
                A primeira foto será a capa. Use as setas para ordenar.
              </p>
              <input
                ref={entradaFotos}
                type="file"
                accept="image/*"
                multiple
                hidden
                disabled={salvando}
                onChange={selecionarFotos}
              />
              <button
                type="button"
                className="botao botao-fantasma"
                onClick={() => entradaFotos.current?.click()}
                disabled={salvando}
                aria-describedby={erroFotos ? 'ajuda-fotos erro-fotos' : 'ajuda-fotos'}
              >
                {fotosSelecionadas.length ? 'Adicionar mais fotos' : 'Escolher fotos'}
              </button>
              {erroFotos && <p id="erro-fotos" role="alert" style={{ color: '#b91c1c' }}>{erroFotos}</p>}
              {fotosSelecionadas.length > 0 && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 12, marginTop: 16 }}>
                  {fotosSelecionadas.map((foto, indice) => (
                    <div key={foto.id} style={{ background: '#fff', borderRadius: 12, border: '1px solid rgba(15, 23, 42, 0.12)', padding: 8, minWidth: 0 }}>
                      <img
                        src={foto.url}
                        alt={`Foto ${indice + 1}: ${foto.nome}`}
                        draggable={false}
                        style={{ width: '100%', height: 100, objectFit: 'cover', borderRadius: 8 }}
                      />
                      <p title={foto.nome} style={{ fontSize: 12, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{foto.nome}</p>
                      <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                        <button
                          type="button"
                          className="botao botao-fantasma"
                          aria-label={`Mover foto ${indice + 1} para antes`}
                          onClick={() => moverFoto(indice, -1)}
                          disabled={salvando || indice === 0}
                          style={{
                            flex: 1,
                            minWidth: 0,
                            padding: '0.5rem 0.75rem',
                            fontSize: 12,
                            lineHeight: 1,
                            borderRadius: 999,
                            justifyContent: 'center',
                          }}
                        >
                          ←
                        </button>
                        <button
                          type="button"
                          className="botao botao-fantasma"
                          aria-label={`Mover foto ${indice + 1} para depois`}
                          onClick={() => moverFoto(indice, 1)}
                          disabled={salvando || indice === fotosSelecionadas.length - 1}
                          style={{
                            flex: 1,
                            minWidth: 0,
                            padding: '0.5rem 0.75rem',
                            fontSize: 12,
                            lineHeight: 1,
                            borderRadius: 999,
                            justifyContent: 'center',
                          }}
                        >
                          →
                        </button>
                        <button
                          type="button"
                          className="botao botao-fantasma"
                          aria-label={`Remover foto ${indice + 1}`}
                          onClick={() => removerFoto(foto.id)}
                          disabled={salvando}
                          style={{
                            flex: 1,
                            minWidth: 0,
                            padding: '0.5rem 0.75rem',
                            fontSize: 12,
                            lineHeight: 1,
                            borderRadius: 999,
                            justifyContent: 'center',
                            color: '#b91c1c',
                            borderColor: 'rgba(185, 28, 28, 0.4)',
                          }}
                        >
                          ✕
                        </button>
                      </div>
                      <span style={{ display: 'block', fontSize: 12, marginTop: 8 }}>{indice === 0 ? '1 — Capa' : `${indice + 1}`}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

          <section className="cartao">
            <h2 className="secao-titulo">Disponibilidade e preço</h2>

            <fieldset style={{ border: 0, padding: 0, marginBottom: 18 }}>
              <legend className="campo-rotulo abaixo-3">Como essa peça funciona?</legend>
              <div className="opcoes">
                {(
                  [
                    ['disponivel', 'Tenho pronta para enviar', 'Sai do estoque assim que alguém comprar.'],
                    ['unica', 'É peça única', 'Some do catálogo depois de vendida.'],
                    ['encomenda', 'Faço sob encomenda', 'Você define o prazo de produção.'],
                  ] as [Disponibilidade, string, string][]
                ).map(([id, texto, ajuda]) => (
                  <label className="opcao opcao-topo" key={id}>
                    <input
                      type="radio"
                      name="disponibilidade"
                      checked={disponibilidade === id}
                      onChange={() => definirDisponibilidade(id)}
                    />
                    <span className="encolhivel">
                      <span style={{ fontWeight: 600, display: 'block' }}>{texto}</span>
                      <span className="campo-ajuda">{ajuda}</span>
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>

            {disponibilidade === 'encomenda' && (
              <Campo
                rotulo="Prazo de produção (em dias)"
                ajuda="Seja realista: o prazo aparece para o comprador antes da compra."
                erro={erros['peca-prazo']}
                id="peca-prazo"
              >
                <input id="peca-prazo" name="prazo" type="number" defaultValue={initialPeca?.prazoProducaoDias ?? 15} min={1} max={120} />
              </Campo>
            )}

            <Campo rotulo="Preço" ajuda="O valor é exibido em reais ao sair do campo." erro={erros['peca-preco']} id="peca-preco">
              <input
                id="peca-preco"
                name="preco"
                inputMode="decimal"
                placeholder="R$ 0,00"
                value={preco}
                onFocus={() => definirPreco((valor) => valor.replace(/^R\$\s*/, ''))}
                onChange={(evento) => definirPreco(evento.target.value.replace(/[^\d,.]/g, ''))}
                onBlur={() => {
                  const valor = numeroDoPreco(preco)
                  if (Number.isFinite(valor) && valor > 0) definirPreco(emReais(valor))
                }}
              />
            </Campo>

            <div className="acoes-linha acima-2">
              <button disabled={salvando} type="submit" className="botao botao-primario">
                {initialPeca ? 'Salvar alterações' : 'Enviar para curadoria'}
              </button>
              {!initialPeca && <button type="button" className="botao botao-fantasma" disabled={salvando} onClick={salvarRascunho}>Salvar rascunho</button>}
            </div>
          </section>
        </form>

        <aside>
          <div className="cartao abaixo-4">
            <h2 className="secao-titulo">Apoio à precificação</h2>
            <p className="campo-ajuda abaixo-3">
              Uma conta simples para você não vender abaixo do que o trabalho vale.
            </p>

            <p className="resumo">
              <span>Materiais</span>
              <strong>{emReais(sugestao.materiais)}</strong>
            </p>
            <p className="resumo">
              <span>
                {sugestao.horas}h de trabalho × {emReais(sugestao.valorHora)}
              </span>
              <strong>{emReais(sugestao.horas * sugestao.valorHora)}</strong>
            </p>
            <p className="resumo resumo-total">
              <span>Preço sugerido</span>
              <span className="preco-destaque">{emReais(precoSugerido)}</span>
            </p>

            <p className="campo-ajuda acima-3">Sugestão, não regra. Você decide o preço final.</p>
          </div>

          <p className="aviso">
            <IconeAviso />
            <span>
              Toda peça nova passa por <strong>curadoria</strong> antes de entrar no catálogo. Costuma levar até um
              dia útil.
            </span>
          </p>
        </aside>
      </div>
    </>
  )
}
