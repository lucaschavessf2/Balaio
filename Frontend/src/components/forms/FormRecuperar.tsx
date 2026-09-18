'use client'

import Link from 'next/link'
import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Campo } from '@/components/ui/Basicos'
import { avisar } from '@/components/feedback/Avisos'
import { validarEmail } from '@/utils/validacao'
import { IconeCheck } from '@/components/ui/Icones'

export default function FormRecuperar() {
  const [erro, definirErro] = useState<string | null>(null)
  const [enviadoPara, definirEnviadoPara] = useState<string | null>(null)
  const refCartaoSucesso = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (enviadoPara) refCartaoSucesso.current?.focus()
  }, [enviadoPara])

  function enviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    const email = String(new FormData(evento.currentTarget).get('email') ?? '')
    const problema = validarEmail(email)
    definirErro(problema)
    if (problema) {
      document.getElementById('recuperar-email')?.focus()
      return
    }
    definirEnviadoPara(email)
    avisar.sucesso('Link de recuperação enviado', 'Confira sua caixa de entrada e o spam.')
  }

  if (enviadoPara) {
    return (
      <div className="cartao cartao-auth-sucesso" role="status" tabIndex={-1} ref={refCartaoSucesso}>
        <span className="cabeca-auth-icone cabeca-auth-icone-sucesso">
          <IconeCheck tamanho={26} />
        </span>
        <p className="texto-forte">Link enviado</p>
        <p className="autoria">
          Enviamos o link de recuperação para <strong>{enviadoPara}</strong>. Ele vale por 1 hora.
        </p>
        <p className="campo-ajuda">Não chegou? Confira a caixa de spam antes de pedir outro.</p>
        <Link href="/login" className="botao botao-secundario botao-largo acima-2">
          Voltar para o login
        </Link>
      </div>
    )
  }

  return (
    <form className="cartao" onSubmit={enviar} noValidate>
      <Campo
        rotulo="Seu e-mail"
        ajuda="O mesmo que você usou no cadastro."
        erro={erro ?? undefined}
        id="recuperar-email"
      >
        <input
          id="recuperar-email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="voce@exemplo.com"
          enterKeyHint="send"
        />
      </Campo>

      <button type="submit" className="botao botao-primario botao-largo">
        Enviar link de recuperação
      </button>
    </form>
  )
}
