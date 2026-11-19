import { StyleSheet, type StyleProp, type TextStyle } from 'react-native';
import { Text } from 'react-native-paper';

import { colors, fonts } from '@/theme';

type FooterLinkProps = {
  text: string;
  linkText: string;
  onPress: () => void;
  style?: StyleProp<TextStyle>;
};

/** Texto de rodapé no estilo "Não tem conta? Cadastre-se". */
export function FooterLink({ text, linkText, onPress, style }: FooterLinkProps) {
  return (
    <Text style={[styles.text, style]}>
      {text}{' '}
      <Text style={styles.link} onPress={onPress} accessibilityRole="link">
        {linkText}
      </Text>
    </Text>
  );
}

const styles = StyleSheet.create({
  text: {
    fontFamily: fonts.spartanLight,
    fontSize: 13,
    lineHeight: 15,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  link: {
    fontFamily: fonts.spartanLight,
    color: colors.link,
  },
});
