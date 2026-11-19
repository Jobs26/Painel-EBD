/**
 * REGRA — gastos da Escola Dominical (Relatórios → Gastos)
 *
 * - Gasto = conta paga pela escola: revistas, insumos (material, lanche, limpeza…) ou outros.
 * - Cada gasto tem: nome da conta, o que ela é (tipo + descrição opcional), valor e a data
 *   em que foi lançado. A data define o trimestre de onde o valor é abatido.
 * - Saldo do trimestre = ofertas lançadas − gastos do trimestre. A Home usa os gastos
 *   do período filtrado no card de balanço.
 * - Lançamento retroativo (data num trimestre anterior ao atual) é permitido, depois de
 *   confirmar no pop-up, e abate da arrecadação daquele trimestre.
 * - Trimestre fechado não recebe, altera nem exclui gastos (o fechamento congela o saldo).
 * - Não se lança gasto com data futura.
 */
import {
  compararTrimestres,
  fechamentoDe,
  isoDate,
  trimestreDaData,
  trimestreDe,
  type Fechamento,
  type Intervalo,
  type Trimestre,
} from '@/data/relatorio';

export type CategoriaGasto = 'revistas' | 'insumos' | 'outros';

export const CATEGORIAS_GASTO: { value: CategoriaGasto; label: string; icon: string }[] = [
  { value: 'revistas', label: 'Revistas', icon: 'book-open-variant' },
  { value: 'insumos', label: 'Insumos', icon: 'package-variant-closed' },
  { value: 'outros', label: 'Outros', icon: 'receipt-text-outline' },
];

export const categoriaDoGasto = (c: CategoriaGasto) => CATEGORIAS_GASTO.find((o) => o.value === c)!;

export type Gasto = {
  id: string;
  /** Nome da conta, ex.: "Revistas do 4º trimestre". */
  nome: string;
  categoria: CategoriaGasto;
  /** O que é a conta, em detalhe ('' = sem descrição). */
  descricao: string;
  /** Valor em reais. */
  valor: number;
  /** Data do lançamento, "AAAA-MM-DD". Define o trimestre abatido. */
  data: string;
};

export type DadosGasto = Omit<Gasto, 'id'>;

/** Soma dos valores (arredondada em centavos). */
export const totalGastos = (lista: Gasto[]) => Math.round(lista.reduce((s, g) => s + g.valor, 0) * 100) / 100;

/** Gastos com data dentro do intervalo (e até hoje). */
export function gastosDoIntervalo({ inicio, fim }: Intervalo, gastos: Gasto[], hoje = new Date()) {
  const hojeStr = isoDate(hoje);
  return gastos.filter((g) => g.data >= inicio && g.data <= fim && g.data <= hojeStr);
}

/** Gastos do trimestre, mais recentes primeiro. */
export function gastosDoTrimestre(t: Trimestre, gastos: Gasto[]) {
  return gastos
    .filter((g) => compararTrimestres(trimestreDaData(g.data), t) === 0)
    .sort((a, b) => (a.data === b.data ? b.id.localeCompare(a.id) : b.data.localeCompare(a.data)));
}

/** Situação da data escolhida para o gasto (mensagem de erro, ou se é retroativo). */
export function situacaoDaData(
  data: string,
  fechamentos: Fechamento[],
  hoje = new Date(),
): { erro: 'futura' | 'fechado' | null; retroativo: boolean } {
  if (data > isoDate(hoje)) return { erro: 'futura', retroativo: false };
  const t = trimestreDaData(data);
  if (fechamentoDe(t, fechamentos)) return { erro: 'fechado', retroativo: true };
  return { erro: null, retroativo: compararTrimestres(t, trimestreDe(hoje)) < 0 };
}
