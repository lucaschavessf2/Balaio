import { buscar, enviar } from './cliente'
import type { EnderecoUsuario, Usuario } from '@/mocks/usuario'
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
export const criarEndereco = (endereco: Omit<EnderecoUsuario, 'id' | 'principal'>) => enviar<EnderecoUsuario>('/usuario/enderecos', endereco)
export const atualizarEndereco = (id: string, endereco: Partial<EnderecoUsuario>) => enviar<EnderecoUsuario>(`/usuario/enderecos/${encodeURIComponent(id)}`, endereco, 'PATCH')
export const excluirEndereco = (id: string) => buscar<EnderecoUsuario>(`/usuario/enderecos/${encodeURIComponent(id)}`, { method: 'DELETE' })
export const solicitarRecuperacao = (email: string) => enviar<{ recebida: boolean }>('/auth/recuperacao', { email })
export const listarFretes = () => buscar<OpcaoFrete[]>('/fretes')
