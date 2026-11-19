import { StyleSheet, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Button, Text } from 'react-native-paper';

import { LancamentoForm } from '@/components/LancamentoForm';
import { ehDomingo, hojeIso } from '@/data/relatorio';
import { colors, fonts } from '@/theme';

/** Lançamento de um domingo: /relatorios/AAAA-MM-DD */
export default function LancamentoScreen() {
  const { data } = useLocalSearchParams<{ data: string }>();

  // Só domingos que já aconteceram podem ser lançados.
  if (typeof data !== 'string' || !ehDomingo(data) || data > hojeIso()) {
    return (
      <View style={styles.notFound}>
        <Text style={styles.text}>Domingo não encontrado.</Text>
        <Button onPress={() => router.replace('/relatorios')} textColor={colors.primary}>
          Voltar para relatórios
        </Button>
      </View>
    );
  }

  // `key` reinicia o formulário se outro domingo for aberto.
  return <LancamentoForm key={data} data={data} />;
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
