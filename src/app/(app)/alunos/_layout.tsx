import { Stack } from 'expo-router';

import { colors } from '@/theme';

/** Pilha da aba Alunos: lista → cadastro/edição. */
export default function AlunosLayout() {
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
