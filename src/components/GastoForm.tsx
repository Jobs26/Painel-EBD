import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, HelperText, Icon, Text } from 'react-native-paper';

import { ConfirmDialog } from '@/components/ConfirmDialog';
import { MoneyField } from '@/components/CounterField';
import { FilterChips } from '@/components/FilterChips';
import { FormField } from '@/components/FormField';
import { FormScreen, FormStep, formFieldStyles, sairDoFormulario } from '@/components/FormScreen';
import { PrimaryButton } from '@/components/PrimaryButton';
import { useEscola } from '@/data/EscolaContext';
import { CATEGORIAS_GASTO, situacaoDaData, type CategoriaGasto, type DadosGasto, type Gasto } from '@/data/gastos';
import { labelTrimestre, parseIsoDate, trimestreDaData } from '@/data/relatorio';
import { colors, fonts } from '@/theme';
import { formatBRL } from '@/utils/currency';
import { maskDate } from '@/utils/masks';

type GastoFormProps = {
  /** Gasto a editar. Sem ele, o formulário lança um novo gasto. */
  gasto?: Gasto;
  /** Data sugerida para um gasto novo ("AAAA-MM-DD"). */
  dataSugerida?: string;
};

/** "AAAA-MM-DD" → "DD / MM / AAAA" */
const mascararIso = (iso: string) => `${iso.slice(8, 10)} / ${iso.slice(5, 7)} / ${iso.slice(0, 4)}`;

/** "DD / MM / AAAA" → "AAAA-MM-DD" (null se incompleta ou inválida). */
function isoDaMascara(texto: string): string | null {
  const d = texto.replace(/\D/g, '');
  if (d.length !== 8) return null;
  const iso = `${d.slice(4, 8)}-${d.slice(2, 4)}-${d.slice(0, 2)}`;
  return parseIsoDate(iso) && Number(d.slice(4, 8)) >= 2000 ? iso : null;
}

const CHIPS = CATEGORIAS_GASTO.map(({ value, label }) => ({ value, label }));

/**
 * Lançamento/edição de gasto em 2 etapas: 1) a conta (nome, tipo, descrição),
 * 2) valor e data. A data define o trimestre de onde o valor é abatido.
 */
