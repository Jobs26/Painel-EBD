import type { ComponentRef, FC, Ref } from 'react';
import { Pressable, StyleSheet, type PressableProps } from 'react-native';
import type { TabTriggerSlotProps } from 'expo-router/ui';
import type { SvgProps } from 'react-native-svg';

import FolderUserIcon from '@assets/icons/folder-user.svg';
import HomeIcon from '@assets/icons/nav-home.svg';
import ProfileIcon from '@assets/icons/nav-profile.svg';
import RelatorioIcon from '@assets/icons/nav-relatorio.svg';
import PeopleGroupIcon from '@assets/icons/people-group.svg';
import { colors } from '@/theme';

type NavItem = {
  name: string;
  href: '/home' | '/turmas' | '/alunos' | '/relatorios' | '/perfil';
  label: string;
  Icon: FC<SvgProps>;
};

/** Itens da barra inferior ("Bottom Navigation - Light Mode" no Figma). */
export const NAV_ITEMS: NavItem[] = [
  { name: 'home', href: '/home', label: 'Início', Icon: HomeIcon },
  { name: 'turmas', href: '/turmas', label: 'Turmas', Icon: PeopleGroupIcon },
  { name: 'alunos', href: '/alunos', label: 'Alunos', Icon: FolderUserIcon },
  { name: 'relatorios', href: '/relatorios', label: 'Relatórios', Icon: RelatorioIcon },
  { name: 'perfil', href: '/perfil', label: 'Perfil', Icon: ProfileIcon },
];

type NavButtonProps = Omit<TabTriggerSlotProps, 'ref'> & {
  Icon: FC<SvgProps>;
  label: string;
  ref?: Ref<ComponentRef<typeof Pressable>>;
};

/** Botão de aba; usado com `<TabTrigger asChild>`, que injeta `isFocused` e `onPress`. */
export function NavButton({ Icon, label, isFocused, ref, ...props }: NavButtonProps) {
  return (
    <Pressable
      ref={ref}
      {...(props as PressableProps)}
      accessibilityRole="tab"
      accessibilityLabel={label}
      aria-selected={!!isFocused}
      style={[styles.button, isFocused && styles.buttonActive]}
    >
      <Icon />
    </Pressable>
  );
}

export const bottomNavStyles = StyleSheet.create({
  bar: {
    height: 100,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 40,
    paddingBottom: 4,
    backgroundColor: colors.navBackground,
    borderTopLeftRadius: 70,
    borderTopRightRadius: 70,
  },
});

const styles = StyleSheet.create({
  button: {
    width: 57,
    height: 53,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonActive: {
    backgroundColor: colors.navActive,
  },
});
