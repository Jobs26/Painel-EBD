import { StyleSheet, View } from 'react-native';
import { Button, Icon, IconButton, Text } from 'react-native-paper';

import { StatusPill } from '@/components/StatusPill';
import { dataNumerica, fimTrimestre, mesesDoTrimestre, type Fechamento, type Trimestre } from '@/data/relatorio';
import { colors, fonts } from '@/theme';

type TrimestreCardProps = {
  trimestre: Trimestre;
  fechamento?: Fechamento;
  /** Domingos com todas as turmas lançadas. */
  completos: number;
  totalDomingos: number;
  podeVoltar: boolean;
  podeAvancar: boolean;
  onVoltar: () => void;
  onAvancar: () => void;
  /** O fechamento só é liberado depois do último dia do trimestre. */
  podeFechar: boolean;
  onFechar: () => void;
  /** Trimestre aberto e anterior ao atual: lançar exige liberar os lançamentos retroativos. */
  retroativo: boolean;
  retroativoLiberado: boolean;
  onLiberarRetroativo: () => void;
  onBloquearRetroativo: () => void;
};

/** Seletor de trimestre com a situação (aberto/fechado), o progresso e o botão de fechamento. */
export function TrimestreCard({
  trimestre,
  fechamento,
  completos,
  totalDomingos,
  podeVoltar,
  podeAvancar,
  onVoltar,
  onAvancar,
  podeFechar,
  onFechar,
  retroativo,
  retroativoLiberado,
  onLiberarRetroativo,
  onBloquearRetroativo,
}: TrimestreCardProps) {
  const progresso = totalDomingos > 0 ? Math.min(completos / totalDomingos, 1) : 0;

  return (
    <View style={styles.card}>
      <View style={styles.selector}>
        <IconButton
          icon="chevron-left"
          size={26}
          iconColor={colors.primary}
          disabled={!podeVoltar}
          onPress={onVoltar}
          accessibilityLabel="Trimestre anterior"
          style={styles.arrow}
        />
        <View style={styles.selectorText}>
          <Text style={styles.title} accessibilityRole="header">
            {trimestre.numero}º trimestre · {trimestre.ano}
          </Text>
          <Text style={styles.caption}>{mesesDoTrimestre(trimestre)}</Text>
        </View>
        <IconButton
          icon="chevron-right"
          size={26}
          iconColor={colors.primary}
          disabled={!podeAvancar}
          onPress={onAvancar}
          accessibilityLabel="Próximo trimestre"
          style={styles.arrow}
        />
      </View>

      <View style={styles.statusRow}>
        {fechamento ? (
          <StatusPill tone="locked" icon="lock" label="Fechado" />
        ) : (
          <StatusPill tone="ok" icon="lock-open-variant-outline" label="Aberto" />
        )}
        <Text style={styles.progressText}>
          {completos} de {totalDomingos} domingos lançados
        </Text>
      </View>
      <View
        style={styles.track}
        accessibilityRole="progressbar"
        accessibilityValue={{ min: 0, max: totalDomingos, now: completos }}
      >
        <View style={[styles.fill, { width: `${progresso * 100}%` }]} />
      </View>

      {retroativo ? (
        retroativoLiberado ? (
          <View style={[styles.retroativo, styles.retroativoLiberado]}>
            <Icon source="lock-open-variant-outline" size={18} color={colors.presence} />
            <Text style={[styles.retroativoTexto, styles.retroativoTextoLiberado]}>
              Lançamentos retroativos liberados.
            </Text>
            <Button
              mode="text"
              compact
              onPress={onBloquearRetroativo}
              textColor={colors.primary}
              labelStyle={styles.bloquearLabel}
              accessibilityLabel="Bloquear lançamentos retroativos"
            >
              Bloquear
            </Button>
          </View>
        ) : (
          <View style={styles.retroativo}>
            <View style={styles.retroativoLinha}>
              <Icon source="history" size={18} color={colors.subtext} />
              <Text style={styles.retroativoTexto}>
                Trimestre anterior ao atual: os domingos estão bloqueados para lançamento.
              </Text>
            </View>
            <Button
              mode="outlined"
              icon="history"
              onPress={onLiberarRetroativo}
              textColor={colors.primary}
              style={styles.retroativoBotao}
              labelStyle={styles.closeLabel}
            >
              Lançamentos retroativos
            </Button>
          </View>
        )
      ) : null}

      {fechamento ? (
        <View style={styles.info}>
          <Icon source="lock-outline" size={16} color={colors.subtext} />
          <Text style={styles.infoText}>
            Fechado em {dataNumerica(fechamento.fechadoEm)}. Os lançamentos podem ser consultados, mas não alterados.
          </Text>
        </View>
      ) : podeFechar ? (
        <Button
          mode="contained"
          icon="lock-outline"
          onPress={onFechar}
          buttonColor={colors.primary}
          textColor={colors.white}
          style={styles.closeButton}
          labelStyle={styles.closeLabel}
        >
          Fechar trimestre
        </Button>
      ) : (
        <View style={styles.info}>
          <Icon source="calendar-clock" size={16} color={colors.subtext} />
          <Text style={styles.infoText}>
            O fechamento fica disponível depois de {dataNumerica(fimTrimestre(trimestre))}.
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: 10,
    marginTop: 18,
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 16,
    borderRadius: 24,
    backgroundColor: colors.white,
    boxShadow: `0 4px 16px ${colors.shadow}`,
  },
  selector: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  arrow: {
    margin: 0,
  },
  selectorText: {
    flex: 1,
    alignItems: 'center',
  },
  title: {
    fontFamily: fonts.nunitoBold,
    fontSize: 19,
    color: colors.black,
  },
  caption: {
    fontFamily: fonts.interRegular,
    fontSize: 12,
    color: colors.subtext,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 6,
  },
  progressText: {
    flex: 1,
    fontFamily: fonts.interRegular,
    fontSize: 12,
    color: colors.subtext,
    textAlign: 'right',
  },
  track: {
    height: 8,
    marginHorizontal: 6,
    borderRadius: 4,
    backgroundColor: colors.background,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 4,
    backgroundColor: colors.presence,
  },
  info: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 6,
  },
  infoText: {
    flex: 1,
    fontFamily: fonts.interRegular,
    fontSize: 12,
    lineHeight: 17,
    color: colors.subtext,
  },
  retroativo: {
    gap: 10,
    marginHorizontal: 6,
    padding: 12,
    borderRadius: 16,
    backgroundColor: colors.background,
  },
  retroativoLiberado: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 4,
    paddingRight: 4,
  },
  retroativoLinha: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  retroativoTexto: {
    flex: 1,
    fontFamily: fonts.interRegular,
    fontSize: 12,
    lineHeight: 17,
    color: colors.subtext,
  },
  retroativoTextoLiberado: {
    fontFamily: fonts.interMedium,
    color: colors.presence,
  },
  retroativoBotao: {
    alignSelf: 'center',
    borderRadius: 30,
    borderColor: colors.primary,
  },
  bloquearLabel: {
    fontFamily: fonts.interMedium,
    fontSize: 13,
    letterSpacing: 0,
  },
  closeButton: {
    alignSelf: 'center',
    marginTop: 2,
    borderRadius: 30,
  },
  closeLabel: {
    fontFamily: fonts.nunitoBold,
    fontSize: 15,
    letterSpacing: 0,
  },
});
