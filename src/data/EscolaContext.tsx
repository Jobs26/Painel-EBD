import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

import {
  SENHA_MOCK,
  alunosMock,
  gastosMock,
  relatorioMock,
  turmasMock,
  type Aluno,
  type FaixaEtaria,
  type Turma,
} from '@/data/mock';
import { type DadosGasto, type Gasto } from '@/data/gastos';
import {
  bloqueioDo,
  fechamentoDe,
  idTrimestre,
  isoDate,
  trimestreDaData,
  type Aula,
  type Fechamento,
  type Lancamento,
  type Trimestre,
  type TurmaRelatorio,
} from '@/data/relatorio';

export type DadosTurma = { nome: string; faixaEtaria: FaixaEtaria };
export type DadosAluno = Pick<Aluno, 'nome' | 'idade' | 'telefone' | 'nascimento' | 'turmaId'>;

/** Tela onde a mensagem curta (Snackbar) deve aparecer. */
export type AreaAviso = 'turmas' | 'alunos' | 'relatorios' | 'perfil';

type EscolaContextValue = {
  // O usuário logado e os dados cadastrais vêm do `useAuth()` (Supabase).
  /** DEMONSTRAÇÃO (Perfil → Alterar senha): confere a senha atual. TODO(backend): Supabase Auth. */
  senhaConfere: (senha: string) => boolean;
  /** Troca a senha. Chamar só depois do código do e-mail confirmado (ver `src/data/senha.ts`). */
  alterarSenha: (novaSenha: string) => void;

  turmas: Turma[];
  alunos: Aluno[];
  /** Lançamentos de cada domingo (relatório). */
  aulas: Aula[];
  /** Trimestres já fechados. */
  fechamentos: Fechamento[];
  /** Ids dos trimestres anteriores ao atual liberados para lançamento retroativo. */
  retroativosLiberados: string[];

  criarTurma: (dados: DadosTurma, alunoIds: string[]) => Turma;
  atualizarTurma: (id: string, dados: DadosTurma) => void;
  /** Define quais alunos ATIVOS pertencem à turma (vincula e desvincula). */
  definirAlunos: (turmaId: string, alunoIds: string[]) => void;
  definirTurmaAtiva: (id: string, ativa: boolean) => void;

  criarAluno: (dados: DadosAluno) => Aluno;
  atualizarAluno: (id: string, dados: DadosAluno) => void;
  vincularAluno: (alunoId: string, turmaId: string | null) => void;
  definirAlunoAtivo: (id: string, ativo: boolean) => void;

  /**
   * Salva o lançamento de um domingo. Para cada turma informada: grava o lançamento
   * ou, com `null`, apaga o que havia. Turmas não informadas ficam como estão.
   * Não faz nada se o trimestre do domingo estiver fechado ou for retroativo sem liberação.
   */
  salvarAula: (data: string, alteracoes: Record<string, Lancamento | null>) => void;
  /** Libera (ou bloqueia de novo) os lançamentos retroativos de um trimestre anterior ao atual. */
  definirRetroativo: (trimestre: Trimestre, liberado: boolean) => void;
  /** Gastos da escola (revistas, insumos…), abatidos das ofertas do trimestre da data. */
  gastos: Gasto[];
  /** Os três ignoram gastos de trimestre fechado (ver `src/data/gastos.ts`). */
  criarGasto: (dados: DadosGasto) => void;
  atualizarGasto: (id: string, dados: DadosGasto) => void;
  removerGasto: (id: string) => void;
  /** Fecha o trimestre: a partir daí ele só pode ser consultado. */
  fecharTrimestre: (trimestre: Trimestre, turmas: TurmaRelatorio[]) => void;

  /** Mensagem exibida na lista da área indicada (ex.: depois de salvar um cadastro). */
  aviso: { area: AreaAviso; mensagem: string; /** Muda a cada aviso: use como `key` do Snackbar. */ id: number } | null;
  avisar: (area: AreaAviso, mensagem: string) => void;
  limparAviso: () => void;
};

