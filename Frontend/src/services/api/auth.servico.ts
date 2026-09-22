import { enviar } from './cliente'
import type { RespostaApi } from './tipos'

export type Papel = 'comprador' | 'artesao' | 'admin'

export type PapelCadastro = Exclude<Papel, 'admin'>

export type UsuarioAutenticado = {
  id: string
  nome: string
  email: string
  papel: Papel
  imagem: string
  telefone?: string
  artesao?: string
}

export type DadosCadastro = {
  nome: string
  email: string
  senha: string
  papel: PapelCadastro
  territorio?: string
  tecnica?: string
}

export function entrar(email: string, senha: string): Promise<RespostaApi<UsuarioAutenticado>> {
  return enviar<UsuarioAutenticado>('/auth/entrar', { email, senha })
}

export function cadastrar(dados: DadosCadastro): Promise<RespostaApi<UsuarioAutenticado>> {
  return enviar<UsuarioAutenticado>('/auth/cadastro', dados)
}

export function atualizarConta(
  id: string,
  dados: { nome: string; email: string; telefone: string },
): Promise<RespostaApi<UsuarioAutenticado>> {
  return enviar<UsuarioAutenticado>(`/conta/${encodeURIComponent(id)}`, dados, 'PATCH')
}

export function alterarSenha(id: string, senhaAtual: string, novaSenha: string): Promise<RespostaApi<{ id: string }>> {
  return enviar<{ id: string }>(`/conta/${encodeURIComponent(id)}/senha`, { senhaAtual, novaSenha })
}
