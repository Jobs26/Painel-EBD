import { StyleSheet, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Button, Text } from 'react-native-paper';

import { TurmaForm } from '@/components/TurmaForm';
import { useEscola } from '@/data/EscolaContext';
import { colors, fonts } from '@/theme';

export default function EditarTurmaScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { turmas } = useEscola();
  const turma = turmas.find((t) => t.id === id);

  if (!turma) {
    return (
      <View style={styles.notFound}>
        <Text style={styles.text}>Turma não encontrada.</Text>
        <Button onPress={() => router.replace('/turmas')} textColor={colors.primary}>
          Voltar para turmas
        </Button>
      </View>
    );
  }

  // `key` reinicia o formulário se outra turma for aberta.
  return <TurmaForm key={turma.id} turma={turma} />;
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
