'use client'

import { useState, type FormEvent } from 'react'
import { Campo } from '@/components/ui/Basicos'
import { avisar } from '@/components/feedback/Avisos'
import { IconeEditar, IconeEstrela, IconeLixeira } from '@/components/ui/Icones'
import { validarCEP, validarObrigatorio } from '@/utils/validacao'
import type { EnderecoUsuario } from '@/mocks/usuario'
import { atualizarEndereco, criarEndereco, excluirEndereco } from '@/services/api/conta.servico'

const NOVO = '__novo__'

export default function EnderecosEntrega({ iniciais }: { iniciais: EnderecoUsuario[] }) {
  const [enderecos, definirEnderecos] = useState(iniciais)
  const [emEdicao, definirEmEdicao] = useState<string | null>(null)
  const [erros, definirErros] = useState<Record<string, string>>({})

  function abrir(apelido: string) {
    definirErros({})
    definirEmEdicao(apelido)
  }

  async function tornarPrincipal(endereco: EnderecoUsuario) {
    const resposta = await atualizarEndereco(endereco.id, { principal: true })
    if (!resposta.dados) return avisar.erro('Não foi possível atualizar', resposta.erro?.mensagem)
    definirEnderecos(enderecos.map((e) => ({ ...e, principal: e.id === endereco.id })))
    avisar.sucesso(`"${endereco.apelido}" agora é o endereço principal`)
  }

  async function excluir(endereco: EnderecoUsuario) {
    const resposta = await excluirEndereco(endereco.id)
    if (!resposta.dados) return avisar.erro('Não foi possível excluir', resposta.erro?.mensagem)
    let restantes = enderecos.filter((e) => e.id !== endereco.id)
    if (endereco.principal && restantes.length > 0) restantes = restantes.map((e, indice) => ({ ...e, principal: indice === 0 }))
    if (emEdicao === endereco.id) definirEmEdicao(null)
    definirEnderecos(restantes)
    avisar.sucesso(`Endereço "${endereco.apelido}" excluído`)
  }

  async function salvar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()
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

    if (emEdicao === NOVO) {
      const resposta = await criarEndereco({ apelido, rua, bairro, cep })
      if (!resposta.dados) return avisar.erro('Não foi possível salvar', resposta.erro?.mensagem)
      definirEnderecos([...enderecos, resposta.dados])
    } else {
      const resposta = await atualizarEndereco(emEdicao!, { apelido, rua, bairro, cep })
      if (!resposta.dados) return avisar.erro('Não foi possível salvar', resposta.erro?.mensagem)
      definirEnderecos(enderecos.map((e) => (e.id === emEdicao ? resposta.dados! : e)))
    }
    definirEmEdicao(null)
    avisar.sucesso('Endereço salvo')
  }

  function formulario(endereco?: EnderecoUsuario) {
    return (
      <form onSubmit={salvar} noValidate className="acima-3">
        <Campo rotulo="Nome do endereço" erro={erros['end-apelido']} id="end-apelido">
          <input id="end-apelido" name="apelido" defaultValue={endereco?.apelido} placeholder="Casa" />
        </Campo>
        <Campo rotulo="Rua e número" erro={erros['end-rua']} id="end-rua">
          <input id="end-rua" name="rua" defaultValue={endereco?.rua} placeholder="Rua da Aurora, 240" />
        </Campo>
        <Campo rotulo="Bairro, cidade e estado" id="end-bairro">
          <input id="end-bairro" name="bairro" defaultValue={endereco?.bairro} placeholder="Boa Vista, Recife, PE" />
        </Campo>
        <Campo rotulo="CEP" erro={erros['end-cep']} id="end-cep">
          <input
            id="end-cep"
            name="cep"
            inputMode="numeric"
            maxLength={9}
            defaultValue={endereco?.cep}
            placeholder="50000-000"
          />
        </Campo>
        <div className="acoes-linha">
          <button type="submit" className="botao botao-primario">
            Salvar endereço
          </button>
          <button type="button" className="botao botao-fantasma" onClick={() => definirEmEdicao(null)}>
            Cancelar
          </button>
        </div>
      </form>
    )
  }

  return (
    <section className="cartao">
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
                aria-label={`Editar endereço ${e.apelido}`}
              >
                <IconeEditar tamanho={15} />
                Editar
              </button>
              <button
                type="button"
                className="botao botao-compacto botao-perigo"
                onClick={() => excluir(e)}
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
        <button type="button" className="botao botao-secundario acima-4" onClick={() => abrir(NOVO)}>
          Adicionar endereço
        </button>
      )}
    </section>
  )
}
