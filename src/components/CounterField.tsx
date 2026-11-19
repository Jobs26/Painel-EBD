import { useRef, type ComponentRef } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { Icon, Text } from 'react-native-paper';

import { useRevelarCampo } from '@/components/FormScreen';
import { colors, fonts } from '@/theme';
import { formatBRL } from '@/utils/currency';

type BaseProps = {
  label: string;
  /** Complemento do rótulo de acessibilidade (ex.: nome da turma). */
  contexto: string;
  /** Texto só com dígitos ('' = não preenchido). */
  value: string;
  onChange: (value: string) => void;
  somenteLeitura?: boolean;
  error?: boolean;
};

const soDigitos = (texto: string, max: number) => texto.replace(/\D/g, '').replace(/^0+(?=\d)/, '').slice(0, max);

/** Linha "Presentes   [−] 12 [+]": contador com botões e campo numérico. */
export function CounterField({ label, contexto, value, onChange, somenteLeitura = false, error = false }: BaseProps) {
  const numero = value === '' ? 0 : Number(value);
  const nome = `${label} — ${contexto}`;
  const revelarCampo = useRevelarCampo();
  const inputRef = useRef<ComponentRef<typeof TextInput>>(null);

  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      {somenteLeitura ? (
        <Text style={styles.readOnly} accessibilityLabel={`${nome}: ${value || 'não lançado'}`}>
          {value === '' ? '—' : value}
        </Text>
      ) : (
        <View style={styles.stepper}>
          <StepButton
            icon="minus"
            label={`Diminuir ${nome}`}
            disabled={numero <= 0}
            onPress={() => onChange(String(numero - 1))}
          />
          <TextInput
            ref={inputRef}
            value={value}
            onChangeText={(texto) => onChange(soDigitos(texto, 4))}
            placeholder="0"
            placeholderTextColor={colors.placeholder}
            keyboardType="number-pad"
            selectTextOnFocus
            onFocus={() => revelarCampo(inputRef.current)}
            accessibilityLabel={nome}
            style={[styles.input, error && styles.inputError]}
          />
          <StepButton icon="plus" label={`Aumentar ${nome}`} onPress={() => onChange(String(numero + 1))} />
        </View>
      )}
    </View>
  );
}

/** Linha "Ofertas   R$0,00": valor em centavos digitado da direita para a esquerda. */
export function MoneyField({ label, contexto, value, onChange, somenteLeitura = false }: BaseProps) {
  const texto = value === '' ? '' : formatBRL(Number(value) / 100);
  const nome = `${label} — ${contexto}`;
  const revelarCampo = useRevelarCampo();
  const inputRef = useRef<ComponentRef<typeof TextInput>>(null);

  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      {somenteLeitura ? (
        <Text style={styles.readOnly} accessibilityLabel={`${nome}: ${texto || 'não lançado'}`}>
          {texto || '—'}
        </Text>
      ) : (
        <TextInput
          ref={inputRef}
          value={texto}
          // Zeros à esquerda são removidos; apagar tudo volta para "não preenchido".
          onChangeText={(t) => onChange(t.replace(/\D/g, '').replace(/^0+/, '').slice(0, 8))}
          placeholder="R$0,00"
          placeholderTextColor={colors.placeholder}
          keyboardType="number-pad"
          onFocus={() => revelarCampo(inputRef.current)}
          accessibilityLabel={nome}
          style={[styles.input, styles.moneyInput]}
        />
      )}
    </View>
  );
}

function StepButton({
  icon,
  label,
  disabled = false,
  onPress,
}: {
  icon: string;
  label: string;
  disabled?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      hitSlop={4}
      style={({ pressed }) => [styles.step, pressed && styles.stepPressed, disabled && styles.stepDisabled]}
    >
      <Icon source={icon} size={18} color={colors.primary} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 44,
    gap: 12,
  },
  label: {
    flex: 1,
    fontFamily: fonts.interMedium,
    fontSize: 15,
    color: colors.label,
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  step: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.navActive,
  },
  stepPressed: {
    opacity: 0.7,
  },
  stepDisabled: {
    opacity: 0.35,
  },
  input: {
    width: 58,
    height: 42,
    // Sem isso o Android aplica o padding padrão do TextInput e o fundo corta o topo do número.
    paddingVertical: 0,
    paddingHorizontal: 6,
    includeFontPadding: false,
    textAlignVertical: 'center',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'transparent',
    backgroundColor: colors.background,
    textAlign: 'center',
    fontFamily: fonts.nunitoBold,
    fontSize: 17,
    color: colors.textPrimary,
  },
  inputError: {
    borderColor: colors.expense,
  },
  moneyInput: {
    width: 134,
    textAlign: 'right',
    paddingHorizontal: 12,
  },
  readOnly: {
    fontFamily: fonts.nunitoBold,
    fontSize: 17,
    color: colors.textPrimary,
  },
});
