'use client'

import { useId, useRef, useState } from 'react'
import { Retrato } from '@/components/ui/Basicos'
import { avisar } from '@/components/feedback/Avisos'
import { FORMATOS_FOTO, lerComoDataUrl, TAMANHO_MAXIMO_FOTO_MB, validarFoto } from '@/utils/foto'

type Props = {
  imagemInicial?: string
  rotulo: string
  nome?: string
}

export default function TrocarFoto({ imagemInicial, rotulo, nome }: Props) {
  const idErro = useId()
  const [imagem, definirImagem] = useState(imagemInicial)
  const [erro, definirErro] = useState<string | null>(null)
  const entrada = useRef<HTMLInputElement>(null)

  async function escolher(arquivo: File | undefined) {
    if (!arquivo) return
    const problema = validarFoto(arquivo)
    definirErro(problema)
    if (entrada.current) entrada.current.value = ''
    if (problema) {
      avisar.erro('Foto recusada', problema)
      return
    }
    definirImagem(await lerComoDataUrl(arquivo))
    avisar.info('Foto escolhida', nome ? 'Ela é salva junto com o formulário.' : undefined)
  }

  return (
    <div className="bloco-artesao abaixo-4">
      <Retrato imagem={imagem} />
      <div className="encolhivel">
        <p style={{ fontWeight: 600 }}>{rotulo}</p>
        <p className="campo-ajuda">
          JPG, PNG ou WebP de até {TAMANHO_MAXIMO_FOTO_MB} MB.
        </p>
        <button
          type="button"
          className="botao botao-fantasma acima-2"
          onClick={() => entrada.current?.click()}
          aria-describedby={erro ? idErro : undefined}
        >
          Trocar foto
        </button>
        {erro && (
          <p className="campo-erro acima-2" id={idErro} role="alert">
            {erro}
          </p>
        )}
        <input
          ref={entrada}
          type="file"
          accept={FORMATOS_FOTO.join(',')}
          className="so-leitor"
          tabIndex={-1}
          onChange={(evento) => void escolher(evento.target.files?.[0])}
        />
        {nome && <input type="hidden" name={nome} value={imagem ?? ''} />}
      </div>
    </div>
  )
}
