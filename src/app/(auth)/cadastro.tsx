import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { HelperText, Text } from 'react-native-paper';

import EyePassIcon from '@assets/icons/eye-pass.svg';
import { AuthScreen } from '@/components/AuthScreen';
import { FooterLink } from '@/components/FooterLink';
import { FormField } from '@/components/FormField';
import { PrimaryButton } from '@/components/PrimaryButton';
import { erroDoCadastro, SENHA_MINIMO } from '@/data/auth';
import { useAuth } from '@/data/AuthContext';
import { colors, fonts } from '@/theme';
import { maskDate, maskPhone } from '@/utils/masks';

type CadastroForm = {
  nome: string;
  email: string;
  telefone: string;
  nascimento: string;
  senha: string;
  confirmarSenha: string;
};

const initialForm: CadastroForm = {
  nome: '',
  email: '',
  telefone: '',
  nascimento: '',
  senha: '',
  confirmarSenha: '',
};

/**
 * Criar conta (Supabase Auth). Depois do cadastro, abre a confirmação do código
 * enviado ao e-mail. Regras em `src/data/auth.ts`.
 */
export default function CadastroScreen() {
  const { cadastrar } = useAuth();
  const [form, setForm] = useState(initialForm);
  const [submitted, setSubmitted] = useState(false);
  const [erroServidor, setErroServidor] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  const set = (field: keyof CadastroForm) => (value: string) => {
    setErroServidor(null);
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const { confirmarSenha, ...dados } = form;
  const erroValidacao = erroDoCadastro(dados, confirmarSenha);
  const senhasDiferentes = confirmarSenha.length > 0 && form.senha !== confirmarSenha;
  const erro = erroServidor ?? (submitted ? erroValidacao : senhasDiferentes ? 'As senhas não coincidem.' : null);

  const handleCadastro = async () => {
    if (enviando) return;
    setSubmitted(true);
    if (erroValidacao) return;
    setEnviando(true);
    const resultado = await cadastrar(dados);
    setEnviando(false);
    if (!resultado.ok) {
      setErroServidor(resultado.erro);
      return;
    }
    router.replace({ pathname: '/confirmar-email', params: { email: dados.email.trim().toLowerCase() } });
  };

  const fieldProps = {
    height: 41,
    labelPaddingLeft: 18,
    inputPaddingLeft: 35,
    labelGap: 6,
    labelStyle: styles.label,
    inputTextStyle: styles.inputText,
    placeholderTextColor: colors.placeholderSecondary,
  } as const;

  return (
    <AuthScreen paddingTop={65} paddingHorizontal={22}>
      <Text style={styles.title}>Criar conta</Text>

      <View style={styles.form}>
        <FormField
          {...fieldProps}
          label="Nome completo"
          placeholder="Seu nome completo"
          value={form.nome}
          onChangeText={set('nome')}
          autoComplete="name"
          autoCapitalize="words"
        />
        <FormField
          {...fieldProps}
          label="Email"
          placeholder="example@example.com"
          value={form.email}
          onChangeText={set('email')}
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
        />
        <FormField
          {...fieldProps}
          label="Número de telefone"
          placeholder="(11) 91234-5678"
          value={form.telefone}
          onChangeText={(v) => set('telefone')(maskPhone(v))}
          keyboardType="phone-pad"
          autoComplete="tel"
        />
        <FormField
          {...fieldProps}
          label="Data de Nascimento"
          placeholder="DD / MM / AAAA"
          value={form.nascimento}
          onChangeText={(v) => set('nascimento')(maskDate(v))}
          keyboardType="number-pad"
        />
        <FormField
          {...fieldProps}
          label="Senha"
          placeholder="●●●●●●●●"
          value={form.senha}
          onChangeText={set('senha')}
          password
          eyeIcon={EyePassIcon}
          autoComplete="new-password"
        />
        <FormField
          {...fieldProps}
          label="Confirmar senha"
          placeholder="●●●●●●●●"
          value={form.confirmarSenha}
          onChangeText={set('confirmarSenha')}
          password
          eyeIcon={EyePassIcon}
          autoComplete="new-password"
        />
      </View>

      {erro ? (
        <HelperText type="error" visible accessibilityLiveRegion="polite">
          {erro}
        </HelperText>
      ) : (
        <HelperText type="info" visible style={styles.dica}>
          A senha precisa ter pelo menos {SENHA_MINIMO} caracteres, com letras e números.
        </HelperText>
      )}

      <Text style={styles.terms}>
        Ao continuar, você concorda com{'\n'}
        <Text style={styles.termsBold}>os Termos de Uso e Políticas de privacidade</Text>
      </Text>

      <PrimaryButton
        title={enviando ? 'Enviando…' : 'Cadastre-se'}
        width={207}
        height={45}
        onPress={handleCadastro}
        loading={enviando}
        disabled={enviando}
        labelStyle={styles.buttonLabel}
        style={styles.button}
      />

      <FooterLink
        text="Já possui uma conta?"
        linkText="Log In"
        onPress={() => router.replace('/login')}
        style={styles.footer}
      />
    </AuthScreen>
  );
}

const styles = StyleSheet.create({
  title: {
    fontFamily: fonts.nunitoSemiBold,
    fontSize: 30,
    lineHeight: 41,
    color: colors.black,
    textAlign: 'center',
  },
  form: {
    marginTop: 56,
    gap: 18,
  },
  label: {
    fontFamily: fonts.interMedium,
    color: colors.label,
  },
  inputText: {
    fontFamily: fonts.poppinsMedium,
  },
  dica: {
    color: colors.subtext,
  },
  terms: {
    marginTop: 25,
    fontFamily: fonts.spartanRegular,
    fontSize: 14,
    color: colors.subtext,
    textAlign: 'center',
  },
  termsBold: {
    fontFamily: fonts.spartanSemiBold,
  },
  button: {
    marginTop: 10,
  },
  buttonLabel: {
    fontFamily: fonts.poppinsSemiBold,
    fontSize: 20,
    lineHeight: 22,
  },
  footer: {
    marginTop: 11,
  },
});
