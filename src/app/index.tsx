import { Redirect } from 'expo-router';

import { useAuth } from '@/data/AuthContext';

/** Entrada do app: com sessão salva vai direto para a Home, sem sessão para o login. */
export default function Index() {
  const { logado } = useAuth();
  return <Redirect href={logado ? '/home' : '/login'} />;
}
