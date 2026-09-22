'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState, type FormEvent } from 'react'
import { Campo } from '@/components/ui/Basicos'
import { avisar } from '@/components/feedback/Avisos'
import { IconeAviso } from '@/components/ui/Icones'
import { destinoInicial, sessaoDoUsuario } from '@/services/sessao/cookie'
import { useSessao } from '@/store/sessao'
import { validarEmail, validarObrigatorio } from '@/utils/validacao'
import { entrar as entrarNaConta } from '@/services/api/conta.servico'

export default function FormEntrar({ proximo }: { proximo?: string }) {
  const roteador = useRouter()
  const { iniciarSessao } = useSessao()
  const [erros, definirErros] = useState<Record<string, string>>({})
  const [enviando, definirEnviando] = useState(false)
  const [erroAcesso, definirErroAcesso] = useState<string | null>(null)

  async function entrar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    if (enviando) return
    const dados = new FormData(evento.currentTarget)
    const email = String(dados.get('email') ?? '')
    const senha = String(dados.get('senha') ?? '')
    const proximosErros: Record<string, string> = {}

    const problemaEmail = validarEmail(email)
    if (problemaEmail) proximosErros['email'] = problemaEmail

    const problemaSenha = validarObrigatorio(senha, 'Digite sua senha')
    if (problemaSenha) proximosErros['senha'] = problemaSenha

    definirErros(proximosErros)
    definirErroAcesso(null)
    const primeiro = Object.keys(proximosErros)[0]
    if (primeiro) {
      document.getElementById(primeiro)?.focus()
      avisar.erro('Confira os campos destacados')
      return
    }

    definirEnviando(true)
    const { dados: usuario, erro } = await entrarNaConta({
      email: String(dados.get('email')),
      senha: String(dados.get('senha')),
    })
    definirEnviando(false)
    if (!usuario) {
      definirErroAcesso(erro?.mensagem ?? 'Não foi possível entrar.')
      avisar.erro('Não foi possível entrar', erro?.mensagem)
      return
    }
    const sessao = sessaoDoUsuario(usuario)
    if (!sessao) { definirErroAcesso('A API não retornou uma conta válida.'); return }
    iniciarSessao(sessao)
    avisar.sucesso('Bem-vindo de volta!', `Olá, ${usuario.nome}.`)
    roteador.push(proximo ?? destinoInicial(sessao))
    roteador.refresh()
  }

  return (
    <form className="cartao" onSubmit={entrar} noValidate>
      {erroAcesso && (
        <p className="auth-erro" role="alert">
          <IconeAviso tamanho={18} />
          <span>{erroAcesso}</span>
        </p>
      )}

      <Campo rotulo="Seu e-mail" erro={erros['email']} id="email">
        <input id="email" name="email" type="email" autoComplete="email" placeholder="voce@exemplo.com" />
      </Campo>

      <Campo rotulo="Sua senha" erro={erros['senha']} id="senha">
        <input id="senha" name="senha" type="password" autoComplete="current-password" enterKeyHint="go" />
      </Campo>

      <button type="submit" className="botao botao-primario botao-largo" disabled={enviando}>
        {enviando ? 'Entrando…' : 'Entrar'}
      </button>

      <p className="voltar-login">
        <Link href="/login/recover">Esqueci minha senha</Link>
      </p>
    </form>
  )
}
