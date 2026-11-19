import { useState } from 'react';
import { StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { HelperText, Text } from 'react-native-paper';

import { AuthScreen } from '@/components/AuthScreen';
import { FooterLink } from '@/components/FooterLink';
import { FormField } from '@/components/FormField';
import { PrimaryButton } from '@/components/PrimaryButton';
import { emailValido, normalizarEmail } from '@/data/auth';
import { useAuth } from '@/data/AuthContext';
import { colors, fonts } from '@/theme';

/**
 * Recuperação de senha, etapa 1: pede o código ao Supabase e segue para a tela de
 * redefinição. A resposta é sempre a mesma, com ou sem conta (evita enumeração).
 */
export default function EsqueciSenhaScreen() {
  const { pedirRecuperacao } = useAuth();
  const [email, setEmail] = useState('');
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  const handleContinuar = async () => {
    if (enviando) return;
    if (!emailValido(email)) {
      setErro('Informe um e-mail válido.');
      return;
    }
    setErro(null);
    setEnviando(true);
    const resultado = await pedirRecuperacao(email);
    setEnviando(false);
    if (!resultado.ok) {
      setErro(resultado.erro);
      return;
    }
    router.push({ pathname: '/redefinir-senha', params: { email: normalizarEmail(email) } });
  };

  return (
    <>
      <AuthScreen paddingTop={100} paddingHorizontal={22}>
        <Text style={styles.title}>Esqueci a senha</Text>

        <FormField
          label="Endereço de Email cadastrado"
          placeholder="example@example.com"
          value={email}
          onChangeText={(v) => {
            setEmail(v);
            setErro(null);
          }}
          onSubmitEditing={handleContinuar}
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          height={41}
          labelPaddingLeft={16}
          inputPaddingLeft={19}
          labelGap={28}
          labelStyle={styles.label}
          inputTextStyle={styles.inputText}
          containerStyle={styles.field}
        />
        {erro ? (
          <HelperText type="error" visible style={styles.erro} accessibilityLiveRegion="polite">
            {erro}
          </HelperText>
        ) : null}

        <PrimaryButton
          title={enviando ? 'Enviando…' : 'Continuar'}
          width={169}
          height={32}
          onPress={handleContinuar}
          loading={enviando}
          disabled={enviando}
          labelStyle={styles.buttonLabel}
          style={styles.button}
        />

        <FooterLink
          text="Não possui conta?"
          linkText="Cadastre-se"
          onPress={() => router.push('/cadastro')}
          style={styles.footer}
        />
      </AuthScreen>
    </>
  );
}

const styles = StyleSheet.create({
  title: {
    fontFamily: fonts.nunitoSemiBold,
    fontSize: 30,
    lineHeight: 34,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  field: {
    marginTop: 114,
  },
  label: {
    fontFamily: fonts.interMedium,
    color: colors.textPrimary,
  },
  inputText: {
    fontFamily: fonts.interRegular,
  },
  erro: {
    textAlign: 'center',
  },
  button: {
    marginTop: 28,
  },
  buttonLabel: {
    fontFamily: fonts.nunitoBold,
    fontSize: 20,
    lineHeight: 22,
  },
  footer: {
    marginTop: 49,
  },
});
