import { buscar, enviar } from './cliente'
import type { RespostaApi } from './tipos'

export type PerguntaPublica = { id: string; pecaSlug: string; pergunta: string; autor: string; usuarioId?: string; resposta?: string }

export const listarPerguntas = (slug: string): Promise<RespostaApi<PerguntaPublica[]>> => buscar(`/pecas/${encodeURIComponent(slug)}/perguntas`)
export const criarPergunta = (slug: string, pergunta: string): Promise<RespostaApi<PerguntaPublica>> => enviar(`/pecas/${encodeURIComponent(slug)}/perguntas`, { pergunta })
export const responderPergunta = (slug: string, id: string, resposta: string): Promise<RespostaApi<PerguntaPublica>> => enviar(`/pecas/${encodeURIComponent(slug)}/perguntas/${encodeURIComponent(id)}`, { resposta }, 'PATCH')
