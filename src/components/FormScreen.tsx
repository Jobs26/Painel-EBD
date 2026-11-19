import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ComponentRef,
  type ReactNode,
} from 'react';
import { Keyboard, KeyboardAvoidingView, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { router, type Href } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon, IconButton, Text } from 'react-native-paper';

import { ConfirmDialog } from '@/components/ConfirmDialog';
import { colors, fonts } from '@/theme';

type FormScreenProps = {
  title: string;
  /** Linha de apoio abaixo do título. */
  subtitle?: string;
  /** Rota da lista, usada quando não há tela anterior para voltar. */
  fallbackHref: Href;
  /** Se houver alterações não salvas, pergunta antes de sair. */
  dirty: boolean;
  /** Rodapé fixo (botão salvar). Sem ele, a tela é só de consulta. */
  footer?: ReactNode;
  children: ReactNode;
};

/** Volta para a tela anterior (ou para a lista, se o formulário foi aberto direto). */
export function sairDoFormulario(fallbackHref: Href) {
  if (router.canGoBack()) router.back();
  else router.replace(fallbackHref);
}

/** Elemento que sabe medir a própria posição na tela (campo de texto). */
type Mensuravel = { measureInWindow: (cb: (x: number, y: number, w: number, h: number) => void) => void };

const RevelarCampoContext = createContext<(campo?: Mensuravel | null) => void>(() => {});

/**
 * Função que rola o formulário até o campo ficar acima do teclado.
 * Os campos chamam no `onFocus` passando a própria ref.
 */
export const useRevelarCampo = () => useContext(RevelarCampoContext);

/** Campo em foco segundo o React Native (não existe na versão web). */
function campoEmFoco(): Mensuravel | null {
  const state = TextInput.State as { currentlyFocusedInput?: () => Mensuravel | null };
  return typeof state.currentlyFocusedInput === 'function' ? state.currentlyFocusedInput() : null;
}

/** Espaço livre entre o campo em foco e o teclado/rodapé. */
const MARGEM_CAMPO = 28;

/** Estrutura das telas de cadastro: cabeçalho com voltar, conteúdo rolável e rodapé fixo. */
export function FormScreen({ title, subtitle, fallbackHref, dirty, footer, children }: FormScreenProps) {
  const insets = useSafeAreaInsets();
  const [confirmarSaida, setConfirmarSaida] = useState(false);

  const areaRef = useRef<ComponentRef<typeof View>>(null);
  const scrollRef = useRef<ComponentRef<typeof ScrollView>>(null);
  const deslocamento = useRef(0);
  const ultimoCampo = useRef<Mensuravel | null>(null);

  // No Expo Go não há o react-native-keyboard-controller: o KeyboardAvoidingView encolhe
  // a área do formulário e aqui rolamos até o campo em foco ficar visível.
  const revelarCampo = useCallback((informado?: Mensuravel | null) => {
    if (informado) ultimoCampo.current = informado;
    // Espera o KeyboardAvoidingView aplicar o novo tamanho antes de medir.
    setTimeout(() => {
      const campo = informado ?? campoEmFoco() ?? ultimoCampo.current;
      const area = areaRef.current;
      if (!campo || !area) return;
      area.measureInWindow((_ax, areaY, _aw, areaAltura) => {
        campo.measureInWindow((_x, y, _w, altura) => {
          const limiteInferior = areaY + areaAltura - MARGEM_CAMPO;
          const limiteSuperior = areaY + MARGEM_CAMPO;
          if (y + altura > limiteInferior) {
            scrollRef.current?.scrollTo({ y: deslocamento.current + (y + altura - limiteInferior), animated: true });
          } else if (y < limiteSuperior) {
            scrollRef.current?.scrollTo({ y: Math.max(0, deslocamento.current - (limiteSuperior - y)), animated: true });
          }
        });
      });
    }, 150);
  }, []);

  useEffect(() => {
    const assinatura = Keyboard.addListener('keyboardDidShow', () => revelarCampo());
    return () => assinatura.remove();
  }, [revelarCampo]);

  return (
    <KeyboardAvoidingView style={styles.flex} behavior="padding">
      <StatusBar style="dark" />
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 20) + 8 }]}>
        <IconButton
          icon="arrow-left"
          size={24}
          iconColor={colors.black}
          onPress={() => (dirty ? setConfirmarSaida(true) : sairDoFormulario(fallbackHref))}
          accessibilityLabel="Voltar"
          style={styles.back}
        />
        <View style={styles.flex}>
          <Text style={styles.title} accessibilityRole="header" numberOfLines={1}>
            {title}
          </Text>
          {subtitle ? (
            <Text style={styles.subtitle} numberOfLines={1}>
              {subtitle}
            </Text>
          ) : null}
        </View>
      </View>

      <View ref={areaRef} style={styles.flex}>
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          // O teclado numérico do iOS não tem "OK": arrastar a tela fecha o teclado.
          keyboardDismissMode="on-drag"
          onScroll={(e) => {
            deslocamento.current = e.nativeEvent.contentOffset.y;
          }}
          scrollEventThrottle={32}
        >
          <RevelarCampoContext.Provider value={revelarCampo}>{children}</RevelarCampoContext.Provider>
        </ScrollView>
      </View>

      {footer ? <View style={styles.footer}>{footer}</View> : null}

      <ConfirmDialog
        visible={confirmarSaida}
        title="Descartar alterações?"
        message="As informações preenchidas não serão salvas."
        destructive
        onConfirm={() => {
          setConfirmarSaida(false);
          sairDoFormulario(fallbackHref);
        }}
        onDismiss={() => setConfirmarSaida(false)}
      />
    </KeyboardAvoidingView>
  );
}

