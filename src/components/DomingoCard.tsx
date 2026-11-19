import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Button, Icon, Text } from 'react-native-paper';

import { MetricRow, type Metricas } from '@/components/MetricRow';
import { StatusPill } from '@/components/StatusPill';
import {
  dataPorExtenso,
  diaDoMes,
  mesCurto,
  situacaoDoDomingo,
  somar,
  totalDe,
  type Lancamento,
  type Bloqueio,
  type Numeros,
  type TurmaRelatorio,
} from '@/data/relatorio';
import { colors, fonts } from '@/theme';
import { formatBRL } from '@/utils/currency';

export type LinhaDomingo = { turma: TurmaRelatorio; lancamento: Lancamento | null };

type DomingoCardProps = {
  /** "AAAA-MM-DD" */
  data: string;
  linhas: LinhaDomingo[];
  /** Motivo de o domingo não poder ser lançado/alterado (`null` = pode). */
  bloqueio: Bloqueio;
  onAbrir: () => void;
};

const MENSAGEM_BLOQUEIO: Record<Exclude<Bloqueio, null>, string> = {
  fechado: 'Trimestre fechado — somente consulta.',
  retroativo: 'Libere os lançamentos retroativos para editar.',
};

export const metricasDe = (l: Numeros): Metricas => ({
  matriculados: l.matriculados,
  presentes: l.presentes,
  visitantes: l.visitantes,
  total: totalDe(l),
  biblias: l.biblias,
  revistas: l.revistas,
});

