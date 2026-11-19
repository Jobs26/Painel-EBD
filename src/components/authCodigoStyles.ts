import { StyleSheet } from 'react-native';

import { colors, fonts } from '@/theme';

/** Estilos comuns das telas de código (confirmar e-mail e redefinir senha). */
export const authCodigoStyles = StyleSheet.create({
  title: {
    fontFamily: fonts.nunitoSemiBold,
    fontSize: 30,
    lineHeight: 34,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  texto: {
    marginTop: 16,
    fontFamily: fonts.interRegular,
    fontSize: 14,
    lineHeight: 20,
    color: colors.subtext,
    textAlign: 'center',
  },
  email: {
    fontFamily: fonts.interSemiBold,
    color: colors.textPrimary,
  },
  label: {
    fontFamily: fonts.interMedium,
    color: colors.textPrimary,
  },
  codigo: {
    fontFamily: fonts.interMedium,
    letterSpacing: 6,
  },
  erro: {
    textAlign: 'center',
  },
  buttonLabel: {
    fontFamily: fonts.nunitoBold,
    fontSize: 20,
    lineHeight: 22,
  },
  reenviar: {
    marginTop: 20,
    alignSelf: 'center',
    fontFamily: fonts.interSemiBold,
    fontSize: 14,
    color: colors.primary,
    textDecorationLine: 'underline',
  },
  reenviarEspera: {
    color: colors.subtext,
    textDecorationLine: 'none',
  },
});
