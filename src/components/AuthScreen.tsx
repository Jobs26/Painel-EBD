import type { ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';

import { colors } from '@/theme';

type AuthScreenProps = {
  children: ReactNode;
  /** Distância do topo da tela até o primeiro elemento, como no Figma. */
  paddingTop: number;
  /** Margem lateral dos campos. */
  paddingHorizontal: number;
};

/** Contêiner rolável com fundo creme usado nas telas de autenticação. */
export function AuthScreen({ children, paddingTop, paddingHorizontal }: AuthScreenProps) {
  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar style="dark" />
      <ScrollView
        style={styles.flex}
        contentContainerStyle={[styles.content, { paddingTop, paddingHorizontal }]}
        keyboardShouldPersistTaps="handled"
      >
        {children}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingBottom: 40,
  },
});
