import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';

import CheckIcon from '@assets/icons/check.svg';
import DividerLine from '@assets/icons/divider-line.svg';
import ExpenseIcon from '@assets/icons/expense.svg';
import IncomeIcon from '@assets/icons/income.svg';
import type { ResumoFinanceiro } from '@/data/mock';
import { colors, fonts } from '@/theme';
import { formatBRL } from '@/utils/currency';

type BalanceSummaryProps = {
  resumo: ResumoFinanceiro;
};

function mensagemGastos(percentual: number) {
  if (percentual <= 30) return `${percentual}% dos gastos, parece bom.`;
  if (percentual <= 70) return `${percentual}% dos gastos, atenção.`;
  return `${percentual}% dos gastos, cuidado!`;
}

/** Card de ofertas x gastos do topo da Home. */
export function BalanceSummary({ resumo }: BalanceSummaryProps) {
  const { ofertasTotais, gastos } = resumo;
  const percentual = ofertasTotais > 0 ? Math.round((gastos / ofertasTotais) * 100) : 0;
  const barra = Math.min(Math.max(percentual, 0), 100);

  return (
    <View>
      <View style={styles.row}>
        <View style={styles.column}>
          <View style={styles.caption}>
            <View style={styles.incomeIconBox}>
              <IncomeIcon />
            </View>
            <Text style={styles.captionText}>Ofertas totais</Text>
          </View>
          <Text style={styles.incomeValue}>{formatBRL(ofertasTotais)}</Text>
        </View>

        <View style={styles.dividerSlot}>
          <View style={styles.dividerRotate}>
            <DividerLine />
          </View>
        </View>

        <View style={[styles.column, styles.expenseColumn]}>
          <View style={[styles.caption, styles.expenseCaption]}>
            <ExpenseIcon />
            <Text style={styles.captionText}>Gastos</Text>
          </View>
          <Text style={styles.expenseValue}>{formatBRL(-gastos)}</Text>
        </View>
      </View>

      <View
        style={styles.progressTrack}
        accessibilityRole="progressbar"
        accessibilityValue={{ min: 0, max: 100, now: barra }}
      >
        <View style={[styles.progressUsed, { flex: barra }]}>
          <Text style={styles.progressPercent}>{percentual}%</Text>
        </View>
        <View style={[styles.progressRemaining, { flex: 100 - barra }]}>
          <Text style={styles.progressAmount} numberOfLines={1}>
            {formatBRL(ofertasTotais)}
          </Text>
        </View>
      </View>

      <View style={styles.status}>
        <CheckIcon />
        <Text style={styles.statusText}>{mensagemGastos(percentual)}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    paddingLeft: 10,
  },
  column: {
    flex: 1,
  },
  expenseColumn: {
    paddingLeft: 15,
  },
  caption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    height: 17,
  },
  expenseCaption: {
    marginLeft: 14,
  },
  incomeIconBox: {
    width: 12,
    height: 11,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  captionText: {
    fontFamily: fonts.interRegular,
    fontSize: 12,
    color: colors.white,
  },
  incomeValue: {
    fontFamily: fonts.poppinsBold,
    fontSize: 24,
    lineHeight: 33,
    color: colors.honeydew,
  },
  expenseValue: {
    fontFamily: fonts.poppinsSemiBold,
    fontSize: 24,
    lineHeight: 33,
    color: colors.expense,
  },
  dividerSlot: {
    width: 1,
    height: 39,
    marginTop: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dividerRotate: {
    transform: [{ rotate: '-90deg' }],
  },
  progressTrack: {
    flexDirection: 'row',
    height: 25,
    marginTop: 9,
    borderRadius: 13.5,
    backgroundColor: colors.darkGreen,
    overflow: 'hidden',
  },
  progressUsed: {
    minWidth: 56,
    justifyContent: 'center',
    paddingLeft: 16,
  },
  progressPercent: {
    fontFamily: fonts.poppinsRegular,
    fontSize: 12,
    color: colors.honeydew,
  },
  progressRemaining: {
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingRight: 14,
    borderRadius: 13.5,
    backgroundColor: colors.honeydew,
  },
  progressAmount: {
    fontFamily: fonts.poppinsMediumItalic,
    fontSize: 13,
    color: colors.darkGreen,
  },
  status: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 9,
    paddingLeft: 10,
  },
  statusText: {
    fontFamily: fonts.poppinsRegular,
    fontSize: 15,
    color: colors.white,
  },
});
