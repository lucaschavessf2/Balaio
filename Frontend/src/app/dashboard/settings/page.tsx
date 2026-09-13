import LayoutPainel from '@/components/painel/LayoutPainel'
import { Campo, Migalhas } from '@/components/ui/Basicos'
import FormularioSimulado from '@/components/forms/FormularioSimulado'
import TrocarFoto from '@/components/forms/TrocarFoto'
import { IconeAviso, IconeCaminhao, IconeSelo } from '@/components/ui/Icones'
import { notFound } from 'next/navigation'
import { obterArtesao } from '@/services/api/artesaos.servico'
import { obterReferencias } from '@/services/api/referencias.servico'

export default async function Configuracoes() {
  const [{ dados: artesao }, refs] = await Promise.all([obterArtesao('mestre-nuca'), obterReferencias()])
  if (!artesao) notFound()
  const tecnicas = refs.dados?.tecnicas ?? []
  const territorios = refs.dados?.territorios ?? []

  return (
    <LayoutPainel ativo="config">
      <Migalhas trilha={[{ texto: 'Painel do artesão', href: '/dashboard' }, { texto: 'Configurações da oficina' }]} />
      <h1 className="titulo-pagina">Configurações da oficina</h1>
      <p className="subtitulo-pagina">
        Como o seu ateliê aparece para quem compra, de onde suas peças saem e quando você consegue produzir.
      </p>

      <div className="duas-colunas">
        <div>
          <FormularioSimulado textoSucesso="Identidade do ateliê salva">
            <section className="cartao abaixo-5">
              <h2 className="secao-titulo">Identidade do ateliê</h2>

              <TrocarFoto imagemInicial={artesao.imagem} rotulo="Foto do ateliê" />

              <Campo rotulo="Nome do ateliê" id="cfg-atelie">
                <input id="cfg-atelie" defaultValue={artesao.atelie} required />
              </Campo>

              <Campo rotulo="Seu nome de artesão" ajuda="É como sua assinatura aparece nas peças." id="cfg-nome">
                <input id="cfg-nome" defaultValue={artesao.nome} required />
              </Campo>

              <Campo
                rotulo="Sua história"
                ajuda="É o texto que aparece no topo do seu perfil. Conte de onde vem o ofício."
                id="cfg-historia"
              >
                <textarea id="cfg-historia" defaultValue={artesao.historia} />
              </Campo>

              <div className="grade-dois">
                <Campo rotulo="Território" id="cfg-territorio">
                  <select id="cfg-territorio" defaultValue={territorios[0]}>
                    {territorios.map((t) => (
                      <option key={t}>{t}</option>
                    ))}
                  </select>
                </Campo>
                <Campo rotulo="Técnica principal" id="cfg-tecnica">
                  <select id="cfg-tecnica" defaultValue={artesao.tecnica}>
                    {tecnicas.map((t) => (
                      <option key={t}>{t}</option>
                    ))}
                  </select>
                </Campo>
              </div>

              <button type="submit" className="botao botao-primario">
                Salvar identidade
              </button>
            </section>
          </FormularioSimulado>

          <FormularioSimulado textoSucesso="Preferências de envio salvas">
            <section className="cartao">
              <h2 className="secao-titulo linha-flex" style={{ gap: 10 }}>
                <IconeCaminhao tamanho={20} />
                Envio e produção
              </h2>

              <Campo rotulo="CEP de origem" ajuda="É daqui que o frete é calculado para o comprador." id="cfg-cep">
                <input id="cfg-cep" defaultValue="55880-000" required pattern="\d{5}-?\d{3}" inputMode="numeric" />
              </Campo>

              <Campo
                rotulo="Prazo padrão de encomenda (dias)"
                ajuda="Usado como sugestão quando você cadastra uma peça sob encomenda."
                id="cfg-prazo"
              >
                <input id="cfg-prazo" type="number" defaultValue={15} min={1} max={120} required />
              </Campo>

              <fieldset style={{ border: 0, padding: 0, margin: '0 0 18px' }}>
                <legend className="campo-rotulo abaixo-3">Quando você consegue produzir</legend>
                <div className="opcoes">
                  <label className="opcao">
                    <input type="checkbox" defaultChecked />
                    Aceito encomendas o ano todo
                  </label>
                  <label className="opcao">
                    <input type="checkbox" />
                    Pausar encomendas temporariamente
                  </label>
                </div>
              </fieldset>

              <button type="submit" className="botao botao-primario">
                Salvar envio
              </button>
            </section>
          </FormularioSimulado>
        </div>

        <aside>
          <div className="cartao abaixo-4">
            <h2 className="secao-titulo linha-flex" style={{ gap: 10 }}>
              <IconeSelo tamanho={20} />
              Selo de origem
            </h2>
            <p className="autoria abaixo-3">
              Seu ateliê tem o selo ativo, emitido pela Associação dos Ceramistas de Tracunhaém. Ele é revalidado a
              cada 12 meses.
            </p>
            <span className="selo selo-disponivel">
              <span className="selo-ponto" />
              Ativo até março de 2027
            </span>
          </div>

          <FormularioSimulado
            textoSucesso="Chave Pix atualizada"
            descricaoSucesso="O próximo repasse já usa a nova chave."
          >
            <div className="cartao abaixo-4">
              <h2 className="secao-titulo">Recebimento</h2>
              <Campo rotulo="Chave Pix para repasse" ajuda="É para cá que o valor vai depois da entrega." id="cfg-pix">
                <input id="cfg-pix" defaultValue="atelie@exemplo.com" required />
              </Campo>
              <button type="submit" className="botao botao-secundario botao-largo">
                Atualizar chave
              </button>
            </div>
          </FormularioSimulado>

          <p className="aviso">
            <IconeAviso />
            <span>
              Você não precisa de CNPJ para vender. Se um comprador pedir nota fiscal, a plataforma emite em nome
              do ateliê.
            </span>
          </p>
        </aside>
      </div>
    </LayoutPainel>
  )
}
