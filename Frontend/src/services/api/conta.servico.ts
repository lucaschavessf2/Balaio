import { buscar, enviar } from './cliente'
import type { Usuario } from '@/mocks/usuario'
import type { OpcaoFrete } from '@/mocks/frete'

export type Cadastro = { nome: string; email: string; senha: string; perfil: 'comprador' | 'artesao'; territorio?: string; tecnica?: string }
export type Credenciais = { email: string; senha: string }
export type AtualizacaoUsuario = Pick<Usuario, 'nome' | 'email' | 'telefone' | 'tipoComprador'>

const autorizacao = (token?: string) => token ? { headers: { Authorization: `Bearer ${token}` } } : undefined

export const cadastrarUsuario = (cadastro: Cadastro) => enviar<Usuario>('/auth/cadastro', cadastro)
export const entrar = (credenciais: Credenciais) => enviar<Usuario>('/auth/login', credenciais)
export const sair = () => enviar<{ encerrada: boolean }>('/auth/logout', {})
export const obterUsuario = (token?: string) => buscar<Usuario>('/usuario', autorizacao(token))
export const atualizarUsuario = (usuario: AtualizacaoUsuario) => enviar<Usuario>('/usuario', usuario, 'PATCH')
export const listarFretes = () => buscar<OpcaoFrete[]>('/fretes')
