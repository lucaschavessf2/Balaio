import { IconeCheck, IconeInfo } from '@/components/ui/Icones'

export type EstadoSalvo = { tipo: 'salvo'; horario: string; campos: string[] } | { tipo: 'sem-mudancas' } | null

export function horarioAgora(): string {
  return new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
}

export default function ConfirmacaoSalvo({ estado }: { estado: EstadoSalvo }) {
  return (
    <div role="status" aria-live="polite">
      {estado?.tipo === 'salvo' && (
        <p className="confirmacao-salvo">
          <IconeCheck tamanho={16} />
          <span>
            <strong>Salvo às {estado.horario}.</strong> Atualizado: {estado.campos.join(', ')}.
          </span>
        </p>
      )}
      {estado?.tipo === 'sem-mudancas' && (
        <p className="confirmacao-salvo confirmacao-salvo-neutra">
          <IconeInfo tamanho={16} />
          <span>Nenhuma alteração para salvar.</span>
        </p>
      )}
    </div>
  )
}
