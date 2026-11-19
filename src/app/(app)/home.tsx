import { useMemo, useState, type FC } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Divider, Menu, Text } from 'react-native-paper';
import type { SvgProps } from 'react-native-svg';

import FilterIcon from '@assets/icons/filter-square.svg';
import FilterLightIcon from '@assets/icons/filter-square-light.svg';
import TrainingClassIcon from '@assets/icons/training-class.svg';
import { BalanceSummary } from '@/components/BalanceSummary';
import { PresenceBar } from '@/components/PresenceBar';
import {
  FAIXAS_ETARIAS,
  PERIODOS,
  PERIODO_PADRAO,
  labelFaixaEtaria,
  type FaixaEtaria,
  type Periodo,
} from '@/data/mock';
import { useEscola } from '@/data/EscolaContext';
import { gastosDoIntervalo, totalGastos } from '@/data/gastos';
import {
  descricaoDoPeriodo,
  intervaloDoPeriodo,
  lancamentosDoIntervalo,
  percentualPresenca,
  somar,
} from '@/data/relatorio';
import { colors, fonts } from '@/theme';

const labelPeriodo = (p: Periodo) => PERIODOS.find((o) => o.value === p)?.label ?? '';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { usuario, turmas, aulas, fechamentos, gastos } = useEscola();

  // Os dois filtros são independentes e começam no trimestre atual.
  const [periodoBalanco, setPeriodoBalanco] = useState<Periodo>(PERIODO_PADRAO);
  const [periodoPresenca, setPeriodoPresenca] = useState<Periodo>(PERIODO_PADRAO);
  const [faixa, setFaixa] = useState<FaixaEtaria | 'todas'>('todas');

  // Turmas desativadas (soft delete) não entram no relatório.
  const turmasRelatorio = useMemo(
    () => turmas.filter((t) => t.ativa && (faixa === 'todas' || t.faixaEtaria === faixa)),
    [turmas, faixa],
  );

  // Os números da Home vêm dos lançamentos da tela de Relatórios.
  const intervaloBalanco = intervaloDoPeriodo(periodoBalanco, aulas);
  const ofertas = somar(
    lancamentosDoIntervalo(intervaloBalanco, aulas, turmas, fechamentos).map((l) => l.lancamento),
  ).ofertas;
  // Gastos lançados em Relatórios → Gastos, no mesmo período.
  const gastosPeriodo = totalGastos(gastosDoIntervalo(intervaloBalanco, gastos));

  // Presença = presentes ÷ matriculados das aulas lançadas no período.
  const intervaloPresenca = intervaloDoPeriodo(periodoPresenca, aulas);
  const lancamentosPresenca = lancamentosDoIntervalo(intervaloPresenca, aulas, turmas, fechamentos);
  const presencaDa = (turmaId: string) =>
    percentualPresenca(lancamentosPresenca.filter((l) => l.turmaId === turmaId).map((l) => l.lancamento));
  const idsFiltrados = new Set(turmasRelatorio.map((t) => t.id));
  const geral = somar(lancamentosPresenca.filter((l) => idsFiltrados.has(l.turmaId)).map((l) => l.lancamento));
  const percentualGeral = geral.matriculados > 0 ? Math.round((geral.presentes / geral.matriculados) * 100) : null;

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 20) + 14 }]}>
        <Text style={styles.greeting}>Olá, Bem-vindo {usuario.nome.split(' ')[0]}</Text>
        <Text style={styles.periodo}>
          {labelPeriodo(periodoBalanco)} · {descricaoDoPeriodo(periodoBalanco, intervaloBalanco)}
        </Text>
        <View style={styles.summary}>
          <BalanceSummary resumo={{ ofertasTotais: ofertas, gastos: gastosPeriodo }} />
          <View style={styles.summaryFilter}>
            <FilterMenu
              Icon={FilterLightIcon}
              label="Filtrar balanço por período"
              secoes={[{ options: PERIODOS, value: periodoBalanco, onChange: (v) => setPeriodoBalanco(v as Periodo) }]}
            />
          </View>
        </View>
      </View>

      <View style={styles.sheet}>
        <ScrollView contentContainerStyle={styles.sheetContent}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle} accessibilityRole="header">
              Relatório de presença
            </Text>
            <FilterMenu
              Icon={FilterIcon}
              label="Filtrar presença por período e faixa etária"
              secoes={[
                {
                  titulo: 'Período',
                  options: PERIODOS,
                  value: periodoPresenca,
                  onChange: (v) => setPeriodoPresenca(v as Periodo),
                },
                {
                  titulo: 'Faixa etária',
                  options: [{ value: 'todas', label: 'Todas as faixas' }, ...FAIXAS_ETARIAS],
                  value: faixa,
                  onChange: (v) => setFaixa(v as FaixaEtaria | 'todas'),
                },
              ]}
            />
          </View>
          <Text style={styles.filterInfo}>
            {labelPeriodo(periodoPresenca)} · {descricaoDoPeriodo(periodoPresenca, intervaloPresenca)}
            {faixa !== 'todas' ? ` · ${labelFaixaEtaria(faixa)}` : ''}
          </Text>
          {turmasRelatorio.length > 0 ? (
            <Text
              style={styles.geral}
              accessibilityLabel={
                percentualGeral === null
                  ? 'Presença geral: sem aula lançada no período'
                  : `Presença geral: ${percentualGeral}%`
              }
            >
              Presença geral:{' '}
              <Text style={styles.geralValor}>
                {percentualGeral === null
                  ? 'sem aula lançada'
                  : `${percentualGeral}% (${geral.presentes} de ${geral.matriculados})`}
              </Text>
            </Text>
          ) : null}

          {turmasRelatorio.length === 0 ? (
            <Text style={styles.empty}>Nenhuma turma ativa nesta faixa etária.</Text>
          ) : (
            turmasRelatorio.map((turma) => (
              <View key={turma.id} style={styles.turma}>
                <View style={styles.turmaHeader}>
                  <View style={styles.turmaIcon}>
                    <TrainingClassIcon />
                  </View>
                  <Text style={styles.turmaNome} numberOfLines={1}>
                    {turma.nome}
                  </Text>
                </View>
                <PresenceBar percentual={presencaDa(turma.id)} />
              </View>
            ))
          )}
        </ScrollView>
      </View>
    </View>
  );
}

