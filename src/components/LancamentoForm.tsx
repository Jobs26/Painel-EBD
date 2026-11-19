import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Icon, Text } from 'react-native-paper';

import TrainingClassIcon from '@assets/icons/training-class.svg';
import { ChamadaTurma } from '@/components/ChamadaTurma';
import { CounterField, MoneyField } from '@/components/CounterField';
import { metricasDe } from '@/components/DomingoCard';
import { FormScreen, formFieldStyles, sairDoFormulario } from '@/components/FormScreen';
import { MetricRow } from '@/components/MetricRow';
import { PrimaryButton } from '@/components/PrimaryButton';
import { StatusPill } from '@/components/StatusPill';
import { useEscola } from '@/data/EscolaContext';
import {
  bloqueioDo,
  dataNumerica,
  dataPorExtenso,
  ehRetroativo,
  fechamentoDe,
  labelTrimestre,
  somar,
  totalDe,
  trimestreDaData,
  turmasDoRelatorio,
  type Lancamento,
  type Presenca,
} from '@/data/relatorio';
import { colors, fonts } from '@/theme';
import { formatBRL } from '@/utils/currency';

/** Valores digitados de uma turma (texto só com dígitos; '' = vazio; ofertas em centavos). */
type Campos = { visitantes: string; biblias: string; revistas: string; ofertas: string };
type CampoContador = Exclude<keyof Campos, 'ofertas'>;
type Formulario = { chamada: Presenca[]; campos: Campos };

const CAMPOS_VAZIOS: Campos = { visitantes: '', biblias: '', revistas: '', ofertas: '' };
const FORMULARIO_VAZIO: Formulario = { chamada: [], campos: CAMPOS_VAZIOS };

const num = (v: string) => (v === '' ? 0 : Number(v));
const contarPresentes = (chamada: Presenca[]) => chamada.filter((p) => p.presente).length;

const preenchido = ({ chamada, campos }: Formulario) =>
  chamada.some((p) => p.presente) || Object.values(campos).some((v) => v !== '');

const iguais = (a: Formulario, b: Formulario) =>
  (Object.keys(a.campos) as (keyof Campos)[]).every((k) => a.campos[k] === b.campos[k]) &&
  a.chamada.length === b.chamada.length &&
  a.chamada.every((p, i) => p.alunoId === b.chamada[i].alunoId && p.presente === b.chamada[i].presente);

const lancamentoDe = ({ chamada, campos }: Formulario): Lancamento => ({
  matriculados: chamada.length,
  presentes: contarPresentes(chamada),
  chamada,
  visitantes: num(campos.visitantes),
  biblias: num(campos.biblias),
  revistas: num(campos.revistas),
  ofertas: num(campos.ofertas) / 100,
});

/**
 * Lançamento de um domingo: um card por turma com a chamada dos alunos (presentes),
 * visitantes, total, bíblias, revistas e ofertas. Matriculados = alunos da chamada.
 * Com o trimestre fechado, a tela vira só consulta.
 */
