import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, Icon, Snackbar, Text } from 'react-native-paper';

import { Avatar } from '@/components/Avatar';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { useEscola } from '@/data/EscolaContext';
import { colors, fonts } from '@/theme';
import { calcularIdade, parseDate } from '@/utils/masks';

/** Perfil do usuário logado: dados cadastrais, segurança (senha) e sair. */
export default function PerfilScreen() {
  const insets = useSafeAreaInsets();
  const { usuario, aviso, limparAviso } = useEscola();
  const [confirmarSaida, setConfirmarSaida] = useState(false);

  const nascimento = parseDate(usuario.nascimento);
  const dados: { icon: string; label: string; valor: string }[] = [
    { icon: 'account-outline', label: 'Nome', valor: usuario.nome },
    { icon: 'email-outline', label: 'E-mail', valor: usuario.email },
    {
      icon: 'cake-variant-outline',
      label: 'Data de nascimento',
      valor: nascimento
        ? `${usuario.nascimento.replace(/ /g, '')} · ${calcularIdade(nascimento)} anos`
        : 'Não informada',
    },
    { icon: 'phone-outline', label: 'Telefone', valor: usuario.telefone || 'Não informado' },
  ];

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={[styles.content, { paddingTop: Math.max(insets.top, 20) + 20 }]}>
        <Text style={styles.title} accessibilityRole="header">
          Perfil
        </Text>
        <Text style={styles.summary}>Sua conta no Painel EBD</Text>

        <View style={styles.identidade}>
          <Avatar nome={usuario.nome} size={72} selected />
          <Text style={styles.nome} numberOfLines={2}>
            {usuario.nome}
          </Text>
          <Text style={styles.email} numberOfLines={1}>
            {usuario.email}
          </Text>
        </View>

        <View style={styles.secaoHeader}>
          <Text style={styles.secaoTitulo}>Dados cadastrais</Text>
          <Button
            mode="text"
            compact
            icon="pencil-outline"
            onPress={() => router.push('/perfil/dados')}
            textColor={colors.primary}
            labelStyle={styles.editarLabel}
            accessibilityLabel="Editar dados cadastrais"
          >
            Editar
          </Button>
        </View>
        <View style={styles.card}>
          {dados.map(({ icon, label, valor }, i) => (
            <View
              key={label}
              style={[styles.linha, i === dados.length - 1 && styles.ultima]}
              accessible
              accessibilityLabel={`${label}: ${valor}`}
            >
              <View style={styles.icone}>
                <Icon source={icon} size={20} color={colors.primary} />
              </View>
              <View style={styles.flex}>
                <Text style={styles.linhaLabel}>{label}</Text>
                <Text style={styles.linhaValor} numberOfLines={1}>
                  {valor}
                </Text>
              </View>
            </View>
          ))}
        </View>

        <Text style={[styles.secaoTitulo, styles.secaoSolta]}>Segurança</Text>
        <View style={styles.card}>
          <Pressable
            onPress={() => router.push('/perfil/senha')}
            accessibilityRole="button"
            accessibilityLabel="Alterar senha"
            style={({ pressed }) => [styles.linha, styles.ultima, pressed && styles.pressed]}
          >
            <View style={styles.icone}>
              <Icon source="lock-reset" size={20} color={colors.primary} />
            </View>
            <View style={styles.flex}>
              <Text style={styles.acao}>Alterar senha</Text>
              <Text style={styles.linhaLabel}>Com código de confirmação no e-mail</Text>
            </View>
            <Icon source="chevron-right" size={22} color={colors.subtext} />
          </Pressable>
        </View>

        <Button
          mode="outlined"
          icon="logout"
          onPress={() => setConfirmarSaida(true)}
          textColor={colors.expense}
          style={styles.sair}
          labelStyle={styles.sairLabel}
        >
          Sair da conta
        </Button>
      </ScrollView>

      <ConfirmDialog
        visible={confirmarSaida}
        title="Deseja sair da conta?"
        message="Você precisará entrar de novo com seu e-mail e senha."
        confirmLabel="Sair"
        cancelLabel="Cancelar"
        destructive
        onDismiss={() => setConfirmarSaida(false)}
        onConfirm={() => {
          setConfirmarSaida(false);
          // TODO(backend): supabase.auth.signOut()
          router.replace('/login');
        }}
      />

      <Snackbar
        key={aviso?.id}
        visible={aviso?.area === 'perfil'}
        onDismiss={limparAviso} duration={3000} style={styles.snackbar}>
        {aviso?.area === 'perfil' ? aviso.mensagem : ''}
      </Snackbar>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  flex: {
    flex: 1,
  },
  title: {
    fontFamily: fonts.nunitoSemiBold,
    fontSize: 24,
    lineHeight: 30,
    color: colors.black,
  },
  summary: {
    marginTop: 2,
    fontFamily: fonts.interRegular,
    fontSize: 13,
    color: colors.subtext,
  },
  identidade: {
    alignItems: 'center',
    gap: 4,
    marginTop: 18,
    paddingVertical: 22,
    paddingHorizontal: 16,
    borderRadius: 24,
    backgroundColor: colors.white,
    boxShadow: `0 4px 16px ${colors.shadow}`,
  },
  nome: {
    marginTop: 8,
    textAlign: 'center',
    fontFamily: fonts.nunitoBold,
    fontSize: 20,
    color: colors.black,
  },
  email: {
    fontFamily: fonts.interRegular,
    fontSize: 13,
    color: colors.subtext,
  },
  secaoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 18,
    marginBottom: 6,
  },
  secaoTitulo: {
    paddingLeft: 4,
    fontFamily: fonts.nunitoBold,
    fontSize: 16,
    color: colors.primary,
  },
  secaoSolta: {
    marginTop: 22,
    marginBottom: 10,
  },
  editarLabel: {
    fontFamily: fonts.interMedium,
    fontSize: 13,
    letterSpacing: 0,
  },
  card: {
    paddingHorizontal: 14,
    borderRadius: 24,
    backgroundColor: colors.white,
    boxShadow: `0 4px 16px ${colors.shadow}`,
  },
  linha: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minHeight: 64,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  ultima: {
    borderBottomWidth: 0,
  },
  pressed: {
    opacity: 0.6,
  },
  icone: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.navActive,
  },
  linhaLabel: {
    fontFamily: fonts.interRegular,
    fontSize: 12,
    color: colors.subtext,
  },
  linhaValor: {
    marginTop: 1,
    fontFamily: fonts.interMedium,
    fontSize: 15,
    color: colors.black,
  },
  acao: {
    fontFamily: fonts.interMedium,
    fontSize: 15,
    color: colors.black,
  },
  sair: {
    alignSelf: 'center',
    marginTop: 26,
    borderRadius: 30,
    borderColor: colors.expense,
  },
  sairLabel: {
    fontFamily: fonts.nunitoBold,
    fontSize: 15,
    letterSpacing: 0,
  },
  snackbar: {
    marginHorizontal: 16,
    borderRadius: 16,
    backgroundColor: colors.primary,
  },
});