type FormStepProps = {
  numero: number;
  titulo: string;
  subtitulo?: string;
  concluida: boolean;
  bloqueada?: boolean;
  /** Texto exibido no lugar do conteúdo enquanto a etapa está bloqueada. */
  mensagemBloqueio?: string;
  children: ReactNode;
};

/** Card numerado de uma etapa do cadastro. */
export function FormStep({
  numero,
  titulo,
  subtitulo,
  concluida,
  bloqueada = false,
  mensagemBloqueio,
  children,
}: FormStepProps) {
  return (
    <View style={[styles.card, bloqueada && styles.cardLocked]}>
      <View style={styles.cardHeader}>
        <View style={[styles.badge, concluida && styles.badgeDone]}>
          {concluida ? (
            <Icon source="check" size={16} color={colors.white} />
          ) : (
            <Text style={styles.badgeText}>{numero}</Text>
          )}
        </View>
        <View style={styles.flex}>
          <Text style={styles.cardTitle}>{titulo}</Text>
          {subtitulo ? <Text style={styles.cardSubtitle}>{subtitulo}</Text> : null}
        </View>
      </View>
      {bloqueada ? (
        <View style={styles.locked}>
          <Icon source="lock-outline" size={20} color={colors.subtext} />
          <Text style={styles.lockedText}>{mensagemBloqueio}</Text>
        </View>
      ) : (
        children
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  back: {
    margin: 0,
  },
  title: {
    fontFamily: fonts.nunitoSemiBold,
    fontSize: 24,
    lineHeight: 30,
    color: colors.black,
  },
  subtitle: {
    fontFamily: fonts.interRegular,
    fontSize: 13,
    color: colors.subtext,
  },
  content: {
    gap: 16,
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 24,
  },
  footer: {
    paddingTop: 12,
    paddingBottom: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.line,
    backgroundColor: colors.background,
  },
  card: {
    gap: 14,
    padding: 18,
    borderRadius: 24,
    backgroundColor: colors.white,
    boxShadow: `0 4px 16px ${colors.shadow}`,
  },
  cardLocked: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.inputBackground,
    boxShadow: 'none',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  badge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.navActive,
  },
  badgeDone: {
    backgroundColor: colors.presence,
  },
  badgeText: {
    fontFamily: fonts.nunitoBold,
    fontSize: 14,
    color: colors.primary,
  },
  cardTitle: {
    fontFamily: fonts.nunitoBold,
    fontSize: 17,
    color: colors.black,
  },
  cardSubtitle: {
    fontFamily: fonts.interRegular,
    fontSize: 12,
    color: colors.subtext,
  },
  locked: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  lockedText: {
    flex: 1,
    fontFamily: fonts.interRegular,
    fontSize: 13,
    lineHeight: 18,
    color: colors.subtext,
  },
});

/** Estilos comuns dos campos dentro das etapas. */
export const formFieldStyles = StyleSheet.create({
  // O título da etapa já funciona como rótulo visual; o rótulo continua acessível.
  hiddenLabel: {
    position: 'absolute',
    width: 1,
    height: 1,
    opacity: 0,
  },
  inputText: {
    fontFamily: fonts.interRegular,
    fontSize: 16,
  },
  label: {
    fontFamily: fonts.interMedium,
    fontSize: 13,
    color: colors.label,
  },
  helper: {
    marginTop: -8,
  },
  saveLabel: {
    fontFamily: fonts.poppinsSemiBold,
    fontSize: 18,
    lineHeight: 24,
  },
});