export function GastoForm({ gasto, dataSugerida }: GastoFormProps) {
  const { fechamentos, criarGasto, atualizarGasto, removerGasto, avisar } = useEscola();

  const dataBase = gasto?.data ?? dataSugerida;
  const inicial = {
    nome: gasto?.nome ?? '',
    categoria: gasto?.categoria ?? null,
    descricao: gasto?.descricao ?? '',
    valor: gasto ? String(Math.round(gasto.valor * 100)) : '',
    data: dataBase ? mascararIso(dataBase) : '',
  };

  const [nome, setNome] = useState(inicial.nome);
  const [categoria, setCategoria] = useState<CategoriaGasto | null>(inicial.categoria);
  const [descricao, setDescricao] = useState(inicial.descricao);
  const [valor, setValor] = useState(inicial.valor);
  const [data, setData] = useState(inicial.data);
  const [tentouSalvar, setTentouSalvar] = useState(false);
  const [confirmarRetroativo, setConfirmarRetroativo] = useState(false);
  const [confirmarExclusao, setConfirmarExclusao] = useState(false);

  const nomeOk = nome.trim().length > 0;
  const valorReais = valor === '' ? 0 : Number(valor) / 100;
  const valorOk = valorReais > 0;
  const iso = isoDaMascara(data);
  const situacao = iso ? situacaoDaData(iso, fechamentos) : null;
  const dataOk = !!situacao && !situacao.erro;
  const trimestre = iso ? labelTrimestre(trimestreDaData(iso)) : '';
  const digitosData = data.replace(/\D/g, '').length;

  const alterado =
    nome !== inicial.nome ||
    categoria !== inicial.categoria ||
    descricao !== inicial.descricao ||
    valor !== inicial.valor ||
    data !== inicial.data;

  const gravar = () => {
    if (!iso || !categoria) return;
    const dados: DadosGasto = { nome: nome.trim(), categoria, descricao: descricao.trim(), valor: valorReais, data: iso };
    if (gasto) atualizarGasto(gasto.id, dados);
    else criarGasto(dados);
    avisar(
      'relatorios',
      `${gasto ? 'Gasto atualizado' : 'Gasto lançado'}: ${formatBRL(valorReais)} abatidos do ${trimestre}.`,
    );
    sairDoFormulario('/relatorios');
  };

  const salvar = () => {
    setTentouSalvar(true);
    if (!nomeOk || !categoria || !valorOk || !dataOk) return;
    // Retroativo (trimestre anterior ao atual): pede confirmação se a data é nova.
    if (situacao?.retroativo && (!gasto || iso !== gasto.data)) setConfirmarRetroativo(true);
    else gravar();
  };

  const campo = {
    height: 48,
    labelStyle: formFieldStyles.label,
    labelPaddingLeft: 4,
    labelGap: 6,
    inputTextStyle: formFieldStyles.inputText,
  };

  const avisoData = !iso
    ? digitosData === 8 || (tentouSalvar && digitosData > 0)
      ? { erro: true, texto: 'Data inválida.' }
      : tentouSalvar
        ? { erro: true, texto: 'Informe a data do gasto.' }
        : null
    : situacao?.erro === 'futura'
      ? { erro: true, texto: 'A data não pode ser futura.' }
      : situacao?.erro === 'fechado'
        ? { erro: true, texto: `O ${trimestre} está fechado. Escolha uma data de um trimestre aberto.` }
        : situacao?.retroativo
          ? { erro: false, texto: `Lançamento retroativo: será abatido do ${trimestre}.` }
          : { erro: false, texto: `Será abatido do ${trimestre} (trimestre atual).` };

  return (
    <FormScreen
      title={gasto ? 'Editar gasto' : 'Novo gasto'}
      subtitle="Revistas e insumos da escola"
      fallbackHref="/relatorios"
      dirty={alterado}
      footer={
        <PrimaryButton
          title={gasto ? 'Salvar alterações' : 'Lançar gasto'}
          width={240}
          height={48}
          onPress={salvar}
          disabled={!!gasto && !alterado}
          labelStyle={formFieldStyles.saveLabel}
        />
      }
    >
      <FormStep numero={1} titulo="Conta" subtitulo="Nome e o que é essa conta." concluida={nomeOk && !!categoria}>
        <FormField
          {...campo}
          label="Nome da conta"
          value={nome}
          onChangeText={setNome}
          placeholder="Ex.: Revistas do 1º trimestre"
          autoCapitalize="sentences"
          maxLength={60}
          error={tentouSalvar && !nomeOk}
        />
        {tentouSalvar && !nomeOk ? (
          <HelperText type="error" visible style={formFieldStyles.helper}>
            Informe o nome da conta.
          </HelperText>
        ) : null}

        <Text style={[formFieldStyles.label, styles.rotulo]}>O que é essa conta</Text>
        <FilterChips
          options={CHIPS}
          value={categoria}
          onChange={setCategoria}
          accessibilityLabel="O que é essa conta"
        />
        {tentouSalvar && !categoria ? (
          <HelperText type="error" visible style={formFieldStyles.helper}>
            Escolha o tipo da conta.
          </HelperText>
        ) : null}

        <FormField
          {...campo}
          label="Descrição (opcional)"
          value={descricao}
          onChangeText={setDescricao}
          placeholder="Ex.: 40 revistas de alunos e 6 de professores"
          autoCapitalize="sentences"
          maxLength={200}
          multiline
          height={72}
        />
      </FormStep>

      <FormStep numero={2} titulo="Valor e período" concluida={valorOk && dataOk}>
        <MoneyField label="Valor" contexto="gasto" value={valor} onChange={setValor} error={tentouSalvar && !valorOk} />
        {tentouSalvar && !valorOk ? (
          <HelperText type="error" visible style={formFieldStyles.helper}>
            Informe o valor do gasto.
          </HelperText>
        ) : null}

        <FormField
          {...campo}
          label="Data do lançamento"
          value={data}
          onChangeText={(v) => setData(maskDate(v))}
          placeholder="DD / MM / AAAA"
          keyboardType="number-pad"
          error={!!avisoData?.erro}
        />
        {avisoData ? (
          avisoData.erro ? (
            <HelperText type="error" visible style={formFieldStyles.helper}>
              {avisoData.texto}
            </HelperText>
          ) : (
            <View style={styles.info}>
              <Icon source={situacao?.retroativo ? 'history' : 'calendar-check'} size={16} color={colors.primary} />
              <Text style={styles.infoTexto}>{avisoData.texto}</Text>
            </View>
          )
        ) : null}
      </FormStep>

      {gasto ? (
        <Button
          mode="text"
          icon="trash-can-outline"
          onPress={() => setConfirmarExclusao(true)}
          textColor={colors.expense}
          style={styles.excluir}
          labelStyle={styles.excluirLabel}
        >
          Excluir gasto
        </Button>
      ) : null}

      <ConfirmDialog
        visible={confirmarRetroativo}
        title="Deseja realizar lançamentos retroativos?"
        message={`Este gasto será abatido da arrecadação do ${trimestre}.`}
        onDismiss={() => setConfirmarRetroativo(false)}
        onConfirm={() => {
          setConfirmarRetroativo(false);
          gravar();
        }}
      />
      <ConfirmDialog
        visible={confirmarExclusao}
        title="Excluir este gasto?"
        message={gasto ? `"${gasto.nome}" (${formatBRL(gasto.valor)}) deixará de ser abatido do trimestre.` : ''}
        confirmLabel="Excluir"
        cancelLabel="Cancelar"
        destructive
        onDismiss={() => setConfirmarExclusao(false)}
        onConfirm={() => {
          if (!gasto) return;
          setConfirmarExclusao(false);
          removerGasto(gasto.id);
          avisar('relatorios', `Gasto "${gasto.nome}" excluído.`);
          sairDoFormulario('/relatorios');
        }}
      />
    </FormScreen>
  );
}

const styles = StyleSheet.create({
  rotulo: {
    marginBottom: -6,
    paddingLeft: 4,
  },
  info: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: -6,
    paddingLeft: 4,
  },
  infoTexto: {
    flex: 1,
    fontFamily: fonts.interRegular,
    fontSize: 12,
    lineHeight: 17,
    color: colors.primary,
  },
  excluir: {
    alignSelf: 'center',
  },
  excluirLabel: {
    fontFamily: fonts.nunitoBold,
    fontSize: 15,
    letterSpacing: 0,
  },
});
