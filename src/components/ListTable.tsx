import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Icon, Text } from 'react-native-paper';

import EditIcon from '@assets/icons/edit.svg';
import LinkChainIcon from '@assets/icons/link-chain.svg';
import ToggleOnIcon from '@assets/icons/toggle-on.svg';
import { colors, fonts } from '@/theme';

const ACTION_WIDTH = 58;

/**
 * Card com a tabela "Nome | Editar | Vincular | Ativar"
 * (padrão da tela "Cadastro de classes" do Figma, reutilizado em Alunos).
 */
export function ListTable({
  nameLabel,
  emptyText,
  children,
}: {
  nameLabel: string;
  emptyText: string;
  children: ReactNode[];
}) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={[styles.headerText, styles.nameColumn]}>{nameLabel}</Text>
        <Text style={[styles.headerText, styles.actionColumn]}>Editar</Text>
        <Text style={[styles.headerText, styles.actionColumn]}>Vincular</Text>
        <Text style={[styles.headerText, styles.actionColumn]}>Ativar</Text>
      </View>

      {children.length === 0 ? (
        <View style={styles.empty}>
          <Icon source="text-search" size={32} color={colors.subtext} />
          <Text style={styles.emptyText}>{emptyText}</Text>
        </View>
      ) : (
        children
      )}
    </View>
  );
}

type ListRowProps = {
  /** Ícone ou avatar à esquerda do nome. */
  leading: ReactNode;
  title: string;
  meta: string;
  active: boolean;
  /** Texto acrescentado à linha de detalhes quando inativo ("Inativa" para turmas). */
  inactiveLabel?: string;
  last?: boolean;
  /** Descrição usada nos rótulos de acessibilidade das ações (ex.: "Classe 1"). */
  label: string;
  onEdit: () => void;
  onLink: () => void;
  onToggle: () => void;
};

/** Linha com as 3 ações: editar, vincular e ativar/desativar (soft delete). */
export function ListRow({
  leading,
  title,
  meta,
  active,
  inactiveLabel = 'Inativo',
  last = false,
  label,
  onEdit,
  onLink,
  onToggle,
}: ListRowProps) {
  return (
    <View style={[styles.row, last && styles.lastRow]}>
      <View style={[styles.nameColumn, styles.nameCell, !active && styles.inactive]}>
        {leading}
        <View style={styles.nameText}>
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
          <Text style={styles.meta} numberOfLines={1}>
            {meta}
            {active ? '' : ` · ${inactiveLabel}`}
          </Text>
        </View>
      </View>

      <RowAction label={`Editar ${label}`} onPress={onEdit}>
        <EditIcon />
      </RowAction>
      <RowAction label={`Vincular ${label}`} disabled={!active} onPress={onLink}>
        <LinkChainIcon />
      </RowAction>
      <RowAction label={`${label}: ${active ? 'ativo' : 'inativo'}`} role="switch" checked={active} onPress={onToggle}>
        <View style={!active && styles.toggleOff}>
          <ToggleOnIcon />
        </View>
      </RowAction>
    </View>
  );
}

type RowActionProps = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  role?: 'button' | 'switch';
  checked?: boolean;
  children: ReactNode;
};

function RowAction({ label, onPress, disabled = false, role = 'button', checked, children }: RowActionProps) {
  return (
    <View style={styles.actionColumn}>
      <Pressable
        onPress={onPress}
        disabled={disabled}
        accessibilityRole={role}
        accessibilityLabel={label}
        accessibilityState={{ disabled, checked }}
        hitSlop={6}
        style={({ pressed }) => [styles.actionButton, pressed && styles.actionPressed, disabled && styles.disabled]}
      >
        {children}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginTop: 20,
    paddingHorizontal: 12,
    paddingBottom: 6,
    borderRadius: 24,
    backgroundColor: colors.white,
    boxShadow: `0 4px 16px ${colors.shadow}`,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 14,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  headerText: {
    fontFamily: fonts.nunitoSemiBold,
    fontSize: 14,
    color: colors.black,
    textAlign: 'center',
  },
  nameColumn: {
    flex: 1,
    textAlign: 'left',
  },
  actionColumn: {
    width: ACTION_WIDTH,
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 60,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  lastRow: {
    borderBottomWidth: 0,
  },
  nameCell: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  nameText: {
    flex: 1,
  },
  title: {
    fontFamily: fonts.interRegular,
    fontSize: 17,
    color: colors.black,
  },
  meta: {
    fontFamily: fonts.interRegular,
    fontSize: 11,
    color: colors.subtext,
  },
  inactive: {
    opacity: 0.45,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionPressed: {
    backgroundColor: colors.navActive,
  },
  disabled: {
    opacity: 0.3,
  },
  // Sem ícone "desligado" no Figma: o mesmo toggle espelhado e esmaecido.
  toggleOff: {
    opacity: 0.35,
    transform: [{ scaleX: -1 }],
  },
  empty: {
    alignItems: 'center',
    gap: 8,
    paddingVertical: 32,
  },
  emptyText: {
    fontFamily: fonts.interRegular,
    fontSize: 14,
    color: colors.subtext,
  },
});
