import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';

import TrainingClassIcon from '@assets/icons/training-class.svg';
import { MetricRow } from '@/components/MetricRow';
import { PresenceBar } from '@/components/PresenceBar';
import { percentualPresenca, somar, type Lancamento, type TurmaRelatorio } from '@/data/relatorio';
import { colors, fonts } from '@/theme';
import { formatBRL } from '@/utils/currency';

type TurmaTrimestreCardProps = {
  turma: TurmaRelatorio;
  /** Lançamentos da turma no trimestre, do domingo mais recente para o mais antigo. */
  lancamentos: Lancamento[];
  totalDomingos: number;
};

/** Visão "por turma": somas do trimestre, presença média e ofertas da turma. */
export function TurmaTrimestreCard({ turma, lancamentos, totalDomingos }: TurmaTrimestreCardProps) {
  const totais = somar(lancamentos);
  const presenca = percentualPresenca(lancamentos);

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.icon}>
          <TrainingClassIcon />
        </View>
        <View style={styles.headerText}>
          <Text style={styles.nome} numberOfLines={1}>
            {turma.nome}
          </Text>
          <Text style={styles.caption}>
            {lancamentos.length} de {totalDomingos} domingos lançados
          </Text>
        </View>
        <Text style={styles.oferta}>{formatBRL(totais.ofertas)}</Text>
      </View>

      {presenca !== null ? <PresenceBar percentual={presenca} /> : null}

      <MetricRow
        valores={{
          // Matriculados do domingo mais recente; os demais são somas do trimestre.
          matriculados: lancamentos[0]?.matriculados ?? null,
          presentes: totais.presentes,
          visitantes: totais.visitantes,
          total: totais.total,
          biblias: totais.biblias,
          revistas: totais.revistas,
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: 12,
    padding: 14,
    borderRadius: 20,
    backgroundColor: colors.white,
    boxShadow: `0 4px 16px ${colors.shadow}`,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  icon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.navActive,
  },
  headerText: {
    flex: 1,
  },
  nome: {
    fontFamily: fonts.nunitoBold,
    fontSize: 16,
    color: colors.black,
  },
  caption: {
    fontFamily: fonts.interRegular,
    fontSize: 12,
    color: colors.subtext,
  },
  oferta: {
    fontFamily: fonts.interSemiBold,
    fontSize: 14,
    color: colors.presence,
  },
});
