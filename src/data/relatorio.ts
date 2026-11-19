/**
 * Regras do relatório de aulas: cada domingo recebe um lançamento por turma
 * e o relatório é fechado a cada trimestre (depois de fechado, fica só para consulta).
 */
import type { Periodo, Turma } from '@/data/mock';

/** Linha da chamada: um aluno matriculado e se ele estava presente. */
export type Presenca = { alunoId: string; presente: boolean };

export type Lancamento = {
  /** Alunos ativos na turma no dia do lançamento (= tamanho da chamada). */
  matriculados: number;
  /** Alunos marcados como presentes na chamada. */
  presentes: number;
  /** Chamada do dia: os alunos da turma naquele domingo. */
  chamada: Presenca[];
  visitantes: number;
  biblias: number;
  revistas: number;
  /** Valor em reais. */
  ofertas: number;
};

export type Aula = {
  /** Data do domingo, "AAAA-MM-DD". */
  data: string;
  /** Lançamento de cada turma, pela id da turma. */
  registros: Record<string, Lancamento>;
};

export type TurmaRelatorio = { id: string; nome: string };

export type Fechamento = {
  /** Id do trimestre, ex.: "2026-T3". */
  trimestre: string;
  /** "AAAA-MM-DD" */
  fechadoEm: string;
  /** Turmas que estavam no relatório quando o trimestre foi fechado (ficam congeladas). */
  turmas: TurmaRelatorio[];
};

export type Trimestre = { ano: number; numero: number };

// ---------------------------------------------------------------------------
// Datas
// ---------------------------------------------------------------------------

const pad = (n: number) => String(n).padStart(2, '0');

const MESES = [
  'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
  'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro',
];
const MESES_CURTOS = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];

/** Data local no formato "AAAA-MM-DD" (strings nesse formato podem ser comparadas com < e >). */
export const isoDate = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

export function parseIsoDate(iso: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!m) return null;
  const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  return isoDate(d) === iso ? d : null;
}

export const hojeIso = () => isoDate(new Date());

/** "08" */
export const diaDoMes = (iso: string) => iso.slice(8, 10);
/** "nov" */
export const mesCurto = (iso: string) => MESES_CURTOS[Number(iso.slice(5, 7)) - 1];
/** "8 de novembro" */
export const dataPorExtenso = (iso: string) => `${Number(iso.slice(8, 10))} de ${MESES[Number(iso.slice(5, 7)) - 1]}`;
/** "08/11/2026" */
export const dataNumerica = (iso: string) => `${iso.slice(8, 10)}/${iso.slice(5, 7)}/${iso.slice(0, 4)}`;

// ---------------------------------------------------------------------------
// Trimestres
// ---------------------------------------------------------------------------

export const trimestreDe = (d: Date): Trimestre => ({ ano: d.getFullYear(), numero: Math.floor(d.getMonth() / 3) + 1 });
export const trimestreDaData = (iso: string): Trimestre => ({
  ano: Number(iso.slice(0, 4)),
  numero: Math.floor((Number(iso.slice(5, 7)) - 1) / 3) + 1,
});
export const idTrimestre = (t: Trimestre) => `${t.ano}-T${t.numero}`;
export const compararTrimestres = (a: Trimestre, b: Trimestre) => a.ano * 4 + a.numero - (b.ano * 4 + b.numero);

export function deslocarTrimestre(t: Trimestre, n: number): Trimestre {
  const indice = t.ano * 4 + (t.numero - 1) + n;
  return { ano: Math.floor(indice / 4), numero: (indice % 4) + 1 };
}

/** Último dia do trimestre, "AAAA-MM-DD". */
export const fimTrimestre = (t: Trimestre) => isoDate(new Date(t.ano, t.numero * 3, 0));