export function LancamentoForm({ data }: { data: string }) {
  const { turmas, alunos, aulas, fechamentos, retroativosLiberados, salvarAula, avisar } = useEscola();

  const trimestre = trimestreDaData(data);
  const fechamento = fechamentoDe(trimestre, fechamentos);
  const bloqueio = bloqueioDo(trimestre, fechamentos, retroativosLiberados);
  const somenteLeitura = !!bloqueio;
  const retroativo = !fechamento && ehRetroativo(trimestre);
  const linhas = turmasDoRelatorio(trimestre, turmas, fechamentos);
  const aula = aulas.find((a) => a.data === data);

  const nomeDe = (alunoId: string) => alunos.find((a) => a.id === alunoId)?.nome ?? 'Aluno removido';

  /** Turma já lançada: a chamada salva. Ainda não lançada: os alunos ativos da turma hoje, sem presença. */
  const formularioInicial = (turmaId: string): Formulario => {
    const registro = aula?.registros[turmaId];
    if (registro) {
      return {
        chamada: registro.chamada.map((p) => ({ ...p })),
        campos: {
          visitantes: String(registro.visitantes),
          biblias: String(registro.biblias),
          revistas: String(registro.revistas),
          ofertas: registro.ofertas > 0 ? String(Math.round(registro.ofertas * 100)) : '',
        },
      };
    }
    return {
      chamada: alunos
        .filter((a) => a.ativo && a.turmaId === turmaId)
        .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'))
        .map((a) => ({ alunoId: a.id, presente: false })),
      campos: CAMPOS_VAZIOS,
    };
  };

  const [inicial] = useState<Record<string, Formulario>>(() =>
    Object.fromEntries(linhas.map((t) => [t.id, formularioInicial(t.id)])),
  );
  const [formularios, setFormularios] = useState(inicial);

  const formularioDa = (turmaId: string) => formularios[turmaId] ?? FORMULARIO_VAZIO;
  const alterarChamada = (turmaId: string, chamada: Presenca[]) =>
    setFormularios((atual) => ({ ...atual, [turmaId]: { ...(atual[turmaId] ?? FORMULARIO_VAZIO), chamada } }));
  const alterarCampo = (turmaId: string, chave: keyof Campos, valor: string) =>
    setFormularios((atual) => {
      const f = atual[turmaId] ?? FORMULARIO_VAZIO;
      return { ...atual, [turmaId]: { ...f, campos: { ...f.campos, [chave]: valor } } };
    });

  const alterado = linhas.some((t) => !iguais(formularioDa(t.id), inicial[t.id] ?? FORMULARIO_VAZIO));
  const lancadas = linhas.filter((t) => preenchido(formularioDa(t.id)));
  const totais = somar(lancadas.map((t) => lancamentoDe(formularioDa(t.id))));

  const salvar = () => {
    if (somenteLeitura) return;
    salvarAula(
      data,
      Object.fromEntries(
        linhas.map((t) => {
          const f = formularioDa(t.id);
          return [t.id, preenchido(f) ? lancamentoDe(f) : null];
        }),
      ),
    );
    avisar(
      'relatorios',
      lancadas.length === 0
        ? `Lançamento de ${dataPorExtenso(data)} removido.`
        : `Domingo, ${dataPorExtenso(data)} salvo (${lancadas.length} de ${linhas.length} turmas).`,
    );
    sairDoFormulario('/relatorios');
  };

  const contadores: { chave: CampoContador; label: string }[] = [
    { chave: 'biblias', label: 'Bíblias' },
    { chave: 'revistas', label: 'Revistas' },
  ];

  return (
    <FormScreen
      title={`Domingo, ${dataPorExtenso(data)}`}
      subtitle={`${labelTrimestre(trimestre)} · ${
        fechamento ? 'fechado' : retroativo ? (somenteLeitura ? 'retroativo bloqueado' : 'retroativo') : 'aberto'
      }`}
      fallbackHref="/relatorios"
      dirty={alterado}
      footer={
        somenteLeitura ? undefined : (
          <PrimaryButton
            title="Salvar lançamento"
            width={260}
            height={48}
            onPress={salvar}
            disabled={!alterado}
            labelStyle={formFieldStyles.saveLabel}
          />
        )
      }
    >
      {fechamento ? (
        <View style={styles.aviso}>
          <Icon source="lock-outline" size={20} color={colors.primary} />
          <Text style={styles.avisoTexto}>
            Trimestre fechado em {dataNumerica(fechamento.fechadoEm)}. Os dados podem ser consultados, mas não
            alterados.
          </Text>
        </View>
      ) : bloqueio === 'retroativo' ? (
        <View style={styles.aviso}>
          <Icon source="history" size={20} color={colors.primary} />
          <Text style={styles.avisoTexto}>
            Este domingo é de um trimestre anterior ao atual. Para lançar ou alterar, toque em “Lançamentos
            retroativos” no topo da tela de relatórios.
          </Text>
        </View>
      ) : (
        <View style={styles.aviso}>
          <Icon source="information-outline" size={20} color={colors.primary} />
          <Text style={styles.avisoTexto}>
            Marque os alunos presentes e preencha os demais campos. Campos vazios contam como zero; turma sem nada
            marcado fica como pendente.
          </Text>
        </View>
      )}

      <View style={styles.resumo}>
        <View style={styles.resumoHeader}>
          <Text style={styles.resumoTitulo}>Total do domingo</Text>
          <Text style={styles.resumoOferta}>{formatBRL(totais.ofertas)}</Text>
        </View>
        <Text style={styles.resumoCaption}>
          {lancadas.length} de {linhas.length} turmas preenchidas
        </Text>
        <MetricRow valores={metricasDe(totais)} destaque />
      </View>

      {linhas.length === 0 ? (
        <Text style={styles.vazio}>Nenhuma turma ativa. Cadastre turmas na aba Turmas.</Text>
      ) : null}

      {linhas.map((turma) => {
        const f = formularioDa(turma.id);
        const lancada = preenchido(f);
        const presentes = contarPresentes(f.chamada);

        return (
          <View key={turma.id} style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.icon}>
                <TrainingClassIcon />
              </View>
              <View style={styles.flex}>
                <Text style={styles.turma} numberOfLines={1}>
                  {turma.nome}
                </Text>
                <Text style={styles.caption}>
                  {f.chamada.length} {f.chamada.length === 1 ? 'matriculado' : 'matriculados'}
                </Text>
              </View>
              {lancada ? (
                <StatusPill tone="ok" icon="check" label="Lançada" />
              ) : (
                <StatusPill tone={somenteLeitura ? 'muted' : 'warn'} label="Pendente" />
              )}
            </View>

            {somenteLeitura && !lancada ? (
              <Text style={styles.semLancamento}>Turma sem lançamento neste domingo.</Text>
            ) : (
              <>
                <ChamadaTurma
                  turmaNome={turma.nome}
                  chamada={f.chamada}
                  nomeDe={nomeDe}
                  onChange={(chamada) => alterarChamada(turma.id, chamada)}
                  somenteLeitura={somenteLeitura}
                />

                <View style={styles.divisor} />

                <CounterField
                  label="Visitantes"
                  contexto={turma.nome}
                  value={f.campos.visitantes}
                  onChange={(v) => alterarCampo(turma.id, 'visitantes', v)}
                  somenteLeitura={somenteLeitura}
                />

                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>Total (presentes + visitantes)</Text>
                  <Text style={styles.totalValor}>
                    {lancada ? totalDe({ presentes, visitantes: num(f.campos.visitantes) }) : '—'}
                  </Text>
                </View>

                {contadores.map(({ chave, label }) => (
                  <CounterField
                    key={chave}
                    label={label}
                    contexto={turma.nome}
                    value={f.campos[chave]}
                    onChange={(v) => alterarCampo(turma.id, chave, v)}
                    somenteLeitura={somenteLeitura}
                  />
                ))}

                <MoneyField
                  label="Ofertas"
                  contexto={turma.nome}
                  value={f.campos.ofertas}
                  onChange={(v) => alterarCampo(turma.id, 'ofertas', v)}
                  somenteLeitura={somenteLeitura}
                />
              </>
            )}
          </View>
        );
      })}
    </FormScreen>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  aviso: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 14,
    borderRadius: 18,
    backgroundColor: colors.navActive,
  },
  avisoTexto: {
    flex: 1,
    fontFamily: fonts.interRegular,
    fontSize: 12,
    lineHeight: 17,
    color: colors.primary,
  },
  resumo: {
    gap: 8,
    padding: 14,
    borderRadius: 20,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.navActive,
  },
  resumoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  resumoTitulo: {
    flex: 1,
    fontFamily: fonts.nunitoBold,
    fontSize: 16,
    color: colors.primary,
  },
  resumoOferta: {
    fontFamily: fonts.interSemiBold,
    fontSize: 15,
    color: colors.presence,
  },
  resumoCaption: {
    marginTop: -6,
    fontFamily: fonts.interRegular,
    fontSize: 12,
    color: colors.subtext,
  },
  vazio: {
    textAlign: 'center',
    fontFamily: fonts.interRegular,
    fontSize: 14,
    color: colors.subtext,
  },
  card: {
    gap: 4,
    padding: 16,
    borderRadius: 24,
    backgroundColor: colors.white,
    boxShadow: `0 4px 16px ${colors.shadow}`,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 6,
  },
  icon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.navActive,
  },
  turma: {
    fontFamily: fonts.nunitoBold,
    fontSize: 17,
    color: colors.black,
  },
  caption: {
    fontFamily: fonts.interRegular,
    fontSize: 12,
    color: colors.subtext,
  },
  semLancamento: {
    paddingVertical: 6,
    fontFamily: fonts.interRegular,
    fontSize: 13,
    color: colors.subtext,
  },
  divisor: {
    height: 1,
    marginVertical: 6,
    backgroundColor: colors.line,
  },
  totalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: colors.navActive,
  },
  totalLabel: {
    flex: 1,
    fontFamily: fonts.interMedium,
    fontSize: 13,
    color: colors.primary,
  },
  totalValor: {
    fontFamily: fonts.nunitoBold,
    fontSize: 17,
    color: colors.primary,
  },
});
