/**
 * Dados fictícios usados enquanto o backend (Supabase) não está conectado.
 * Substituir por consultas reais quando a camada de dados for implementada.
 */
import {
  deslocarTrimestre,
  domingosDoTrimestre,
  fimTrimestre,
  idTrimestre,
  isoDate,
  parseIsoDate,
  totalDe,
  trimestreDe,
  type Aula,
  type Fechamento,
  type Lancamento,
} from '@/data/relatorio';
import type { Gasto } from '@/data/gastos';

export type ResumoFinanceiro = {
  ofertasTotais: number;
  gastos: number;
};

/** Filtros de período da Home (o padrão é o trimestre atual). */
export type Periodo = 'dia' | 'semana' | 'mes' | 'trimestre' | 'ano';

export const PERIODO_PADRAO: Periodo = 'trimestre';

export const PERIODOS: { value: Periodo; label: string }[] = [
  { value: 'dia', label: 'Dia (última aula)' },
  { value: 'semana', label: 'Esta semana' },
  { value: 'mes', label: 'Este mês' },
  { value: 'trimestre', label: 'Este trimestre' },
  { value: 'ano', label: 'Este ano' },
];


/** Usuário logado (dados cadastrais exibidos no Perfil). */
export type Usuario = {
  nome: string;
  email: string;
  /** "(11) 91234-5678" */
  telefone: string;
  /** "DD / MM / AAAA" */
  nascimento: string;
};

export const usuarioMock: Usuario = {
  nome: 'Administrador EBD',
  email: 'admin@painelebd.com',
  telefone: '(11) 91234-5678',
  nascimento: '15 / 03 / 1985',
};

/** Senha fictícia do usuário de teste (só front-end; no backend a senha nunca fica no app). */
export const SENHA_MOCK = 'ebd12345';

// ---------------------------------------------------------------------------
// Turmas e alunos
// ---------------------------------------------------------------------------

export type FaixaEtaria = 'criancas' | 'adolescentes' | 'jovens' | 'adultos' | 'melhor-idade';

export const FAIXAS_ETARIAS: { value: FaixaEtaria; label: string; idade: string; min: number; max: number }[] = [
  { value: 'criancas', label: 'Crianças', idade: '3 a 11 anos', min: 0, max: 11 },
  { value: 'adolescentes', label: 'Adolescentes', idade: '12 a 17 anos', min: 12, max: 17 },
  { value: 'jovens', label: 'Jovens', idade: '18 a 29 anos', min: 18, max: 29 },
  { value: 'adultos', label: 'Adultos', idade: '30 a 59 anos', min: 30, max: 59 },
  { value: 'melhor-idade', label: 'Melhor idade', idade: '60 anos ou mais', min: 60, max: 200 },
];

export function labelFaixaEtaria(faixa: FaixaEtaria) {
  return FAIXAS_ETARIAS.find((f) => f.value === faixa)?.label ?? faixa;
}

/** Faixa etária correspondente a uma idade (usada para recomendar a turma do aluno). */
export function faixaDaIdade(idade: number): FaixaEtaria | null {
  return FAIXAS_ETARIAS.find((f) => idade >= f.min && idade <= f.max)?.value ?? null;
}

export type Turma = {
  id: string;
  nome: string;
  faixaEtaria: FaixaEtaria;
  /** `false` = turma desativada (soft delete). */
  ativa: boolean;
};

export type Aluno = {
  id: string;
  nome: string;
  /** `null` quando a idade ainda não foi informada. */
  idade: number | null;
  /** Telefone já formatado, ex.: "(11) 91234-5678" ('' se não informado). */
  telefone: string;
  /** Data de nascimento "DD / MM / AAAA" ('' se não informada). */
  nascimento: string;
  /** Turma à qual o aluno está vinculado (um aluno pertence a no máximo uma turma). */
  turmaId: string | null;
  /** `false` = aluno desativado (soft delete). */
  ativo: boolean;
};

