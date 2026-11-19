import type { FC } from 'react';
import { useState } from 'react';
import { StyleSheet, View, type StyleProp, type TextStyle, type ViewStyle } from 'react-native';
import { Text, TextInput, type TextInputProps } from 'react-native-paper';
import type { SvgProps } from 'react-native-svg';

import { colors, fonts } from '@/theme';

type FormFieldProps = Omit<TextInputProps, 'mode' | 'label' | 'style' | 'right'> & {
  label: string;
  /** Altura do campo (36 no login, 41 no cadastro/recuperação). */
  height?: number;
  /** Recuo do texto digitado em relação à borda esquerda do campo. */
  inputPaddingLeft?: number;
  /** Recuo do rótulo em relação à borda esquerda do campo. */
  labelPaddingLeft?: number;
  /** Espaço entre o rótulo e o campo. */
  labelGap?: number;
  labelStyle?: StyleProp<TextStyle>;
  /** Fonte do texto digitado e do placeholder. */
  inputTextStyle?: StyleProp<TextStyle>;
  /** Campo de senha com botão de mostrar/ocultar. */
  password?: boolean;
  /** Ícone de "olho fechado" exibido enquanto a senha está oculta. */
  eyeIcon?: FC<SvgProps>;
  containerStyle?: StyleProp<ViewStyle>;
};

export function FormField({
  label,
  height = 41,
  inputPaddingLeft = 17,
  labelPaddingLeft = 17,
  labelGap = 0,
  labelStyle,
  inputTextStyle,
  password = false,
  eyeIcon: EyeIcon,
  containerStyle,
  placeholderTextColor = colors.placeholder,
  ...inputProps
}: FormFieldProps) {
  const [hidden, setHidden] = useState(password);

  const right = password ? (
    <TextInput.Icon
      accessibilityLabel={hidden ? 'Mostrar senha' : 'Ocultar senha'}
      onPress={() => setHidden((v) => !v)}
      color={colors.textSecondary}
      icon={hidden && EyeIcon ? () => <EyeIcon /> : 'eye-outline'}
    />
  ) : undefined;

  return (
    <View style={containerStyle}>
      <Text style={[styles.label, { paddingLeft: labelPaddingLeft, marginBottom: labelGap }, labelStyle]}>
        {label}
      </Text>
      <TextInput
        mode="outlined"
        accessibilityLabel={label}
        secureTextEntry={hidden}
        autoCapitalize={password ? 'none' : inputProps.autoCapitalize}
        placeholderTextColor={placeholderTextColor}
        textColor={colors.textPrimary}
        outlineColor="transparent"
        activeOutlineColor={colors.primary}
        outlineStyle={styles.outline}
        style={[styles.input, { height }]}
        contentStyle={[
          styles.content,
          { paddingLeft: inputPaddingLeft },
          inputTextStyle,
          password && hidden && styles.passwordDots,
        ]}
        right={right}
        {...inputProps}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    fontFamily: fonts.poppinsMedium,
    fontSize: 15,
    color: colors.textPrimary,
  },
  input: {
    backgroundColor: colors.inputBackground,
  },
  outline: {
    borderRadius: 18,
  },
  content: {
    fontFamily: fonts.nunitoRegular,
    fontSize: 16,
  },
  // No Figma a senha oculta aparece como "●●●●●●●●" espaçados.
  passwordDots: {
    fontSize: 12,
    letterSpacing: 8.4,
  },
});
