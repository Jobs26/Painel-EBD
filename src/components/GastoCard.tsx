import { Pressable, StyleSheet, View } from 'react-native';
import { Icon, Text } from 'react-native-paper';

import { categoriaDoGasto, type Gasto } from '@/data/gastos';
import { dataNumerica } from '@/data/relatorio';
import { colors, fonts } from '@/theme';
import { formatBRL } from '@/utils/currency';

type GastoCardProps = {
  gasto: Gasto;
  /** Sem `onPress` (trimestre fechado) o card é só de consulta. */
  onPress?: () => void;
};

/** Um gasto da lista: tipo, nome, data, descrição e valor abatido. */
export function GastoCard({ gasto, onPress }: GastoCardProps) {
  const categoria = categoriaDoGasto(gasto.categoria);
  const resumo = `${categoria.label} · ${dataNumerica(gasto.data)}`;

  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityLabel={`${gasto.nome}, ${resumo}, ${formatBRL(gasto.valor)}${onPress ? ': editar' : ''}`}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <View style={styles.icone}>
        <Icon source={categoria.icon} size={20} color={colors.primary} />
      </View>
      <View style={styles.texto}>
        <Text style={styles.nome} numberOfLines={1}>
          {gasto.nome}
        </Text>
        <Text style={styles.resumo}>{resumo}</Text>
        {gasto.descricao ? (
          <Text style={styles.descricao} numberOfLines={2}>
            {gasto.descricao}
          </Text>
        ) : null}
      </View>
      <Text style={styles.valor}>{formatBRL(-gasto.valor)}</Text>
      {onPress ? <Icon source="chevron-right" size={20} color={colors.subtext} /> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 12,
    paddingLeft: 12,
    paddingRight: 8,
    borderRadius: 20,
    backgroundColor: colors.white,
    boxShadow: `0 4px 16px ${colors.shadow}`,
  },
  pressed: {
    backgroundColor: colors.background,
  },
  icone: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.navActive,
  },
  texto: {
    flex: 1,
    gap: 1,
  },
  nome: {
    fontFamily: fonts.nunitoBold,
    fontSize: 15,
    color: colors.black,
  },
  resumo: {
    fontFamily: fonts.interRegular,
    fontSize: 12,
    color: colors.subtext,
  },
  descricao: {
    marginTop: 2,
    fontFamily: fonts.interRegular,
    fontSize: 12,
    lineHeight: 16,
    color: colors.label,
  },
  valor: {
    fontFamily: fonts.interSemiBold,
    fontSize: 14,
    color: colors.expense,
  },
});
