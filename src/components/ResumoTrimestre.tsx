import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';

import type { Totais } from '@/data/relatorio';
import { colors, fonts } from '@/theme';
import { formatBRL } from '@/utils/currency';

const ITENS: { chave: keyof Omit<Totais, 'ofertas' | 'matriculados'>; label: string }[] = [
  { chave: 'presentes', label: 'Presentes' },
  { chave: 'visitantes', label: 'Visitantes' },
  { chave: 'total', label: 'Total' },
  { chave: 'biblias', label: 'Bíblias' },
  { chave: 'revistas', label: 'Revistas' },
];

const media = (valor: number, aulas: number) => (aulas > 0 ? Math.round(valor / aulas) : 0);

/** Card azul com as somas do trimestre, a média por aula e o saldo (ofertas − gastos). */
export function ResumoTrimestre({ totais, aulas, gastos }: { totais: Totais; aulas: number; gastos: number }) {
  const saldo = Math.round((totais.ofertas - gastos) * 100) / 100;
  return (
    <View style={styles.card}>
      <Text style={styles.label}>Ofertas do trimestre</Text>
      <Text style={styles.ofertas}>{formatBRL(totais.ofertas)}</Text>
      <Text style={styles.caption}>
        {aulas > 0
          ? `${aulas} ${aulas === 1 ? 'aula lançada' : 'aulas lançadas'} · média de ${formatBRL(totais.ofertas / aulas)} por aula`
          : 'Nenhuma aula lançada neste trimestre'}
      </Text>

      <View style={styles.saldoRow}>
        <View style={styles.saldoItem} accessible accessibilityLabel={`Gastos do trimestre: ${formatBRL(gastos)}`}>
          <Text style={styles.label}>Gastos</Text>
          <Text style={styles.gastos}>{formatBRL(-gastos)}</Text>
        </View>
        <View style={styles.saldoItem} accessible accessibilityLabel={`Saldo do trimestre: ${formatBRL(saldo)}`}>
          <Text style={styles.label}>Saldo (ofertas − gastos)</Text>
          <Text style={[styles.saldo, saldo < 0 && styles.gastos]}>{formatBRL(saldo)}</Text>
        </View>
      </View>

      <View style={styles.grid}>
        {ITENS.map(({ chave, label }) => (
          <View
            key={chave}
            style={styles.item}
            accessible
            accessibilityLabel={`${label}: ${totais[chave]} no trimestre, média de ${media(totais[chave], aulas)} por aula`}
          >
            <Text style={styles.valor}>{totais[chave]}</Text>
            <Text style={styles.itemLabel} numberOfLines={1}>
              {label}
            </Text>
            <Text style={styles.media}>≈ {media(totais[chave], aulas)}/aula</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginTop: 14,
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 14,
    borderRadius: 24,
    backgroundColor: colors.primary,
  },
  label: {
    fontFamily: fonts.interRegular,
    fontSize: 12,
    color: colors.navActive,
  },
  ofertas: {
    fontFamily: fonts.poppinsBold,
    fontSize: 26,
    lineHeight: 34,
    color: colors.honeydew,
  },
  caption: {
    fontFamily: fonts.interRegular,
    fontSize: 12,
    color: colors.navActive,
  },
  saldoRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.lineOnPrimary,
  },
  saldoItem: {
    flex: 1,
  },
  gastos: {
    fontFamily: fonts.poppinsSemiBold,
    fontSize: 17,
    lineHeight: 24,
    color: colors.expense,
  },
  saldo: {
    fontFamily: fonts.poppinsSemiBold,
    fontSize: 17,
    lineHeight: 24,
    color: colors.honeydew,
  },
  grid: {
    flexDirection: 'row',
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.lineOnPrimary,
  },
  item: {
    flex: 1,
    alignItems: 'center',
  },
  valor: {
    fontFamily: fonts.nunitoBold,
    fontSize: 20,
    lineHeight: 24,
    color: colors.white,
  },
  itemLabel: {
    fontFamily: fonts.interMedium,
    fontSize: 11,
    color: colors.navActive,
  },
  media: {
    marginTop: 1,
    fontFamily: fonts.interRegular,
    fontSize: 10,
    color: colors.navBackground,
  },
});
