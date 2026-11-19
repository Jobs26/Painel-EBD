import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { HelperText } from 'react-native-paper';

import { FormField } from '@/components/FormField';
import { FormScreen, FormStep, formFieldStyles, sairDoFormulario } from '@/components/FormScreen';
import { PrimaryButton } from '@/components/PrimaryButton';
import { TurmaPicker } from '@/components/TurmaPicker';
import { useEscola } from '@/data/EscolaContext';
import type { Aluno } from '@/data/mock';
import { calcularIdade, maskDate, maskPhone, parseDate } from '@/utils/masks';

type AlunoFormProps = {
  /** Aluno a editar. Sem ele, o formulário cadastra um novo aluno. */
  aluno?: Aluno;
};

const IDADE_MAXIMA = 120;

/**
 * Cadastro/edição de aluno em 3 etapas:
 * 1) nome, 2) idade, telefone e nascimento e, só com nome + idade, 3) vínculo com uma turma.
 */
export function AlunoForm({ aluno }: AlunoFormProps) {
  const { turmas, criarAluno, atualizarAluno, avisar } = useEscola();

  const inicial = {
    nome: aluno?.nome ?? '',
    idade: aluno?.idade != null ? String(aluno.idade) : '',
    telefone: aluno?.telefone ?? '',
    nascimento: aluno?.nascimento ?? '',
    turmaId: aluno?.turmaId ?? null,
  };

  const [nome, setNome] = useState(inicial.nome);
  const [idade, setIdade] = useState(inicial.idade);
  const [telefone, setTelefone] = useState(inicial.telefone);
  const [nascimento, setNascimento] = useState(inicial.nascimento);
  const [turmaId, setTurmaId] = useState<string | null>(inicial.turmaId);
  const [tentouSalvar, setTentouSalvar] = useState(false);

  const nomeLimpo = nome.trim();
  const nomeOk = nomeLimpo.length > 0;

  const idadeNumero = idade === '' ? null : Number(idade);
  const idadeInvalida = idadeNumero !== null && (!Number.isInteger(idadeNumero) || idadeNumero > IDADE_MAXIMA);
  const idadeOk = idadeNumero !== null && !idadeInvalida;

  const digitosNascimento = nascimento.replace(/\D/g, '').length;
  const dataNascimento = parseDate(nascimento);
  const nascimentoInvalido = digitosNascimento > 0 && !dataNascimento;
  const digitosTelefone = telefone.replace(/\D/g, '').length;
  const telefoneIncompleto = digitosTelefone > 0 && digitosTelefone < 10;

  const podeVincular = nomeOk && idadeOk;

  const alterado =
    nome !== inicial.nome ||
    idade !== inicial.idade ||
    telefone !== inicial.telefone ||
    nascimento !== inicial.nascimento ||
    turmaId !== inicial.turmaId;

  const alterarNascimento = (texto: string) => {
    const masked = maskDate(texto);
    setNascimento(masked);
    const data = parseDate(masked);
    // A idade é preenchida automaticamente a partir da data de nascimento.
    if (data) setIdade(String(calcularIdade(data)));
  };

  const salvar = () => {
    setTentouSalvar(true);
    if (!nomeOk || idadeInvalida || nascimentoInvalido || telefoneIncompleto) return;

    const dados = {
      nome: nomeLimpo,
      idade: idadeNumero,
      telefone,
      nascimento: dataNascimento ? nascimento : '',
      // Sem nome e idade o vínculo fica bloqueado, então não salva turma.
      turmaId: podeVincular ? turmaId : null,
    };
    const nomeTurma = turmas.find((t) => t.id === dados.turmaId)?.nome;

    if (aluno) {
      atualizarAluno(aluno.id, dados);
      avisar('alunos', `Dados de "${nomeLimpo}" atualizados.`);
    } else {
      criarAluno(dados);
      avisar('alunos', nomeTurma ? `"${nomeLimpo}" cadastrado na ${nomeTurma}.` : `"${nomeLimpo}" cadastrado.`);
    }
    sairDoFormulario('/alunos');
  };

  const campo = {
    height: 48,
    labelStyle: formFieldStyles.label,
    labelPaddingLeft: 4,
    labelGap: 6,
    inputTextStyle: formFieldStyles.inputText,
  };

  return (
    <FormScreen
      title={aluno ? 'Editar aluno' : 'Novo aluno'}
      fallbackHref="/alunos"
      dirty={alterado}
      footer={
        <PrimaryButton
          title={aluno ? 'Salvar alterações' : 'Salvar'}
          width={240}
          height={48}
          onPress={salvar}
          labelStyle={formFieldStyles.saveLabel}
        />
      }
    >
      <FormStep numero={1} titulo="Nome do aluno" concluida={nomeOk}>
        <FormField
          label="Nome do aluno"
          labelStyle={formFieldStyles.hiddenLabel}
          value={nome}
          onChangeText={setNome}
          placeholder="Nome completo"
          autoCapitalize="words"
          autoComplete="name"
          maxLength={80}
          height={48}
          inputTextStyle={formFieldStyles.inputText}
          error={tentouSalvar && !nomeOk}
        />
        {tentouSalvar && !nomeOk ? (
          <HelperText type="error" visible style={formFieldStyles.helper}>
            Nome não cadastrado.
          </HelperText>
        ) : null}
      </FormStep>

      <FormStep numero={2} titulo="Dados pessoais" subtitulo="A idade é calculada pela data de nascimento." concluida={idadeOk}>
        <View style={styles.row}>
          <FormField
            {...campo}
            containerStyle={styles.nascimento}
            label="Data de nascimento"
            value={nascimento}
            onChangeText={alterarNascimento}
            placeholder="DD / MM / AAAA"
            keyboardType="number-pad"
            error={nascimentoInvalido && digitosNascimento === 8}
          />
          <FormField
            {...campo}
            containerStyle={styles.idade}
            label="Idade"
            value={idade}
            onChangeText={(v) => setIdade(v.replace(/\D/g, '').slice(0, 3))}
            placeholder="Anos"
            keyboardType="number-pad"
            maxLength={3}
            error={idadeInvalida}
          />
        </View>
        {nascimentoInvalido && (digitosNascimento === 8 || tentouSalvar) ? (
          <HelperText type="error" visible style={formFieldStyles.helper}>
            Data de nascimento inválida.
          </HelperText>
        ) : null}
        {idadeInvalida ? (
          <HelperText type="error" visible style={formFieldStyles.helper}>
            Informe uma idade entre 0 e {IDADE_MAXIMA} anos.
          </HelperText>
        ) : null}
        <FormField
          {...campo}
          label="Telefone"
          value={telefone}
          onChangeText={(v) => setTelefone(maskPhone(v))}
          placeholder="(11) 91234-5678"
          keyboardType="phone-pad"
          autoComplete="tel"
          error={tentouSalvar && telefoneIncompleto}
        />
        {tentouSalvar && telefoneIncompleto ? (
          <HelperText type="error" visible style={formFieldStyles.helper}>
            Telefone incompleto.
          </HelperText>
        ) : null}
      </FormStep>

      <FormStep
        numero={3}
        titulo="Vincular turma"
        subtitulo="Opcional — você pode vincular depois."
        concluida={podeVincular && turmaId !== null}
        bloqueada={!podeVincular}
        mensagemBloqueio="Preencha o nome e a idade para liberar o vínculo com uma turma."
      >
        <TurmaPicker value={turmaId} onChange={setTurmaId} idade={idadeOk ? idadeNumero : null} />
      </FormStep>
    </FormScreen>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  nascimento: {
    flex: 1.6,
  },
  idade: {
    flex: 1,
  },
});
