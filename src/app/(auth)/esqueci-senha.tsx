import { useState } from 'react';
import { StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { Snackbar, Text } from 'react-native-paper';

import { AuthScreen } from '@/components/AuthScreen';
import { FooterLink } from '@/components/FooterLink';
import { FormField } from '@/components/FormField';
import { PrimaryButton } from '@/components/PrimaryButton';
import { colors, fonts } from '@/theme';

export default function EsqueciSenhaScreen() {
  const [email, setEmail] = useState('');
  const [enviado, setEnviado] = useState(false);

  // TODO(backend): disparar o e-mail de recuperação pelo Supabase Auth.
  const handleContinuar = () => {
    if (email.trim()) setEnviado(true);
  };

  return (
    <>
      <AuthScreen paddingTop={100} paddingHorizontal={22}>
        <Text style={styles.title}>Esqueci a senha</Text>

        <FormField
          label="Endereço de Email cadastrado"
          placeholder="example@example.com"
          value={email}
          onChangeText={setEmail}
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

        <PrimaryButton
          title="Continuar"
          width={169}
          height={32}
          onPress={handleContinuar}
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

      <Snackbar visible={enviado} onDismiss={() => setEnviado(false)} duration={4000}>
        Se o e-mail estiver cadastrado, você receberá um link para redefinir a senha.
      </Snackbar>
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
