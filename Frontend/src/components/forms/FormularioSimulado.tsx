'use client'

import type { FormEvent, ReactNode } from 'react'
import { avisar } from '@/components/feedback/Avisos'

type CampoFormulario = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement

type Props = {
  textoSucesso: string
  descricaoSucesso?: string
  aoEnviar?: () => void
  children: ReactNode
}

export default function FormularioSimulado({ textoSucesso, descricaoSucesso, aoEnviar, children }: Props) {
  function enviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    const campos = Array.from(evento.currentTarget.elements).filter(
      (elemento): elemento is CampoFormulario =>
        elemento instanceof HTMLInputElement ||
        elemento instanceof HTMLSelectElement ||
        elemento instanceof HTMLTextAreaElement,
    )

    let primeiroInvalido: CampoFormulario | null = null
    for (const campo of campos) {
      if (campo.validity.valid) {
        campo.removeAttribute('aria-invalid')
      } else {
        campo.setAttribute('aria-invalid', 'true')
        primeiroInvalido = primeiroInvalido ?? campo
      }
    }

    if (primeiroInvalido) {
      primeiroInvalido.focus()
      avisar.erro('Confira os campos destacados', 'Alguns campos obrigatórios ainda não foram preenchidos.')
      return
    }

    aoEnviar?.()
    avisar.sucesso(textoSucesso, descricaoSucesso)
  }

  return (
    <form noValidate onSubmit={enviar}>
      {children}
    </form>
  )
}
