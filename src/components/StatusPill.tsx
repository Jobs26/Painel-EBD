import { StyleSheet, View } from 'react-native';
import { Icon, Text } from 'react-native-paper';

import { colors, fonts } from '@/theme';

export type StatusTone = 'ok' | 'info' | 'warn' | 'muted' | 'locked';

const TONS: Record<StatusTone, { fundo: string; borda: string; texto: string }> = {
  ok: { fundo: colors.presence, borda: colors.presence, texto: colors.white },
  info: { fundo: colors.navActive, borda: colors.navActive, texto: colors.primary },
  warn: { fundo: 'transparent', borda: colors.expense, texto: colors.expense },
  muted: { fundo: 'transparent', borda: colors.inputBackground, texto: colors.subtext },
  locked: { fundo: colors.primary, borda: colors.primary, texto: colors.white },
};

/** Etiqueta curta de situação ("Completo", "2/4 turmas", "Fechado"...). */
export function StatusPill({ label, tone, icon }: { label: string; tone: StatusTone; icon?: string }) {
  const cor = TONS[tone];
  return (
    <View style={[styles.pill, { backgroundColor: cor.fundo, borderColor: cor.borda }]}>
      {icon ? <Icon source={icon} size={13} color={cor.texto} /> : null}
      <Text style={[styles.text, { color: cor.texto }]} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1,
  },
  text: {
    fontFamily: fonts.interMedium,
    fontSize: 11,
  },
});
