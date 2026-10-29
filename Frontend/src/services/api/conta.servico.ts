import { buscar, enviar } from './cliente'
import type { EnderecoUsuario, OpcaoFrete, Usuario } from '@/types/dominio'

export type Cadastro = { nome: string; email: string; senha: string; perfil: 'comprador' | 'artesao'; territorio?: string; tecnica?: string }
export type Credenciais = { email: string; senha: string }
export type AtualizacaoUsuario = Pick<Usuario, 'nome' | 'email' | 'telefone' | 'tipoComprador'>

const autorizacao = (token?: string) => token ? { headers: { Authorization: `Bearer ${token}` } } : undefined

const baseAutenticacao = () => typeof window === 'undefined'
  ? (process.env.API_GATEWAY_URL ?? 'http://127.0.0.1:8080/api/v1')
  : '/api/v1'
export const enviarAutenticacao = <T>(caminho: string, corpo: unknown) => buscar<T>(caminho, {
  method: 'POST', body: JSON.stringify(corpo),
}, baseAutenticacao())

export const cadastrarUsuario = (cadastro: Cadastro) => enviarAutenticacao<Usuario>('/auth/cadastro', cadastro)
export const entrar = (credenciais: Credenciais) => enviarAutenticacao<Usuario>('/auth/login', credenciais)
export const sair = () => enviarAutenticacao<{ encerrada: boolean }>('/auth/logout', {})
export const obterUsuario = (token?: string) => buscar<Usuario>('/usuario', autorizacao(token), baseAutenticacao())
export const obterPerfilConta = () => buscar<Usuario>('/conta/perfil')
export const atualizarUsuario = (usuario: AtualizacaoUsuario) => enviar<Usuario>('/usuario', usuario, 'PATCH')
export const criarEndereco = (endereco: Omit<EnderecoUsuario, 'id' | 'principal'>) => enviar<EnderecoUsuario>('/usuario/enderecos', endereco)
export const atualizarEndereco = (id: string, endereco: Partial<EnderecoUsuario>) => enviar<EnderecoUsuario>(`/usuario/enderecos/${encodeURIComponent(id)}`, endereco, 'PATCH')
export const excluirEndereco = (id: string) => buscar<EnderecoUsuario>(`/usuario/enderecos/${encodeURIComponent(id)}`, { method: 'DELETE' })
export const solicitarRecuperacao = (email: string) => enviar<{ recebida: boolean }>('/auth/recuperacao', { email })
export const listarFretes = () => buscar<OpcaoFrete[]>('/fretes')
