export type OpcaoFrete = { id: string; nome: string; prazo: string; valor: number }

export const opcoesFrete: OpcaoFrete[] = [
  { id: 'padrao', nome: 'Sertão Logística Regional', prazo: '10 a 14 dias úteis', valor: 38.9 },
  { id: 'expresso', nome: 'Expresso Recife', prazo: '4 a 6 dias úteis', valor: 72.5 },
]
