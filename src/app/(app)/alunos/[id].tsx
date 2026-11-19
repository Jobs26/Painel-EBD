import { StyleSheet, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Button, Text } from 'react-native-paper';

import { AlunoForm } from '@/components/AlunoForm';
import { useEscola } from '@/data/EscolaContext';
import { colors, fonts } from '@/theme';

export default function EditarAlunoScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { alunos } = useEscola();
  const aluno = alunos.find((a) => a.id === id);

  if (!aluno) {
    return (
      <View style={styles.notFound}>
        <Text style={styles.text}>Aluno não encontrado.</Text>
        <Button onPress={() => router.replace('/alunos')} textColor={colors.primary}>
          Voltar para alunos
        </Button>
      </View>
    );
  }

  // `key` reinicia o formulário se outro aluno for aberto.
  return <AlunoForm key={aluno.id} aluno={aluno} />;
}

const styles = StyleSheet.create({
  notFound: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  text: {
    fontFamily: fonts.nunitoSemiBold,
    fontSize: 18,
    color: colors.black,
  },
});
