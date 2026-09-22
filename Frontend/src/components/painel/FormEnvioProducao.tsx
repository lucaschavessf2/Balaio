'use client'

import { useState, type FormEvent } from 'react'
import { Campo } from '@/components/ui/Basicos'
import { avisar } from '@/components/feedback/Avisos'
import { IconeAviso, IconeCaminhao } from '@/components/ui/Icones'
import ConfirmacaoSalvo, { horarioAgora, type EstadoSalvo } from '@/components/painel/ConfirmacaoSalvo'
import { atualizarConfiguracoes, type ConfiguracoesAtelie } from '@/services/api/artesaos.servico'
import { camposAlterados, listarRotulos } from '@/utils/alteracoes'
import { validarCEP, validarPrazoDias } from '@/utils/validacao'

type EnvioProducao = Pick<ConfiguracoesAtelie, 'cepOrigem' | 'prazoPadraoDias' | 'aceitaEncomendas' | 'encomendasPausadas'>

const rotulosEnvio: Record<keyof EnvioProducao, string> = {
  cepOrigem: 'CEP de origem',
  prazoPadraoDias: 'Prazo padrão',
  aceitaEncomendas: 'Encomendas o ano todo',
  encomendasPausadas: 'Pausa de encomendas',
}

function envioDe(configuracoes: ConfiguracoesAtelie): EnvioProducao {
  const { cepOrigem, prazoPadraoDias, aceitaEncomendas, encomendasPausadas } = configuracoes
  return { cepOrigem, prazoPadraoDias, aceitaEncomendas, encomendasPausadas }
}

export default function FormEnvioProducao({ slug, configuracoes }: { slug: string; configuracoes: ConfiguracoesAtelie }) {
  const [salvo, definirSalvo] = useState<EnvioProducao>(() => envioDe(configuracoes))
  const [erros, definirErros] = useState<Record<string, string>>({})
  const [erroEnvio, definirErroEnvio] = useState<string | null>(null)
  const [confirmacao, definirConfirmacao] = useState<EstadoSalvo>(null)
  const [salvando, definirSalvando] = useState(false)

  async function salvar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    if (salvando) return
    const dados = new FormData(evento.currentTarget)
    const cep = String(dados.get('cepOrigem') ?? '').trim()
    const prazo = String(dados.get('prazoPadraoDias') ?? '').trim()
    const proximosErros: Record<string, string> = {}

    const problemaCep = validarCEP(cep)
    if (problemaCep) proximosErros['cfg-cep'] = problemaCep
    const problemaPrazo = validarPrazoDias(prazo)
    if (problemaPrazo) proximosErros['cfg-prazo'] = problemaPrazo

    definirErros(proximosErros)
    definirErroEnvio(null)
    definirConfirmacao(null)
    const primeiro = Object.keys(proximosErros)[0]
    if (primeiro) {
      document.getElementById(primeiro)?.focus()
      return
    }

    const atual: EnvioProducao = {
      cepOrigem: cep.replace(/^(\d{5})(\d{3})$/, '$1-$2'),
      prazoPadraoDias: Number(prazo),
      aceitaEncomendas: dados.get('aceitaEncomendas') === 'on',
      encomendasPausadas: dados.get('encomendasPausadas') === 'on',
    }
    const alteracoes = camposAlterados(salvo, atual)
    if (Object.keys(alteracoes).length === 0) {
      definirConfirmacao({ tipo: 'sem-mudancas' })
      return
    }

    definirSalvando(true)
    const { dados: atualizado, erro } = await atualizarConfiguracoes(slug, alteracoes)
    definirSalvando(false)

    if (!atualizado) {
      definirErroEnvio(erro?.mensagem ?? 'Não foi possível salvar agora.')
      avisar.erro('Preferências não salvas', 'O que você digitou continua no formulário.')
      return
    }

    definirSalvo(envioDe(atualizado))
    definirConfirmacao({ tipo: 'salvo', horario: horarioAgora(), campos: listarRotulos(alteracoes, rotulosEnvio) })
    avisar.sucesso('Preferências de envio salvas')
  }

  return (
    <form className="cartao" onSubmit={salvar} noValidate>
      <h2 className="secao-titulo linha-flex" style={{ gap: 10 }}>
        <IconeCaminhao tamanho={20} />
        Envio e produção
      </h2>

      <ConfirmacaoSalvo estado={confirmacao} />

      {erroEnvio && (
        <p className="auth-erro" role="alert">
          <IconeAviso tamanho={18} />
          <span>{erroEnvio}</span>
        </p>
      )}

      <Campo
        rotulo="CEP de origem"
        ajuda="É daqui que o frete é calculado para o comprador."
        erro={erros['cfg-cep']}
        id="cfg-cep"
      >
        <input
          id="cfg-cep"
          name="cepOrigem"
          defaultValue={salvo.cepOrigem}
          inputMode="numeric"
          maxLength={9}
          placeholder="55880-000"
        />
      </Campo>

      <Campo
        rotulo="Prazo padrão de encomenda (dias)"
        ajuda="Usado como sugestão quando você cadastra uma peça sob encomenda."
        erro={erros['cfg-prazo']}
        id="cfg-prazo"
      >
        <input id="cfg-prazo" name="prazoPadraoDias" type="number" defaultValue={salvo.prazoPadraoDias} min={1} max={120} />
      </Campo>

      <fieldset style={{ border: 0, padding: 0, margin: '0 0 18px' }}>
        <legend className="campo-rotulo abaixo-3">Quando você consegue produzir</legend>
        <div className="opcoes">
          <label className="opcao">
            <input type="checkbox" name="aceitaEncomendas" defaultChecked={salvo.aceitaEncomendas} />
            Aceito encomendas o ano todo
          </label>
          <label className="opcao">
            <input type="checkbox" name="encomendasPausadas" defaultChecked={salvo.encomendasPausadas} />
            Pausar encomendas temporariamente
          </label>
        </div>
      </fieldset>

      <button type="submit" className="botao botao-primario" disabled={salvando}>
        {salvando ? 'Salvando…' : 'Salvar envio'}
      </button>
    </form>
  )
}
