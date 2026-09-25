'use client'

import { useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { Campo } from '@/components/ui/Basicos'
import { IconeSelo } from '@/components/ui/Icones'
import { avisar } from '@/components/feedback/Avisos'
import { solicitarSelo } from '@/services/api/curadoria.servico'
import type { EstadoSelo } from '@/types/dominio'

const LIMITE_MENSAGEM = 1000

export default function CartaoSelo({ estadoInicial }: { estadoInicial: EstadoSelo }) {
  const roteador = useRouter()
  const [estado, definirEstado] = useState(estadoInicial)
  const [mensagem, definirMensagem] = useState('')
  const [enviando, definirEnviando] = useState(false)
  const solicitacao = estado.solicitacao
  const pendente = solicitacao?.situacao === 'pendente'
  const pediuAjuste = solicitacao?.situacao === 'ajuste'

  async function pedirSelo(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    definirEnviando(true)
    const resposta = await solicitarSelo(mensagem)
    definirEnviando(false)
    if (!resposta.dados) {
      avisar.erro('Não foi possível enviar a solicitação', resposta.erro?.mensagem)
      return
    }
    definirEstado(resposta.dados)
    definirMensagem('')
    avisar.sucesso('Solicitação enviada à curadoria', 'Você continua vendendo normalmente enquanto analisamos.')
    roteador.refresh()
  }

  return (
    <div className="cartao abaixo-4">
      <h2 className="secao-titulo linha-flex" style={{ gap: 10 }}>
        <IconeSelo tamanho={20} />
        Selo de artesão verificado
      </h2>

      {estado.selo ? (
        <>
          <p className="autoria abaixo-3">
            Seu ateliê tem o selo ativo. Ele aparece no seu perfil e nas suas peças, mostrando que a curadoria
            conferiu a origem e a autoria do seu trabalho.
          </p>
          <span className="selo selo-disponivel">
            <span className="selo-ponto" />
            Selo ativo
          </span>
        </>
      ) : pendente ? (
        <>
          <p className="autoria abaixo-3">
            Sua solicitação está com a curadoria. Enquanto isso, suas peças já estão à venda normalmente.
          </p>
          <span className="selo selo-encomenda">
            <span className="selo-ponto" />
            Em análise
          </span>
        </>
      ) : (
        <form onSubmit={pedirSelo}>
          {pediuAjuste ? (
            <div className="aviso abaixo-3">
              <span>
                <strong>A curadoria pediu um ajuste:</strong> {solicitacao?.motivo}
              </span>
            </div>
          ) : (
            <p className="autoria abaixo-3">
              O selo não é obrigatório para vender. Ele mostra ao comprador que a curadoria conferiu a origem e a
              autoria do seu trabalho.
            </p>
          )}
          <Campo
            rotulo="Mensagem para a curadoria (opcional)"
            ajuda="Conte a qual associação você pertence ou como podemos confirmar a origem do seu trabalho."
            id="mensagem-selo"
          >
            <textarea
              id="mensagem-selo"
              maxLength={LIMITE_MENSAGEM}
              value={mensagem}
              onChange={(evento) => definirMensagem(evento.target.value)}
            />
          </Campo>
          <button type="submit" className="botao botao-secundario" disabled={enviando}>
            {pediuAjuste ? 'Enviar novamente' : 'Solicitar selo'}
          </button>
        </form>
      )}
    </div>
  )
}
