'use client'

import { useCallback, useEffect, useState } from 'react'
import { obterPerfilConta } from '@/services/api/conta.servico'
import { useSessao } from '@/store/sessao'
import type { Usuario } from '@/types/dominio'

type ResultadoPerfil = { identidade: string; revisao: number; perfil: Usuario | null; erro?: string }

export function usePerfilConta() {
  const { sessao, estado, versao, saidaPendente } = useSessao()
  const identidade = estado === 'autenticada' && sessao && !saidaPendente ? `${versao}:${sessao.id}` : null
  const [revisao, definirRevisao] = useState(0)
  const [resultado, definirResultado] = useState<ResultadoPerfil | null>(null)
  const recarregar = useCallback(() => definirRevisao((valor) => valor + 1), [])

  useEffect(() => {
    if (!identidade) return
    let ativo = true
    void obterPerfilConta().then(({ dados, erro }) => {
      if (ativo) definirResultado({ identidade, revisao, perfil: dados, erro: erro?.mensagem })
    })
    return () => { ativo = false }
  }, [identidade, revisao])

  const atual = identidade && resultado?.identidade === identidade && resultado.revisao === revisao ? resultado : null
  return { perfil: atual?.perfil ?? null, erro: atual?.erro, carregando: Boolean(identidade && !atual), recarregar }
}
