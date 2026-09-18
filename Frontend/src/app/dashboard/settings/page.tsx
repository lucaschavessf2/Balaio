import LayoutPainel from '@/components/painel/LayoutPainel'
import { Migalhas } from '@/components/ui/Basicos'
import FormConfiguracoesAtelie from '@/components/forms/FormConfiguracoesAtelie'
import { obterReferencias } from '@/services/api/referencias.servico'
import { exigirArtesao } from '@/services/autenticacao'

export default async function Configuracoes() {
  const [{ artesao }, refs] = await Promise.all([exigirArtesao(), obterReferencias()])
  return (
    <LayoutPainel ativo="config">
      <Migalhas trilha={[{ texto: 'Painel do artesão', href: '/dashboard' }, { texto: 'Configurações da oficina' }]} />
      <h1 className="titulo-pagina">Configurações da oficina</h1>
      <p className="subtitulo-pagina">Como o seu ateliê aparece para quem compra, de onde suas peças saem e quando você consegue produzir.</p>
      <div className="tela-estreita">
        <FormConfiguracoesAtelie artesao={artesao} tecnicas={refs.dados?.tecnicas ?? []} territorios={refs.dados?.territorios ?? []} />
      </div>
    </LayoutPainel>
  )
}
