import { MD3LightTheme, configureFonts, type MD3Theme } from 'react-native-paper';

import { colors } from './colors';
import { fonts } from './fonts';

export const paperTheme: MD3Theme = {
  ...MD3LightTheme,
  roundness: 6,
  fonts: configureFonts({ config: { fontFamily: fonts.nunitoRegular } }),
  colors: {
    ...MD3LightTheme.colors,
    primary: colors.primary,
    onPrimary: colors.white,
    background: colors.background,
    surface: colors.background,
    onSurface: colors.textPrimary,
    error: colors.expense,
  },
};
