import { Stack } from 'expo-router';

import { colors } from '@/theme';

/** Pilha da aba Relatórios: trimestre → lançamento de um domingo. */
export default function RelatoriosLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        contentStyle: { backgroundColor: colors.background },
      }}
    />
  );
}
