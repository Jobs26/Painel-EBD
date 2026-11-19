import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import type { Session } from '@supabase/supabase-js';

import {
  BLOQUEIO_LOGIN_MS,
  MAX_TENTATIVAS_LOGIN,
  MENSAGEM_LOGIN_INVALIDO,
  mensagemDoErro,
  nascimentoDoBanco,
  nascimentoParaBanco,
  normalizarEmail,
  type DadosCadastro,
} from '@/data/auth';
import type { Usuario } from '@/data/mock';
import type { UsuarioRow } from '@/lib/database.types';
import { supabase } from '@/lib/supabase';

/** Resultado das ações de autenticação: `erro` já vem pronto para mostrar na tela. */
export type Resultado = { ok: true } | { ok: false; erro: string };
export type ResultadoLogin = Resultado | { ok: false; erro: string; naoConfirmado: true };

type AuthContextValue = {
  /** Restaurando a sessão salva (mantém a splash screen). */
  carregando: boolean;
  /** Há sessão válida (e não está no meio de uma redefinição de senha). */
  logado: boolean;
  session: Session | null;
  /** Dados cadastrais da tabela `usuarios` (null enquanto carrega). */
  usuario: Usuario | null;

  entrar: (email: string, senha: string) => Promise<ResultadoLogin>;
  cadastrar: (dados: DadosCadastro) => Promise<Resultado>;
  confirmarCadastro: (email: string, codigo: string) => Promise<Resultado>;
  reenviarConfirmacao: (email: string) => Promise<Resultado>;
  /** Sempre "dá certo" para e-mail inexistente (resposta genérica); só falha por limite/rede. */
  pedirRecuperacao: (email: string) => Promise<Resultado>;
  redefinirSenha: (email: string, codigo: string, novaSenha: string) => Promise<Resultado>;
  atualizarUsuario: (dados: Omit<Usuario, 'email'>) => Promise<Resultado>;
  sair: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

const usuarioDaLinha = (linha: UsuarioRow): Usuario => ({
  nome: linha.nome,
  email: linha.email,
  telefone: linha.telefone,
  nascimento: nascimentoDoBanco(linha.data_nascimento),
});

/** Sessão do Supabase Auth + perfil do usuário logado. Regras em `src/data/auth.ts`. */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [perfil, setPerfil] = useState<{ id: string; usuario: Usuario } | null>(null);
  // Durante a redefinição, o código cria uma sessão antes da senha nova ser gravada;
  // isso segura o redirecionamento para a Home até o fim (ou desfaz a sessão se falhar).
  const [redefinindo, setRedefinindo] = useState(false);
  // Tentativas de login erradas por e-mail (bloqueio local; o servidor também limita por IP).
  const falhas = useRef(new Map<string, { quantidade: number; bloqueadoAte: number }>());

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setCarregando(false);
    });
    const { data } = supabase.auth.onAuthStateChange((_evento, nova) => setSession(nova));
    return () => data.subscription.unsubscribe();
  }, []);

  const userId = session?.user.id;
  useEffect(() => {
    if (!userId) return;
    let ativo = true;
    supabase
      .from('usuarios')
      .select('*')
      .eq('id', userId)
      .single()
      .then(({ data }) => {
        if (ativo && data) setPerfil({ id: data.id, usuario: usuarioDaLinha(data) });
      });
    return () => {
      ativo = false;
    };
  }, [userId]);
  // Perfil de outra conta (ou de antes do logout) nunca aparece.
  const usuario = perfil && perfil.id === userId ? perfil.usuario : null;

  const entrar = useCallback(async (email: string, senha: string): Promise<ResultadoLogin> => {
    const chave = normalizarEmail(email);
    if (!chave || !senha) return { ok: false, erro: 'Informe o e-mail e a senha.' };

    const registro = falhas.current.get(chave);
    if (registro && registro.bloqueadoAte > Date.now()) {
      const minutos = Math.ceil((registro.bloqueadoAte - Date.now()) / 60000);
      return {
        ok: false,
        erro: `Muitas tentativas erradas. Tente de novo em ${minutos} min ou use "Esqueceu a senha?".`,
      };
    }

    const { error } = await supabase.auth.signInWithPassword({ email: chave, password: senha });
    if (!error) {
      falhas.current.delete(chave);
      return { ok: true };
    }
    if (error.code === 'email_not_confirmed') {
      await supabase.auth.resend({ type: 'signup', email: chave });
      return { ok: false, erro: mensagemDoErro(error), naoConfirmado: true };
    }
    if (error.code === 'invalid_credentials') {
      // Depois de um bloqueio a contagem recomeça do zero (o registro bloqueado guarda quantidade 0).
      const quantidade = (registro?.quantidade ?? 0) + 1;
      const bloquear = quantidade >= MAX_TENTATIVAS_LOGIN;
      falhas.current.set(chave, { quantidade: bloquear ? 0 : quantidade, bloqueadoAte: bloquear ? Date.now() + BLOQUEIO_LOGIN_MS : 0 });
      if (bloquear) {
        return { ok: false, erro: `Muitas tentativas erradas. Login bloqueado por ${BLOQUEIO_LOGIN_MS / 60000} minutos.` };
      }
      const restantes = MAX_TENTATIVAS_LOGIN - quantidade;
      return {
        ok: false,
        erro: restantes <= 2 ? `${MENSAGEM_LOGIN_INVALIDO} Restam ${restantes} tentativa${restantes > 1 ? 's' : ''}.` : MENSAGEM_LOGIN_INVALIDO,
      };
    }
    return { ok: false, erro: mensagemDoErro(error) };
  }, []);

  const cadastrar = useCallback(async (dados: DadosCadastro): Promise<Resultado> => {
    const { data, error } = await supabase.auth.signUp({
      email: normalizarEmail(dados.email),
      password: dados.senha,
      options: {
        data: {
          nome: dados.nome.trim(),
          telefone: dados.telefone,
          data_nascimento: nascimentoParaBanco(dados.nascimento),
        },
      },
    });
    if (error) return { ok: false, erro: mensagemDoErro(error) };
    // Com confirmação de e-mail ligada, e-mail repetido volta como usuário "vazio" (sem identities).
    if (data.user && data.user.identities?.length === 0) return { ok: false, erro: 'Este e-mail já está cadastrado.' };
    return { ok: true };
  }, []);

  const confirmarCadastro = useCallback(async (email: string, codigo: string): Promise<Resultado> => {
    const { error } = await supabase.auth.verifyOtp({ email: normalizarEmail(email), token: codigo, type: 'email' });
    return error ? { ok: false, erro: mensagemDoErro(error) } : { ok: true };
  }, []);

  const reenviarConfirmacao = useCallback(async (email: string): Promise<Resultado> => {
    const { error } = await supabase.auth.resend({ type: 'signup', email: normalizarEmail(email) });
    return error ? { ok: false, erro: mensagemDoErro(error) } : { ok: true };
  }, []);

  const pedirRecuperacao = useCallback(async (email: string): Promise<Resultado> => {
    const { error } = await supabase.auth.resetPasswordForEmail(normalizarEmail(email));
    // Só limite de envio e falta de conexão viram erro: nada que revele se a conta existe.
    if (error && (error.code?.startsWith('over_') || error.status === 0)) return { ok: false, erro: mensagemDoErro(error) };
    return { ok: true };
  }, []);

  const redefinirSenha = useCallback(async (email: string, codigo: string, novaSenha: string): Promise<Resultado> => {
    setRedefinindo(true);
    try {
      const verificacao = await supabase.auth.verifyOtp({ email: normalizarEmail(email), token: codigo, type: 'recovery' });
      if (verificacao.error) return { ok: false, erro: mensagemDoErro(verificacao.error) };
      const troca = await supabase.auth.updateUser({ password: novaSenha });
      if (troca.error) {
        // O código já foi consumido: desfaz a sessão para o usuário não entrar sem senha nova.
        await supabase.auth.signOut({ scope: 'local' });
        return { ok: false, erro: `${mensagemDoErro(troca.error)} Peça um novo código.` };
      }
      falhas.current.delete(normalizarEmail(email));
      return { ok: true };
    } finally {
      setRedefinindo(false);
    }
  }, []);

  const atualizarUsuario = useCallback(
    async (dados: Omit<Usuario, 'email'>): Promise<Resultado> => {
      const data_nascimento = nascimentoParaBanco(dados.nascimento);
      if (!userId || !data_nascimento) return { ok: false, erro: 'Dados inválidos.' };
      const { data, error } = await supabase
        .from('usuarios')
        .update({ nome: dados.nome.trim(), telefone: dados.telefone, data_nascimento })
        .eq('id', userId)
        .select()
        .single();
      if (error || !data) return { ok: false, erro: 'Não foi possível salvar. Tente novamente.' };
      setPerfil({ id: data.id, usuario: usuarioDaLinha(data) });
      return { ok: true };
    },
    [userId],
  );

  const sair = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      carregando,
      logado: !!session && !redefinindo,
      session,
      usuario,
      entrar,
      cadastrar,
      confirmarCadastro,
      reenviarConfirmacao,
      pedirRecuperacao,
      redefinirSenha,
      atualizarUsuario,
      sair,
    }),
    [carregando, session, redefinindo, usuario, entrar, cadastrar, confirmarCadastro, reenviarConfirmacao, pedirRecuperacao, redefinirSenha, atualizarUsuario, sair],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth precisa estar dentro de <AuthProvider>.');
  return ctx;
}
