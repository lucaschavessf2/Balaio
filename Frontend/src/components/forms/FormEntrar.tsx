'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState, type FormEvent } from 'react'
import { Campo } from '@/components/ui/Basicos'
import { avisar } from '@/components/feedback/Avisos'
import { IconeAviso } from '@/components/ui/Icones'
import { entrar } from '@/services/api/auth.servico'
import { destinoInicial } from '@/services/sessao/cookie'
import { useSessao } from '@/store/sessao'
import { validarEmail, validarObrigatorio } from '@/utils/validacao'

export default function FormEntrar({ proximo }: { proximo?: string }) {
  const roteador = useRouter()
  const { iniciarSessao } = useSessao()
  const [erros, definirErros] = useState<Record<string, string>>({})
  const [erroAcesso, definirErroAcesso] = useState<string | null>(null)
  const [enviando, definirEnviando] = useState(false)

  async function aoEnviar(evento: FormEvent<HTMLFormElement>) {
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
    const { dados: usuario, erro } = await entrar(email.trim(), senha)
    definirEnviando(false)

    if (!usuario) {
      definirErroAcesso(erro?.mensagem ?? 'Não foi possível entrar agora.')
      document.getElementById('senha')?.focus()
      return
    }

    iniciarSessao(usuario)
    avisar.sucesso(`Bem-vindo, ${usuario.nome.split(' ')[0]}!`)
    roteador.push(proximo ?? destinoInicial(usuario))
    roteador.refresh()
  }

  return (
    <form className="cartao" onSubmit={aoEnviar} noValidate>
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
