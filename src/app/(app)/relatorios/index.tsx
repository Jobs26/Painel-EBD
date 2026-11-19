import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, Icon, Snackbar, Text } from 'react-native-paper';

import { ConfirmDialog } from '@/components/ConfirmDialog';
import { DomingoCard, type LinhaDomingo } from '@/components/DomingoCard';
import { FilterChips, type ChipOption } from '@/components/FilterChips';
import { GastoCard } from '@/components/GastoCard';
import { ResumoTrimestre } from '@/components/ResumoTrimestre';
import { TrimestreCard } from '@/components/TrimestreCard';
import { TurmaTrimestreCard } from '@/components/TurmaTrimestreCard';
import { useEscola } from '@/data/EscolaContext';
import { CATEGORIAS_GASTO, gastosDoTrimestre, totalGastos } from '@/data/gastos';
import {
  bloqueioDo,
  compararTrimestres,
  deslocarTrimestre,
  domingosDoTrimestre,
  ehRetroativo,
  fechamentoDe,
  fimTrimestre,
  hojeIso,
  labelTrimestre,
  situacaoDoDomingo,
  somar,
  trimestreDaData,
  trimestreDe,
  turmasDoRelatorio,
  type Lancamento,
  type Trimestre,
} from '@/data/relatorio';
import { colors, fonts } from '@/theme';
import { formatBRL } from '@/utils/currency';

type Visao = 'domingos' | 'turmas' | 'gastos';

const VISOES: ChipOption<Visao>[] = [
  { value: 'domingos', label: 'Por domingo' },
  { value: 'turmas', label: 'Por turma' },
  { value: 'gastos', label: 'Gastos' },
];

/**
 * Relatório da EBD: cada domingo recebe os dados de cada turma
 * (matriculados, presentes, visitantes, total, bíblias, revistas e ofertas)
 * e o trimestre é fechado no fim — depois disso, só consulta.
 */
