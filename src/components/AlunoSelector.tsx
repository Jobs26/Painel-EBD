import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Checkbox, Text } from 'react-native-paper';

import { Avatar } from '@/components/Avatar';
import { SearchBar } from '@/components/SearchBar';
import { useEscola } from '@/data/EscolaContext';
import { colors, fonts } from '@/theme';

type AlunoSelectorProps = {
  /** Turma sendo editada (undefined no cadastro de uma turma nova). */
  turmaId?: string;
  selecionados: string[];
  onChange: (ids: string[]) => void;
};

/** Lista pesquisável de alunos ATIVOS com caixas de seleção para vincular à turma. */
export function AlunoSelector({ turmaId, selecionados, onChange }: AlunoSelectorProps) {
  const { alunos, turmas } = useEscola();
  const [busca, setBusca] = useState('');

  const nomeTurma = useMemo(() => new Map(turmas.map((t) => [t.id, t.nome])), [turmas]);

  const lista = useMemo(() => {
    const termo = busca.trim().toLocaleLowerCase('pt-BR');
    return alunos
      .filter((a) => a.ativo)
      .filter((a) => !termo || a.nome.toLocaleLowerCase('pt-BR').includes(termo))
      .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
  }, [alunos, busca]);

  const alternar = (id: string) => {
    onChange(selecionados.includes(id) ? selecionados.filter((s) => s !== id) : [...selecionados, id]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchRow}>
        <SearchBar value={busca} onChangeText={setBusca} placeholder="Pesquisar aluno..." />
      </View>
      <Text style={styles.counter}>
        {selecionados.length === 0
          ? 'Nenhum aluno selecionado'
          : `${selecionados.length} aluno${selecionados.length > 1 ? 's' : ''} selecionado${selecionados.length > 1 ? 's' : ''}`}
      </Text>

      {lista.length === 0 ? (
        <Text style={styles.empty}>Nenhum aluno encontrado.</Text>
      ) : (
        lista.map((aluno, index) => {
          const marcado = selecionados.includes(aluno.id);
          const emOutraTurma = aluno.turmaId && aluno.turmaId !== turmaId ? nomeTurma.get(aluno.turmaId) : null;
          return (
            <Pressable
              key={aluno.id}
              onPress={() => alternar(aluno.id)}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: marcado }}
              accessibilityLabel={aluno.nome}
              style={({ pressed }) => [
                styles.row,
                index > 0 && styles.rowDivider,
                pressed && styles.rowPressed,
              ]}
            >
              <Avatar nome={aluno.nome} selected={marcado} />
              <View style={styles.info}>
                <Text style={styles.nome} numberOfLines={1}>
                  {aluno.nome}
                </Text>
                <Text style={styles.detalhe} numberOfLines={1}>
                  {aluno.idade !== null ? `${aluno.idade} anos` : 'Idade não informada'}
                  {emOutraTurma ? ` · hoje em ${emOutraTurma}` : ''}
                </Text>
              </View>
              <Checkbox.Android
                status={marcado ? 'checked' : 'unchecked'}
                color={colors.primary}
                uncheckedColor={colors.subtext}
                onPress={() => alternar(aluno.id)}
              />
            </Pressable>
          );
        })
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 4,
  },
  searchRow: {
    flexDirection: 'row',
  },
  counter: {
    marginTop: 8,
    marginBottom: 2,
    fontFamily: fonts.interMedium,
    fontSize: 12,
    color: colors.subtext,
  },
  empty: {
    paddingVertical: 24,
    textAlign: 'center',
    fontFamily: fonts.interRegular,
    fontSize: 14,
    color: colors.subtext,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
  },
  rowDivider: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.line,
  },
  rowPressed: {
    opacity: 0.7,
  },
  info: {
    flex: 1,
  },
  nome: {
    fontFamily: fonts.interMedium,
    fontSize: 15,
    color: colors.black,
  },
  detalhe: {
    fontFamily: fonts.interRegular,
    fontSize: 12,
    color: colors.subtext,
  },
});
