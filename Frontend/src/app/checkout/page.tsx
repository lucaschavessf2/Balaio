'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState, type FormEvent } from 'react'
import Pagina from '@/components/layout/Pagina'
import { Campo, EstadoVazio, Foto, Migalhas } from '@/components/ui/Basicos'
import { IconeCadeado, IconeCaminhao, IconeCheck, IconeSacola, IconeSetaDireita } from '@/components/ui/Icones'
import { avisar } from '@/components/feedback/Avisos'
import { finalizarCompra } from '@/services/api/pedidos.servico'
import EstadoErro from '@/components/feedback/EstadoErro'
import EstadoCarregando from '@/components/feedback/EstadoCarregando'
import { useSacola } from '@/store/sacola'
import { usePecas } from '@/hooks/usePecas'
import { validarCEP, validarObrigatorio } from '@/utils/validacao'
import { useDados } from '@/store/dados'
import { useSessao } from '@/store/sessao'
import { emReais, precoComDesconto } from '@/utils/formato'
import { obterUsuario } from '@/services/api/conta.servico'

type Meio = 'pix' | 'cartao' | 'boleto'

const meios: { id: Meio; nome: string; nota: string }[] = [
  { id: 'pix', nome: 'Pix', nota: 'Aprovação na hora' },
  { id: 'cartao', nome: 'Cartão', nota: 'Até 12x sem juros' },
  { id: 'boleto', nome: 'Boleto', nota: 'Vence em 3 dias úteis' },
]

