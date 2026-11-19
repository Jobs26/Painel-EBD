import { useMemo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { RadioButton, Text } from 'react-native-paper';

import PeopleGroupIcon from '@assets/icons/people-group-sm.svg';
import { useEscola } from '@/data/EscolaContext';
import { FAIXAS_ETARIAS, faixaDaIdade } from '@/data/mock';
import { colors, fonts } from '@/theme';

type TurmaPickerProps = {
  value: string | null;
  onChange: (turmaId: string | null) => void;
  /** Idade do aluno: destaca a turma da faixa etária correspondente. */
  idade: number | null;
};

const SEM_TURMA = 'sem-turma';

/** Lista de opções (seleção única) com as turmas ativas para vincular o aluno. */
export function TurmaPicker({ value, onChange, idade }: TurmaPickerProps) {
  const { turmas, alunos } = useEscola();
  const faixaRecomendada = idade !== null ? faixaDaIdade(idade) : null;

  const opcoes = useMemo(() => {
    // Turmas ativas + a turma atual do aluno, mesmo se tiver sido desativada.
    const lista = turmas.filter((t) => t.ativa || t.id === value);
    return lista.sort((a, b) => {
      const ra = Number(a.faixaEtaria === faixaRecomendada);
      const rb = Number(b.faixaEtaria === faixaRecomendada);
      return rb - ra || a.nome.localeCompare(b.nome, 'pt-BR');
    });
  }, [turmas, value, faixaRecomendada]);

  const totalAlunos = (turmaId: string) => alunos.filter((a) => a.ativo && a.turmaId === turmaId).length;

  return (
    <RadioButton.Group value={value ?? SEM_TURMA} onValueChange={(v) => onChange(v === SEM_TURMA ? null : v)}>
      <Opcao
        valor={SEM_TURMA}
        selecionado={value === null}
        titulo="Sem turma"
        detalhe="Vincular depois"
        onPress={() => onChange(null)}
      />
      {opcoes.map((turma) => {
        const faixa = FAIXAS_ETARIAS.find((f) => f.value === turma.faixaEtaria);
        const n = totalAlunos(turma.id);
        return (
          <Opcao
            key={turma.id}
            valor={turma.id}
            selecionado={value === turma.id}
            titulo={turma.nome}
            detalhe={`${faixa?.label} (${faixa?.idade}) · ${n} aluno${n === 1 ? '' : 's'}${turma.ativa ? '' : ' · Inativa'}`}
            recomendada={turma.ativa && turma.faixaEtaria === faixaRecomendada}
            icone
            onPress={() => onChange(turma.id)}
          />
        );
      })}
      {opcoes.length === 0 ? (
        <Text style={styles.empty}>Nenhuma turma ativa. Cadastre uma na tela de Turmas.</Text>
      ) : null}
    </RadioButton.Group>
  );
}

type OpcaoProps = {
  valor: string;
  selecionado: boolean;
  titulo: string;
  detalhe: string;
  recomendada?: boolean;
  icone?: boolean;
  onPress: () => void;
};

function Opcao({ valor, selecionado, titulo, detalhe, recomendada = false, icone = false, onPress }: OpcaoProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="radio"
      accessibilityState={{ checked: selecionado }}
      accessibilityLabel={`${titulo}${recomendada ? ', recomendada' : ''}`}
      style={({ pressed }) => [styles.row, selecionado && styles.rowSelected, pressed && styles.pressed]}
    >
      <View style={styles.icon}>{icone ? <PeopleGroupIcon /> : null}</View>
      <View style={styles.info}>
        <View style={styles.titleRow}>
          <Text style={styles.titulo} numberOfLines={1}>
            {titulo}
          </Text>
          {recomendada ? (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>Recomendada</Text>
            </View>
          ) : null}
        </View>
        <Text style={styles.detalhe} numberOfLines={1}>
          {detalhe}
        </Text>
      </View>
      <RadioButton.Android value={valor} color={colors.primary} uncheckedColor={colors.subtext} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8,
    paddingLeft: 10,
    paddingRight: 2,
    marginBottom: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.line,
  },
  rowSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.navActive,
  },
  pressed: {
    opacity: 0.75,
  },
  icon: {
    width: 24,
    alignItems: 'center',
  },
  info: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  titulo: {
    flexShrink: 1,
    fontFamily: fonts.interMedium,
    fontSize: 15,
    color: colors.black,
  },
  detalhe: {
    fontFamily: fonts.interRegular,
    fontSize: 12,
    color: colors.subtext,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    backgroundColor: colors.presence,
  },
  badgeText: {
    fontFamily: fonts.interSemiBold,
    fontSize: 10,
    color: colors.white,
  },
  empty: {
    paddingVertical: 12,
    textAlign: 'center',
    fontFamily: fonts.interRegular,
    fontSize: 13,
    color: colors.subtext,
  },
});
