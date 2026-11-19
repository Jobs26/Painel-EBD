import { Pressable, ScrollView, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { Text } from 'react-native-paper';

import { colors, fonts } from '@/theme';

export type ChipOption<T extends string> = { value: T; label: string; caption?: string };

type FilterChipsProps<T extends string> = {
  options: ChipOption<T>[];
  value: T | null;
  onChange: (value: T) => void;
  /** `scroll`: uma linha rolável (filtros). `wrap`: quebra em várias linhas (formulário). */
  layout?: 'scroll' | 'wrap';
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
};

/** Grupo de "pílulas" de seleção única (filtro por faixa etária, período...). */
export function FilterChips<T extends string>({
  options,
  value,
  onChange,
  layout = 'scroll',
  accessibilityLabel,
  style,
}: FilterChipsProps<T>) {
  const chips = options.map((option) => {
    const selected = option.value === value;
    return (
      <Pressable
        key={option.value}
        onPress={() => onChange(option.value)}
        accessibilityRole="radio"
        accessibilityState={{ checked: selected }}
        accessibilityLabel={option.caption ? `${option.label}, ${option.caption}` : option.label}
        style={({ pressed }) => [
          styles.chip,
          layout === 'wrap' && styles.chipWrap,
          selected && styles.chipSelected,
          pressed && styles.chipPressed,
        ]}
      >
        <Text style={[styles.label, selected && styles.labelSelected]}>{option.label}</Text>
        {option.caption ? (
          <Text style={[styles.caption, selected && styles.captionSelected]}>{option.caption}</Text>
        ) : null}
      </Pressable>
    );
  });

  if (layout === 'wrap') {
    return (
      <View accessibilityRole="radiogroup" accessibilityLabel={accessibilityLabel} style={[styles.wrap, style]}>
        {chips}
      </View>
    );
  }

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      accessibilityRole="radiogroup"
      accessibilityLabel={accessibilityLabel}
      style={style}
      contentContainerStyle={styles.row}
    >
      {chips}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: {
    gap: 8,
    paddingVertical: 2,
  },
  wrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  chip: {
    justifyContent: 'center',
    minHeight: 36,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.inputBackground,
    backgroundColor: colors.white,
  },
  chipWrap: {
    minHeight: 54,
    borderRadius: 18,
  },
  chipSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  chipPressed: {
    opacity: 0.75,
  },
  label: {
    fontFamily: fonts.nunitoSemiBold,
    fontSize: 14,
    color: colors.primary,
  },
  labelSelected: {
    color: colors.white,
  },
  caption: {
    fontFamily: fonts.interRegular,
    fontSize: 11,
    color: colors.subtext,
  },
  captionSelected: {
    color: colors.navActive,
  },
});
