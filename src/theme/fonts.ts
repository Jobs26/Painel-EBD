// Importa cada peso separadamente para empacotar só as fontes usadas
// (importar do pacote raiz inclui todos os pesos no app, ~10 MB).
import { Inter_400Regular } from '@expo-google-fonts/inter/400Regular';
import { Inter_500Medium } from '@expo-google-fonts/inter/500Medium';
import { Inter_600SemiBold } from '@expo-google-fonts/inter/600SemiBold';
import { LeagueSpartan_300Light } from '@expo-google-fonts/league-spartan/300Light';
import { LeagueSpartan_400Regular } from '@expo-google-fonts/league-spartan/400Regular';
import { LeagueSpartan_600SemiBold } from '@expo-google-fonts/league-spartan/600SemiBold';
import { Nunito_400Regular } from '@expo-google-fonts/nunito/400Regular';
import { Nunito_600SemiBold } from '@expo-google-fonts/nunito/600SemiBold';
import { Nunito_700Bold } from '@expo-google-fonts/nunito/700Bold';
import { Poppins_400Regular } from '@expo-google-fonts/poppins/400Regular';
import { Poppins_500Medium } from '@expo-google-fonts/poppins/500Medium';
import { Poppins_500Medium_Italic } from '@expo-google-fonts/poppins/500Medium_Italic';
import { Poppins_600SemiBold } from '@expo-google-fonts/poppins/600SemiBold';
import { Poppins_700Bold } from '@expo-google-fonts/poppins/700Bold';

/** Mapa passado para `useFonts` no layout raiz. */
export const fontAssets = {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  LeagueSpartan_300Light,
  LeagueSpartan_400Regular,
  LeagueSpartan_600SemiBold,
  Nunito_400Regular,
  Nunito_600SemiBold,
  Nunito_700Bold,
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_500Medium_Italic,
  Poppins_600SemiBold,
  Poppins_700Bold,
};

/** Nomes de família usados em `fontFamily` (React Native não usa fontWeight com fontes customizadas). */
export const fonts = {
  interRegular: 'Inter_400Regular',
  interMedium: 'Inter_500Medium',
  interSemiBold: 'Inter_600SemiBold',
  spartanLight: 'LeagueSpartan_300Light',
  spartanRegular: 'LeagueSpartan_400Regular',
  spartanSemiBold: 'LeagueSpartan_600SemiBold',
  nunitoRegular: 'Nunito_400Regular',
  nunitoSemiBold: 'Nunito_600SemiBold',
  nunitoBold: 'Nunito_700Bold',
  poppinsRegular: 'Poppins_400Regular',
  poppinsMedium: 'Poppins_500Medium',
  poppinsMediumItalic: 'Poppins_500Medium_Italic',
  poppinsSemiBold: 'Poppins_600SemiBold',
  poppinsBold: 'Poppins_700Bold',
} as const;
