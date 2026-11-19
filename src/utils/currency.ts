/**
 * Formata um valor no padrão do Figma: "R$1.000,00" / "-R$300,00".
 * (Sem espaço após o "R$", diferente do Intl.NumberFormat.)
 */
export function formatBRL(value: number): string {
  const sign = value < 0 ? '-' : '';
  const [inteiro, centavos] = Math.abs(value).toFixed(2).split('.');
  const milhar = inteiro.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `${sign}R$${milhar},${centavos}`;
}
