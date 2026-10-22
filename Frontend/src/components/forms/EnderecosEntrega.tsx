'use client'

import { useRef, useState, type FormEvent } from 'react'
import { Campo } from '@/components/ui/Basicos'
import { avisar } from '@/components/feedback/Avisos'
import { IconeEditar, IconeEstrela, IconeLixeira } from '@/components/ui/Icones'
import { validarCEP, validarObrigatorio } from '@/utils/validacao'
import type { EnderecoUsuario } from '@/types/dominio'
import { atualizarEndereco, criarEndereco, excluirEndereco } from '@/services/api/conta.servico'

const NOVO = '__novo__'

export default function EnderecosEntrega({ iniciais }: { iniciais: EnderecoUsuario[] }) {
  const [enderecos, definirEnderecos] = useState(iniciais)
  const [emEdicao, definirEmEdicao] = useState<string | null>(null)
  const [erros, definirErros] = useState<Record<string, string>>({})
  const [processando, definirProcessando] = useState(false)
  const operacaoEmAndamento = useRef(false)

  function iniciarOperacao() {
    if (operacaoEmAndamento.current) return false
    operacaoEmAndamento.current = true
    definirProcessando(true)
    return true
  }

  function finalizarOperacao() {
    operacaoEmAndamento.current = false
    definirProcessando(false)
  }

  function abrir(apelido: string) {
    if (operacaoEmAndamento.current) return
    definirErros({})
    definirEmEdicao(apelido)
  }

  async function tornarPrincipal(endereco: EnderecoUsuario) {
    if (!iniciarOperacao()) return
    try {
      const resposta = await atualizarEndereco(endereco.id, { principal: true })
      if (!resposta.dados) return avisar.erro('Não foi possível atualizar', resposta.erro?.mensagem)
      definirEnderecos((atuais) => atuais.map((e) => ({ ...e, principal: e.id === endereco.id })))
      avisar.sucesso(`"${endereco.apelido}" agora é o endereço principal`)
    } finally {
      finalizarOperacao()
    }
  }

  async function excluir(endereco: EnderecoUsuario) {
    if (!iniciarOperacao()) return
    try {
      const resposta = await excluirEndereco(endereco.id)
      if (!resposta.dados) return avisar.erro('Não foi possível excluir', resposta.erro?.mensagem)
      definirEnderecos((atuais) => {
        const restantes = atuais.filter((e) => e.id !== endereco.id)
        return endereco.principal && restantes.length > 0
          ? restantes.map((e, indice) => ({ ...e, principal: indice === 0 }))
          : restantes
      })
      definirEmEdicao((atual) => atual === endereco.id ? null : atual)
      avisar.sucesso(`Endereço "${endereco.apelido}" excluído`)
    } finally {
      finalizarOperacao()
    }
  }

  async function salvar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    if (operacaoEmAndamento.current || !emEdicao) return
    const id = emEdicao
    const dados = new FormData(evento.currentTarget)
    const apelido = String(dados.get('apelido') ?? '')
    const rua = String(dados.get('rua') ?? '')
    const bairro = String(dados.get('bairro') ?? '')
    const cep = String(dados.get('cep') ?? '')

    const proximosErros: Record<string, string> = {}
    const problemaApelido = validarObrigatorio(apelido, 'Dê um nome a este endereço, como Casa')
    if (problemaApelido) proximosErros['end-apelido'] = problemaApelido
    const problemaRua = validarObrigatorio(rua, 'Informe rua e número')
    if (problemaRua) proximosErros['end-rua'] = problemaRua
    const problemaCep = validarCEP(cep)
    if (problemaCep) proximosErros['end-cep'] = problemaCep

    definirErros(proximosErros)
    const primeiro = Object.keys(proximosErros)[0]
    if (primeiro) {
      document.getElementById(primeiro)?.focus()
      avisar.erro('Confira os campos destacados')
      return
    }

    if (!iniciarOperacao()) return
    try {
      if (id === NOVO) {
        const resposta = await criarEndereco({ apelido, rua, bairro, cep })
        if (!resposta.dados) return avisar.erro('Não foi possível salvar', resposta.erro?.mensagem)
        const novo = resposta.dados
        definirEnderecos((atuais) => [...atuais, novo])
      } else {
        const resposta = await atualizarEndereco(id, { apelido, rua, bairro, cep })
        if (!resposta.dados) return avisar.erro('Não foi possível salvar', resposta.erro?.mensagem)
        const atualizado = resposta.dados
        definirEnderecos((atuais) => atuais.map((e) => (e.id === id ? atualizado : e)))
      }
      definirEmEdicao((atual) => atual === id ? null : atual)
      avisar.sucesso('Endereço salvo')
    } finally {
      finalizarOperacao()
    }
  }

  function formulario(endereco?: EnderecoUsuario) {
    return (
      <form onSubmit={salvar} noValidate className="acima-3">
        <Campo rotulo="Nome do endereço" erro={erros['end-apelido']} id="end-apelido">
          <input id="end-apelido" name="apelido" defaultValue={endereco?.apelido} placeholder="Casa" disabled={processando} />
        </Campo>
        <Campo rotulo="Rua e número" erro={erros['end-rua']} id="end-rua">
          <input id="end-rua" name="rua" defaultValue={endereco?.rua} placeholder="Rua da Aurora, 240" disabled={processando} />
        </Campo>
        <Campo rotulo="Bairro, cidade e estado" id="end-bairro">
          <input id="end-bairro" name="bairro" defaultValue={endereco?.bairro} placeholder="Boa Vista, Recife, PE" disabled={processando} />
        </Campo>
        <Campo rotulo="CEP" erro={erros['end-cep']} id="end-cep">
          <input
            id="end-cep"
            name="cep"
            inputMode="numeric"
            maxLength={9}
            defaultValue={endereco?.cep}
            placeholder="50000-000"
            disabled={processando}
          />
        </Campo>
        <div className="acoes-linha">
          <button type="submit" className="botao botao-primario" disabled={processando}>
            {processando ? 'Salvando…' : 'Salvar endereço'}
          </button>
          <button type="button" className="botao botao-fantasma" disabled={processando} onClick={() => definirEmEdicao(null)}>
            Cancelar
          </button>
        </div>
      </form>
    )
  }

  return (
    <section className="cartao" aria-busy={processando}>
      <h2 className="secao-titulo">Endereços de entrega</h2>
      {enderecos.map((e) => (
        <div className="endereco" key={e.id}>
          <div className="encolhivel">
            <p className="linha-flex" style={{ gap: 8, fontWeight: 600 }}>
              {e.apelido}
              {e.principal && <span className="selo selo-neutro">Principal</span>}
            </p>
            {emEdicao === e.id ? (
              formulario(e)
            ) : (
              [e.rua, e.bairro, `CEP ${e.cep}`].filter(Boolean).map((linha) => (
                <p className="autoria" key={linha}>
                  {linha}
                </p>
              ))
            )}
          </div>
          {emEdicao !== e.id && (
            <div className="acoes-linha">
              {!e.principal && (
                <button
                  type="button"
                  className="botao botao-compacto botao-fantasma"
                  onClick={() => tornarPrincipal(e)}
                  disabled={processando}
                  aria-label={`Tornar "${e.apelido}" o endereço principal`}
                >
                  <IconeEstrela tamanho={15} />
                  Tornar principal
                </button>
              )}
              <button
                type="button"
                className="botao botao-compacto botao-fantasma"
                onClick={() => abrir(e.id)}
                disabled={processando}
                aria-label={`Editar endereço ${e.apelido}`}
              >
                <IconeEditar tamanho={15} />
                Editar
              </button>
              <button
                type="button"
                className="botao botao-compacto botao-perigo"
                onClick={() => excluir(e)}
                disabled={processando}
                aria-label={`Excluir endereço ${e.apelido}`}
              >
                <IconeLixeira tamanho={15} />
                Excluir
              </button>
            </div>
          )}
        </div>
      ))}
      {emEdicao === NOVO ? (
        formulario()
      ) : (
        <button type="button" className="botao botao-secundario acima-4" disabled={processando} onClick={() => abrir(NOVO)}>
          Adicionar endereço
        </button>
      )}
    </section>
  )
}