export const turmasMock: Turma[] = [
  { id: 't1', nome: 'Classe 1', faixaEtaria: 'criancas', ativa: true },
  { id: 't2', nome: 'Classe 2', faixaEtaria: 'adolescentes', ativa: true },
  { id: 't3', nome: 'Classe 3', faixaEtaria: 'jovens', ativa: true },
  { id: 't4', nome: 'Classe 4', faixaEtaria: 'adultos', ativa: true },
];

const aluno = (
  id: string,
  nome: string,
  idade: number,
  nascimento: string,
  telefone: string,
  turmaId: string | null,
): Aluno => ({ id, nome, idade, nascimento, telefone, turmaId, ativo: true });

export const alunosMock: Aluno[] = [
  aluno('a1', 'Ana Beatriz Souza', 8, '14 / 03 / 2018', '(11) 98765-4321', 't1'),
  aluno('a2', 'Davi Lucas Pereira', 9, '02 / 07 / 2017', '(11) 97654-3210', 't1'),
  aluno('a3', 'Laura Martins', 7, '21 / 09 / 2019', '(11) 96543-2109', 't1'),
  aluno('a4', 'Pedro Henrique Lima', 14, '05 / 01 / 2012', '(11) 95432-1098', 't2'),
  aluno('a5', 'Sofia Oliveira', 15, '30 / 06 / 2011', '(11) 94321-0987', 't2'),
  aluno('a6', 'Gabriel Costa', 22, '11 / 11 / 2003', '(11) 93210-9876', 't3'),
  aluno('a7', 'Isabela Rocha', 25, '19 / 04 / 2001', '(11) 92109-8765', 't3'),
  aluno('a8', 'Marcos Antônio Silva', 41, '08 / 08 / 1985', '(11) 91098-7654', 't4'),
  aluno('a9', 'Raquel Fernandes', 37, '25 / 12 / 1988', '(11) 99876-5432', 't4'),
  aluno('a10', 'João Victor Almeida', 10, '17 / 02 / 2016', '(11) 98123-4567', null),
  aluno('a11', 'Mariana Ribeiro', 16, '03 / 10 / 2010', '(11) 97234-5678', null),
  aluno('a12', 'Samuel Barbosa', 63, '29 / 05 / 1963', '(11) 96345-6789', null),
];

// ---------------------------------------------------------------------------
// Relatório (lançamentos por domingo)
// ---------------------------------------------------------------------------

