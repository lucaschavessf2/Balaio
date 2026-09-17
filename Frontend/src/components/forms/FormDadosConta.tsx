'use client'

import { useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { avisar } from '@/components/feedback/Avisos'
import { Campo } from '@/components/ui/Basicos'
import { atualizarUsuario } from '@/services/api/conta.servico'
import type { Usuario } from '@/mocks/usuario'

export default function FormDadosConta({ usuario }: { usuario: Usuario }) {
  const roteador = useRouter()
  const [enviando, definirEnviando] = useState(false)

  async function salvar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    const formulario = evento.currentTarget
    if (!formulario.reportValidity()) return
    const dados = new FormData(formulario)
    definirEnviando(true)
    const resposta = await atualizarUsuario({
      nome: String(dados.get('nome') ?? ''),
      email: String(dados.get('email') ?? ''),
      telefone: String(dados.get('telefone') ?? ''),
      tipoComprador: String(dados.get('tipoComprador') ?? 'final'),
    })
    definirEnviando(false)
    if (!resposta.dados) {
      avisar.erro('Não foi possível salvar os dados', resposta.erro?.mensagem)
      return
    }
    avisar.sucesso('Dados da conta salvos')
    roteador.refresh()
  }

  return (
    <form noValidate onSubmit={salvar}>
      <section className="cartao">
        <Campo rotulo="Nome completo" id="conta-nome">
          <input id="conta-nome" name="nome" defaultValue={usuario.nome} autoComplete="name" required />
        </Campo>
        <Campo rotulo="E-mail" id="conta-email">
          <input id="conta-email" name="email" type="email" defaultValue={usuario.email} autoComplete="email" required />
        </Campo>
        <Campo rotulo="Telefone" ajuda="Usado só para avisos sobre a entrega." id="conta-telefone">
          <input id="conta-telefone" name="telefone" type="tel" defaultValue={usuario.telefone ?? ''} autoComplete="tel" />
        </Campo>
        <Campo rotulo="Que tipo de comprador você é?" ajuda="Ajuda a plataforma a sugerir peças mais úteis para você." id="conta-tipo">
          <select id="conta-tipo" name="tipoComprador" defaultValue={usuario.tipoComprador ?? 'final'}>
            <option value="final">Compro para mim</option>
            <option value="presente">Compro para presentear</option>
            <option value="lojista">Sou lojista e revendo</option>
            <option value="turista">Conheci em uma viagem a PE</option>
          </select>
        </Campo>
        <button type="submit" className="botao botao-primario" disabled={enviando}>
          {enviando ? 'Salvando…' : 'Salvar alterações'}
        </button>
      </section>
    </form>
  )
}