/** "4º trimestre de 2026" */
export const labelTrimestre = (t: Trimestre) => `${t.numero}º trimestre de ${t.ano}`;
/** "out – dez" */
export const mesesDoTrimestre = (t: Trimestre) =>
  `${MESES_CURTOS[(t.numero - 1) * 3]} – ${MESES_CURTOS[(t.numero - 1) * 3 + 2]}`;

/** Todos os domingos do trimestre, em ordem ("AAAA-MM-DD"). */
export function domingosDoTrimestre(t: Trimestre): string[] {
  const d = new Date(t.ano, (t.numero - 1) * 3, 1);
  d.setDate(d.getDate() + ((7 - d.getDay()) % 7));
  const fim = fimTrimestre(t);
  const lista: string[] = [];
  while (isoDate(d) <= fim) {
    lista.push(isoDate(d));
    d.setDate(d.getDate() + 7);
  }
  return lista;
}

export const ehDomingo = (iso: string) => parseIsoDate(iso)?.getDay() === 0;

export function fechamentoDe(t: Trimestre, fechamentos: Fechamento[]) {
  return fechamentos.find((f) => f.trimestre === idTrimestre(t));
}

/** Trimestre anterior ao atual: lançar ou alterar exige liberar os lançamentos retroativos. */
export const ehRetroativo = (t: Trimestre, hoje = new Date()) => compararTrimestres(t, trimestreDe(hoje)) < 0;

/** Por que o trimestre não pode ser lançado/alterado (`null` = pode). */
export type Bloqueio = 'fechado' | 'retroativo' | null;

/**
 * - fechado: só consulta, sempre;
 * - anterior ao atual e aberto: só consulta até alguém liberar os lançamentos retroativos;
 * - atual: livre.
 */
export function bloqueioDo(t: Trimestre, fechamentos: Fechamento[], retroativosLiberados: string[]): Bloqueio {
  if (fechamentoDe(t, fechamentos)) return 'fechado';
  if (ehRetroativo(t) && !retroativosLiberados.includes(idTrimestre(t))) return 'retroativo';
  return null;
}

/**
 * Turmas que aparecem no relatório do trimestre:
 * - trimestre aberto: as turmas ativas (turma desativada sai do relatório);
 * - trimestre fechado: as turmas que estavam nele no fechamento.
 */
export function turmasDoRelatorio(t: Trimestre, turmas: Turma[], fechamentos: Fechamento[]): TurmaRelatorio[] {
  const fechamento = fechamentoDe(t, fechamentos);
  if (fechamento) return fechamento.turmas;
  return turmas.filter((turma) => turma.ativa).map(({ id, nome }) => ({ id, nome }));
}

// ---------------------------------------------------------------------------
// Totais
// ---------------------------------------------------------------------------

/** Números de um lançamento, sem a chamada. */
export type Numeros = Omit<Lancamento, 'chamada'>;
export type Totais = Numeros & { total: number };

/** Total = presentes + visitantes. */
export const totalDe = (l: Pick<Lancamento, 'presentes' | 'visitantes'>) => l.presentes + l.visitantes;

export function somar(lista: Numeros[]): Totais {
  const soma: Totais = { matriculados: 0, presentes: 0, visitantes: 0, biblias: 0, revistas: 0, ofertas: 0, total: 0 };
  for (const l of lista) {
    soma.matriculados += l.matriculados;
    soma.presentes += l.presentes;
    soma.visitantes += l.visitantes;
    soma.biblias += l.biblias;
    soma.revistas += l.revistas;
    soma.ofertas += l.ofertas;
  }
  soma.total = totalDe(soma);
  // Evita resíduos de ponto flutuante nas somas em reais.
  soma.ofertas = Math.round(soma.ofertas * 100) / 100;
  return soma;
}

/** Presentes ÷ matriculados, em % (null se não houver matriculados). */
export function percentualPresenca(lista: Numeros[]): number | null {
  const { matriculados, presentes } = somar(lista);
  return matriculados > 0 ? (presentes / matriculados) * 100 : null;
}

