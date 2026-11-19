import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';

import FileAddIcon from '@assets/icons/file-add.svg';
import { SearchBar } from '@/components/SearchBar';
import { colors, fonts } from '@/theme';

type ListScreenHeaderProps = {
  title: string;
  /** Linha de resumo abaixo do título (ex.: "4 turmas · 4 ativas"). */
  summary: string;
  search: string;
  onSearch: (texto: string) => void;
  searchPlaceholder: string;
  onAdd: () => void;
  addLabel: string;
  /** Filtros exibidos abaixo da pesquisa. */
  children?: ReactNode;
};

/** Título + barra de pesquisa + botão de adicionar das telas de cadastro (turmas, alunos). */
export function ListScreenHeader({
  title,
  summary,
  search,
  onSearch,
  searchPlaceholder,
  onAdd,
  addLabel,
  children,
}: ListScreenHeaderProps) {
  return (
    <View>
      <Text style={styles.title} accessibilityRole="header">
        {title}
      </Text>
      <Text style={styles.summary}>{summary}</Text>

      <View style={styles.searchRow}>
        <SearchBar value={search} onChangeText={onSearch} placeholder={searchPlaceholder} />
        <Pressable
          onPress={onAdd}
          accessibilityRole="button"
          accessibilityLabel={addLabel}
          style={({ pressed }) => [styles.addButton, pressed && styles.pressed]}
        >
          <FileAddIcon />
        </Pressable>
      </View>

      {children ? <View style={styles.filters}>{children}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  title: {
    fontFamily: fonts.nunitoSemiBold,
    fontSize: 24,
    lineHeight: 30,
    color: colors.black,
  },
  summary: {
    marginTop: 2,
    fontFamily: fonts.interRegular,
    fontSize: 13,
    color: colors.subtext,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 18,
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.navActive,
  },
  pressed: {
    opacity: 0.7,
  },
  filters: {
    marginTop: 14,
  },
});
