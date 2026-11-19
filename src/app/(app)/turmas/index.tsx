import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Snackbar } from 'react-native-paper';

import PeopleGroupIcon from '@assets/icons/people-group-sm.svg';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { FilterChips, type ChipOption } from '@/components/FilterChips';
import { ListScreenHeader } from '@/components/ListScreenHeader';
import { ListRow, ListTable } from '@/components/ListTable';
import { VincularAlunosDialog } from '@/components/VincularAlunosDialog';
import { useEscola } from '@/data/EscolaContext';
import { FAIXAS_ETARIAS, labelFaixaEtaria, type FaixaEtaria, type Turma } from '@/data/mock';
import { colors } from '@/theme';

type FiltroFaixa = FaixaEtaria | 'todas';

const OPCOES_FILTRO: ChipOption<FiltroFaixa>[] = [
  { value: 'todas', label: 'Todas' },
  ...FAIXAS_ETARIAS.map((f) => ({ value: f.value, label: f.label })),
];

const plural = (n: number, singular: string, pluralForm = `${singular}s`) => `${n} ${n === 1 ? singular : pluralForm}`;

/** Tela "Cadastro de classes" (Figma: "Tela cadastro de classes"). */
export default function TurmasScreen() {
  const insets = useSafeAreaInsets();
  const { turmas, alunos, definirTurmaAtiva, aviso, avisar, limparAviso } = useEscola();

  const [busca, setBusca] = useState('');
  const [filtro, setFiltro] = useState<FiltroFaixa>('todas');
  const [confirmarNova, setConfirmarNova] = useState(false);
  const [desativando, setDesativando] = useState<Turma | null>(null);
  const [vinculando, setVinculando] = useState<Turma | null>(null);

  // Só alunos ativos contam para a turma.
  const totalAlunos = useMemo(() => {
    const mapa = new Map<string, number>();
    alunos.forEach((a) => a.ativo && a.turmaId && mapa.set(a.turmaId, (mapa.get(a.turmaId) ?? 0) + 1));
    return mapa;
  }, [alunos]);

  const lista = useMemo(() => {
    const termo = busca.trim().toLocaleLowerCase('pt-BR');
    return turmas
      .filter((t) => filtro === 'todas' || t.faixaEtaria === filtro)
      .filter((t) => !termo || t.nome.toLocaleLowerCase('pt-BR').includes(termo))
      .sort((a, b) => Number(b.ativa) - Number(a.ativa));
  }, [turmas, busca, filtro]);

  const ativas = turmas.filter((t) => t.ativa).length;

  const alternarAtiva = (turma: Turma) => {
    if (turma.ativa) {
      setDesativando(turma);
    } else {
      definirTurmaAtiva(turma.id, true);
      avisar('turmas', `Turma "${turma.nome}" reativada.`);
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
          title="Cadastro de classes"
          summary={`${plural(turmas.length, 'turma')} · ${plural(ativas, 'ativa')}`}
          search={busca}
          onSearch={setBusca}
          searchPlaceholder="Pesquisar classe..."
          onAdd={() => setConfirmarNova(true)}
          addLabel="Adicionar nova turma"
        >
          <FilterChips
            options={OPCOES_FILTRO}
            value={filtro}
            onChange={setFiltro}
            accessibilityLabel="Filtrar por faixa etária"
          />
        </ListScreenHeader>

        <ListTable nameLabel="Nome da turma" emptyText="Nenhuma turma encontrada.">
          {lista.map((turma, index) => (
            <ListRow
              key={turma.id}
              leading={<PeopleGroupIcon />}
              title={turma.nome}
              meta={`${labelFaixaEtaria(turma.faixaEtaria)} · ${plural(totalAlunos.get(turma.id) ?? 0, 'aluno')}`}
              active={turma.ativa}
              inactiveLabel="Inativa"
              last={index === lista.length - 1}
              label={turma.nome}
              onEdit={() => router.push(`/turmas/${turma.id}`)}
              onLink={() => setVinculando(turma)}
              onToggle={() => alternarAtiva(turma)}
            />
          ))}
        </ListTable>
      </ScrollView>

      <ConfirmDialog
        visible={confirmarNova}
        title="Deseja criar uma nova turma?"
        onDismiss={() => setConfirmarNova(false)}
        onConfirm={() => {
          setConfirmarNova(false);
          router.push('/turmas/nova');
        }}
      />

      <ConfirmDialog
        visible={!!desativando}
        title={`Desativar "${desativando?.nome}"?`}
        message="A turma deixa de aparecer nos relatórios, mas os dados são mantidos. Você pode reativá-la a qualquer momento."
        confirmLabel="Desativar"
        cancelLabel="Cancelar"
        destructive
        onDismiss={() => setDesativando(null)}
        onConfirm={() => {
          if (desativando) {
            definirTurmaAtiva(desativando.id, false);
            avisar('turmas', `Turma "${desativando.nome}" desativada.`);
          }
          setDesativando(null);
        }}
      />

      <VincularAlunosDialog
        turma={vinculando}
        onDismiss={() => setVinculando(null)}
        onSaved={(n) => {
          avisar('turmas', `${vinculando?.nome}: ${plural(n, 'aluno')} vinculado${n === 1 ? '' : 's'}.`);
          setVinculando(null);
        }}
      />

      <Snackbar
        key={aviso?.id}
        visible={aviso?.area === 'turmas'}
        onDismiss={limparAviso}
        duration={3000}
        style={styles.snackbar}
      >
        {aviso?.area === 'turmas' ? aviso.mensagem : ''}
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