export type SituacaoDomingo = 'completo' | 'parcial' | 'pendente';

export function situacaoDoDomingo(lancadas: number, turmas: number): SituacaoDomingo {
  if (lancadas === 0) return 'pendente';
  return lancadas >= turmas ? 'completo' : 'parcial';
}

// ---------------------------------------------------------------------------
// Períodos da Home (dia, semana, mês, trimestre, ano)
// ---------------------------------------------------------------------------

/** Datas ISO de início e fim (inclusive) de um período. */
export type Intervalo = { inicio: string; fim: string };

/**
 * Intervalo do período em relação a `hoje`:
 * - dia: a última aula lançada até hoje (há uma aula por semana, aos domingos);
 * - semana: domingo a sábado da semana atual;
 * - mês, trimestre e ano: os atuais, do primeiro ao último dia.
 */
export function intervaloDoPeriodo(periodo: Periodo, aulas: Aula[], hoje = new Date()): Intervalo {
  const hojeStr = isoDate(hoje);
  const ano = hoje.getFullYear();
  const mes = hoje.getMonth();
  switch (periodo) {
    case 'dia': {
      const ultima = aulas.reduce((maior, a) => (a.data <= hojeStr && a.data > maior ? a.data : maior), '');
      const dia = ultima || hojeStr;
      return { inicio: dia, fim: dia };
    }
    case 'semana': {
      const domingo = new Date(ano, mes, hoje.getDate() - hoje.getDay());
      const sabado = new Date(ano, mes, domingo.getDate() + 6);
      return { inicio: isoDate(domingo), fim: isoDate(sabado) };
    }
    case 'mes':
      return { inicio: isoDate(new Date(ano, mes, 1)), fim: isoDate(new Date(ano, mes + 1, 0)) };
    case 'trimestre': {
      const t = trimestreDe(hoje);
      return { inicio: isoDate(new Date(t.ano, (t.numero - 1) * 3, 1)), fim: fimTrimestre(t) };
    }
    case 'ano':
      return { inicio: `${ano}-01-01`, fim: `${ano}-12-31` };
  }
}

/** Texto do intervalo: "aula de 8 de novembro", "8 a 14 de novembro", "novembro de 2026", "4º trimestre de 2026", "2026". */
export function descricaoDoPeriodo(periodo: Periodo, { inicio, fim }: Intervalo): string {
  switch (periodo) {
    case 'dia':
      return `aula de ${dataPorExtenso(inicio)}`;
    case 'semana':
      return inicio.slice(5, 7) === fim.slice(5, 7)
        ? `${Number(inicio.slice(8, 10))} a ${dataPorExtenso(fim)}`
        : `${dataPorExtenso(inicio)} a ${dataPorExtenso(fim)}`;
    case 'mes':
      return `${MESES[Number(inicio.slice(5, 7)) - 1]} de ${inicio.slice(0, 4)}`;
    case 'trimestre':
      return labelTrimestre(trimestreDaData(inicio));
    case 'ano':
      return inicio.slice(0, 4);
  }
}

/**
 * Lançamentos das aulas dentro do intervalo (até hoje), por turma,
 * respeitando as turmas de cada relatório (turma desativada sai do trimestre aberto).
 */
export function lancamentosDoIntervalo(
  { inicio, fim }: Intervalo,
  aulas: Aula[],
  turmas: Turma[],
  fechamentos: Fechamento[],
  hoje = new Date(),
): { turmaId: string; lancamento: Lancamento }[] {
  const hojeStr = isoDate(hoje);
  return aulas
    .filter((aula) => aula.data >= inicio && aula.data <= fim && aula.data <= hojeStr)
    .flatMap((aula) =>
      turmasDoRelatorio(trimestreDaData(aula.data), turmas, fechamentos)
        .filter((t) => aula.registros[t.id])
        .map((t) => ({ turmaId: t.id, lancamento: aula.registros[t.id] })),
    );
}
