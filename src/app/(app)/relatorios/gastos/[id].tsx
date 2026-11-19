import { StyleSheet, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Button, Text } from 'react-native-paper';

import { GastoForm } from '@/components/GastoForm';
import { useEscola } from '@/data/EscolaContext';
import { fechamentoDe, trimestreDaData } from '@/data/relatorio';
import { colors, fonts } from '@/theme';

/** Edição de um gasto: /relatorios/gastos/:id (só em trimestre aberto). */
export default function EditarGastoScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { gastos, fechamentos } = useEscola();
  const gasto = gastos.find((g) => g.id === id);

  if (!gasto || fechamentoDe(trimestreDaData(gasto.data), fechamentos)) {
    return (
      <View style={styles.notFound}>
        <Text style={styles.text}>
          {gasto ? 'Este gasto é de um trimestre fechado e não pode ser alterado.' : 'Gasto não encontrado.'}
        </Text>
        <Button onPress={() => router.replace('/relatorios')} textColor={colors.primary}>
          Voltar para relatórios
        </Button>
      </View>
    );
  }

  return <GastoForm key={gasto.id} gasto={gasto} />;
}

const styles = StyleSheet.create({
  notFound: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingHorizontal: 32,
  },
  text: {
    textAlign: 'center',
    fontFamily: fonts.nunitoSemiBold,
    fontSize: 18,
    color: colors.black,
  },
});
