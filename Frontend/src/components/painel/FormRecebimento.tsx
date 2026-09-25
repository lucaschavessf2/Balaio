'use client'

import { useState, type FormEvent } from 'react'
import { Campo } from '@/components/ui/Basicos'
import { avisar } from '@/components/feedback/Avisos'
import { IconeAviso } from '@/components/ui/Icones'
import ConfirmacaoSalvo, { horarioAgora, type EstadoSalvo } from '@/components/painel/ConfirmacaoSalvo'
import { atualizarConfiguracoes } from '@/services/api/artesaos.servico'
import { validarObrigatorio } from '@/utils/validacao'

export default function FormRecebimento({ slug, chavePix }: { slug: string; chavePix: string }) {
  const [salva, definirSalva] = useState(chavePix)
  const [erro, definirErro] = useState<string | null>(null)
  const [erroEnvio, definirErroEnvio] = useState<string | null>(null)
  const [confirmacao, definirConfirmacao] = useState<EstadoSalvo>(null)
  const [salvando, definirSalvando] = useState(false)

  async function salvar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    if (salvando) return
    const chave = String(new FormData(evento.currentTarget).get('chavePix') ?? '').trim()
    const problema = validarObrigatorio(chave, 'Informe a chave Pix que recebe os repasses')
    definirErro(problema)
    definirErroEnvio(null)
    definirConfirmacao(null)
    if (problema) {
      document.getElementById('cfg-pix')?.focus()
      return
    }
    if (chave === salva) {
      definirConfirmacao({ tipo: 'sem-mudancas' })
      return
    }

    definirSalvando(true)
    const { dados, erro: erroApi } = await atualizarConfiguracoes(slug, { chavePix: chave })
    definirSalvando(false)

    if (!dados) {
      definirErroEnvio(erroApi?.mensagem ?? 'Não foi possível salvar agora.')
      avisar.erro('Chave não atualizada', 'O que você digitou continua no formulário.')
      return
    }

    definirSalva(dados.chavePix)
    definirConfirmacao({ tipo: 'salvo', horario: horarioAgora(), campos: ['Chave Pix'] })
    avisar.sucesso('Chave Pix atualizada', 'O próximo repasse já usa a nova chave.')
  }

  return (
    <form className="cartao abaixo-4" onSubmit={salvar} noValidate>
      <h2 className="secao-titulo">Recebimento</h2>

      <ConfirmacaoSalvo estado={confirmacao} />

      {erroEnvio && (
        <p className="auth-erro" role="alert">
          <IconeAviso tamanho={18} />
          <span>{erroEnvio}</span>
        </p>
      )}

      <Campo
        rotulo="Chave Pix para repasse"
        ajuda="É para cá que o valor vai depois da entrega."
        erro={erro ?? undefined}
        id="cfg-pix"
      >
        <input id="cfg-pix" name="chavePix" defaultValue={salva} placeholder="E-mail, telefone, CPF ou chave aleatória" />
      </Campo>
      <button type="submit" className="botao botao-secundario botao-largo" disabled={salvando}>
        {salvando ? 'Salvando…' : 'Atualizar chave'}
      </button>
    </form>
  )
}
