/**
 * REGRA — alteração de senha (Perfil → Alterar senha)
 *
 * 1. O usuário logado pede um código. O app envia um código de 6 dígitos para o
 *    e-mail cadastrado (o e-mail aparece mascarado na tela: "ad***@painelebd.com").
 * 2. O código vale 10 minutos. Pode ser reenviado depois de 60 segundos; o código
 *    novo invalida o anterior.
 * 3. O usuário digita o código no app. Errou 5 vezes → o código é invalidado e é
 *    preciso pedir outro. Código vencido → pedir outro.
 * 4. Só com o código confirmado o usuário informa: senha atual, nova senha e a
 *    confirmação da nova senha.
 * 5. A nova senha precisa ter no mínimo 8 caracteres, letras e números, ser
 *    diferente da senha atual e igual à confirmação. Senha atual errada → erro.
 * 6. Deu certo → a senha é trocada, o usuário volta ao Perfil com o aviso de sucesso
 *    (no backend: encerrar as outras sessões abertas da conta).
 *
 * Fase atual: só front-end. O código é gerado no próprio app e mostrado num aviso
 * de demonstração; a senha fica em memória (EscolaContext).
 *
 * TODO(backend, Supabase Auth): `supabase.auth.reauthenticate()` envia o código (nonce)
 * para o e-mail do usuário logado e `supabase.auth.updateUser({ password, nonce })`
 * troca a senha. A senha atual pode ser conferida com `signInWithPassword` antes da
 * troca. Prazo do código e limite de tentativas são configurados no Supabase.
 */

export const CODIGO_DIGITOS = 6;
export const CODIGO_VALIDADE_MS = 10 * 60 * 1000;
export const REENVIO_SEGUNDOS = 60;
export const MAX_TENTATIVAS_CODIGO = 5;
export const SENHA_MINIMO = 8;

/** Código numérico de 6 dígitos (só para a demonstração no front-end). */
export function gerarCodigo() {
  return String(Math.floor(Math.random() * 10 ** CODIGO_DIGITOS)).padStart(CODIGO_DIGITOS, '0');
}

/** "admin@painelebd.com" → "ad***@painelebd.com" */
export function mascararEmail(email: string) {
  const [usuario, dominio] = email.split('@');
  if (!dominio) return email;
  return `${usuario.slice(0, 2)}***@${dominio}`;
}

export const REQUISITOS_SENHA: { id: string; label: string; ok: (nova: string, atual: string) => boolean }[] = [
  { id: 'tamanho', label: `Pelo menos ${SENHA_MINIMO} caracteres`, ok: (nova) => nova.length >= SENHA_MINIMO },
  { id: 'letras-numeros', label: 'Letras e números', ok: (nova) => /[a-zA-Z]/.test(nova) && /\d/.test(nova) },
  { id: 'diferente', label: 'Diferente da senha atual', ok: (nova, atual) => nova.length > 0 && nova !== atual },
];

export const novaSenhaValida = (nova: string, atual: string) => REQUISITOS_SENHA.every((r) => r.ok(nova, atual));
