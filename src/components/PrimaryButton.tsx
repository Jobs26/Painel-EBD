import { StyleSheet, type StyleProp, type TextStyle, type ViewStyle } from 'react-native';
import { Button, type ButtonProps } from 'react-native-paper';

import { colors, fonts } from '@/theme';

type PrimaryButtonProps = Omit<ButtonProps, 'mode' | 'children'> & {
  title: string;
  width: number;
  height: number;
  labelStyle?: StyleProp<TextStyle>;
  style?: StyleProp<ViewStyle>;
};

/** Botão em pílula azul-marinho ("Log in Dark Mode" no Figma). */
export function PrimaryButton({ title, width, height, labelStyle, style, ...props }: PrimaryButtonProps) {
  return (
    <Button
      mode="contained"
      buttonColor={colors.primary}
      textColor={colors.white}
      style={[styles.button, { width }, style]}
      contentStyle={{ height }}
      labelStyle={[styles.label, labelStyle]}
      {...props}
    >
      {title}
    </Button>
  );
}

const styles = StyleSheet.create({
  button: {
    alignSelf: 'center',
    borderRadius: 30,
  },
  label: {
    fontFamily: fonts.nunitoSemiBold,
    fontSize: 24,
    lineHeight: 28,
    letterSpacing: 0,
    marginVertical: 0,
    marginHorizontal: 0,
  },
});
