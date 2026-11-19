import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';

import { colors, fonts } from '@/theme';

export type Metricas = {
  matriculados: number | null;
  presentes: number | null;
  visitantes: number | null;
  total: number | null;
  biblias: number | null;
  revistas: number | null;
};

const COLUNAS: { chave: keyof Metricas; curto: string; nome: string }[] = [
  { chave: 'matriculados', curto: 'Matric.', nome: 'Matriculados' },
  { chave: 'presentes', curto: 'Pres.', nome: 'Presentes' },
  { chave: 'visitantes', curto: 'Visit.', nome: 'Visitantes' },
  { chave: 'total', curto: 'Total', nome: 'Total' },
  { chave: 'biblias', curto: 'Bíblias', nome: 'Bíblias' },
  { chave: 'revistas', curto: 'Revistas', nome: 'Revistas' },
];

/**
 * Os 6 números de um lançamento lado a lado (matriculados, presentes, visitantes,
 * total, bíblias e revistas). O "Total" (presentes + visitantes) fica destacado.
 */
export function MetricRow({ valores, destaque = false }: { valores: Metricas; destaque?: boolean }) {
  return (
    <View style={styles.row}>
      {COLUNAS.map(({ chave, curto, nome }) => {
        const valor = valores[chave];
        return (
          <View
            key={chave}
            style={[styles.cell, chave === 'total' && styles.totalCell]}
            accessible
            accessibilityLabel={`${nome}: ${valor ?? 'não lançado'}`}
          >
            <Text style={styles.label} numberOfLines={1}>
              {curto}
            </Text>
            <Text style={[styles.value, destaque && styles.valueStrong]}>{valor ?? '—'}</Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 4,
  },
  cell: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: colors.background,
  },
  totalCell: {
    backgroundColor: colors.navActive,
  },
  label: {
    fontFamily: fonts.interRegular,
    fontSize: 10,
    color: colors.subtext,
  },
  value: {
    marginTop: 1,
    fontFamily: fonts.nunitoSemiBold,
    fontSize: 16,
    color: colors.black,
  },
  valueStrong: {
    fontFamily: fonts.nunitoBold,
    color: colors.primary,
  },
});
