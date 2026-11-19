import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';

import { colors, fonts } from '@/theme';
import { iniciais } from '@/utils/masks';

/** Círculo com as iniciais do aluno. */
export function Avatar({ nome, selected = false, size = 38 }: { nome: string; selected?: boolean; size?: number }) {
  return (
    <View
      style={[
        styles.avatar,
        { width: size, height: size, borderRadius: size / 2 },
        selected && styles.selected,
      ]}
    >
      <Text style={[styles.text, { fontSize: Math.round(size * 0.37) }, selected && styles.textSelected]}>
        {iniciais(nome)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  avatar: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.navActive,
  },
  selected: {
    backgroundColor: colors.primary,
  },
  text: {
    fontFamily: fonts.nunitoBold,
    color: colors.primary,
  },
  textSelected: {
    color: colors.white,
  },
});
