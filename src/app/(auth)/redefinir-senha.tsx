import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Redirect, router, useLocalSearchParams } from 'expo-router';
import { HelperText, Icon, Snackbar, Text } from 'react-native-paper';

import EyePassIcon from '@assets/icons/eye-pass.svg';
import { AuthScreen } from '@/components/AuthScreen';
import { authCodigoStyles } from '@/components/authCodigoStyles';
import { FooterLink } from '@/components/FooterLink';
import { FormField } from '@/components/FormField';
import { PrimaryButton } from '@/components/PrimaryButton';
import {
  CODIGO_DIGITOS,
  MENSAGEM_RECUPERACAO,
  REENVIO_CODIGO_SEGUNDOS,
  REQUISITOS_SENHA_NOVA,
  codigoValido,
  senhaForte,
} from '@/data/auth';
import { useAuth } from '@/data/AuthContext';
import { colors, fonts } from '@/theme';
import { useContagemRegressiva } from '@/utils/useContagemRegressiva';

/**
 * Recuperação de senha, etapa 2: código recebido no e-mail + nova senha.
 * Deu certo → senha trocada, código invalidado e o usuário entra no app.
 */
export default function RedefinirSenhaScreen() {
  const { email } = useLocalSearchParams<{ email?: string }>();
  const { redefinirSenha, pedirRecuperacao } = useAuth();
  const [codigo, setCodigo] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmar, setConfirmar] = useState('');
  const [erro, setErro] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [espera, reiniciarEspera] = useContagemRegressiva(REENVIO_CODIGO_SEGUNDOS);

  if (!email) return <Redirect href="/esqueci-senha" />;

  const limpar = () => setErro(null);

  const redefinir = async () => {
    if (enviando) return;
    if (!codigoValido(codigo)) return setErro(`Digite o código de ${CODIGO_DIGITOS} dígitos.`);
    if (!senhaForte(senha)) return setErro('A nova senha não atende aos requisitos.');
    if (senha !== confirmar) return setErro('As senhas não coincidem.');
    setErro(null);
    setEnviando(true);
    const resultado = await redefinirSenha(email, codigo, senha);
    setEnviando(false);
    if (!resultado.ok) setErro(resultado.erro);
    // Sucesso: a sessão nova leva para a Home (layout raiz).
  };

  const reenviar = async () => {
    const resultado = await pedirRecuperacao(email);
    if (!resultado.ok) return setErro(resultado.erro);
    setCodigo('');
    setErro(null);
    setAviso('Se o e-mail estiver cadastrado, enviamos um novo código.');
    reiniciarEspera(REENVIO_CODIGO_SEGUNDOS);
  };

  const campo = {
    height: 41,
    labelPaddingLeft: 16,
    inputPaddingLeft: 19,
    labelGap: 8,
    labelStyle: styles.label,
  } as const;

  return (
    <>
      <AuthScreen paddingTop={80} paddingHorizontal={22}>
        <Text style={styles.title}>Redefinir senha</Text>
        <Text style={styles.texto}>{MENSAGEM_RECUPERACAO}</Text>

        <View style={styles.form}>
          <FormField
            {...campo}
            label="Código recebido no e-mail"
            placeholder="000000"
            value={codigo}
            onChangeText={(v) => {
              setCodigo(v.replace(/\D/g, '').slice(0, CODIGO_DIGITOS));
              limpar();
            }}
            keyboardType="number-pad"
            autoComplete="one-time-code"
            textContentType="oneTimeCode"
            maxLength={CODIGO_DIGITOS}
            inputTextStyle={styles.codigo}
          />
          <FormField
            {...campo}
            label="Nova senha"
            placeholder="●●●●●●●●"
            value={senha}
            onChangeText={(v) => {
              setSenha(v);
              limpar();
            }}
            password
            eyeIcon={EyePassIcon}
            autoComplete="new-password"
          />
          <View style={styles.requisitos}>
            {REQUISITOS_SENHA_NOVA.map((r) => {
              const ok = r.ok(senha, '');
              return (
                <View key={r.id} style={styles.requisito} accessible accessibilityLabel={`${r.label}: ${ok ? 'ok' : 'pendente'}`}>
                  <Icon source={ok ? 'check-circle' : 'circle-outline'} size={16} color={ok ? colors.primary : colors.subtext} />
                  <Text style={[styles.requisitoTexto, ok && styles.requisitoOk]}>{r.label}</Text>
                </View>
              );
            })}
          </View>
          <FormField
            {...campo}
            label="Confirmar nova senha"
            placeholder="●●●●●●●●"
            value={confirmar}
            onChangeText={(v) => {
              setConfirmar(v);
              limpar();
            }}
            password
            eyeIcon={EyePassIcon}
            autoComplete="new-password"
            onSubmitEditing={redefinir}
          />
        </View>

        {erro ? (
          <HelperText type="error" visible style={styles.erro} accessibilityLiveRegion="polite">
            {erro}
          </HelperText>
        ) : null}

        <PrimaryButton
          title={enviando ? 'Salvando…' : 'Redefinir senha'}
          width={220}
          height={40}
          onPress={redefinir}
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
          text="Lembrou a senha?"
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
  form: {
    marginTop: 32,
    gap: 16,
  },
  requisitos: {
    marginTop: -6,
    paddingLeft: 16,
    gap: 4,
  },
  requisito: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  requisitoTexto: {
    fontFamily: fonts.interRegular,
    fontSize: 12,
    color: colors.subtext,
  },
  requisitoOk: {
    color: colors.primary,
  },
  button: {
    marginTop: 20,
  },
  footer: {
    marginTop: 28,
  },
});
