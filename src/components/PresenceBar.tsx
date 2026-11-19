import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';

import { colors, fonts } from '@/theme';

/** Barra de presença da Home ("Rectangle 158/161" no Figma). */
export function PresenceBar({ percentual }: { percentual: number | null }) {
  if (percentual === null) {
    return (
      <View style={styles.track} accessible accessibilityLabel="Sem aula lançada no período">
        <Text style={[styles.label, styles.labelDark]}>Sem aula lançada no período</Text>
      </View>
    );
  }
  const valor = Math.min(Math.max(Math.round(percentual), 0), 100);
  // Com barras curtas o texto fica sobre a trilha clara; troca a cor para manter contraste.
  const textoSobreTrilha = valor < 50;

  return (
    <View
      style={styles.track}
      accessibilityRole="progressbar"
      accessibilityLabel={`${valor}% de presença total`}
      accessibilityValue={{ min: 0, max: 100, now: valor }}
    >
      <View style={[styles.fill, { width: `${valor}%` }]} />
      <Text style={[styles.label, textoSobreTrilha && styles.labelDark]}>{valor} % presença total</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    height: 36,
    justifyContent: 'center',
    borderRadius: 18,
    backgroundColor: colors.inputBackground,
    overflow: 'hidden',
  },
  fill: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    borderRadius: 18,
    backgroundColor: colors.presence,
  },
  label: {
    paddingLeft: 26,
    fontFamily: fonts.interRegular,
    fontSize: 15,
    color: colors.honeydew,
  },
  labelDark: {
    color: colors.textPrimary,
  },
});
