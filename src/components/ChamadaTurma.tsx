import { Pressable, StyleSheet, View } from 'react-native';
import { Icon, Text } from 'react-native-paper';

import { Avatar } from '@/components/Avatar';
import type { Presenca } from '@/data/relatorio';
import { colors, fonts } from '@/theme';

type ChamadaTurmaProps = {
  turmaNome: string;
  chamada: Presenca[];
  /** Nome de cada aluno, pela id. */
  nomeDe: (alunoId: string) => string;
  onChange: (chamada: Presenca[]) => void;
  somenteLeitura?: boolean;
};

/** Chamada da turma: um aluno por linha com a caixa de presença. Presentes = alunos marcados. */
export function ChamadaTurma({ turmaNome, chamada, nomeDe, onChange, somenteLeitura = false }: ChamadaTurmaProps) {
  const presentes = chamada.filter((p) => p.presente).length;
  const todosMarcados = chamada.length > 0 && presentes === chamada.length;

  const alternar = (alunoId: string) =>
    onChange(chamada.map((p) => (p.alunoId === alunoId ? { ...p, presente: !p.presente } : p)));

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.label}>Presentes</Text>
        <Text style={styles.contagem} accessibilityLabel={`${presentes} de ${chamada.length} alunos presentes`}>
          {presentes} de {chamada.length}
        </Text>
        {!somenteLeitura && chamada.length > 0 ? (
          <Pressable
            onPress={() => onChange(chamada.map((p) => ({ ...p, presente: !todosMarcados })))}
            accessibilityRole="button"
            accessibilityLabel={`${todosMarcados ? 'Desmarcar' : 'Marcar'} todos — ${turmaNome}`}
            hitSlop={6}
            style={({ pressed }) => [styles.todos, pressed && styles.pressed]}
          >
            <Text style={styles.todosTexto}>{todosMarcados ? 'Desmarcar todos' : 'Marcar todos'}</Text>
          </Pressable>
        ) : null}
      </View>

      {chamada.length === 0 ? (
        <Text style={styles.vazio}>Nenhum aluno ativo vinculado a esta turma.</Text>
      ) : (
        <View style={styles.lista}>
          {chamada.map(({ alunoId, presente }, index) => {
            const nome = nomeDe(alunoId);
            return (
              <Pressable
                key={alunoId}
                onPress={() => alternar(alunoId)}
                disabled={somenteLeitura}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: presente, disabled: somenteLeitura }}
                aria-checked={presente}
                accessibilityLabel={`${nome} — ${turmaNome}`}
                style={({ pressed }) => [
                  styles.aluno,
                  index === chamada.length - 1 && styles.ultimo,
                  pressed && styles.pressed,
                ]}
              >
                <Avatar nome={nome} size={30} selected={presente} />
                <Text style={styles.nome} numberOfLines={1}>
                  {nome}
                </Text>
                {somenteLeitura ? (
                  <Text style={presente ? styles.presente : styles.faltou}>{presente ? 'Presente' : 'Faltou'}</Text>
                ) : (
                  <Icon
                    source={presente ? 'checkbox-marked' : 'checkbox-blank-outline'}
                    size={26}
                    color={presente ? colors.primary : colors.subtext}
                  />
                )}
              </Pressable>
            );
          })}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 6,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    minHeight: 36,
  },
  label: {
    fontFamily: fonts.interMedium,
    fontSize: 15,
    color: colors.label,
  },
  contagem: {
    flex: 1,
    fontFamily: fonts.nunitoBold,
    fontSize: 15,
    color: colors.primary,
  },
  todos: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  todosTexto: {
    fontFamily: fonts.interMedium,
    fontSize: 12,
    color: colors.link,
  },
  vazio: {
    paddingVertical: 8,
    fontFamily: fonts.interRegular,
    fontSize: 13,
    color: colors.subtext,
  },
  lista: {
    paddingHorizontal: 10,
    borderRadius: 16,
    backgroundColor: colors.background,
  },
  aluno: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    minHeight: 48,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  ultimo: {
    borderBottomWidth: 0,
  },
  pressed: {
    opacity: 0.6,
  },
  nome: {
    flex: 1,
    fontFamily: fonts.interRegular,
    fontSize: 15,
    color: colors.black,
  },
  presente: {
    fontFamily: fonts.interMedium,
    fontSize: 12,
    color: colors.presence,
  },
  faltou: {
    fontFamily: fonts.interMedium,
    fontSize: 12,
    color: colors.expense,
  },
});
