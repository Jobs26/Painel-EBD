import { Redirect } from 'expo-router';

// TODO(backend): redirecionar para /home quando já houver sessão ativa no Supabase.
export default function Index() {
  return <Redirect href="/login" />;
}