const EscolaContext = createContext<EscolaContextValue | null>(null);

/**
 * Estado de turmas, alunos e relatório em memória (fase só de front-end).
 * TODO(backend): trocar por consultas e mutações no Supabase.
 */
export function EscolaProvider({ children }: { children: ReactNode }) {
  const [turmas, setTurmas] = useState<Turma[]>(turmasMock);
  const [alunos, setAlunos] = useState<Aluno[]>(alunosMock);
  const [relatorioInicial] = useState(() => relatorioMock());
  const [aulas, setAulas] = useState<Aula[]>(relatorioInicial.aulas);
  const [fechamentos, setFechamentos] = useState<Fechamento[]>(relatorioInicial.fechamentos);
  const [retroativosLiberados, setRetroativosLiberados] = useState<string[]>([]);
  const [gastos, setGastos] = useState<Gasto[]>(() => gastosMock());
  const [aviso, setAviso] = useState<EscolaContextValue['aviso']>(null);
  const [senha, setSenha] = useState(SENHA_MOCK);

  // ---------------------------------------------------------------- senha (demonstração)
  const senhaConfere = useCallback((tentativa: string) => tentativa === senha, [senha]);
  const alterarSenha = useCallback((novaSenha: string) => setSenha(novaSenha), []);

  // ---------------------------------------------------------------- turmas
  const definirAlunos = useCallback((turmaId: string, alunoIds: string[]) => {
    const selecionados = new Set(alunoIds);
    setAlunos((atual) =>
      atual.map((aluno) => {
        // Alunos desativados não aparecem na seleção, então mantêm o vínculo que já tinham.
        if (!aluno.ativo) return aluno;
        if (selecionados.has(aluno.id)) return { ...aluno, turmaId };
        if (aluno.turmaId === turmaId) return { ...aluno, turmaId: null };
        return aluno;
      }),
    );
  }, []);

  const criarTurma = useCallback(
    (dados: DadosTurma, alunoIds: string[]) => {
      const nova: Turma = { id: `t${Date.now()}`, ...dados, ativa: true };
      setTurmas((atual) => [...atual, nova]);
      if (alunoIds.length > 0) definirAlunos(nova.id, alunoIds);
      return nova;
    },
    [definirAlunos],
  );

  const atualizarTurma = useCallback((id: string, dados: DadosTurma) => {
    setTurmas((atual) => atual.map((t) => (t.id === id ? { ...t, ...dados } : t)));
  }, []);

  const definirTurmaAtiva = useCallback((id: string, ativa: boolean) => {
    setTurmas((atual) => atual.map((t) => (t.id === id ? { ...t, ativa } : t)));
  }, []);

  // ---------------------------------------------------------------- alunos
  const criarAluno = useCallback((dados: DadosAluno) => {
    const novo: Aluno = { id: `a${Date.now()}`, ...dados, ativo: true };
    setAlunos((atual) => [...atual, novo]);
    return novo;
  }, []);

  const atualizarAluno = useCallback((id: string, dados: DadosAluno) => {
    setAlunos((atual) => atual.map((a) => (a.id === id ? { ...a, ...dados } : a)));
  }, []);

  const vincularAluno = useCallback((alunoId: string, turmaId: string | null) => {
    setAlunos((atual) => atual.map((a) => (a.id === alunoId ? { ...a, turmaId } : a)));
  }, []);

  const definirAlunoAtivo = useCallback((id: string, ativo: boolean) => {
    setAlunos((atual) => atual.map((a) => (a.id === id ? { ...a, ativo } : a)));
  }, []);

  // ---------------------------------------------------------------- relatório
  const salvarAula = useCallback(
    (data: string, alteracoes: Record<string, Lancamento | null>) => {
      // Trimestre fechado (ou retroativo sem liberação) não pode ser alterado.
      if (bloqueioDo(trimestreDaData(data), fechamentos, retroativosLiberados)) return;
      setAulas((atual) => {
        const registros = { ...atual.find((a) => a.data === data)?.registros };
        for (const [turmaId, lancamento] of Object.entries(alteracoes)) {
          if (lancamento) registros[turmaId] = lancamento;
          else delete registros[turmaId];
        }
        const outras = atual.filter((a) => a.data !== data);
        return Object.keys(registros).length > 0 ? [...outras, { data, registros }] : outras;
      });
    },
    [fechamentos, retroativosLiberados],
  );

  const definirRetroativo = useCallback((trimestre: Trimestre, liberado: boolean) => {
    const id = idTrimestre(trimestre);
    setRetroativosLiberados((atual) => {
      const sem = atual.filter((t) => t !== id);
      return liberado ? [...sem, id] : sem;
    });
  }, []);

  // ---------------------------------------------------------------- gastos
  const fechado = useCallback(
    (data: string) => !!fechamentoDe(trimestreDaData(data), fechamentos),
    [fechamentos],
  );

  const criarGasto = useCallback(
    (dados: DadosGasto) => {
      if (fechado(dados.data)) return;
      setGastos((atual) => [...atual, { id: `g${Date.now()}`, ...dados }]);
    },
    [fechado],
  );

  const atualizarGasto = useCallback(
    (id: string, dados: DadosGasto) => {
      setGastos((atual) =>
        atual.map((g) => (g.id === id && !fechado(g.data) && !fechado(dados.data) ? { id, ...dados } : g)),
      );
    },
    [fechado],
  );

  const removerGasto = useCallback(
    (id: string) => setGastos((atual) => atual.filter((g) => g.id !== id || fechado(g.data))),
    [fechado],
  );

  const fecharTrimestre = useCallback((trimestre: Trimestre, turmasDoTrimestre: TurmaRelatorio[]) => {
    const id = idTrimestre(trimestre);
    setFechamentos((atual) =>
      atual.some((f) => f.trimestre === id)
        ? atual
        : [...atual, { trimestre: id, fechadoEm: isoDate(new Date()), turmas: turmasDoTrimestre }],
    );
  }, []);

  // `id` novo a cada aviso: o Snackbar (com key={aviso.id}) reinicia a contagem e um
  // aviso logo depois de outro não é apagado pelo tempo do anterior.
  const avisar = useCallback(
    (area: AreaAviso, mensagem: string) => setAviso((atual) => ({ area, mensagem, id: (atual?.id ?? 0) + 1 })),
    [],
  );
  const limparAviso = useCallback(() => setAviso(null), []);

  const value = useMemo<EscolaContextValue>(
    () => ({
      senhaConfere,
      alterarSenha,
      turmas,
      alunos,
      aulas,
      fechamentos,
      retroativosLiberados,
      salvarAula,
      definirRetroativo,
      gastos,
      criarGasto,
      atualizarGasto,
      removerGasto,
      fecharTrimestre,
      criarTurma,
      atualizarTurma,
      definirAlunos,
      definirTurmaAtiva,
      criarAluno,
      atualizarAluno,
      vincularAluno,
      definirAlunoAtivo,
      aviso,
      avisar,
      limparAviso,
    }),
    [
      senhaConfere,
      alterarSenha,
      turmas,
      alunos,
      aulas,
      fechamentos,
      retroativosLiberados,
      salvarAula,
      definirRetroativo,
      gastos,
      criarGasto,
      atualizarGasto,
      removerGasto,
      fecharTrimestre,
      criarTurma,
      atualizarTurma,
      definirAlunos,
      definirTurmaAtiva,
      criarAluno,
      atualizarAluno,
      vincularAluno,
      definirAlunoAtivo,
      aviso,
      avisar,
      limparAviso,
    ],
  );

  return <EscolaContext.Provider value={value}>{children}</EscolaContext.Provider>;
}

export function useEscola() {
  const ctx = useContext(EscolaContext);
  if (!ctx) throw new Error('useEscola precisa estar dentro de <EscolaProvider>.');
  return ctx;
}
