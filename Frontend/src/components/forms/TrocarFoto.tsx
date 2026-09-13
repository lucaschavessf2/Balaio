'use client'

import { useRef, useState } from 'react'
import { Retrato } from '@/components/ui/Basicos'
import { avisar } from '@/components/feedback/Avisos'

export default function TrocarFoto({ imagemInicial, rotulo }: { imagemInicial?: string; rotulo: string }) {
  const [imagem, definirImagem] = useState(imagemInicial)
  const entrada = useRef<HTMLInputElement>(null)

  return (
    <div className="bloco-artesao abaixo-4">
      <Retrato imagem={imagem} />
      <div className="encolhivel">
        <p style={{ fontWeight: 600 }}>{rotulo}</p>
        <button type="button" className="botao botao-fantasma acima-2" onClick={() => entrada.current?.click()}>
          Trocar foto
        </button>
        <input
          ref={entrada}
          type="file"
          accept="image/*"
          className="so-leitor"
          tabIndex={-1}
          onChange={(evento) => {
            const arquivo = evento.target.files?.[0]
            if (!arquivo) return
            definirImagem(URL.createObjectURL(arquivo))
            avisar.sucesso('Foto atualizada')
          }}
        />
      </div>
    </div>
  )
}
