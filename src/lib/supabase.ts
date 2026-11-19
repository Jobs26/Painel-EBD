import { AppState, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

import type { Database } from '@/lib/database.types';

const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const chave = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!url || !chave) {
  throw new Error(
    'Supabase não configurado: crie o arquivo .env.local (veja .env.example) e reinicie o `npm start`.',
  );
}

/**
 * Cliente único do Supabase. A sessão (token de acesso + refresh) fica salva no
 * AsyncStorage, então o usuário continua logado ao fechar e abrir o app.
 */
export const supabase = createClient<Database>(url, chave, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// No celular, o token só é renovado com o app em primeiro plano (recomendação do Supabase).
if (Platform.OS !== 'web') {
  AppState.addEventListener('change', (estado) => {
    if (estado === 'active') supabase.auth.startAutoRefresh();
    else supabase.auth.stopAutoRefresh();
  });
}
