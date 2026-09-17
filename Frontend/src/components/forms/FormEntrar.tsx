'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState, type FormEvent } from 'react'
import { Campo } from '@/components/ui/Basicos'
import { avisar } from '@/components/feedback/Avisos'
import { validarEmail, validarObrigatorio } from '@/utils/validacao'
import { entrar as entrarNaConta } from '@/services/api/conta.servico'

export default function FormEntrar() {
  const roteador = useRouter()
  const [erros, definirErros] = useState<Record<string, string>>({})
  const [enviando, definirEnviando] = useState(false)

  async function entrar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    const dados = new FormData(evento.currentTarget)
    const proximosErros: Record<string, string> = {}

    const problemaEmail = validarEmail(String(dados.get('email') ?? ''))
    if (problemaEmail) proximosErros['email'] = problemaEmail

    const problemaSenha = validarObrigatorio(String(dados.get('senha') ?? ''), 'Digite sua senha')
    if (problemaSenha) proximosErros['senha'] = problemaSenha

    definirErros(proximosErros)
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
      avisar.erro('Não foi possível entrar', erro?.mensagem)
      return
    }
    avisar.sucesso('Bem-vindo de volta!', `Olá, ${usuario.nome}.`)
    roteador.push(usuario.perfil === 'artesao' ? '/dashboard' : '/account')
    roteador.refresh()
  }

  return (
    <form className="cartao" onSubmit={entrar} noValidate>
      <Campo rotulo="Seu e-mail" erro={erros['email']} id="email">
        <input id="email" name="email" type="email" autoComplete="email" placeholder="voce@exemplo.com" />
      </Campo>

      <Campo rotulo="Sua senha" erro={erros['senha']} id="senha">
        <input id="senha" name="senha" type="password" autoComplete="current-password" enterKeyHint="go" />
      </Campo>

      <button type="submit" className="botao botao-primario botao-largo" disabled={enviando}>
        {enviando ? 'Entrando…' : 'Entrar'}
      </button>

      <p style={{ textAlign: 'center', marginTop: 14 }}>
        <Link href="/login/recover">Esqueci minha senha</Link>
      </p>
    </form>
  )
}
