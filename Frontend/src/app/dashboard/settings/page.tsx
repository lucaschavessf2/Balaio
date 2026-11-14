import { Migalhas } from '@/components/ui/Basicos'
import FormPerfilAtelie from '@/components/painel/FormPerfilAtelie'
import FormEnvioProducao from '@/components/painel/FormEnvioProducao'
import FormRecebimento from '@/components/painel/FormRecebimento'
import CartaoSelo from '@/components/painel/CartaoSelo'
import { IconeAviso } from '@/components/ui/Icones'
import { notFound } from 'next/navigation'
import { obterArtesao, obterConfiguracoes } from '@/services/api/artesaos.servico'
import { obterMeuSelo } from '@/services/api/curadoria.servico'
import { obterReferencias } from '@/services/api/referencias.servico'
import { exigirArtesao } from '@/services/autenticacao'

export default async function Configuracoes() {
  const { artesao: atelie, token } = await exigirArtesao()
  const [{ dados: artesao }, refs, { dados: configuracoes, erro: erroConfiguracoes }, { dados: estadoSelo }] = await Promise.all([
    obterArtesao(atelie.slug),
    obterReferencias(),
    obterConfiguracoes(atelie.slug),
    obterMeuSelo(token),
  ])
  if (!artesao) notFound()
  if (!configuracoes) throw new Error(erroConfiguracoes?.mensagem ?? 'Não foi possível carregar as configurações.')
  const tecnicas = refs.dados?.tecnicas ?? []
  const territorios = refs.dados?.territorios ?? []

  return (
    <>
      <Migalhas trilha={[{ texto: 'Painel do artesão', href: '/dashboard' }, { texto: 'Configurações da oficina' }]} />
      <h1 className="titulo-pagina">Configurações da oficina</h1>
      <p className="subtitulo-pagina">
        Como o seu ateliê aparece para quem compra, de onde suas peças saem e quando você consegue produzir.
      </p>

      <div className="duas-colunas">
        <div>
          <FormPerfilAtelie artesao={artesao} tecnicas={tecnicas} territorios={territorios} />

          <FormEnvioProducao slug={artesao.slug} configuracoes={configuracoes} />
        </div>

        <aside>
          <CartaoSelo estadoInicial={estadoSelo ?? { selo: artesao.selo, solicitacao: null }} />

          <FormRecebimento slug={artesao.slug} chavePix={configuracoes.chavePix} />

          <p className="aviso">
            <IconeAviso />
            <span>
              Você não precisa de CNPJ para vender. Se um comprador pedir nota fiscal, a plataforma emite em nome
              do ateliê.
            </span>
          </p>
        </aside>
      </div>
    </>
  )
}
