import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, HelperText, Icon, Text } from 'react-native-paper';

import EyePassIcon from '@assets/icons/eye-pass.svg';
import { FormField } from '@/components/FormField';
import { FormScreen, FormStep, formFieldStyles, sairDoFormulario } from '@/components/FormScreen';
import { PrimaryButton } from '@/components/PrimaryButton';
import { useAuth } from '@/data/AuthContext';
import { useEscola } from '@/data/EscolaContext';
import {
  CODIGO_DIGITOS,
  CODIGO_VALIDADE_MS,
  MAX_TENTATIVAS_CODIGO,
  REENVIO_SEGUNDOS,
  REQUISITOS_SENHA,
  gerarCodigo,
  mascararEmail,
  novaSenhaValida,
} from '@/data/senha';
import { colors, fonts } from '@/theme';

type Envio = { codigo: string; enviadoEm: number; tentativas: number };

/**
 * Alterar senha em 3 etapas (regra completa em `src/data/senha.ts`):
 * 1) enviar código ao e-mail, 2) digitar o código, 3) senha atual + nova senha.
 */
export default function AlterarSenhaScreen() {
  const { usuario } = useAuth();
  const { senhaConfere, alterarSenha, avisar } = useEscola();
  const emailMascarado = mascararEmail(usuario?.email ?? '');

  const [envio, setEnvio] = useState<Envio | null>(null);
  const [espera, setEspera] = useState(0);
  const [codigo, setCodigo] = useState('');
  const [erroCodigo, setErroCodigo] = useState<string | null>(null);
  const [confirmado, setConfirmado] = useState(false);

  const [atual, setAtual] = useState('');
  const [nova, setNova] = useState('');
  const [confirmacao, setConfirmacao] = useState('');
  const [atualIncorreta, setAtualIncorreta] = useState(false);
  const [tentouSalvar, setTentouSalvar] = useState(false);

  // Contagem regressiva para liberar o reenvio do código.
  useEffect(() => {
    if (espera <= 0) return;
    const t = setTimeout(() => setEspera((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [espera]);

  const enviarCodigo = () => {
    // TODO(backend): supabase.auth.reauthenticate() envia o código ao e-mail do usuário logado.
    setEnvio({ codigo: gerarCodigo(), enviadoEm: Date.now(), tentativas: 0 });
    setEspera(REENVIO_SEGUNDOS);
    setCodigo('');
    setErroCodigo(null);
  };

  const confirmarCodigo = () => {
    if (!envio) return;
    if (Date.now() - envio.enviadoEm > CODIGO_VALIDADE_MS) {
      setEnvio(null);
      setEspera(0);
      setErroCodigo('O código venceu. Peça um novo código.');
      return;
    }
    if (codigo === envio.codigo) {
      setConfirmado(true);
      setErroCodigo(null);
      return;
    }
    const tentativas = envio.tentativas + 1;
    if (tentativas >= MAX_TENTATIVAS_CODIGO) {
      setEnvio(null);
      setEspera(0);
      setCodigo('');
      setErroCodigo('Muitas tentativas erradas. Peça um novo código.');
    } else {
      const restam = MAX_TENTATIVAS_CODIGO - tentativas;
      setEnvio({ ...envio, tentativas });
      setErroCodigo(`Código incorreto. ${restam === 1 ? 'Resta 1 tentativa' : `Restam ${restam} tentativas`}.`);
    }
  };

  const novaOk = novaSenhaValida(nova, atual);
  const confirmacaoOk = confirmacao.length > 0 && confirmacao === nova;
  const alterado = envio !== null || confirmado || atual !== '' || nova !== '' || confirmacao !== '';

  const salvar = () => {
    setTentouSalvar(true);
    if (!confirmado) return;
    const atualOk = senhaConfere(atual);
    setAtualIncorreta(!atualOk);
    if (!atualOk || !novaOk || !confirmacaoOk) return;
    // TODO(backend): supabase.auth.updateUser({ password: nova, nonce: codigo }).
    alterarSenha(nova);
    avisar('perfil', 'Senha alterada com sucesso.');
    sairDoFormulario('/perfil');
  };

  const campoSenha = {
    height: 48,
    labelStyle: formFieldStyles.label,
    labelPaddingLeft: 4,
    labelGap: 6,
    inputTextStyle: formFieldStyles.inputText,
    password: true,
    eyeIcon: EyePassIcon,
    placeholder: '●●●●●●●●',
  };

  return (
    <FormScreen
      title="Alterar senha"
      subtitle="Confirmação por código no e-mail"
      fallbackHref="/perfil"
      dirty={alterado}
      footer={
        <PrimaryButton
          title="Alterar senha"
          width={240}
          height={48}
          onPress={salvar}
          disabled={!confirmado}
          labelStyle={formFieldStyles.saveLabel}
        />
      }
    >
      <FormStep numero={1} titulo="Código no e-mail" concluida={envio !== null || confirmado}>
        {confirmado ? (
          <Linha icon="email-check-outline" cor={colors.presence} texto={`E-mail ${emailMascarado} confirmado.`} />
        ) : envio ? (
          <>
            <Text style={styles.texto}>
              Enviamos um código de {CODIGO_DIGITOS} dígitos para <Text style={styles.destaque}>{emailMascarado}</Text>.
              Ele vale por {CODIGO_VALIDADE_MS / 60000} minutos.
            </Text>
            <View style={styles.demo} accessibilityLabel={`Demonstração: o código é ${envio.codigo}`}>
              <Icon source="flask-outline" size={18} color={colors.primary} />
              <Text style={styles.demoTexto}>
                Demonstração (sem backend): o código é <Text style={styles.demoCodigo}>{envio.codigo}</Text>
              </Text>
            </View>
            <Button
              mode="text"
              icon="email-sync-outline"
              onPress={enviarCodigo}
              disabled={espera > 0}
              textColor={colors.primary}
              labelStyle={styles.botaoLabel}
              style={styles.reenviar}
            >
              {espera > 0 ? `Reenviar código em ${espera} s` : 'Reenviar código'}
            </Button>
          </>
        ) : (
          <>
            <Text style={styles.texto}>
              Para sua segurança, vamos enviar um código de {CODIGO_DIGITOS} dígitos para{' '}
              <Text style={styles.destaque}>{emailMascarado}</Text>.
            </Text>
            <Button
              mode="outlined"
              icon="email-fast-outline"
              onPress={enviarCodigo}
              textColor={colors.primary}
              style={styles.botao}
              labelStyle={styles.botaoLabel}
            >
              Enviar código
            </Button>
          </>
        )}
      </FormStep>

      <FormStep
        numero={2}
        titulo="Confirmar código"
        concluida={confirmado}
        bloqueada={!envio && !confirmado}
        mensagemBloqueio={erroCodigo ?? 'Peça o código no e-mail para liberar esta etapa.'}
      >
        {confirmado ? (
          <Linha icon="check-circle-outline" cor={colors.presence} texto="Código confirmado." />
        ) : (
          <>
            <FormField
              label="Código de confirmação"
              labelStyle={formFieldStyles.hiddenLabel}
              value={codigo}
              onChangeText={(v) => {
                setCodigo(v.replace(/\D/g, '').slice(0, CODIGO_DIGITOS));
                setErroCodigo(null);
              }}
              placeholder="000000"
              keyboardType="number-pad"
              autoComplete="one-time-code"
              textContentType="oneTimeCode"
              maxLength={CODIGO_DIGITOS}
              height={52}
              inputTextStyle={styles.codigo}
              error={!!erroCodigo}
            />
            {erroCodigo ? (
              <HelperText type="error" visible style={formFieldStyles.helper}>
                {erroCodigo}
              </HelperText>
            ) : null}
            <Button
              mode="contained"
              onPress={confirmarCodigo}
              disabled={codigo.length < CODIGO_DIGITOS}
              buttonColor={colors.primary}
              textColor={colors.white}
              style={styles.botao}
              labelStyle={styles.botaoLabel}
            >
              Confirmar código
            </Button>
          </>
        )}
      </FormStep>

      <FormStep
        numero={3}
        titulo="Nova senha"
        concluida={confirmado && novaOk && confirmacaoOk}
        bloqueada={!confirmado}
        mensagemBloqueio="Confirme o código enviado ao e-mail para liberar a troca de senha."
      >
        <FormField
          {...campoSenha}
          label="Senha atual"
          value={atual}
          onChangeText={(v) => {
            setAtual(v);
            setAtualIncorreta(false);
          }}
          autoComplete="current-password"
          error={atualIncorreta}
        />
        {atualIncorreta ? (
          <HelperText type="error" visible style={formFieldStyles.helper}>
            Senha atual incorreta.
          </HelperText>
        ) : null}

        <FormField
          {...campoSenha}
          label="Nova senha"
          value={nova}
          onChangeText={setNova}
          autoComplete="new-password"
          error={tentouSalvar && !novaOk}
        />
        <View style={styles.requisitos}>
          {REQUISITOS_SENHA.map((r) => {
            const ok = r.ok(nova, atual);
            return (
              <View key={r.id} style={styles.requisito} accessible accessibilityLabel={`${r.label}: ${ok ? 'ok' : 'pendente'}`}>
                <Icon
                  source={ok ? 'check-circle' : 'circle-outline'}
                  size={16}
                  color={ok ? colors.presence : tentouSalvar ? colors.expense : colors.subtext}
                />
                <Text style={[styles.requisitoTexto, ok && styles.requisitoOk]}>{r.label}</Text>
              </View>
            );
          })}
        </View>

        <FormField
          {...campoSenha}
          label="Confirmar nova senha"
          value={confirmacao}
          onChangeText={setConfirmacao}
          autoComplete="new-password"
          error={confirmacao.length > 0 && !confirmacaoOk}
        />
        {(confirmacao.length > 0 || tentouSalvar) && !confirmacaoOk ? (
          <HelperText type="error" visible style={formFieldStyles.helper}>
            {confirmacao.length === 0 ? 'Repita a nova senha.' : 'As senhas não coincidem.'}
          </HelperText>
        ) : null}
      </FormStep>
    </FormScreen>
  );
}

function Linha({ icon, cor, texto }: { icon: string; cor: string; texto: string }) {
  return (
    <View style={styles.linha}>
      <Icon source={icon} size={20} color={cor} />
      <Text style={[styles.texto, { color: cor }]}>{texto}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  texto: {
    flex: 1,
    fontFamily: fonts.interRegular,
    fontSize: 14,
    lineHeight: 20,
    color: colors.subtext,
  },
  destaque: {
    fontFamily: fonts.interSemiBold,
    color: colors.black,
  },
  linha: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  demo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 14,
    backgroundColor: colors.navActive,
  },
  demoTexto: {
    flex: 1,
    fontFamily: fonts.interRegular,
    fontSize: 12,
    lineHeight: 17,
    color: colors.primary,
  },
  demoCodigo: {
    fontFamily: fonts.interSemiBold,
    letterSpacing: 2,
  },
  botao: {
    alignSelf: 'center',
    borderRadius: 30,
    borderColor: colors.primary,
  },
  botaoLabel: {
    fontFamily: fonts.nunitoBold,
    fontSize: 15,
    letterSpacing: 0,
  },
  reenviar: {
    alignSelf: 'center',
    marginTop: -6,
  },
  codigo: {
    fontFamily: fonts.nunitoBold,
    fontSize: 22,
    letterSpacing: 8,
    textAlign: 'center',
  },
  requisitos: {
    gap: 4,
    marginTop: -6,
    paddingLeft: 4,
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
    color: colors.presence,
  },
});
