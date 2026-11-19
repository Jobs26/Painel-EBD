import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { HelperText, Text } from 'react-native-paper';

import EyePassIcon from '@assets/icons/eye-pass.svg';
import { AuthScreen } from '@/components/AuthScreen';
import { FooterLink } from '@/components/FooterLink';
import { FormField } from '@/components/FormField';
import { PrimaryButton } from '@/components/PrimaryButton';
import { colors, fonts } from '@/theme';
import { maskDate } from '@/utils/masks';

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

/** Aplica a máscara DD / MM / AAAA enquanto o usuário digita. */
export default function CadastroScreen() {
  const [form, setForm] = useState(initialForm);
  const [submitted, setSubmitted] = useState(false);

  const set = (field: keyof CadastroForm) => (value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const senhasDiferentes =
    form.confirmarSenha.length > 0 && form.senha !== form.confirmarSenha;
  const camposVazios = Object.values(form).some((v) => v.trim() === '');

  const handleCadastro = () => {
    setSubmitted(true);
    if (camposVazios || senhasDiferentes) return;
    // TODO(backend): criar o usuário no Supabase.
    router.replace('/home');
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
          placeholder="+ 123 456 789"
          value={form.telefone}
          onChangeText={set('telefone')}
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

      {senhasDiferentes ? (
        <HelperText type="error" visible>
          As senhas não coincidem.
        </HelperText>
      ) : submitted && camposVazios ? (
        <HelperText type="error" visible>
          Preencha todos os campos.
        </HelperText>
      ) : null}

      <Text style={styles.terms}>
        Ao continuar, você concorda com{'\n'}
        <Text style={styles.termsBold}>os Termos de Uso e Políticas de privacidade</Text>
      </Text>

      <PrimaryButton
        title="Cadastre-se"
        width={207}
        height={45}
        onPress={handleCadastro}
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
