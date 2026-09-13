'use client'

import { useRef, useState, type FormEvent } from 'react'
import LayoutPainel from '@/components/painel/LayoutPainel'
import { Campo, Migalhas } from '@/components/ui/Basicos'
import { avisar } from '@/components/feedback/Avisos'
import { validarObrigatorio, validarPreco, validarPrazoDias } from '@/utils/validacao'
import { IconeAviso, IconePincel } from '@/components/ui/Icones'
import EstadoCarregando from '@/components/feedback/EstadoCarregando'
import { useReferencias } from '@/hooks/useReferencias'
import { type Disponibilidade } from '@/types/dominio'
import { emReais } from '@/utils/formato'

const sugestao = { materiais: 180, horas: 14, valorHora: 22 }

export default function NovaPeca() {
  const { tecnicas, territorios, categorias, carregando } = useReferencias()
  const [disponibilidade, definirDisponibilidade] = useState<Disponibilidade>('disponivel')
  const [erros, definirErros] = useState<Record<string, string>>({})
  const [fotos, definirFotos] = useState(0)
  const formulario = useRef<HTMLFormElement>(null)
  const precoSugerido = sugestao.materiais + sugestao.horas * sugestao.valorHora

  if (carregando) {
    return (
      <LayoutPainel ativo="pecas">
        <Migalhas
          trilha={[
            { texto: 'Painel do artesão', href: '/dashboard' },
            { texto: 'Minhas peças', href: '/dashboard/pieces' },
            { texto: 'Nova peça' },
          ]}
        />
        <h1 className="titulo-pagina">Cadastrar uma peça</h1>
        <EstadoCarregando rotulo="Carregando o formulário…" cartoes={0} />
      </LayoutPainel>
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

  function limparFormulario() {
    formulario.current?.reset()
    definirDisponibilidade('disponivel')
    definirFotos(0)
  }

  function enviarParaCuradoria(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    if (!validar(false)) return
    limparFormulario()
    avisar.sucesso('Peça enviada para curadoria', 'Você recebe a resposta em até um dia útil.')
  }

  function salvarRascunho() {
    if (!validar(true)) return
    limparFormulario()
    avisar.sucesso('Rascunho salvo em Minhas peças')
  }

  return (
    <LayoutPainel ativo="pecas">
      <Migalhas
        trilha={[
          { texto: 'Painel do artesão', href: '/dashboard' },
          { texto: 'Minhas peças', href: '/dashboard/pieces' },
          { texto: 'Nova peça' },
        ]}
      />
      <h1 className="titulo-pagina">Cadastrar uma peça</h1>
      <p className="subtitulo-pagina">
        Preencha com calma. Quanto mais você contar sobre a origem e a técnica, mais fácil o comprador reconhecer o
        valor do seu trabalho.
      </p>

      <div className="duas-colunas">
        <form ref={formulario} onSubmit={enviarParaCuradoria} noValidate>
          <section className="cartao abaixo-5">
            <h2 className="secao-titulo">O básico</h2>

            <Campo rotulo="Nome da peça" ajuda="Como você chamaria essa peça na feira." erro={erros['peca-nome']} id="peca-nome">
              <input id="peca-nome" name="nome" placeholder="Ex.: Leão Imperial de Tracunhaém" />
            </Campo>

            <Campo rotulo="Técnica" id="peca-tecnica">
              <select id="peca-tecnica" name="tecnica" defaultValue={tecnicas[0]}>
                {tecnicas.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </Campo>

            <div className="grade-dois">
              <Campo rotulo="Categoria" id="peca-categoria">
                <select id="peca-categoria" name="categoria" defaultValue={categorias[0]}>
                  {categorias.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </Campo>

              <Campo rotulo="Território de origem" id="peca-territorio">
                <select id="peca-territorio" name="territorio" defaultValue={territorios[0]}>
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
              <textarea id="peca-historia" name="historia" placeholder="Cada linha da juba é esculpida uma a uma, num ritual de paciência que dura dias..." />
            </Campo>
          </section>

          <section className="cartao abaixo-5">
            <h2 className="secao-titulo">Fotos</h2>
            <label className="area-upload" style={{ display: 'block', cursor: 'pointer' }}>
              <span className="estado-vazio-icone" style={{ width: 64, height: 64, marginBottom: 12 }}>
                <IconePincel tamanho={26} />
              </span>
              <span style={{ display: 'block', fontWeight: 600, color: 'var(--tinta)' }}>
                {fotos > 0 ? `${fotos} ${fotos === 1 ? 'foto escolhida' : 'fotos escolhidas'}` : 'Toque para escolher as fotos'}
              </span>
              <span className="campo-ajuda">
                Use luz do dia e fundo simples. A primeira foto é a que aparece no catálogo.
              </span>
              <input
                type="file"
                accept="image/*"
                multiple
                className="so-leitor"
                onChange={(evento) => {
                  const quantidade = evento.target.files?.length ?? 0
                  definirFotos(quantidade)
                  if (quantidade > 0)
                    avisar.sucesso(`${quantidade} ${quantidade === 1 ? 'foto adicionada' : 'fotos adicionadas'}`)
                }}
              />
            </label>
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
                <input id="peca-prazo" name="prazo" type="number" defaultValue={15} min={1} max={120} />
              </Campo>
            )}

            <Campo rotulo="Preço" erro={erros['peca-preco']} id="peca-preco">
              <input id="peca-preco" name="preco" inputMode="decimal" placeholder="R$ 0,00" />
            </Campo>

            <div className="acoes-linha acima-2">
              <button type="submit" className="botao botao-primario">
                Enviar para curadoria
              </button>
              <button type="button" className="botao botao-fantasma" onClick={salvarRascunho}>
                Salvar rascunho
              </button>
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
    </LayoutPainel>
  )
}
