'use client'

import { useState, type FormEvent } from 'react'
import { Campo } from '@/components/ui/Basicos'
import { avisar } from '@/components/feedback/Avisos'
import { IconeEditar, IconeEstrela, IconeLixeira } from '@/components/ui/Icones'
import { validarCEP, validarObrigatorio } from '@/utils/validacao'

type Endereco = { apelido: string; principal: boolean; linhas: string[] }

const NOVO = '__novo__'

export default function EnderecosEntrega({ iniciais }: { iniciais: Endereco[] }) {
  const [enderecos, definirEnderecos] = useState(iniciais)
  const [emEdicao, definirEmEdicao] = useState<string | null>(null)
  const [erros, definirErros] = useState<Record<string, string>>({})

  function abrir(apelido: string) {
    definirErros({})
    definirEmEdicao(apelido)
  }

  function tornarPrincipal(apelido: string) {
    definirEnderecos(enderecos.map((e) => ({ ...e, principal: e.apelido === apelido })))
    avisar.sucesso(`"${apelido}" agora é o endereço principal`)
  }

  function excluir(apelido: string) {
    const anteriores = enderecos
    const alvo = anteriores.find((e) => e.apelido === apelido)
    if (!alvo) return
    let restantes = anteriores.filter((e) => e.apelido !== apelido)
    if (alvo.principal && restantes.length > 0) {
      restantes = restantes.map((e, indice) => ({ ...e, principal: indice === 0 }))
    }
    if (emEdicao === apelido) definirEmEdicao(null)
    definirEnderecos(restantes)
    avisar.desfazivel(`Endereço "${apelido}" excluído`, () => definirEnderecos(anteriores))
  }

  function salvar(evento: FormEvent<HTMLFormElement>) {
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

    const linhas = [rua, bairro, `CEP ${cep}`].filter(Boolean)
    if (emEdicao === NOVO) {
      definirEnderecos([...enderecos, { apelido, principal: enderecos.length === 0, linhas }])
    } else {
      definirEnderecos(enderecos.map((e) => (e.apelido === emEdicao ? { ...e, apelido, linhas } : e)))
    }
    definirEmEdicao(null)
    avisar.sucesso('Endereço salvo')
  }

  function formulario(endereco?: Endereco) {
    return (
      <form onSubmit={salvar} noValidate className="acima-3">
        <Campo rotulo="Nome do endereço" erro={erros['end-apelido']} id="end-apelido">
          <input id="end-apelido" name="apelido" defaultValue={endereco?.apelido} placeholder="Casa" />
        </Campo>
        <Campo rotulo="Rua e número" erro={erros['end-rua']} id="end-rua">
          <input id="end-rua" name="rua" defaultValue={endereco?.linhas[0]} placeholder="Rua da Aurora, 240" />
        </Campo>
        <Campo rotulo="Bairro, cidade e estado" id="end-bairro">
          <input id="end-bairro" name="bairro" defaultValue={endereco?.linhas[1]} placeholder="Boa Vista, Recife, PE" />
        </Campo>
        <Campo rotulo="CEP" erro={erros['end-cep']} id="end-cep">
          <input
            id="end-cep"
            name="cep"
            inputMode="numeric"
            maxLength={9}
            defaultValue={endereco?.linhas[2]?.replace('CEP ', '')}
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
        <div className="endereco" key={e.apelido}>
          <div className="encolhivel">
            <p className="linha-flex" style={{ gap: 8, fontWeight: 600 }}>
              {e.apelido}
              {e.principal && <span className="selo selo-neutro">Principal</span>}
            </p>
            {emEdicao === e.apelido ? (
              formulario(e)
            ) : (
              e.linhas.map((linha) => (
                <p className="autoria" key={linha}>
                  {linha}
                </p>
              ))
            )}
          </div>
          {emEdicao !== e.apelido && (
            <div className="acoes-linha">
              {!e.principal && (
                <button
                  type="button"
                  className="botao botao-compacto botao-fantasma"
                  onClick={() => tornarPrincipal(e.apelido)}
                  aria-label={`Tornar "${e.apelido}" o endereço principal`}
                >
                  <IconeEstrela tamanho={15} />
                  Tornar principal
                </button>
              )}
              <button
                type="button"
                className="botao botao-compacto botao-fantasma"
                onClick={() => abrir(e.apelido)}
                aria-label={`Editar endereço ${e.apelido}`}
              >
                <IconeEditar tamanho={15} />
                Editar
              </button>
              <button
                type="button"
                className="botao botao-compacto botao-perigo"
                onClick={() => excluir(e.apelido)}
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
