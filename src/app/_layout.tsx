import { useEffect } from 'react';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { PaperProvider } from 'react-native-paper';

import { AuthProvider, useAuth } from '@/data/AuthContext';
import { EscolaProvider } from '@/data/EscolaContext';
import { colors, fontAssets, paperTheme } from '@/theme';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts(fontAssets);

  // O EscolaProvider fica por fora do PaperProvider porque os pop-ups (Portal do Paper)
  // são desenhados no PaperProvider e também precisam ler os dados de turmas/alunos.
  return (
    <AuthProvider>
      <EscolaProvider>
        <PaperProvider theme={paperTheme}>
          <RootNavigator fontesProntas={fontsLoaded || !!fontError} />
        </PaperProvider>
      </EscolaProvider>
    </AuthProvider>
  );
}

/**
 * Rotas protegidas: sem sessão só abre o grupo (auth); com sessão só o (app).
 * Quando a sessão muda (login, logout, token vencido), o Expo Router manda para o
 * `index`, que redireciona para /home ou /login.
 */
function RootNavigator({ fontesProntas }: { fontesProntas: boolean }) {
  const { carregando, logado } = useAuth();
  const pronto = fontesProntas && !carregando;

  useEffect(() => {
    if (pronto) SplashScreen.hideAsync();
  }, [pronto]);

  if (!pronto) return null;

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Protected guard={logado}>
        <Stack.Screen name="(app)" />
      </Stack.Protected>
      <Stack.Protected guard={!logado}>
        <Stack.Screen name="(auth)" />
      </Stack.Protected>
    </Stack>
  );
}