export default function RelatoriosScreen() {
  const insets = useSafeAreaInsets();
  const {
    turmas,
    aulas,
    fechamentos,
    fecharTrimestre,
    retroativosLiberados,
    definirRetroativo,
    gastos,
    aviso,
    avisar,
    limparAviso,
  } = useEscola();

  const hoje = hojeIso();
  const atual = trimestreDe(new Date());
  const [trimestre, setTrimestre] = useState<Trimestre>(atual);
  const [visao, setVisao] = useState<Visao>('domingos');
  const [confirmarFechamento, setConfirmarFechamento] = useState(false);
  const [confirmarRetroativo, setConfirmarRetroativo] = useState(false);

  // Navegação: do trimestre mais antigo com dados até o atual.
  const primeiro = aulas
    .map((a) => trimestreDaData(a.data))
    .reduce((menor, t) => (compararTrimestres(t, menor) < 0 ? t : menor), atual);

  const fechamento = fechamentoDe(trimestre, fechamentos);
  const editavel = !fechamento;
  const bloqueio = bloqueioDo(trimestre, fechamentos, retroativosLiberados);
  // O botão de liberação só existe nos trimestres anteriores ao atual que ainda estão abertos.
  const retroativo = editavel && ehRetroativo(trimestre);
  const turmasDoTrimestre = turmasDoRelatorio(trimestre, turmas, fechamentos);
  const todosDomingos = domingosDoTrimestre(trimestre);
  // Mais recente primeiro; domingos futuros ainda não podem ser lançados.
  const domingos = todosDomingos.filter((d) => d <= hoje).reverse();
  const futuros = todosDomingos.length - domingos.length;

  const aulaPorData = useMemo(() => new Map(aulas.map((a) => [a.data, a])), [aulas]);
  const linhasDo = (data: string): LinhaDomingo[] =>
    turmasDoTrimestre.map((turma) => ({ turma, lancamento: aulaPorData.get(data)?.registros[turma.id] ?? null }));

  const linhasPorDomingo = domingos.map((data) => ({ data, linhas: linhasDo(data) }));
  const lancamentos = linhasPorDomingo.flatMap(({ linhas }) =>
    linhas.map((l) => l.lancamento).filter((l): l is Lancamento => !!l),
  );
  const situacoes = linhasPorDomingo.map(({ linhas }) =>
    situacaoDoDomingo(linhas.filter((l) => l.lancamento).length, linhas.length),
  );
  const completos = situacoes.filter((s) => s === 'completo').length;
  const aulasLancadas = situacoes.filter((s) => s !== 'pendente').length;
  const incompletos = todosDomingos.length - completos;
  const podeFechar = editavel && hoje > fimTrimestre(trimestre);

  const abrirDomingo = (data: string) => router.push(`/relatorios/${data}`);

  // Gastos do trimestre: abatidos das ofertas (saldo no resumo).
  const gastosTrimestre = gastosDoTrimestre(trimestre, gastos);
  const totalGastosTrimestre = totalGastos(gastosTrimestre);
  const porCategoria = CATEGORIAS_GASTO.map((c) => ({
    ...c,
    total: totalGastos(gastosTrimestre.filter((g) => g.categoria === c.value)),
  })).filter((c) => c.total > 0);
  // Gasto novo: hoje no trimestre atual; último dia nos anteriores.
  const lancarGasto = () =>
    router.push({
      pathname: '/relatorios/gastos/novo',
      params: { data: compararTrimestres(trimestre, atual) < 0 ? fimTrimestre(trimestre) : hoje },
    });

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={[styles.content, { paddingTop: Math.max(insets.top, 20) + 20 }]}>
        <Text style={styles.title} accessibilityRole="header">
          Relatórios
        </Text>
        <Text style={styles.summary}>Lançamento por aula · fechamento trimestral</Text>

        <TrimestreCard
          trimestre={trimestre}
          fechamento={fechamento}
          completos={completos}
          totalDomingos={todosDomingos.length}
          podeVoltar={compararTrimestres(trimestre, primeiro) > 0}
          podeAvancar={compararTrimestres(trimestre, atual) < 0}
          onVoltar={() => setTrimestre((t) => deslocarTrimestre(t, -1))}
          onAvancar={() => setTrimestre((t) => deslocarTrimestre(t, 1))}
          podeFechar={podeFechar}
          onFechar={() => setConfirmarFechamento(true)}
          retroativo={retroativo}
          retroativoLiberado={retroativo && !bloqueio}
          onLiberarRetroativo={() => setConfirmarRetroativo(true)}
          onBloquearRetroativo={() => {
            definirRetroativo(trimestre, false);
            avisar('relatorios', `Lançamentos do ${labelTrimestre(trimestre)} bloqueados.`);
          }}
        />

        <ResumoTrimestre totais={somar(lancamentos)} aulas={aulasLancadas} gastos={totalGastosTrimestre} />

        <FilterChips
          options={VISOES}
          value={visao}
          onChange={setVisao}
          accessibilityLabel="Forma de visualizar o relatório"
          style={styles.chips}
        />

        <View style={styles.list}>
          {visao === 'gastos' ? (
            <>
              {fechamento ? (
                <View style={styles.lockRow}>
                  <Icon source="lock-outline" size={16} color={colors.subtext} />
                  <Text style={styles.lockText}>Trimestre fechado — gastos somente para consulta.</Text>
                </View>
              ) : (
                <Button
                  mode="contained"
                  icon="plus"
                  onPress={lancarGasto}
                  buttonColor={colors.primary}
                  textColor={colors.white}
                  style={styles.novoGasto}
                  labelStyle={styles.novoGastoLabel}
                >
                  Lançar gasto
                </Button>
              )}
              {porCategoria.length > 0 ? (
                <Text style={styles.categorias}>
                  {porCategoria.map((c) => `${c.label} ${formatBRL(c.total)}`).join(' · ')}
                </Text>
              ) : null}
              {gastosTrimestre.length === 0 ? (
                <View style={styles.empty}>
                  <Icon source="receipt-text-outline" size={32} color={colors.subtext} />
                  <Text style={styles.emptyText}>Nenhum gasto lançado neste trimestre.</Text>
                </View>
              ) : (
                gastosTrimestre.map((g) => (
                  <GastoCard
                    key={g.id}
                    gasto={g}
                    onPress={fechamento ? undefined : () => router.push(`/relatorios/gastos/${g.id}`)}
                  />
                ))
              )}
            </>
          ) : turmasDoTrimestre.length === 0 ? (
            <View style={styles.empty}>
              <Icon source="google-classroom" size={32} color={colors.subtext} />
              <Text style={styles.emptyText}>Nenhuma turma ativa. Cadastre turmas na aba Turmas.</Text>
            </View>
          ) : visao === 'domingos' ? (
            linhasPorDomingo.map(({ data, linhas }) => (
              <DomingoCard
                key={data}
                data={data}
                linhas={linhas}
                bloqueio={bloqueio}
                onAbrir={() => abrirDomingo(data)}
              />
            ))
          ) : (
            turmasDoTrimestre.map((turma) => (
              <TurmaTrimestreCard
                key={turma.id}
                turma={turma}
                totalDomingos={domingos.length}
                lancamentos={domingos
                  .map((d) => aulaPorData.get(d)?.registros[turma.id])
                  .filter((l): l is Lancamento => !!l)}
              />
            ))
          )}

          {visao === 'domingos' && futuros > 0 ? (
            <Text style={styles.footnote}>
              {futuros === 1 ? 'Falta 1 domingo' : `Faltam ${futuros} domingos`} para terminar o trimestre.
            </Text>
          ) : null}
          {visao === 'turmas' && turmasDoTrimestre.length > 0 ? (
            <Text style={styles.footnote}>
              Somas do trimestre. Matriculados = alunos ativos no último domingo lançado.
            </Text>
          ) : null}
        </View>
      </ScrollView>

      <ConfirmDialog
        visible={confirmarFechamento}
        title={`Fechar o ${labelTrimestre(trimestre)}?`}
        message={
          'Depois de fechado, nenhum domingo deste trimestre poderá ser lançado ou alterado.' +
          (incompletos > 0
            ? ` Atenção: ${incompletos} ${incompletos === 1 ? 'domingo está' : 'domingos estão'} sem lançamento completo.`
            : '')
        }
        confirmLabel="Fechar"
        cancelLabel="Cancelar"
        destructive
        onDismiss={() => setConfirmarFechamento(false)}
        onConfirm={() => {
          fecharTrimestre(trimestre, turmasDoTrimestre);
          avisar('relatorios', `${labelTrimestre(trimestre)} fechado.`);
          setConfirmarFechamento(false);
        }}
      />

      <ConfirmDialog
        visible={confirmarRetroativo}
        title="Deseja realizar lançamentos retroativos?"
        message={`Os domingos do ${labelTrimestre(trimestre)} poderão ser lançados e alterados até o trimestre ser fechado ou bloqueado de novo.`}
        confirmLabel="Sim"
        cancelLabel="Não"
        onDismiss={() => setConfirmarRetroativo(false)}
        onConfirm={() => {
          definirRetroativo(trimestre, true);
          avisar('relatorios', `Lançamentos retroativos liberados no ${labelTrimestre(trimestre)}.`);
          setConfirmarRetroativo(false);
        }}
      />

      <Snackbar
        key={aviso?.id}
        visible={aviso?.area === 'relatorios'}
        onDismiss={limparAviso}
        duration={3000}
        style={styles.snackbar}
      >
        {aviso?.area === 'relatorios' ? aviso.mensagem : ''}
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
  chips: {
    marginTop: 18,
  },
  list: {
    gap: 12,
    marginTop: 14,
  },
  empty: {
    alignItems: 'center',
    gap: 8,
    paddingVertical: 32,
  },
  emptyText: {
    textAlign: 'center',
    fontFamily: fonts.interRegular,
    fontSize: 14,
    color: colors.subtext,
  },
  novoGasto: {
    alignSelf: 'center',
    borderRadius: 30,
  },
  novoGastoLabel: {
    fontFamily: fonts.nunitoBold,
    fontSize: 15,
    letterSpacing: 0,
  },
  categorias: {
    textAlign: 'center',
    fontFamily: fonts.interRegular,
    fontSize: 12,
    color: colors.subtext,
  },
  lockRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  lockText: {
    fontFamily: fonts.interRegular,
    fontSize: 12,
    color: colors.subtext,
  },
  footnote: {
    marginTop: 4,
    textAlign: 'center',
    fontFamily: fonts.interRegular,
    fontSize: 12,
    color: colors.subtext,
  },
  snackbar: {
    marginHorizontal: 16,
    borderRadius: 16,
    backgroundColor: colors.primary,
  },
});
