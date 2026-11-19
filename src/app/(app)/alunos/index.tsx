import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Snackbar } from 'react-native-paper';

import { Avatar } from '@/components/Avatar';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { FilterChips, type ChipOption } from '@/components/FilterChips';
import { ListScreenHeader } from '@/components/ListScreenHeader';
import { ListRow, ListTable } from '@/components/ListTable';
import { VincularTurmaDialog } from '@/components/VincularTurmaDialog';
import { useEscola } from '@/data/EscolaContext';
import type { Aluno } from '@/data/mock';
import { colors } from '@/theme';

const TODOS = 'todos';
const SEM_TURMA = 'sem-turma';

const plural = (n: number, singular: string, pluralForm = `${singular}s`) => `${n} ${n === 1 ? singular : pluralForm}`;

/** Tela "Cadastro de alunos" — mesmo padrão da tela de turmas. */
export default function AlunosScreen() {
  const insets = useSafeAreaInsets();
  const { alunos, turmas, definirAlunoAtivo, aviso, avisar, limparAviso } = useEscola();

  const [busca, setBusca] = useState('');
  const [filtro, setFiltro] = useState<string>(TODOS);
  const [confirmarNovo, setConfirmarNovo] = useState(false);
  const [desativando, setDesativando] = useState<Aluno | null>(null);
  const [vinculando, setVinculando] = useState<Aluno | null>(null);

  const turmaPorId = useMemo(() => new Map(turmas.map((t) => [t.id, t])), [turmas]);

  // Filtro por turma: todos, sem turma ou uma das turmas ativas.
  const opcoesFiltro = useMemo<ChipOption<string>[]>(
    () => [
      { value: TODOS, label: 'Todos' },
      { value: SEM_TURMA, label: 'Sem turma' },
      ...turmas.filter((t) => t.ativa).map((t) => ({ value: t.id, label: t.nome })),
    ],
    [turmas],
  );
  // Se a turma filtrada for desativada, volta para "Todos".
  const filtroAtual = opcoesFiltro.some((o) => o.value === filtro) ? filtro : TODOS;

  const lista = useMemo(() => {
    const termo = busca.trim().toLocaleLowerCase('pt-BR');
    return alunos
      .filter((a) =>
        filtroAtual === TODOS ? true : filtroAtual === SEM_TURMA ? a.turmaId === null : a.turmaId === filtroAtual,
      )
      .filter((a) => !termo || a.nome.toLocaleLowerCase('pt-BR').includes(termo))
      .sort((a, b) => Number(b.ativo) - Number(a.ativo) || a.nome.localeCompare(b.nome, 'pt-BR'));
  }, [alunos, busca, filtroAtual]);

  const ativos = alunos.filter((a) => a.ativo).length;

  const detalhes = (aluno: Aluno) => {
    const idade = aluno.idade !== null ? `${aluno.idade} anos` : 'Idade não informada';
    const turma = aluno.turmaId ? turmaPorId.get(aluno.turmaId) : undefined;
    const nomeTurma = turma ? `${turma.nome}${turma.ativa ? '' : ' (inativa)'}` : 'Sem turma';
    return `${idade} · ${nomeTurma}`;
  };

  const alternarAtivo = (aluno: Aluno) => {
    if (aluno.ativo) {
      setDesativando(aluno);
    } else {
      definirAlunoAtivo(aluno.id, true);
      avisar('alunos', `"${aluno.nome}" reativado.`);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <ScrollView
        contentContainerStyle={[styles.content, { paddingTop: Math.max(insets.top, 20) + 20 }]}
        keyboardShouldPersistTaps="handled"
      >
        <ListScreenHeader
          title="Cadastro de alunos"
          summary={`${plural(alunos.length, 'aluno')} · ${plural(ativos, 'ativo')}`}
          search={busca}
          onSearch={setBusca}
          searchPlaceholder="Pesquisar aluno..."
          onAdd={() => setConfirmarNovo(true)}
          addLabel="Adicionar novo aluno"
        >
          <FilterChips
            options={opcoesFiltro}
            value={filtroAtual}
            onChange={setFiltro}
            accessibilityLabel="Filtrar por turma"
          />
        </ListScreenHeader>

        <ListTable nameLabel="Nome do aluno" emptyText="Nenhum aluno encontrado.">
          {lista.map((aluno, index) => (
            <ListRow
              key={aluno.id}
              leading={<Avatar nome={aluno.nome} size={32} />}
              title={aluno.nome}
              meta={detalhes(aluno)}
              active={aluno.ativo}
              last={index === lista.length - 1}
              label={aluno.nome}
              onEdit={() => router.push(`/alunos/${aluno.id}`)}
              onLink={() => setVinculando(aluno)}
              onToggle={() => alternarAtivo(aluno)}
            />
          ))}
        </ListTable>
      </ScrollView>

      <ConfirmDialog
        visible={confirmarNovo}
        title="Deseja criar novo aluno?"
        onDismiss={() => setConfirmarNovo(false)}
        onConfirm={() => {
          setConfirmarNovo(false);
          router.push('/alunos/novo');
        }}
      />

      <ConfirmDialog
        visible={!!desativando}
        title={`Desativar "${desativando?.nome}"?`}
        message="O aluno deixa de aparecer nas turmas e nos relatórios, mas os dados são mantidos. Você pode reativá-lo a qualquer momento."
        confirmLabel="Desativar"
        cancelLabel="Cancelar"
        destructive
        onDismiss={() => setDesativando(null)}
        onConfirm={() => {
          if (desativando) {
            definirAlunoAtivo(desativando.id, false);
            avisar('alunos', `"${desativando.nome}" desativado.`);
          }
          setDesativando(null);
        }}
      />

      <VincularTurmaDialog
        aluno={vinculando}
        onDismiss={() => setVinculando(null)}
        onSaved={(turmaNome) => {
          if (vinculando) {
            avisar(
              'alunos',
              turmaNome ? `"${vinculando.nome}" vinculado à ${turmaNome}.` : `"${vinculando.nome}" ficou sem turma.`,
            );
          }
          setVinculando(null);
        }}
      />

      <Snackbar
        key={aviso?.id}
        visible={aviso?.area === 'alunos'}
        onDismiss={limparAviso}
        duration={3000}
        style={styles.snackbar}
      >
        {aviso?.area === 'alunos' ? aviso.mensagem : ''}
      </Snackbar>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  snackbar: {
    marginHorizontal: 16,
    borderRadius: 16,
    backgroundColor: colors.primary,
  },
});
