import { Stack } from 'expo-router';

import { colors } from '@/theme';

/** Pilha da aba Turmas: lista → cadastro/edição. */
export default function TurmasLayout() {
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
