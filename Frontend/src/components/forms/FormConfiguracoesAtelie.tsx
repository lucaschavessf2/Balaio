'use client'

import { useState, type FormEvent } from 'react'
import { Campo } from '@/components/ui/Basicos'
import { avisar } from '@/components/feedback/Avisos'
import { atualizarMeuAtelie } from '@/services/api/artesaos.servico'
import type { Artesao } from '@/types/dominio'

export default function FormConfiguracoesAtelie({ artesao, tecnicas, territorios }: { artesao: Artesao; tecnicas: string[]; territorios: string[] }) {
  const [salvando, definirSalvando] = useState(false)
  async function salvar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    const formulario = evento.currentTarget
    if (!formulario.reportValidity()) return
    const dados = new FormData(formulario)
    definirSalvando(true)
    const resposta = await atualizarMeuAtelie({
      atelie: String(dados.get('atelie') ?? ''), nome: String(dados.get('nome') ?? ''), historia: String(dados.get('historia') ?? ''),
      territorio: String(dados.get('territorio') ?? ''), tecnica: String(dados.get('tecnica') ?? '') as Artesao['tecnica'],
      cepOrigem: String(dados.get('cepOrigem') ?? ''), prazoPadraoDias: Number(dados.get('prazoPadraoDias') ?? 15),
      aceitaEncomendas: dados.get('aceitaEncomendas') === 'on', chavePix: String(dados.get('chavePix') ?? ''),
    })
    definirSalvando(false)
    if (!resposta.dados) return avisar.erro('Não foi possível salvar', resposta.erro?.mensagem)
    avisar.sucesso('Configurações do ateliê salvas')
  }
  return (
    <form onSubmit={salvar} noValidate>
      <section className="cartao abaixo-5">
        <h2 className="secao-titulo">Identidade do ateliê</h2>
        <Campo rotulo="Nome do ateliê" id="cfg-atelie"><input id="cfg-atelie" name="atelie" defaultValue={artesao.atelie} required /></Campo>
        <Campo rotulo="Seu nome de artesão" id="cfg-nome"><input id="cfg-nome" name="nome" defaultValue={artesao.nome} required /></Campo>
        <Campo rotulo="Sua história" id="cfg-historia"><textarea id="cfg-historia" name="historia" defaultValue={artesao.historia} /></Campo>
        <div className="grade-dois">
          <Campo rotulo="Território" id="cfg-territorio"><select id="cfg-territorio" name="territorio" defaultValue={artesao.territorio}>{territorios.map((item) => <option key={item}>{item}</option>)}</select></Campo>
          <Campo rotulo="Técnica principal" id="cfg-tecnica"><select id="cfg-tecnica" name="tecnica" defaultValue={artesao.tecnica}>{tecnicas.map((item) => <option key={item}>{item}</option>)}</select></Campo>
        </div>
      </section>
      <section className="cartao abaixo-5">
        <h2 className="secao-titulo">Envio e produção</h2>
        <Campo rotulo="CEP de origem" id="cfg-cep"><input id="cfg-cep" name="cepOrigem" defaultValue={artesao.cepOrigem ?? ''} required pattern="\d{5}-?\d{3}" /></Campo>
        <Campo rotulo="Prazo padrão de encomenda (dias)" id="cfg-prazo"><input id="cfg-prazo" name="prazoPadraoDias" type="number" defaultValue={artesao.prazoPadraoDias ?? 15} min={1} max={120} required /></Campo>
        <label className="opcao"><input type="checkbox" name="aceitaEncomendas" defaultChecked={artesao.aceitaEncomendas ?? true} /> Aceito encomendas</label>
      </section>
      <section className="cartao">
        <h2 className="secao-titulo">Recebimento</h2>
        <Campo rotulo="Chave Pix para repasse" id="cfg-pix"><input id="cfg-pix" name="chavePix" defaultValue={artesao.chavePix ?? ''} required /></Campo>
        <button type="submit" className="botao botao-primario" disabled={salvando}>{salvando ? 'Salvando…' : 'Salvar configurações'}</button>
      </section>
    </form>
  )
}
