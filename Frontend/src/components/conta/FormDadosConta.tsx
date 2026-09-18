'use client'

import { useRouter } from 'next/navigation'
import { useState, type FormEvent } from 'react'
import { Campo } from '@/components/ui/Basicos'
import { avisar } from '@/components/feedback/Avisos'
import TrocarFoto from '@/components/forms/TrocarFoto'
import { atualizarConta } from '@/services/api/auth.servico'
import { useSessao } from '@/store/sessao'
import { validarEmail, validarObrigatorio } from '@/utils/validacao'

export default function FormDadosConta() {
  const roteador = useRouter()
  const { sessao, iniciarSessao } = useSessao()
  const [erros, definirErros] = useState<Record<string, string>>({})
  const [salvando, definirSalvando] = useState(false)

  if (!sessao) return null

  async function salvar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    if (salvando || !sessao) return
    const dados = new FormData(evento.currentTarget)
    const nome = String(dados.get('nome') ?? '')
    const email = String(dados.get('email') ?? '')
    const proximosErros: Record<string, string> = {}

    const problemaNome = validarObrigatorio(nome, 'Digite seu nome completo')
    if (problemaNome) proximosErros['conta-nome'] = problemaNome
    const problemaEmail = validarEmail(email)
    if (problemaEmail) proximosErros['conta-email'] = problemaEmail

    definirErros(proximosErros)
    const primeiro = Object.keys(proximosErros)[0]
    if (primeiro) {
      document.getElementById(primeiro)?.focus()
      avisar.erro('Confira os campos destacados')
      return
    }

    definirSalvando(true)
    const { dados: atualizado, erro } = await atualizarConta(sessao.id, {
      nome: nome.trim(),
      email: email.trim(),
      telefone: String(dados.get('telefone') ?? '').trim(),
    })
    definirSalvando(false)

    if (!atualizado) {
      if (erro?.codigo === 'EMAIL_EM_USO') {
        definirErros({ 'conta-email': erro.mensagem })
        document.getElementById('conta-email')?.focus()
        return
      }
      avisar.erro('Não foi possível salvar', erro?.mensagem)
      return
    }

    iniciarSessao(atualizado)
    avisar.sucesso('Dados da conta salvos')
    roteador.refresh()
  }

  return (
    <form className="cartao" onSubmit={salvar} noValidate>
      <TrocarFoto imagemInicial={sessao.imagem} rotulo={sessao.nome} />

      <Campo rotulo="Nome completo" erro={erros['conta-nome']} id="conta-nome">
        <input id="conta-nome" name="nome" defaultValue={sessao.nome} autoComplete="name" />
      </Campo>
      <Campo rotulo="E-mail" ajuda="É com ele que você entra na conta." erro={erros['conta-email']} id="conta-email">
        <input id="conta-email" name="email" type="email" defaultValue={sessao.email} autoComplete="email" />
      </Campo>
      <Campo rotulo="Telefone" ajuda="Usado só para avisos sobre a entrega." id="conta-telefone">
        <input
          id="conta-telefone"
          name="telefone"
          type="tel"
          defaultValue={sessao.telefone ?? ''}
          autoComplete="tel"
          placeholder="(81) 99999-0000"
        />
      </Campo>

      <button type="submit" className="botao botao-primario" disabled={salvando}>
        {salvando ? 'Salvando…' : 'Salvar alterações'}
      </button>
    </form>
  )
}
