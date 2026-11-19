import { Pressable, StyleSheet, TextInput, View, type StyleProp, type ViewStyle } from 'react-native';
import { Icon } from 'react-native-paper';

import SearchIcon from '@assets/icons/search.svg';
import { colors, fonts } from '@/theme';

type SearchBarProps = {
  value: string;
  onChangeText: (texto: string) => void;
  placeholder: string;
  style?: StyleProp<ViewStyle>;
};

/** Barra de pesquisa em pílula ("Rectangle 165" + "akar-icons:search" no Figma). */
export function SearchBar({ value, onChangeText, placeholder, style }: SearchBarProps) {
  return (
    <View style={[styles.container, style]}>
      <SearchIcon />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.placeholder}
        accessibilityLabel={placeholder}
        returnKeyType="search"
        autoCorrect={false}
        style={styles.input}
      />
      {value.length > 0 && (
        <Pressable
          onPress={() => onChangeText('')}
          accessibilityRole="button"
          accessibilityLabel="Limpar pesquisa"
          hitSlop={10}
        >
          <Icon source="close-circle" size={18} color={colors.subtext} />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingLeft: 12,
    paddingRight: 14,
    borderRadius: 22,
    backgroundColor: colors.inputBackground,
  },
  input: {
    flex: 1,
    height: '100%',
    fontFamily: fonts.interMedium,
    fontSize: 14,
    color: colors.black,
    // Remove o contorno azul padrão do navegador na versão web.
    outlineStyle: 'none',
  } as object,
});
