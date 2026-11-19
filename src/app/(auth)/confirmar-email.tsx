import { useState } from 'react';
import { StyleSheet } from 'react-native';
import { Redirect, router, useLocalSearchParams } from 'expo-router';
import { HelperText, Snackbar, Text } from 'react-native-paper';

import { AuthScreen } from '@/components/AuthScreen';
import { authCodigoStyles } from '@/components/authCodigoStyles';
import { FooterLink } from '@/components/FooterLink';
import { FormField } from '@/components/FormField';
import { PrimaryButton } from '@/components/PrimaryButton';
import { CODIGO_DIGITOS, REENVIO_CODIGO_SEGUNDOS, codigoValido } from '@/data/auth';
import { useAuth } from '@/data/AuthContext';
import { mascararEmail } from '@/data/senha';
import { useContagemRegressiva } from '@/utils/useContagemRegressiva';

/**
 * Confirmação do e-mail do cadastro: o usuário digita o código de 6 dígitos enviado
 * pelo Supabase. Confirmado → a sessão é criada e o layout raiz leva para a Home.
 */
export default function ConfirmarEmailScreen() {
  const { email } = useLocalSearchParams<{ email?: string }>();
  const { confirmarCadastro, reenviarConfirmacao } = useAuth();
  const [codigo, setCodigo] = useState('');
  const [erro, setErro] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  // O código acabou de ser enviado no cadastro (ou no login de conta não confirmada).
  const [espera, reiniciarEspera] = useContagemRegressiva(REENVIO_CODIGO_SEGUNDOS);

  if (!email) return <Redirect href="/login" />;

  const confirmar = async () => {
    if (enviando) return;
    if (!codigoValido(codigo)) {
      setErro(`Digite o código de ${CODIGO_DIGITOS} dígitos.`);
      return;
    }
    setErro(null);
    setEnviando(true);
    const resultado = await confirmarCadastro(email, codigo);
    setEnviando(false);
    if (!resultado.ok) setErro(resultado.erro);
  };

  const reenviar = async () => {
    const resultado = await reenviarConfirmacao(email);
    if (!resultado.ok) {
      setErro(resultado.erro);
      return;
    }
    setCodigo('');
    setErro(null);
    setAviso('Enviamos um novo código para o seu e-mail.');
    reiniciarEspera(REENVIO_CODIGO_SEGUNDOS);
  };

  return (
    <>
      <AuthScreen paddingTop={100} paddingHorizontal={22}>
        <Text style={styles.title}>Confirme seu e-mail</Text>
        <Text style={styles.texto}>
          Enviamos um código de {CODIGO_DIGITOS} dígitos para{'\n'}
          <Text style={styles.email}>{mascararEmail(email)}</Text>
        </Text>

        <FormField
          label="Código de confirmação"
          placeholder="000000"
          value={codigo}
          onChangeText={(v) => {
            setCodigo(v.replace(/\D/g, '').slice(0, CODIGO_DIGITOS));
            setErro(null);
          }}
          keyboardType="number-pad"
          autoComplete="one-time-code"
          textContentType="oneTimeCode"
          maxLength={CODIGO_DIGITOS}
          height={41}
          labelPaddingLeft={16}
          inputPaddingLeft={19}
          labelGap={10}
          labelStyle={styles.label}
          inputTextStyle={styles.codigo}
          containerStyle={styles.field}
          onSubmitEditing={confirmar}
        />
        {erro ? (
          <HelperText type="error" visible style={styles.erro} accessibilityLiveRegion="polite">
            {erro}
          </HelperText>
        ) : null}

        <PrimaryButton
          title={enviando ? 'Confirmando…' : 'Confirmar'}
          width={169}
          height={36}
          onPress={confirmar}
          loading={enviando}
          disabled={enviando}
          labelStyle={styles.buttonLabel}
          style={styles.button}
        />

        <Text
          style={[styles.reenviar, espera > 0 && styles.reenviarEspera]}
          onPress={espera > 0 ? undefined : reenviar}
          accessibilityRole="button"
          accessibilityState={{ disabled: espera > 0 }}
        >
          {espera > 0 ? `Reenviar código em ${espera} s` : 'Reenviar código'}
        </Text>

        <FooterLink
          text="Já confirmou?"
          linkText="Log In"
          onPress={() => router.replace('/login')}
          style={styles.footer}
        />
      </AuthScreen>

      <Snackbar visible={!!aviso} onDismiss={() => setAviso(null)} duration={3000}>
        {aviso ?? ''}
      </Snackbar>
    </>
  );
}

const styles = StyleSheet.create({
  ...authCodigoStyles,
  field: {
    marginTop: 48,
  },
  button: {
    marginTop: 24,
  },
  footer: {
    marginTop: 36,
  },
});
