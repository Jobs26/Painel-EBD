import { useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { Button, Dialog, Portal } from 'react-native-paper';

import { TurmaPicker } from '@/components/TurmaPicker';
import { useEscola } from '@/data/EscolaContext';
import type { Aluno } from '@/data/mock';
import { colors, fonts } from '@/theme';

type VincularTurmaDialogProps = {
  aluno: Aluno | null;
  onDismiss: () => void;
  onSaved: (turmaNome: string | null) => void;
};

/** Pop-up para escolher a turma de um aluno já cadastrado. */
export function VincularTurmaDialog({ aluno, onDismiss, onSaved }: VincularTurmaDialogProps) {
  return (
    <Portal>
      <Dialog visible={!!aluno} onDismiss={onDismiss} style={styles.dialog}>
        {/* `key` recria o conteúdo a cada aluno aberto, reiniciando a escolha. */}
        {aluno ? <Conteudo key={aluno.id} aluno={aluno} onDismiss={onDismiss} onSaved={onSaved} /> : null}
      </Dialog>
    </Portal>
  );
}

function Conteudo({ aluno, onDismiss, onSaved }: VincularTurmaDialogProps & { aluno: Aluno }) {
  const { turmas, vincularAluno } = useEscola();
  const [turmaId, setTurmaId] = useState<string | null>(aluno.turmaId);

  const salvar = () => {
    vincularAluno(aluno.id, turmaId);
    onSaved(turmas.find((t) => t.id === turmaId)?.nome ?? null);
  };

  return (
    <>
      <Dialog.Title style={styles.title} numberOfLines={2}>
        Vincular turma · {aluno.nome}
      </Dialog.Title>
      <Dialog.ScrollArea style={styles.scrollArea}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <TurmaPicker value={turmaId} onChange={setTurmaId} idade={aluno.idade} />
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
