import { useState } from 'react';
import { StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Text } from 'react-native-paper';

import EyePassIcon from '@assets/icons/eye-pass-login.svg';
import { AuthScreen } from '@/components/AuthScreen';
import { FooterLink } from '@/components/FooterLink';
import { FormField } from '@/components/FormField';
import { PrimaryButton } from '@/components/PrimaryButton';
import { colors, fonts } from '@/theme';

const logo = require('@assets/images/logo-ebd.png');

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');

  // TODO(backend): autenticar com o Supabase antes de navegar.
  const handleLogin = () => router.replace('/home');

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
        onChangeText={setEmail}
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
        onChangeText={setSenha}
        password
        eyeIcon={EyePassIcon}
        autoComplete="password"
        height={36}
        containerStyle={styles.secondField}
      />

      <PrimaryButton
        title="Login"
        width={192}
        height={39}
        onPress={handleLogin}
        style={styles.button}
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
