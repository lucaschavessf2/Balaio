'use client'

import Link from 'next/link'
import { useEffect, useState, type FormEvent } from 'react'
import { Campo, Foto } from '@/components/ui/Basicos'
import { avisar } from '@/components/feedback/Avisos'
import { mediacaoDoPedido, proximoIdMediacao, salvarMediacaoLocal } from '@/components/admin/mediacoesLocais'
import { usuarioAtual } from '@/mocks/usuario'
import { type Mediacao } from '@/types/dominio'

const motivos = [
  { chave: 'prazo', rotulo: 'O prazo combinado passou e a peça não chegou', assunto: 'Prazo de entrega ultrapassado' },
  { chave: 'danificada', rotulo: 'A peça chegou danificada', assunto: 'Peça chegou danificada' },
  { chave: 'diferente', rotulo: 'A peça veio muito diferente do anúncio', assunto: 'Peça diferente do anúncio' },
  { chave: 'contato', rotulo: 'Não consigo contato com o artesão', assunto: 'Sem resposta do artesão' },
  { chave: 'outro', rotulo: 'Outro motivo', assunto: 'Outro motivo relatado pelo comprador' },
] as const

const solucoes = [
  { chave: 'reembolso', rotulo: 'Reembolso do valor pago' },
  { chave: 'reparo', rotulo: 'Reparo ou novo envio da peça' },
  { chave: 'conversa', rotulo: 'Uma conversa mediada para chegar a um acordo' },
] as const

type Props = {
  pedidoId: string
  pecaNome?: string
  pecaImagem?: string
  atelie?: string
}

export default function FormMediacao({ pedidoId, pecaNome, pecaImagem, atelie }: Props) {
  const [motivo, definirMotivo] = useState('')
  const [relato, definirRelato] = useState('')
  const [solucao, definirSolucao] = useState('conversa')
  const [erroMotivo, definirErroMotivo] = useState<string | null>(null)
  const [erroRelato, definirErroRelato] = useState<string | null>(null)
  const [aberta, definirAberta] = useState<Mediacao | null>(null)

  useEffect(() => {
    definirAberta(mediacaoDoPedido(pedidoId) ?? null)
  }, [pedidoId])

  function enviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()

    const motivoEscolhido = motivos.find((m) => m.chave === motivo)
    const problemaMotivo = motivoEscolhido ? null : 'Escolha o que aconteceu com o pedido'
    const problemaRelato = relato.trim() ? null : 'Conte o que aconteceu. É o que a plataforma vai ler primeiro'
    definirErroMotivo(problemaMotivo)
    definirErroRelato(problemaRelato)

    if (problemaMotivo || problemaRelato) {
      if (problemaMotivo) {
        document.getElementById(`motivo-${motivos[0].chave}`)?.focus()
      } else {
        document.getElementById('mediacao-relato')?.focus()
      }
      avisar.erro('Confira os campos destacados', 'Falta escolher o motivo ou contar o que aconteceu.')
      return
    }

    const mediacao: Mediacao = {
      id: proximoIdMediacao(),
      pedido: pedidoId,
      assunto: motivoEscolhido!.assunto,
      partes: `${usuarioAtual.nome} × ${atelie ?? 'Ateliê do pedido'}`,
      aberta: 'agora mesmo',
    }
    salvarMediacaoLocal(mediacao)
    avisar.sucesso('Pedido de mediação registrado', 'A plataforma e o artesão foram notificados.')
    definirAberta(mediacao)
  }

  if (aberta) {
    return (
      <section className="cartao">
        <span className="selo selo-encomenda abaixo-3">
          <span className="selo-ponto" />
          Mediação aberta
        </span>
        <h2 className="secao-titulo">Recebemos seu pedido de ajuda</h2>
        <p className="texto-suave abaixo-4">
          Sua mediação ficou registrada com o protocolo <strong>{aberta.id}</strong>, sobre o pedido #{aberta.pedido}.
        </p>
        <h3 className="campo-rotulo abaixo-2">O que acontece agora</h3>
        <ol className="lista-passos-evento abaixo-4">
          <li>O artesão é avisado e tem 48h para responder por aqui.</li>
          <li>Enquanto isso, o repasse do pagamento fica retido pela plataforma.</li>
          <li>Se não houver acordo, a equipe de curadoria decide com base na conversa e nas fotos.</li>
        </ol>
        <div className="acoes-linha acoes-empilhaveis">
          <Link href={`/orders/${aberta.pedido}`} className="botao botao-primario">
            Voltar ao pedido
          </Link>
          <Link href="/orders" className="botao botao-fantasma">
            Meus pedidos
          </Link>
        </div>
      </section>
    )
  }

  return (
    <form className="cartao" onSubmit={enviar} noValidate>
      {pecaNome && (
        <div className="resumo-peca-formulario">
          <div className="resumo-peca-figura">
            <Foto nome={pecaNome} imagem={pecaImagem} decorativa />
          </div>
          <div className="encolhivel">
            <p className="texto-forte">{pecaNome}</p>
            <p className="autoria">Pedido #{pedidoId}</p>
          </div>
        </div>
      )}

      <fieldset className="campo">
        <legend className="campo-rotulo">O que aconteceu?</legend>
        <div className="lista-radios">
          {motivos.map((item) => (
            <label key={item.chave} className="opcao-radio">
              <input
                type="radio"
                id={`motivo-${item.chave}`}
                name="motivo"
                value={item.chave}
                checked={motivo === item.chave}
                onChange={() => {
                  definirMotivo(item.chave)
                  definirErroMotivo(null)
                }}
              />
              <span>{item.rotulo}</span>
            </label>
          ))}
        </div>
        {erroMotivo && (
          <p className="campo-erro acima-2" role="status">
            {erroMotivo}
          </p>
        )}
      </fieldset>

      <Campo
        rotulo="Conte o que aconteceu"
        ajuda="Descreva datas, o que foi combinado e o que você já tentou. Fotos podem ser enviadas depois, pela conversa."
        id="mediacao-relato"
        erro={erroRelato ?? undefined}
      >
        <textarea
          id="mediacao-relato"
          placeholder="Exemplo: o prazo era 26 de março, escrevi para o artesão duas vezes e não tive resposta."
          value={relato}
          onChange={(e) => {
            definirRelato(e.target.value)
            definirErroRelato(null)
          }}
        />
      </Campo>

      <fieldset className="campo">
        <legend className="campo-rotulo">O que resolveria para você?</legend>
        <div className="lista-radios">
          {solucoes.map((item) => (
            <label key={item.chave} className="opcao-radio">
              <input
                type="radio"
                name="solucao"
                value={item.chave}
                checked={solucao === item.chave}
                onChange={() => definirSolucao(item.chave)}
              />
              <span>{item.rotulo}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="acoes-linha acoes-empilhaveis acima-4">
        <button type="submit" className="botao botao-primario">
          Abrir mediação
        </button>
        <Link href={`/orders/${pedidoId}`} className="botao botao-fantasma">
          Voltar ao pedido
        </Link>
      </div>
    </form>
  )
}