type SecaoFiltro = {
  /** Título da seção (só aparece quando o menu tem mais de uma). */
  titulo?: string;
  options: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
};

type FilterMenuProps = {
  Icon: FC<SvgProps>;
  label: string;
  secoes: SecaoFiltro[];
};

/** Ícone "bi:filter-square" que abre um menu de opções (uma ou mais seções). */
function FilterMenu({ Icon, label, secoes }: FilterMenuProps) {
  const [aberto, setAberto] = useState(false);

  return (
    <Menu
      visible={aberto}
      onDismiss={() => setAberto(false)}
      anchorPosition="bottom"
      contentStyle={styles.menu}
      anchor={
        <Pressable
          onPress={() => setAberto(true)}
          accessibilityRole="button"
          accessibilityLabel={label}
          hitSlop={10}
          style={({ pressed }) => pressed && styles.pressed}
        >
          <Icon />
        </Pressable>
      }
    >
      {secoes.map(({ titulo, options, value, onChange }, i) => (
        <View key={titulo ?? i}>
          {i > 0 ? <Divider /> : null}
          {titulo && secoes.length > 1 ? <Text style={styles.menuSecao}>{titulo}</Text> : null}
          {options.map((option) => (
            <Menu.Item
              key={option.value}
              title={option.label}
              leadingIcon={option.value === value ? 'check' : undefined}
              titleStyle={[styles.menuItem, option.value === value && styles.menuItemSelected]}
              dense={secoes.length > 1}
              onPress={() => {
                onChange(option.value);
                setAberto(false);
              }}
            />
          ))}
        </View>
      ))}
    </Menu>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary,
  },
  header: {
    paddingHorizontal: 27,
    paddingBottom: 46,
  },
  greeting: {
    fontFamily: fonts.nunitoSemiBold,
    fontSize: 24,
    lineHeight: 28,
    color: colors.white,
  },
  periodo: {
    marginTop: 2,
    fontFamily: fonts.interRegular,
    fontSize: 12,
    color: colors.navActive,
  },
  summary: {
    marginTop: 14,
    marginLeft: 2,
    marginRight: 16,
  },
  // Figma: ícone no canto superior direito do card de balanço.
  summaryFilter: {
    position: 'absolute',
    top: -9,
    right: -3,
  },
  sheet: {
    flex: 1,
    backgroundColor: colors.background,
    borderTopLeftRadius: 70,
    borderTopRightRadius: 70,
    overflow: 'hidden',
  },
  sheetContent: {
    paddingTop: 38,
    paddingLeft: 31,
    paddingRight: 29,
    paddingBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  sectionTitle: {
    flex: 1,
    fontFamily: fonts.nunitoSemiBold,
    fontSize: 20,
    color: colors.black,
  },
  filterInfo: {
    marginTop: 4,
    fontFamily: fonts.interRegular,
    fontSize: 12,
    color: colors.subtext,
  },
  geral: {
    marginTop: 10,
    fontFamily: fonts.interRegular,
    fontSize: 14,
    color: colors.subtext,
  },
  geralValor: {
    fontFamily: fonts.interSemiBold,
    color: colors.primary,
  },
  turma: {
    marginTop: 26,
    marginLeft: 4,
    gap: 4,
  },
  turmaHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingLeft: 15,
  },
  turmaIcon: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  turmaNome: {
    flex: 1,
    fontFamily: fonts.interRegular,
    fontSize: 18,
    color: colors.black,
  },
  empty: {
    marginTop: 32,
    textAlign: 'center',
    fontFamily: fonts.interRegular,
    fontSize: 14,
    color: colors.subtext,
  },
  pressed: {
    opacity: 0.6,
  },
  menu: {
    borderRadius: 16,
    backgroundColor: colors.white,
  },
  menuSecao: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 2,
    fontFamily: fonts.interSemiBold,
    fontSize: 12,
    color: colors.subtext,
  },
  menuItem: {
    fontFamily: fonts.interRegular,
    fontSize: 14,
    color: colors.black,
  },
  menuItemSelected: {
    fontFamily: fonts.interSemiBold,
    color: colors.primary,
  },
});
