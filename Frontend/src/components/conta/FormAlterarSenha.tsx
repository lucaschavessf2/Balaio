'use client'

import { useState, type FormEvent } from 'react'
import { Campo } from '@/components/ui/Basicos'
import { avisar } from '@/components/feedback/Avisos'
import { alterarSenha } from '@/services/api/auth.servico'
import { useSessao } from '@/store/sessao'
import { validarObrigatorio, validarSenha } from '@/utils/validacao'

export default function FormAlterarSenha() {
  const { sessao } = useSessao()
  const [erros, definirErros] = useState<Record<string, string>>({})
  const [salvando, definirSalvando] = useState(false)

  async function salvar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    if (salvando || !sessao) return
    const formulario = evento.currentTarget
    const dados = new FormData(formulario)
    const atual = String(dados.get('senhaAtual') ?? '')
    const nova = String(dados.get('novaSenha') ?? '')
    const confirmacao = String(dados.get('confirmacao') ?? '')
    const proximosErros: Record<string, string> = {}

    const problemaAtual = validarObrigatorio(atual, 'Digite sua senha atual')
    if (problemaAtual) proximosErros['senha-atual'] = problemaAtual
    const problemaNova = validarSenha(nova)
    if (problemaNova) proximosErros['senha-nova'] = problemaNova
    else if (nova === atual) proximosErros['senha-nova'] = 'A nova senha precisa ser diferente da atual'
    if (!problemaNova && confirmacao !== nova) proximosErros['senha-confirmacao'] = 'As senhas não conferem'

    definirErros(proximosErros)
    const primeiro = Object.keys(proximosErros)[0]
    if (primeiro) {
      document.getElementById(primeiro)?.focus()
      return
    }

    definirSalvando(true)
    const { erro } = await alterarSenha(sessao.id, atual, nova)
    definirSalvando(false)

    if (erro) {
      if (erro.codigo === 'SENHA_ATUAL_INVALIDA') {
        definirErros({ 'senha-atual': erro.mensagem })
        document.getElementById('senha-atual')?.focus()
        return
      }
      avisar.erro('Não foi possível alterar a senha', erro.mensagem)
      return
    }

    formulario.reset()
    avisar.sucesso('Senha alterada', 'Use a nova senha no próximo login.')
  }

  return (
    <form className="cartao" id="seguranca" onSubmit={salvar} noValidate>
      <h2 className="secao-titulo">Alterar senha</h2>

      <Campo rotulo="Senha atual" erro={erros['senha-atual']} id="senha-atual">
        <input id="senha-atual" name="senhaAtual" type="password" autoComplete="current-password" />
      </Campo>
      <Campo rotulo="Nova senha" ajuda="No mínimo 8 caracteres." erro={erros['senha-nova']} id="senha-nova">
        <input id="senha-nova" name="novaSenha" type="password" autoComplete="new-password" />
      </Campo>
      <Campo rotulo="Repita a nova senha" erro={erros['senha-confirmacao']} id="senha-confirmacao">
        <input id="senha-confirmacao" name="confirmacao" type="password" autoComplete="new-password" />
      </Campo>

      <button type="submit" className="botao botao-secundario botao-largo" disabled={salvando}>
        {salvando ? 'Alterando…' : 'Alterar senha'}
      </button>
    </form>
  )
}
