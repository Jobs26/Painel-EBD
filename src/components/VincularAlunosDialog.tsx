import { useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { Button, Dialog, Portal } from 'react-native-paper';

import { AlunoSelector } from '@/components/AlunoSelector';
import type { Turma } from '@/data/mock';
import { useEscola } from '@/data/EscolaContext';
import { colors, fonts } from '@/theme';

type VincularAlunosDialogProps = {
  turma: Turma | null;
  onDismiss: () => void;
  onSaved: (quantidade: number) => void;
};

/** Pop-up para vincular/desvincular alunos de uma turma já cadastrada. */
export function VincularAlunosDialog({ turma, onDismiss, onSaved }: VincularAlunosDialogProps) {
  return (
    <Portal>
      <Dialog visible={!!turma} onDismiss={onDismiss} style={styles.dialog}>
        {/* `key` recria o conteúdo a cada turma aberta, reiniciando a seleção. */}
        {turma ? <Conteudo key={turma.id} turma={turma} onDismiss={onDismiss} onSaved={onSaved} /> : null}
      </Dialog>
    </Portal>
  );
}

function Conteudo({ turma, onDismiss, onSaved }: VincularAlunosDialogProps & { turma: Turma }) {
  const { alunos, definirAlunos } = useEscola();
  // Começa com os alunos ativos que já estão na turma.
  const [selecionados, setSelecionados] = useState(() =>
    alunos.filter((a) => a.ativo && a.turmaId === turma.id).map((a) => a.id),
  );

  const salvar = () => {
    definirAlunos(turma.id, selecionados);
    onSaved(selecionados.length);
  };

  return (
    <>
      <Dialog.Title style={styles.title}>Vincular alunos · {turma.nome}</Dialog.Title>
      <Dialog.ScrollArea style={styles.scrollArea}>
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <AlunoSelector turmaId={turma.id} selecionados={selecionados} onChange={setSelecionados} />
        </ScrollView>
      </Dialog.ScrollArea>
      <Dialog.Actions style={styles.actions}>
        <Button onPress={onDismiss} textColor={colors.primary} labelStyle={styles.buttonLabel}>
          Cancelar
        </Button>
        <Button
          mode="contained"
          onPress={salvar}
          buttonColor={colors.primary}
          textColor={colors.white}
          style={styles.saveButton}
          labelStyle={styles.buttonLabel}
        >
          Salvar
        </Button>
      </Dialog.Actions>
    </>
  );
}

const styles = StyleSheet.create({
  dialog: {
    maxHeight: '85%',
    borderRadius: 28,
    backgroundColor: colors.background,
  },
  title: {
    fontFamily: fonts.nunitoBold,
    fontSize: 20,
    lineHeight: 26,
    color: colors.black,
  },
  scrollArea: {
    paddingHorizontal: 0,
    borderColor: colors.line,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  actions: {
    gap: 8,
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  saveButton: {
    borderRadius: 30,
    paddingHorizontal: 8,
  },
  buttonLabel: {
    fontFamily: fonts.nunitoBold,
    fontSize: 16,
    letterSpacing: 0,
  },
});
