'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState, type FormEvent } from 'react'
import { Campo } from '@/components/ui/Basicos'
import { avisar } from '@/components/feedback/Avisos'
import SeletorComOutro from '@/components/forms/SeletorComOutro'
import TrocarFoto from '@/components/forms/TrocarFoto'
import { IconeAviso, IconeSetaDireita } from '@/components/ui/Icones'
import { avisarArtesaoAtualizado } from '@/hooks/useArtesaoLogado'
import { atualizarArtesao, type PerfilArtesao } from '@/services/api/artesaos.servico'
import ConfirmacaoSalvo, { horarioAgora, type EstadoSalvo } from '@/components/painel/ConfirmacaoSalvo'
import { camposAlterados, listarRotulos } from '@/utils/alteracoes'
import type { Artesao } from '@/types/dominio'
import { validarObrigatorio } from '@/utils/validacao'

const rotulosPerfil: Record<keyof PerfilArtesao, string> = {
  imagem: 'Foto',
  atelie: 'Nome do ateliê',
  nome: 'Nome de artesão',
  historia: 'História',
  territorio: 'Território',
  tecnica: 'Técnica principal',
}

function perfilDe(artesao: Artesao): PerfilArtesao {
  const { imagem, atelie, nome, historia, territorio, tecnica } = artesao
  return {
    imagem,
    atelie: atelie.trim(),
    nome: nome.trim(),
    historia: historia.trim(),
    territorio: territorio.trim(),
    tecnica: tecnica.trim() as PerfilArtesao['tecnica'],
  }
}

type Props = {
  artesao: Artesao
  tecnicas: string[]
  territorios: string[]
}

export default function FormPerfilAtelie({ artesao, tecnicas, territorios }: Props) {
  const roteador = useRouter()
  const [erros, definirErros] = useState<Record<string, string>>({})
  const [erroEnvio, definirErroEnvio] = useState<string | null>(null)
  const [salvando, definirSalvando] = useState(false)
  const [salvo, definirSalvo] = useState<PerfilArtesao>(() => perfilDe(artesao))
  const [confirmacao, definirConfirmacao] = useState<EstadoSalvo>(null)

  async function salvar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    if (salvando) return
    const dados = new FormData(evento.currentTarget)
    const texto = (campo: string) => String(dados.get(campo) ?? '').trim()
    const proximosErros: Record<string, string> = {}

    const problemaAtelie = validarObrigatorio(texto('atelie'), 'Dê um nome ao seu ateliê')
    if (problemaAtelie) proximosErros['cfg-atelie'] = problemaAtelie
    const problemaNome = validarObrigatorio(texto('nome'), 'Digite como você assina as peças')
    if (problemaNome) proximosErros['cfg-nome'] = problemaNome

    definirErros(proximosErros)
    definirErroEnvio(null)
    definirConfirmacao(null)
    const primeiro = Object.keys(proximosErros)[0]
    if (primeiro) {
      document.getElementById(primeiro)?.focus()
      avisar.erro('Confira os campos destacados')
      return
    }

    const atual: PerfilArtesao = {
      imagem: texto('imagem') || salvo.imagem,
      atelie: texto('atelie'),
      nome: texto('nome'),
      historia: texto('historia'),
      territorio: texto('territorio'),
      tecnica: texto('tecnica') as PerfilArtesao['tecnica'],
    }
    const alteracoes = camposAlterados(salvo, atual)
    if (Object.keys(alteracoes).length === 0) {
      definirConfirmacao({ tipo: 'sem-mudancas' })
      return
    }

    definirSalvando(true)
    const { dados: atualizado, erro } = await atualizarArtesao(artesao.slug, alteracoes)
    definirSalvando(false)

    if (!atualizado) {
      const mensagem = erro?.mensagem ?? 'Não foi possível salvar agora.'
      definirErroEnvio(mensagem)
      avisar.erro('Perfil não salvo', 'O que você digitou continua no formulário.')
      return
    }

    definirSalvo(perfilDe(atualizado))
    definirConfirmacao({ tipo: 'salvo', horario: horarioAgora(), campos: listarRotulos(alteracoes, rotulosPerfil) })
    avisarArtesaoAtualizado(atualizado)
    avisar.sucesso('Perfil do ateliê salvo', 'Quem visitar sua loja já vê a nova versão.')
    roteador.refresh()
  }

  return (
    <form className="cartao abaixo-5" onSubmit={salvar} noValidate>
      <h2 className="secao-titulo">Identidade do ateliê</h2>

      <ConfirmacaoSalvo estado={confirmacao} />

      {erroEnvio && (
        <p className="auth-erro" role="alert">
          <IconeAviso tamanho={18} />
          <span>{erroEnvio}</span>
        </p>
      )}

      <TrocarFoto imagemInicial={salvo.imagem} rotulo="Foto do ateliê" nome="imagem" />

      <Campo rotulo="Nome do ateliê" erro={erros['cfg-atelie']} id="cfg-atelie">
        <input id="cfg-atelie" name="atelie" defaultValue={artesao.atelie} />
      </Campo>

      <Campo
        rotulo="Seu nome de artesão"
        ajuda="É como sua assinatura aparece nas peças."
        erro={erros['cfg-nome']}
        id="cfg-nome"
      >
        <input id="cfg-nome" name="nome" defaultValue={artesao.nome} />
      </Campo>

      <Campo
        rotulo="Sua história"
        ajuda="É o texto que aparece no topo do seu perfil. Conte de onde vem o ofício."
        id="cfg-historia"
      >
        <textarea id="cfg-historia" name="historia" defaultValue={artesao.historia} />
      </Campo>

      <div className="grade-dois">
        <Campo rotulo="Território" id="cfg-territorio">
          <SeletorComOutro
            id="cfg-territorio"
            name="territorio"
            opcoes={territorios}
            valorInicial={artesao.territorio || undefined}
            rotuloOutro="Outro território…"
            tituloModal="Qual é o seu território?"
            ajudaModal="Nome da cidade ou região onde fica o seu ateliê"
            exemploModal="Ex.: Bezerros, Agreste"
          />
        </Campo>
        <Campo rotulo="Técnica principal" id="cfg-tecnica">
          <SeletorComOutro
            id="cfg-tecnica"
            name="tecnica"
            opcoes={tecnicas}
            valorInicial={artesao.tecnica || undefined}
            rotuloOutro="Outra técnica…"
            tituloModal="Qual é a sua técnica?"
            ajudaModal="Como você chama o que faz"
            exemploModal="Ex.: Trançado de palha"
          />
        </Campo>
      </div>

      <div className="acoes-linha">
        <button type="submit" className="botao botao-primario" disabled={salvando}>
          {salvando ? 'Salvando…' : 'Salvar identidade'}
        </button>
        <Link href={`/artisans/${artesao.slug}`} className="botao botao-fantasma">
          Ver minha loja
          <IconeSetaDireita />
        </Link>
      </div>
    </form>
  )
}
