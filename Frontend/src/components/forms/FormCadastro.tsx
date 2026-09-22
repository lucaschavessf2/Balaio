'use client'

import { useRouter } from 'next/navigation'
import { useState, type FormEvent } from 'react'
import { Campo } from '@/components/ui/Basicos'
import { avisar } from '@/components/feedback/Avisos'
import { IconeAviso, IconeCadeado } from '@/components/ui/Icones'
import type { PapelCadastro } from '@/services/api/auth.servico'
import { destinoInicial, sessaoDoUsuario } from '@/services/sessao/cookie'
import { useSessao } from '@/store/sessao'
import SeletorComOutro from '@/components/forms/SeletorComOutro'
import { validarEmail, validarObrigatorio, validarSenha } from '@/utils/validacao'
import { cadastrarUsuario } from '@/services/api/conta.servico'

const perfis: { chave: PapelCadastro; rotulo: string }[] = [
  { chave: 'comprador', rotulo: 'Quero comprar peças' },
  { chave: 'artesao', rotulo: 'Quero vender o que eu faço' },
]

type Props = {
  tecnicas: string[]
  territorios: string[]
}

export default function FormCadastro({ tecnicas, territorios }: Props) {
  const roteador = useRouter()
  const { iniciarSessao } = useSessao()
  const [perfil, definirPerfil] = useState<PapelCadastro>('comprador')
  const [erros, definirErros] = useState<Record<string, string>>({})
  const [enviando, definirEnviando] = useState(false)
  const [erroEnvio, definirErroEnvio] = useState<string | null>(null)

  const vendedor = perfil === 'artesao'

  async function cadastrar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    if (enviando) return
    const dados = new FormData(evento.currentTarget)
    const proximosErros: Record<string, string> = {}

    const problemaNome = validarObrigatorio(String(dados.get('nome') ?? ''), 'Digite seu nome completo')
    if (problemaNome) proximosErros['cadastro-nome'] = problemaNome

    const problemaEmail = validarEmail(String(dados.get('email') ?? ''))
    if (problemaEmail) proximosErros['cadastro-email'] = problemaEmail

    const problemaSenha = validarSenha(String(dados.get('senha') ?? ''))
    if (problemaSenha) proximosErros['cadastro-senha'] = problemaSenha

    definirErros(proximosErros)
    definirErroEnvio(null)
    const primeiro = Object.keys(proximosErros)[0]
    if (primeiro) {
      document.getElementById(primeiro)?.focus()
      avisar.erro('Confira os campos destacados')
      return
    }

    definirEnviando(true)
    const { dados: usuario, erro } = await cadastrarUsuario({
      nome: String(dados.get('nome')),
      email: String(dados.get('email')),
      senha: String(dados.get('senha')),
      perfil,
      territorio: vendedor ? String(dados.get('territorio') ?? '') : undefined,
      tecnica: vendedor ? String(dados.get('tecnica') ?? '') : undefined,
    })
    definirEnviando(false)
    if (!usuario) {
      definirErroEnvio(erro?.mensagem ?? 'Não foi possível criar a conta.')
      avisar.erro('Não foi possível criar a conta', erro?.mensagem)
      return
    }

    const sessao = sessaoDoUsuario(usuario)
    if (!sessao) { definirErroEnvio('A API não retornou uma conta válida.'); return }
    iniciarSessao(sessao)
    const destino = destinoInicial(sessao)
    avisar.sucesso(
      'Conta criada!',
      vendedor ? 'Seu ateliê já pode publicar a primeira peça.' : 'Boas compras: seu catálogo está liberado.',
    )
    roteador.push(destino)
    roteador.refresh()
  }

  return (
    <form className="cartao" onSubmit={cadastrar} noValidate>
      {erroEnvio && (
        <p className="auth-erro" role="alert">
          <IconeAviso tamanho={18} />
          <span>{erroEnvio}</span>
        </p>
      )}

      <fieldset className="campo">
        <legend className="campo-rotulo">Você vem para</legend>
        <div className="lista-radios">
          {perfis.map((item) => (
            <label key={item.chave} className="opcao-radio">
              <input
                type="radio"
                name="perfil"
                value={item.chave}
                checked={perfil === item.chave}
                onChange={() => definirPerfil(item.chave)}
              />
              <span>{item.rotulo}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <Campo rotulo="Seu nome completo" erro={erros['cadastro-nome']} id="cadastro-nome">
        <input id="cadastro-nome" name="nome" autoComplete="name" placeholder="Como você quer ser chamado" />
      </Campo>

      <Campo rotulo="Seu e-mail" erro={erros['cadastro-email']} id="cadastro-email">
        <input
          id="cadastro-email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="voce@exemplo.com"
        />
      </Campo>

      <Campo
        rotulo="Crie uma senha"
        ajuda="No mínimo 8 caracteres."
        erro={erros['cadastro-senha']}
        id="cadastro-senha"
      >
        <input id="cadastro-senha" name="senha" type="password" autoComplete="new-password" />
      </Campo>

      {vendedor && (
        <>
          <div className="grade-dois">
            <Campo
              rotulo="Seu território"
              ajuda="Aparece na peça e na busca por região."
              id="cadastro-territorio"
            >
              <SeletorComOutro
                id="cadastro-territorio"
                name="territorio"
                opcoes={territorios}
                rotuloOutro="Outro território…"
                tituloModal="Qual é o seu território?"
                ajudaModal="Nome da cidade ou região onde fica o seu ateliê"
                exemploModal="Ex.: Bezerros, Agreste"
              />
            </Campo>

            <Campo rotulo="Sua técnica principal" ajuda="Dá para acrescentar outras depois." id="cadastro-tecnica">
              <SeletorComOutro
                id="cadastro-tecnica"
                name="tecnica"
                opcoes={tecnicas}
                rotuloOutro="Outra técnica…"
                tituloModal="Qual é a sua técnica?"
                ajudaModal="Como você chama o que faz"
                exemploModal="Ex.: Trançado de palha"
              />
            </Campo>
          </div>

          <p className="aviso auth-aviso">
            <IconeCadeado />
            <span>
              <strong>Não exigimos formalização.</strong> Artesãos informais vendem normalmente. A plataforma ajuda com
              a nota quando ela for necessária.
            </span>
          </p>
        </>
      )}

      <button type="submit" className="botao botao-primario botao-largo" disabled={enviando}>
        {enviando ? 'Criando conta…' : 'Criar minha conta'}
      </button>
    </form>
  )
}