/** Um domingo do trimestre: resumo na linha e, ao tocar, o detalhe de cada turma. */
export function DomingoCard({ data, linhas, bloqueio, onAbrir }: DomingoCardProps) {
  const [aberto, setAberto] = useState(false);
  const editavel = !bloqueio;

  const lancadas = linhas.filter((l): l is { turma: TurmaRelatorio; lancamento: Lancamento } => !!l.lancamento);
  const situacao = situacaoDoDomingo(lancadas.length, linhas.length);
  const totais = somar(lancadas.map((l) => l.lancamento));
  const pendente = situacao === 'pendente';
  const titulo = `Domingo, ${dataPorExtenso(data)}`;

  const pill =
    situacao === 'completo' ? (
      <StatusPill tone="ok" icon="check" label="Completo" />
    ) : situacao === 'parcial' ? (
      <StatusPill tone="info" label={`${lancadas.length}/${linhas.length} turmas`} />
    ) : editavel ? (
      <StatusPill tone="warn" label="Pendente" />
    ) : bloqueio === 'retroativo' ? (
      <StatusPill tone="muted" icon="lock-outline" label="Pendente" />
    ) : (
      <StatusPill tone="muted" label="Sem lançamento" />
    );

  return (
    <View style={styles.card}>
      <Pressable
        onPress={() => (pendente ? editavel && onAbrir() : setAberto((v) => !v))}
        disabled={pendente && !editavel}
        accessibilityRole="button"
        accessibilityLabel={pendente ? `${titulo}: lançar` : titulo}
        accessibilityState={pendente ? undefined : { expanded: aberto }}
        style={({ pressed }) => [styles.header, pressed && styles.pressed]}
      >
        <View style={[styles.dateBox, pendente && styles.dateBoxPendente]}>
          <Text style={styles.day}>{diaDoMes(data)}</Text>
          <Text style={styles.month}>{mesCurto(data)}</Text>
        </View>

        <View style={styles.headerText}>
          <View style={styles.titleRow}>
            <Text style={styles.title} numberOfLines={1}>
              {dataPorExtenso(data)}
            </Text>
            {pill}
          </View>
          <Text style={styles.summary} numberOfLines={1}>
            {pendente
              ? editavel
                ? 'Toque para lançar os dados da aula'
                : bloqueio === 'retroativo'
                  ? 'Lançamento retroativo bloqueado'
                  : 'Nenhum dado lançado'
              : `Total ${totais.total} · Ofertas ${formatBRL(totais.ofertas)}`}
          </Text>
        </View>

        <Icon
          source={pendente ? (editavel ? 'plus-circle-outline' : 'minus') : aberto ? 'chevron-up' : 'chevron-down'}
          size={22}
          color={colors.primary}
        />
      </Pressable>

      {aberto && !pendente ? (
        <View style={styles.body}>
          {linhas.map(({ turma, lancamento }) => (
            <View key={turma.id} style={styles.linha}>
              <View style={styles.linhaHeader}>
                <Text style={styles.turma} numberOfLines={1}>
                  {turma.nome}
                </Text>
                <Text style={lancamento ? styles.oferta : styles.naoLancada}>
                  {lancamento ? formatBRL(lancamento.ofertas) : 'Não lançada'}
                </Text>
              </View>
              {lancamento ? <MetricRow valores={metricasDe(lancamento)} /> : null}
            </View>
          ))}

          <View style={[styles.linha, styles.totalLinha]}>
            <View style={styles.linhaHeader}>
              <Text style={styles.totalTitulo}>Total do domingo</Text>
              <Text style={styles.totalOferta}>{formatBRL(totais.ofertas)}</Text>
            </View>
            <MetricRow valores={metricasDe(totais)} destaque />
          </View>

          {!bloqueio ? (
            <Button
              mode="outlined"
              icon="pencil-outline"
              onPress={onAbrir}
              textColor={colors.primary}
              style={styles.editButton}
              labelStyle={styles.editLabel}
            >
              Editar lançamento
            </Button>
          ) : (
            <View style={styles.locked}>
              <Icon source="lock-outline" size={16} color={colors.subtext} />
              <Text style={styles.lockedText}>{MENSAGEM_BLOQUEIO[bloqueio]}</Text>
            </View>
          )}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    backgroundColor: colors.white,
    boxShadow: `0 4px 16px ${colors.shadow}`,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    paddingLeft: 12,
    paddingRight: 14,
    borderRadius: 20,
  },
  pressed: {
    backgroundColor: colors.background,
  },
  dateBox: {
    width: 46,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    backgroundColor: colors.navActive,
  },
  dateBoxPendente: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.inputBackground,
  },
  day: {
    fontFamily: fonts.nunitoBold,
    fontSize: 19,
    lineHeight: 22,
    color: colors.primary,
  },
  month: {
    fontFamily: fonts.interMedium,
    fontSize: 11,
    color: colors.primary,
  },
  headerText: {
    flex: 1,
    gap: 3,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    flexShrink: 1,
    fontFamily: fonts.nunitoBold,
    fontSize: 16,
    color: colors.black,
  },
  summary: {
    fontFamily: fonts.interRegular,
    fontSize: 12,
    color: colors.subtext,
  },
  body: {
    gap: 12,
    paddingHorizontal: 12,
    paddingBottom: 14,
    paddingTop: 2,
  },
  linha: {
    gap: 6,
  },
  linhaHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 2,
  },
  turma: {
    flex: 1,
    fontFamily: fonts.nunitoSemiBold,
    fontSize: 15,
    color: colors.black,
  },
  oferta: {
    fontFamily: fonts.interMedium,
    fontSize: 13,
    color: colors.presence,
  },
  naoLancada: {
    fontFamily: fonts.interRegular,
    fontSize: 12,
    color: colors.expense,
  },
  totalLinha: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.line,
  },
  totalTitulo: {
    flex: 1,
    fontFamily: fonts.nunitoBold,
    fontSize: 15,
    color: colors.primary,
  },
  totalOferta: {
    fontFamily: fonts.interSemiBold,
    fontSize: 14,
    color: colors.presence,
  },
  editButton: {
    alignSelf: 'center',
    borderRadius: 30,
    borderColor: colors.primary,
  },
  editLabel: {
    fontFamily: fonts.nunitoBold,
    fontSize: 15,
    letterSpacing: 0,
  },
  locked: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  lockedText: {
    fontFamily: fonts.interRegular,
    fontSize: 12,
    color: colors.subtext,
  },
});