/** Gerador pseudoaleatório com semente: os mesmos números a cada recarga. */
function sorteador(semente: string) {
  let a = 0;
  for (let i = 0; i < semente.length; i++) a = (Math.imul(a, 31) + semente.charCodeAt(i)) | 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Presença média de cada turma nos dados fictícios. */
const PRESENCA_BASE: Record<string, number> = { t1: 0.6, t2: 0.72, t3: 0.45, t4: 0.88 };

function lancamentoFicticio(data: string, turmaId: string): Lancamento {
  const r = sorteador(`${data}-${turmaId}`);
  const alunos = alunosMock
    .filter((a) => a.ativo && a.turmaId === turmaId)
    .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
  const matriculados = alunos.length;
  const taxa = (PRESENCA_BASE[turmaId] ?? 0.7) + (r() - 0.5) * 0.5;
  const presentes = Math.min(matriculados, Math.max(0, Math.round(matriculados * taxa)));
  // Sorteia quais alunos estavam presentes.
  const sorteados = new Set(
    alunos
      .map((a) => ({ id: a.id, peso: r() }))
      .sort((a, b) => a.peso - b.peso)
      .slice(0, presentes)
      .map((a) => a.id),
  );
  const visitantes = Math.floor(r() * 3);
  const total = totalDe({ presentes, visitantes });
  return {
    matriculados,
    presentes,
    chamada: alunos.map((a) => ({ alunoId: a.id, presente: sorteados.has(a.id) })),
    visitantes,
    biblias: Math.round(total * (0.6 + r() * 0.4)),
    revistas: Math.round(total * (0.5 + r() * 0.5)),
    ofertas: Math.round((40 + r() * 120) * 2) / 2,
  };
}

/**
 * Histórico fictício relativo à data de hoje:
 * - 3º e 4º trimestres anteriores: lançados e fechados;
 * - trimestre anterior: todo lançado, ainda aberto (pronto para fechar);
 * - trimestre atual: lançado até o penúltimo domingo (o último fica pendente).
 */
export function relatorioMock(hoje = new Date()): { aulas: Aula[]; fechamentos: Fechamento[] } {
  const hojeStr = isoDate(hoje);
  const atual = trimestreDe(hoje);
  const aulas: Aula[] = [];
  const fechamentos: Fechamento[] = [];

  for (let k = 3; k >= 0; k--) {
    const trimestre = deslocarTrimestre(atual, -k);
    let domingos = domingosDoTrimestre(trimestre).filter((d) => d <= hojeStr);
    if (k === 0) domingos = domingos.slice(0, -1);

    for (const data of domingos) {
      aulas.push({
        data,
        registros: Object.fromEntries(turmasMock.map((t) => [t.id, lancamentoFicticio(data, t.id)])),
      });
    }

    if (k >= 2) {
      const fechadoEm = parseIsoDate(fimTrimestre(trimestre))!;
      fechadoEm.setDate(fechadoEm.getDate() + 5);
      fechamentos.push({
        trimestre: idTrimestre(trimestre),
        fechadoEm: isoDate(fechadoEm),
        turmas: turmasMock.map(({ id, nome }) => ({ id, nome })),
      });
    }
  }

  return { aulas, fechamentos };
}

// ---------------------------------------------------------------------------
// Gastos
// ---------------------------------------------------------------------------

/**
 * Gastos fictícios dos últimos trimestres até hoje: as revistas no início de cada
 * trimestre e, todo mês, material de apoio e lanche das crianças.
 */
export function gastosMock(hoje = new Date()): Gasto[] {
  const hojeStr = isoDate(hoje);
  const atual = trimestreDe(hoje);
  const gastos: Gasto[] = [];
  const valor = (semente: string, min: number, max: number) =>
    Math.round((min + sorteador(semente)() * (max - min)) * 2) / 2;

  for (let k = 3; k >= 0; k--) {
    const t = deslocarTrimestre(atual, -k);
    const primeiroMes = (t.numero - 1) * 3;
    gastos.push({
      id: `g-${idTrimestre(t)}-rev`,
      nome: `Revistas do ${t.numero}º trimestre`,
      categoria: 'revistas',
      descricao: 'Revistas dos alunos e dos professores, compradas na editora.',
      valor: valor(`rev-${idTrimestre(t)}`, 380, 520),
      data: isoDate(new Date(t.ano, primeiroMes, 3)),
    });
    for (let m = 0; m < 3; m++) {
      const mes = primeiroMes + m;
      const chave = `${t.ano}-${mes}`;
      gastos.push(
        {
          id: `g-${chave}-mat`,
          nome: 'Material de apoio',
          categoria: 'insumos',
          descricao: 'Papel, lápis de cor, cola e cartolina para as aulas.',
          valor: valor(`mat-${chave}`, 60, 140),
          data: isoDate(new Date(t.ano, mes, 10)),
        },
        {
          id: `g-${chave}-lan`,
          nome: 'Lanche das crianças',
          categoria: 'insumos',
          descricao: '',
          valor: valor(`lan-${chave}`, 40, 90),
          data: isoDate(new Date(t.ano, mes, 20)),
        },
      );
    }
  }
  // Um gasto avulso no meio do trimestre anterior.
  const anterior = deslocarTrimestre(atual, -1);
  gastos.push({
    id: 'g-projetor',
    nome: 'Manutenção do projetor',
    categoria: 'outros',
    descricao: 'Troca da lâmpada do projetor da sala dos adultos.',
    valor: 180,
    data: isoDate(new Date(anterior.ano, (anterior.numero - 1) * 3 + 1, 15)),
  });

  return gastos.filter((g) => g.data <= hojeStr);
}
