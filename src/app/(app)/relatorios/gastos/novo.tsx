import { useLocalSearchParams } from 'expo-router';

import { GastoForm } from '@/components/GastoForm';
import { parseIsoDate } from '@/data/relatorio';

/** Novo gasto: /relatorios/gastos/novo?data=AAAA-MM-DD (data sugerida, opcional). */
export default function NovoGastoScreen() {
  const { data } = useLocalSearchParams<{ data?: string }>();
  return <GastoForm dataSugerida={typeof data === 'string' && parseIsoDate(data) ? data : undefined} />;
}
