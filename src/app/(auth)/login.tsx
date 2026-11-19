import { useState } from 'react';
import { StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { HelperText, Text } from 'react-native-paper';

import EyePassIcon from '@assets/icons/eye-pass-login.svg';
import { AuthScreen } from '@/components/AuthScreen';
import { FooterLink } from '@/components/FooterLink';
import { FormField } from '@/components/FormField';
import { PrimaryButton } from '@/components/PrimaryButton';
import { useAuth } from '@/data/AuthContext';
import { colors, fonts } from '@/theme';

const logo = require('@assets/images/logo-ebd.png');

/** Login com e-mail e senha (Supabase Auth). Regras em `src/data/auth.ts`. */
export default function LoginScreen() {
  const { entrar } = useAuth();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  // Deu certo → a sessão muda e o layout raiz leva para a Home.
  const handleLogin = async () => {
    if (enviando) return;
    setErro(null);
    setEnviando(true);
    const resultado = await entrar(email, senha);
    setEnviando(false);
    if (resultado.ok) return;
    if ('naoConfirmado' in resultado) {
      router.push({ pathname: '/confirmar-email', params: { email: email.trim().toLowerCase() } });
      return;
    }
    setErro(resultado.erro);
  };

  return (
    <AuthScreen paddingTop={120} paddingHorizontal={35}>
      <Image
        source={logo}
        style={styles.logo}
        contentFit="cover"
        accessibilityLabel="Logo Painel EBD"
      />

      <FormField
        label="Email"
        placeholder="example@example.com"
        value={email}
        onChangeText={(v) => {
          setEmail(v);
          setErro(null);
        }}
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
        height={36}
        containerStyle={styles.firstField}
      />

      <FormField
        label="Senha"
        placeholder="●●●●●●●●"
        value={senha}
        onChangeText={(v) => {
          setSenha(v);
          setErro(null);
        }}
        password
        eyeIcon={EyePassIcon}
        autoComplete="password"
        height={36}
        containerStyle={styles.secondField}
        onSubmitEditing={handleLogin}
        returnKeyType="go"
      />

      {erro ? (
        <HelperText type="error" visible style={styles.erro} accessibilityLiveRegion="polite">
          {erro}
        </HelperText>
      ) : null}

      <PrimaryButton
        title={enviando ? 'Entrando…' : 'Login'}
        width={192}
        height={39}
        onPress={handleLogin}
        loading={enviando}
        disabled={enviando}
        style={erro ? styles.buttonComErro : styles.button}
      />

      <Text
        style={styles.forgot}
        onPress={() => router.push('/esqueci-senha')}
        accessibilityRole="link"
      >
        Esqueceu a senha?
      </Text>

      <FooterLink
        text="Não tem conta?"
        linkText="Cadastre-se"
        onPress={() => router.push('/cadastro')}
        style={styles.footer}
      />
    </AuthScreen>
  );
}

const styles = StyleSheet.create({
  logo: {
    width: 219,
    height: 149,
    alignSelf: 'center',
  },
  firstField: {
    marginTop: 32,
  },
  secondField: {
    marginTop: 31,
  },
  button: {
    marginTop: 37,
  },
  buttonComErro: {
    marginTop: 12,
  },
  erro: {
    marginTop: 6,
    textAlign: 'center',
  },
  forgot: {
    marginTop: 21,
    alignSelf: 'center',
    fontFamily: fonts.interSemiBold,
    fontSize: 14,
    color: colors.textPrimary,
    textDecorationLine: 'underline',
  },
  footer: {
    marginTop: 12,
  },
});
