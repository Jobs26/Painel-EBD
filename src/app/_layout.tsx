import { useEffect } from 'react';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { PaperProvider } from 'react-native-paper';

import { EscolaProvider } from '@/data/EscolaContext';
import { colors, fontAssets, paperTheme } from '@/theme';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts(fontAssets);

  useEffect(() => {
    if (fontsLoaded || fontError) SplashScreen.hideAsync();
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) return null;

  // O EscolaProvider fica por fora do PaperProvider porque os pop-ups (Portal do Paper)
  // são desenhados no PaperProvider e também precisam ler os dados de turmas/alunos.
  return (
    <EscolaProvider>
      <PaperProvider theme={paperTheme}>
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: colors.background },
          }}
        />
      </PaperProvider>
    </EscolaProvider>
  );
}
