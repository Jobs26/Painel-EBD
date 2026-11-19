import { Stack } from 'expo-router';

import { colors } from '@/theme';

/** Pilha da aba Perfil: perfil → dados cadastrais / alterar senha. */
export default function PerfilLayout() {
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