export default function Checkout() {
  const { sessao } = useSessao()
  const roteador = useRouter()
  const { itens, pronto, limpar } = useSacola()
  const { mapaPecas, carregando, erro } = usePecas()
  const [meio, definirMeio] = useState<Meio>('pix')
  const { fretes: opcoesFrete, carregando: carregandoFretes, erro: erroFretes } = useDados()
  const [freteId, definirFrete] = useState('padrao')
  const frete = opcoesFrete.find((f) => f.id === freteId) ?? opcoesFrete[0]
  const [erros, definirErros] = useState<Record<string, string>>({})
  const [salvando, definirSalvando] = useState(false)
  const [concluido, definirConcluido] = useState(false)
  const [entrega, definirEntrega] = useState({ cep: '', endereco: '', cidade: '', estado: '' })

  useEffect(() => {
    obterUsuario().then(({ dados }) => {
      const principal = dados?.enderecos?.find((item) => item.principal) ?? dados?.enderecos?.[0]
      if (!principal) return
      const partes = principal.bairro.split(',').map((item) => item.trim())
      definirEntrega({ cep: principal.cep, endereco: principal.rua, cidade: partes.slice(0, -1).join(', '), estado: partes.at(-1) ?? '' })
    })
  }, [])

  const detalhados = itens.flatMap((item) => {
    const peca = mapaPecas.get(item.slug)
    return peca ? [{ item, peca }] : []
  })

  const subtotalCheio = detalhados.reduce((total, d) => total + d.peca.preco * d.item.quantidade, 0)
  const subtotal = detalhados.reduce((total, d) => total + precoComDesconto(d.peca) * d.item.quantidade, 0)
  const economia = subtotalCheio - subtotal
  const total = subtotal + (frete?.valor ?? 0)

  async function confirmar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    if (salvando || !detalhados.length || !frete) return
    const dados = new FormData(evento.currentTarget)
    const proximosErros: Record<string, string> = {}

    const problemaCep = validarCEP(String(dados.get('cep') ?? ''))
    if (problemaCep) proximosErros['cep-checkout'] = problemaCep

    const problemaEndereco = validarObrigatorio(String(dados.get('endereco') ?? ''), 'Informe o endereço de entrega')
    if (problemaEndereco) proximosErros['endereco'] = problemaEndereco

    const problemaCidade = validarObrigatorio(String(dados.get('cidade') ?? ''), 'Informe a cidade')
    if (problemaCidade) proximosErros['cidade'] = problemaCidade

    const problemaEstado = validarObrigatorio(String(dados.get('estado') ?? ''), 'Informe o estado')
    if (problemaEstado) proximosErros['estado'] = problemaEstado

    definirErros(proximosErros)
    const primeiro = Object.keys(proximosErros)[0]
    if (primeiro) {
      document.getElementById(primeiro)?.focus()
      avisar.erro('Confira os campos destacados')
      return
    }

    definirSalvando(true)
    const resposta = await finalizarCompra({
      itens, freteId: frete.id, meio, compradorId: sessao?.id ?? '',
      endereco: { cep: String(dados.get('cep')), endereco: String(dados.get('endereco')), cidade: String(dados.get('cidade')), estado: String(dados.get('estado')) },
    })
    definirSalvando(false)
    if (resposta.erro || !resposta.dados) { avisar.erro('Não foi possível registrar o pedido', resposta.erro?.mensagem); return }
    definirConcluido(true)
    limpar()
    avisar.sucesso('Compra de demonstração registrada', 'Nenhum pagamento real foi realizado.')
    roteador.push('/confirmation/' + resposta.dados.id)
  }

  if ((!pronto || carregando || carregandoFretes) && !concluido) {
    return (
      <Pagina>
        <Migalhas
          trilha={[{ texto: 'Início', href: '/' }, { texto: 'Sacola', href: '/cart' }, { texto: 'Pagamento' }]}
        />
        <h1 className="titulo-pagina">Finalizar compra</h1>
        <EstadoCarregando rotulo="Carregando sua sacola…" cartoes={2} />
      </Pagina>
    )
  }

  if (erro || erroFretes || !frete) return <Pagina><EstadoErro mensagem={erro ?? erroFretes ?? 'Nenhuma opção de entrega disponível.'} /></Pagina>

  if (pronto && detalhados.length === 0 && !concluido) {
    return (
      <Pagina>
        <Migalhas
          trilha={[{ texto: 'Início', href: '/' }, { texto: 'Sacola', href: '/cart' }, { texto: 'Pagamento' }]}
        />
        <h1 className="titulo-pagina">Finalizar compra</h1>
        <EstadoVazio
          icone={<IconeSacola tamanho={34} />}
          titulo="Sua sacola está vazia"
          descricao="Adicione uma peça à sacola para chegar ao pagamento."
          acao={
            <Link href="/" className="botao botao-primario">
              Explorar o catálogo
            </Link>
          }
        />
      </Pagina>
    )
  }

  return (
    <Pagina>
      <Migalhas
        trilha={[{ texto: 'Início', href: '/' }, { texto: 'Sacola', href: '/cart' }, { texto: 'Pagamento' }]}
      />

      <h1 className="titulo-pagina">Finalizar compra</h1>
      <p className="subtitulo-pagina">
        Compra de demonstração: os dados serão salvos, sem cobrança ou pagamento real.
      </p>

      <ol className="etapas-compra">
        <li className="etapa-compra etapa-compra-feita">
          <span className="etapa-compra-numero" aria-hidden>
            <IconeCheck tamanho={14} />
          </span>
          <span className="etapa-compra-texto">Sacola</span>
        </li>
        <li className="etapas-compra-seta" aria-hidden>
          →
        </li>
        <li className="etapa-compra etapa-compra-atual" aria-current="step">
          <span className="etapa-compra-numero" aria-hidden>
            2
          </span>
          <span className="etapa-compra-texto">Entrega e pagamento</span>
        </li>
        <li className="etapas-compra-seta" aria-hidden>
          →
        </li>
        <li className="etapa-compra">
          <span className="etapa-compra-numero" aria-hidden>
            3
          </span>
          <span className="etapa-compra-texto">Confirmação</span>
        </li>
      </ol>

      <form className="duas-colunas" onSubmit={confirmar} noValidate>
        <div>
          <section className="cartao abaixo-5">
            <h2 className="secao-titulo">Endereço de entrega</h2>
            <Campo rotulo="CEP" erro={erros['cep-checkout']} id="cep-checkout">
              <input id="cep-checkout" name="cep" inputMode="numeric" maxLength={9} placeholder="50000-000" value={entrega.cep} onChange={(e) => definirEntrega({ ...entrega, cep: e.target.value })} />
            </Campo>
            <Campo rotulo="Endereço" erro={erros['endereco']} id="endereco">
              <input id="endereco" name="endereco" value={entrega.endereco} onChange={(e) => definirEntrega({ ...entrega, endereco: e.target.value })} />
            </Campo>
            <div className="grade-dois">
              <Campo rotulo="Cidade" erro={erros['cidade']} id="cidade">
                <input id="cidade" name="cidade" value={entrega.cidade} onChange={(e) => definirEntrega({ ...entrega, cidade: e.target.value })} />
              </Campo>
              <Campo rotulo="Estado" erro={erros['estado']} id="estado">
                <input id="estado" name="estado" maxLength={2} value={entrega.estado} onChange={(e) => definirEntrega({ ...entrega, estado: e.target.value })} />
              </Campo>
            </div>
          </section>

          <section className="cartao abaixo-5">
            <h2 className="secao-titulo">Como você quer receber</h2>
            <div className="opcoes">
              {opcoesFrete.map((opcao) => (
                <label className="opcao opcao-topo" key={opcao.id}>
                  <input type="radio" name="frete" checked={frete.id === opcao.id} onChange={() => definirFrete(opcao.id)} />
                  <span className="encolhivel">
                    <span className="linha-flex" style={{ gap: 8, fontWeight: 600 }}>
                      <IconeCaminhao />
                      {opcao.nome}
                    </span>
                    <span className="campo-ajuda">
                      {opcao.prazo} · {emReais(opcao.valor)}
                    </span>
                  </span>
                </label>
              ))}
            </div>
          </section>

          <section className="cartao">
            <h2 className="secao-titulo">Forma de pagamento</h2>
            <div className="opcoes-pagamento">
              {meios.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  className="opcao-pagamento"
                  aria-pressed={meio === m.id}
                  onClick={() => definirMeio(m.id)}
                >
                  <span>
                    <span className="opcao-pagamento-nome">{m.nome}</span>
                    <span className="opcao-pagamento-nota">{m.nota}</span>
                  </span>
                </button>
              ))}
            </div>

            {meio === 'pix' && (
              <div>
                <p className="texto-suave abaixo-3">
                  Ao confirmar, você recebe o código Pix para pagar no aplicativo do seu banco. A confirmação costuma
                  levar poucos segundos.
                </p>
                <div className="qr-simulado" role="img" aria-label="Exemplo de código Pix" />
              </div>
            )}

            {meio === 'cartao' && (
              <div className="bloco-psp">
                <p className="bloco-psp-titulo">
                  <IconeCadeado />
                  Ambiente seguro Mercado Pago
                </p>
                <p>
                  Os dados do cartão são digitados direto no ambiente do Mercado Pago e nunca passam pela plataforma. Ao
                  confirmar, a janela segura de pagamento abre para você concluir em até 12x.
                </p>
              </div>
            )}

            {meio === 'boleto' && (
              <p className="texto-suave">
                O boleto vence em 3 dias úteis. A peça fica reservada até o vencimento. Depois disso ela volta ao
                catálogo.
              </p>
            )}
          </section>
        </div>

        <aside className="cartao coluna-compra">
          <h2 className="secao-titulo">Seu pedido</h2>

          {detalhados.map(({ peca, item }) => (
            <div className="item-sacola" key={peca.slug} style={{ gridTemplateColumns: '64px minmax(0, 1fr)' }}>
              <div className="item-sacola-figura">
                <Foto nome={peca.nome} imagem={peca.imagem} decorativa />
              </div>
              <div className="encolhivel">
                <p style={{ fontWeight: 600 }}>
                  {peca.nome}
                  {item.quantidade > 1 ? ` × ${item.quantidade}` : ''}
                </p>
                <p className="autoria linha-preco">
                  {peca.desconto && <span className="preco-riscado">{emReais(peca.preco * item.quantidade)}</span>}
                  {emReais(precoComDesconto(peca) * item.quantidade)}
                </p>
              </div>
            </div>
          ))}

          <p className="resumo acima-3">
            <span>Subtotal</span>
            <strong>{emReais(subtotalCheio)}</strong>
          </p>
          {economia > 0 && (
            <p className="resumo resumo-desconto">
              <span>Desconto da plataforma</span>
              <strong>{emReais(economia)}</strong>
            </p>
          )}
          <p className="resumo">
            <span>Frete</span>
            <strong>{emReais(frete.valor)}</strong>
          </p>
          <p className="resumo resumo-total">
            <span>Total</span>
            <span className="preco-destaque">{emReais(total)}</span>
          </p>

          <div className="barra-fixa barra-fixa-total">
            <p className="barra-fixa-info">
              <span className="barra-fixa-rotulo">Total</span>
              <span className="barra-fixa-valor">{emReais(total)}</span>
            </p>
            <button disabled={salvando || concluido} type="submit" className="botao botao-sucesso botao-largo">
              Confirmar e pagar <span className="esconde-mobile">{emReais(total)}</span>
              <IconeSetaDireita />
            </button>
          </div>

          <p className="nota-fiscal acima-4" style={{ display: 'flex', gap: 10 }}>
            <IconeCadeado />
            <span>
              Pagamento processado pelo <strong>Mercado Pago</strong>. O valor fica retido e só é liberado ao artesão
              após a confirmação da entrega.
            </span>
          </p>
        </aside>
      </form>
    </Pagina>
  )
}
