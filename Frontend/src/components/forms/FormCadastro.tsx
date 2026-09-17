'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState, type FormEvent } from 'react'
import { Campo } from '@/components/ui/Basicos'
import { avisar } from '@/components/feedback/Avisos'
import { validarEmail, validarObrigatorio, validarSenha } from '@/utils/validacao'
import { cadastrarUsuario } from '@/services/api/conta.servico'

const perfis = [
  { chave: 'comprador', rotulo: 'Quero comprar peças', destino: '/account' },
  { chave: 'artesao', rotulo: 'Quero vender o que eu faço', destino: '/dashboard' },
] as const

type Perfil = (typeof perfis)[number]['chave']

type Props = {
  tecnicas: string[]
  territorios: string[]
}

export default function FormCadastro({ tecnicas, territorios }: Props) {
  const roteador = useRouter()
  const [perfil, definirPerfil] = useState<Perfil>('comprador')
  const [erros, definirErros] = useState<Record<string, string>>({})
  const [enviando, definirEnviando] = useState(false)

  const vendedor = perfil === 'artesao'

  async function cadastrar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    const dados = new FormData(evento.currentTarget)
    const proximosErros: Record<string, string> = {}

    const problemaNome = validarObrigatorio(String(dados.get('nome') ?? ''), 'Digite seu nome completo')
    if (problemaNome) proximosErros['cadastro-nome'] = problemaNome

    const problemaEmail = validarEmail(String(dados.get('email') ?? ''))
    if (problemaEmail) proximosErros['cadastro-email'] = problemaEmail

    const problemaSenha = validarSenha(String(dados.get('senha') ?? ''))
    if (problemaSenha) proximosErros['cadastro-senha'] = problemaSenha

    definirErros(proximosErros)
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
      avisar.erro('Não foi possível criar a conta', erro?.mensagem)
      return
    }

    const destino = perfis.find((p) => p.chave === perfil)!.destino
    avisar.sucesso(
      'Conta criada!',
      vendedor ? 'Seu ateliê já pode publicar a primeira peça.' : 'Boas compras: seu catálogo está liberado.',
    )
    roteador.push(destino)
    roteador.refresh()
  }

  return (
    <form className="cartao" onSubmit={cadastrar} noValidate>
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
        <div className="grade-dois">
          <Campo
            rotulo="Seu território"
            ajuda="Aparece na peça e na busca por região."
            id="cadastro-territorio"
          >
            <select id="cadastro-territorio" name="territorio" defaultValue={territorios[0]}>
              {territorios.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </Campo>

          <Campo rotulo="Sua técnica principal" ajuda="Dá para acrescentar outras depois." id="cadastro-tecnica">
            <select id="cadastro-tecnica" name="tecnica" defaultValue={tecnicas[0]}>
              {tecnicas.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </Campo>
        </div>
      )}

      <button type="submit" className="botao botao-primario botao-largo" disabled={enviando}>
        {enviando ? 'Criando conta…' : 'Criar minha conta'}
      </button>

      <p className="voltar-login">
        Já tem conta? <Link href="/login">Entrar</Link>
      </p>
    </form>
  )
}
