import Link from 'next/link'
import { itensPainel, type ChavePainel } from '@/components/painel/itensPainel'

export default function MenuPainelAbas({ ativo }: { ativo: ChavePainel }) {
  return (
    <nav className="painel-abas" aria-label="Menu do painel">
      {itensPainel().map((item) => (
        <Link
          key={item.chave}
          href={item.href}
          className={`painel-aba${item.chave === ativo ? ' painel-aba-ativa' : ''}`}
          aria-current={item.chave === ativo ? 'page' : undefined}
        >
          {item.icone}
          <span>{item.textoCurto}</span>
          {item.marcador && (
            <span className={`painel-aba-marcador${item.marcador.alerta ? ' painel-aba-marcador-alerta' : ''}`}>
              <span className="so-leitor">{item.marcador.texto}</span>
            </span>
          )}
        </Link>
      ))}
    </nav>
  )
}
