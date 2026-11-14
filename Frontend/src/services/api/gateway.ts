export function urlDoGateway(): string | null {
  if (typeof window !== 'undefined') return null
  const valor = process.env.API_GATEWAY_URL?.trim()
  return valor ? valor.replace(/\/$/, '') : null
}
