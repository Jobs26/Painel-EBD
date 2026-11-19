/**
 * REGRA — criar conta, login e recuperação de senha (Supabase Auth)
 *
 * Onde fica cada coisa:
 * - `auth.users` (Supabase Auth): e-mail único, hash da senha (bcrypt), confirmação de
 *   e-mail e os códigos de uso único (confirmação e recuperação), com validade.
 * - `public.usuarios`: dados cadastrais (nome, e-mail, telefone, nascimento), criado por
 *   gatilho no cadastro. RLS: cada usuário só lê/edita a própria linha.
 *   Migration: `supabase/migrations/20261119183842_criar_usuarios.sql`.
 *
 * Cadastro
 * 1. Valida no app: nome (2+ letras), e-mail, telefone com DDD, nascimento válido (não
 *    futuro, ano ≥ 1900), senha com 8+ caracteres, letras e números, e a confirmação.
 *    O banco repete as validações (constraints), então dados ruins não entram nem por fora do app.
 * 2. `signUp` com os dados em `options.data` → o gatilho cria a linha em `usuarios`.
 * 3. E-mail já cadastrado → "Este e-mail já está cadastrado." (o Supabase devolve o usuário
 *    sem `identities`).
 * 4. Um código de 6 dígitos é enviado ao e-mail; a conta só entra no app depois de
 *    confirmar o código (tela `confirmar-email`). Reenvio após 60 s.
 *
 * Login
 * 1. E-mail e senha obrigatórios.
 * 2. E-mail inexistente ou senha errada → mesma mensagem genérica "E-mail ou senha inválidos."
 * 3. Conta ainda não confirmada → reenvia o código e abre a confirmação.
 * 4. 5 tentativas erradas seguidas para o mesmo e-mail → login bloqueado por 5 minutos
 *    neste aparelho. No servidor, o Supabase limita as tentativas por IP (Rate Limits).
 * 5. A sessão fica salva (AsyncStorage): ao abrir o app de novo, vai direto para a Home.
 *
 * Esqueci a senha
 * 1. Informa o e-mail → resposta sempre genérica ("Se o e-mail estiver cadastrado…"),
 *    exista a conta ou não (evita descobrir quem tem conta).
 * 2. Se existir, o Supabase envia um código de 6 dígitos de uso único (validade
 *    configurada no painel: 5 min).
 * 3. Na tela `redefinir-senha`: código + nova senha + confirmação. Código errado, vencido
 *    ou já usado → erro. Deu certo → senha trocada, código invalidado e o usuário entra.
 *
 * Configuração necessária no painel do Supabase: ver CLAUDE.md ("Supabase Auth").
 */

import { AuthError } from '@supabase/supabase-js';

import { CODIGO_DIGITOS, REQUISITOS_SENHA, SENHA_MINIMO } from '@/data/senha';
import type { Usuario } from '@/data/mock';
import { parseDate } from '@/utils/masks';

export { CODIGO_DIGITOS, SENHA_MINIMO };

export const MAX_TENTATIVAS_LOGIN = 5;
export const BLOQUEIO_LOGIN_MS = 5 * 60 * 1000;
export const REENVIO_CODIGO_SEGUNDOS = 60;

export const MENSAGEM_LOGIN_INVALIDO = 'E-mail ou senha inválidos.';
export const MENSAGEM_RECUPERACAO =
  'Se o e-mail estiver cadastrado, você receberá um código para redefinir a senha.';

const EMAIL_VALIDO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const normalizarEmail = (email: string) => email.trim().toLowerCase();
export const emailValido = (email: string) => EMAIL_VALIDO.test(email.trim());
export const nomeValido = (nome: string) => nome.trim().length >= 2 && nome.trim().length <= 80;
export const telefoneValido = (telefone: string) => /^\d{10,11}$/.test(telefone.replace(/\D/g, ''));
export const codigoValido = (codigo: string) => new RegExp(`^\\d{${CODIGO_DIGITOS}}$`).test(codigo);

/** Requisitos da senha nova no cadastro e na recuperação (sem "diferente da atual"). */
export const REQUISITOS_SENHA_NOVA = REQUISITOS_SENHA.filter((r) => r.id !== 'diferente');
export const senhaForte = (senha: string) => REQUISITOS_SENHA_NOVA.every((r) => r.ok(senha, ''));

/** "DD / MM / AAAA" → "AAAA-MM-DD" (formato do banco); `null` se inválida. */
export function nascimentoParaBanco(mascarada: string) {
  const data = parseDate(mascarada);
  if (!data) return null;
  const mm = String(data.getMonth() + 1).padStart(2, '0');
  const dd = String(data.getDate()).padStart(2, '0');
  return `${data.getFullYear()}-${mm}-${dd}`;
}

/** "AAAA-MM-DD" → "DD / MM / AAAA" (formato das telas). */
export function nascimentoDoBanco(iso: string) {
  const [a, m, d] = iso.split('-');
  return a && m && d ? `${d} / ${m} / ${a}` : '';
}

export type DadosCadastro = Usuario & { senha: string };

/** Primeiro erro de validação do cadastro, ou `null` se estiver tudo certo. */
export function erroDoCadastro(dados: DadosCadastro, confirmarSenha: string): string | null {
  if (Object.values({ ...dados, confirmarSenha }).some((v) => v.trim() === '')) return 'Preencha todos os campos.';
  if (!nomeValido(dados.nome)) return 'Informe o nome completo.';
  if (!emailValido(dados.email)) return 'E-mail inválido.';
  if (!telefoneValido(dados.telefone)) return 'Telefone inválido: informe o DDD e o número.';
  if (!nascimentoParaBanco(dados.nascimento)) return 'Data de nascimento inválida.';
  if (!senhaForte(dados.senha)) return `A senha precisa ter pelo menos ${SENHA_MINIMO} caracteres, com letras e números.`;
  if (dados.senha !== confirmarSenha) return 'As senhas não coincidem.';
  return null;
}

/** Traduz os erros do Supabase Auth para mensagens das telas. */
export function mensagemDoErro(erro: unknown): string {
  if (!(erro instanceof AuthError)) return 'Não foi possível concluir. Tente novamente.';
  switch (erro.code) {
    case 'invalid_credentials':
      return MENSAGEM_LOGIN_INVALIDO;
    case 'email_not_confirmed':
      return 'Confirme seu e-mail para entrar.';
    case 'user_already_exists':
    case 'email_exists':
      return 'Este e-mail já está cadastrado.';
    case 'weak_password':
      return `Senha fraca: use pelo menos ${SENHA_MINIMO} caracteres, com letras e números.`;
    case 'same_password':
      return 'A nova senha precisa ser diferente da senha atual.';
    case 'otp_expired':
      return 'Código inválido ou vencido. Peça um novo código.';
    case 'over_email_send_rate_limit':
      return 'Muitos e-mails enviados. Aguarde alguns minutos e tente de novo.';
    case 'over_request_rate_limit':
      return 'Muitas tentativas. Aguarde alguns minutos e tente de novo.';
    case 'email_address_invalid':
      return 'E-mail inválido.';
    case 'unexpected_failure':
      // Ex.: o gatilho do cadastro recusou os dados (constraint da tabela usuarios).
      return 'Não foi possível salvar o cadastro. Confira os dados e tente novamente.';
  }
  if (erro.status === 0 || erro.name === 'AuthRetryableFetchError') {
    return 'Sem conexão com o servidor. Verifique a internet e tente novamente.';
  }
  return 'Não foi possível concluir. Tente novamente.';
}
