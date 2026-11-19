import { StyleSheet } from 'react-native';
import { Button, Dialog, Portal, Text } from 'react-native-paper';

import { colors, fonts } from '@/theme';

type ConfirmDialogProps = {
  visible: boolean;
  title: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  /** Destaca o botão de confirmação em laranja (ações como desativar). */
  destructive?: boolean;
  onConfirm: () => void;
  onDismiss: () => void;
};

/** Pop-up de confirmação com as alternativas "Sim" / "Não". */
export function ConfirmDialog({
  visible,
  title,
  message,
  confirmLabel = 'Sim',
  cancelLabel = 'Não',
  destructive = false,
  onConfirm,
  onDismiss,
}: ConfirmDialogProps) {
  return (
    <Portal>
      <Dialog visible={visible} onDismiss={onDismiss} style={styles.dialog}>
        <Dialog.Title style={styles.title}>{title}</Dialog.Title>
        {message ? (
          <Dialog.Content>
            <Text style={styles.message}>{message}</Text>
          </Dialog.Content>
        ) : null}
        <Dialog.Actions style={styles.actions}>
          <Button
            mode="outlined"
            onPress={onDismiss}
            textColor={colors.primary}
            style={styles.button}
            labelStyle={styles.buttonLabel}
          >
            {cancelLabel}
          </Button>
          <Button
            mode="contained"
            onPress={onConfirm}
            buttonColor={destructive ? colors.expense : colors.primary}
            textColor={colors.white}
            style={styles.button}
            labelStyle={styles.buttonLabel}
          >
            {confirmLabel}
          </Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
}

const styles = StyleSheet.create({
  dialog: {
    borderRadius: 28,
    backgroundColor: colors.background,
  },
  title: {
    fontFamily: fonts.nunitoBold,
    fontSize: 20,
    lineHeight: 26,
    color: colors.black,
    textAlign: 'center',
  },
  message: {
    fontFamily: fonts.interRegular,
    fontSize: 14,
    lineHeight: 20,
    color: colors.subtext,
    textAlign: 'center',
  },
  actions: {
    justifyContent: 'center',
    gap: 12,
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  button: {
    flex: 1,
    borderRadius: 30,
    borderColor: colors.primary,
  },
  buttonLabel: {
    fontFamily: fonts.nunitoBold,
    fontSize: 16,
    letterSpacing: 0,
  },
});
