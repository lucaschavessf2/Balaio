'use client'

import Link from 'next/link'
import { useEffect, useState, type FormEvent } from 'react'
import { Campo, Foto, Migalhas } from '@/components/ui/Basicos'
import EstadoVazio from '@/components/feedback/EstadoVazio'
import { IconeCadeado, IconeCaminhao, IconeCheck, IconeSacola, IconeSetaDireita } from '@/components/ui/Icones'
import { avisar } from '@/components/feedback/Avisos'
import { concluirCheckoutPendente, finalizarCompra } from '@/services/api/pedidos.servico'
import EstadoErro from '@/components/feedback/EstadoErro'
import EstadoCarregando from '@/components/feedback/EstadoCarregando'
import { useSacola } from '@/store/sacola'
import { usePecas } from '@/hooks/usePecas'
import { validarCEP, validarEstado, validarObrigatorio } from '@/utils/validacao'
import { useDados } from '@/store/dados'
import { emReais, precoComDesconto } from '@/utils/formato'
import { obterUsuario } from '@/services/api/conta.servico'
import SeletorEstado from '@/components/forms/SeletorEstado'

export default function CheckoutFormulario() {
  const { itens, pronto, limpar } = useSacola()
  const { mapaPecas, carregando, erro } = usePecas()
  const { fretes: opcoesFrete, carregando: carregandoFretes, erroFretes } = useDados()
  const [freteId, definirFrete] = useState('padrao')
  const frete = opcoesFrete.find((f) => f.id === freteId) ?? opcoesFrete[0]
  const [erros, definirErros] = useState<Record<string, string>>({})
  const [salvando, definirSalvando] = useState(false)
  const [concluido, definirConcluido] = useState(false)
  const [erroConfirmacao, definirErroConfirmacao] = useState<string | null>(null)
  const [entrega, definirEntrega] = useState({ cep: '', endereco: '', cidade: '', estado: '' })

  function atualizarEntrega(campo: keyof typeof entrega, valor: string) {
    definirEntrega((atual) => ({ ...atual, [campo]: valor }))
    const id = campo === 'cep' ? 'cep-checkout' : campo
    definirErros((atuais) => {
      if (!atuais[id]) return atuais
      const problema = campo === 'cep'
        ? validarCEP(valor)
        : campo === 'estado'
          ? validarEstado(valor)
          : validarObrigatorio(valor, campo === 'endereco' ? 'Informe o endereço de entrega' : 'Informe a cidade')
      if (problema === atuais[id]) return atuais
      const proximos = { ...atuais }
      if (problema) proximos[id] = problema
      else delete proximos[id]
      return proximos
    })
  }

  useEffect(() => {
    obterUsuario().then(({ dados }) => {
      const principal = dados?.enderecos?.find((item) => item.principal) ?? dados?.enderecos?.[0]
      if (!principal) return
      const partes = principal.bairro.split(',').map((item) => item.trim())
      const enderecoCarregado = { cep: principal.cep, endereco: principal.rua, cidade: partes.slice(0, -1).join(', '), estado: partes.at(-1) ?? '' }
      definirEntrega(enderecoCarregado)
      definirErros((atuais) => {
        const proximos = { ...atuais }
        if (!validarCEP(enderecoCarregado.cep)) delete proximos['cep-checkout']
        if (!validarObrigatorio(enderecoCarregado.endereco)) delete proximos.endereco
        if (!validarObrigatorio(enderecoCarregado.cidade)) delete proximos.cidade
        if (!validarEstado(enderecoCarregado.estado)) delete proximos.estado
        return proximos
      })
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

    const problemaEstado = validarEstado(String(dados.get('estado') ?? ''))
    if (problemaEstado) proximosErros['estado'] = problemaEstado

    definirErros(proximosErros)
    const primeiro = Object.keys(proximosErros)[0]
    if (primeiro) {
      document.getElementById(primeiro)?.focus()
      avisar.erro('Confira os campos destacados')
      return
    }

    definirSalvando(true)
    definirErroConfirmacao(null)
    const resposta = await finalizarCompra({
      itens, freteId: frete.id, meio: 'checkout_pro',
      endereco: { cep: String(dados.get('cep')), endereco: String(dados.get('endereco')), cidade: String(dados.get('cidade')), estado: String(dados.get('estado')) },
    })
    definirSalvando(false)
    if (resposta.erro || !resposta.dados) {
      const mensagem = resposta.erro?.mensagem ?? 'Tente novamente em instantes.'
      definirErroConfirmacao(mensagem)
      avisar.erro('Não foi possível registrar o pedido', mensagem)
      return
    }
    if (!resposta.dados.checkoutUrl) {
      definirErroConfirmacao('Pedido registrado; a página de pagamento ainda está sendo preparada. Tente novamente com os mesmos dados.')
      return
    }
    let destino: URL
    try { destino = new URL(resposta.dados.checkoutUrl) }
    catch { definirErroConfirmacao('A página de pagamento de teste retornada é inválida.'); return }
    if (destino.protocol !== 'https:' || destino.hostname !== 'sandbox.mercadopago.com') {
      definirErroConfirmacao('A página de pagamento de teste retornada é inválida. Tente novamente mais tarde.')
      return
    }
    definirConcluido(true)
    avisar.sucesso('Pedido registrado', 'Abrindo o checkout de teste do Mercado Pago.')
    concluirCheckoutPendente()
    limpar()
    window.location.assign(destino.href)
  }

  if ((!pronto || carregando || carregandoFretes) && !concluido) {
    return (
      <>
        <Migalhas
          trilha={[{ texto: 'Início', href: '/' }, { texto: 'Sacola', href: '/cart' }, { texto: 'Revisão da compra' }]}
        />
        <h1 className="titulo-pagina">Finalizar compra</h1>
        <EstadoCarregando rotulo="Carregando sua sacola…" cartoes={2} />
      </>
    )
  }

  if (concluido) return <EstadoCarregando rotulo="Abrindo o pagamento de teste…" cartoes={1} />

  if (erro || erroFretes || !frete) return <EstadoErro mensagem={erro ?? erroFretes ?? 'Nenhuma opção de entrega disponível.'} />

  if (pronto && detalhados.length === 0 && !concluido) {
    return (
      <>
        <Migalhas
          trilha={[{ texto: 'Início', href: '/' }, { texto: 'Sacola', href: '/cart' }, { texto: 'Revisão da compra' }]}
        />
        <h1 className="titulo-pagina">Finalizar compra</h1>
        <EstadoVazio
          icone={<IconeSacola tamanho={34} />}
          titulo="Sua sacola está vazia"
          descricao="Adicione uma peça à sacola para revisar sua compra."
          acao={
            <Link href="/" className="botao botao-primario">
              Explorar o catálogo
            </Link>
          }
        />
      </>
    )
  }

  return (
    <>
      <Migalhas
        trilha={[{ texto: 'Início', href: '/' }, { texto: 'Sacola', href: '/cart' }, { texto: 'Revisão da compra' }]}
      />

      <h1 className="titulo-pagina">Finalizar compra</h1>
      <p className="subtitulo-pagina">
        O pagamento de teste acontece no site seguro do Mercado Pago. Os dados do cartão não passam pelo Balaio.
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
              <input id="cep-checkout" name="cep" inputMode="numeric" maxLength={9} placeholder="50000-000" value={entrega.cep} onChange={(e) => atualizarEntrega('cep', e.target.value)} />
            </Campo>
            <Campo rotulo="Endereço" erro={erros['endereco']} id="endereco">
              <input id="endereco" name="endereco" value={entrega.endereco} onChange={(e) => atualizarEntrega('endereco', e.target.value)} />
            </Campo>
            <div className="grade-dois">
              <Campo rotulo="Cidade" erro={erros['cidade']} id="cidade">
                <input id="cidade" name="cidade" value={entrega.cidade} onChange={(e) => atualizarEntrega('cidade', e.target.value)} />
              </Campo>
              <SeletorEstado
                erro={erros['estado']}
                id="estado"
                value={entrega.estado}
                onChange={(valor) => atualizarEntrega('estado', valor)}
              />
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
            <h2 className="secao-titulo">Pagamento</h2>
            <p className="texto-suave">Você escolherá o meio de pagamento no Checkout Pro de teste do Mercado Pago.</p>
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

          {erroConfirmacao && (
            <p className="aviso acima-3" role="alert">{erroConfirmacao} Sua sacola foi mantida para tentar novamente.</p>
          )}

          <div className="barra-fixa barra-fixa-total">
            <p className="barra-fixa-info">
              <span className="barra-fixa-rotulo">Total</span>
              <span className="barra-fixa-valor">{emReais(total)}</span>
            </p>
            <button disabled={salvando || concluido} type="submit" className="botao botao-sucesso botao-largo">
              {salvando ? 'Registrando pedido…' : 'Confirmar compra'} <span className="esconde-mobile">{emReais(total)}</span>
              <IconeSetaDireita />
            </button>
          </div>

          <p className="nota-fiscal acima-4" style={{ display: 'flex', gap: 10 }}>
            <IconeCadeado />
            <span>
              Esta etapa registra o pedido e abre um pagamento em ambiente de teste. <strong>A confirmação depende do provedor.</strong>
            </span>
          </p>
        </aside>
      </form>
    </>
  )
}
