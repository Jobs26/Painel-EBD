import { useMemo, useState } from 'react';
import { HelperText } from 'react-native-paper';

import { AlunoSelector } from '@/components/AlunoSelector';
import { FilterChips } from '@/components/FilterChips';
import { FormField } from '@/components/FormField';
import { FormScreen, FormStep, formFieldStyles, sairDoFormulario } from '@/components/FormScreen';
import { PrimaryButton } from '@/components/PrimaryButton';
import { useEscola } from '@/data/EscolaContext';
import { FAIXAS_ETARIAS, type FaixaEtaria, type Turma } from '@/data/mock';

type TurmaFormProps = {
  /** Turma a editar. Sem ela, o formulário cadastra uma nova turma. */
  turma?: Turma;
};

const OPCOES_FAIXA = FAIXAS_ETARIAS.map((f) => ({ value: f.value, label: f.label, caption: f.idade }));

/**
 * Cadastro/edição de turma em 3 etapas:
 * 1) nome, 2) faixa etária e, só depois das duas, 3) vínculo (opcional) com alunos.
 */
export function TurmaForm({ turma }: TurmaFormProps) {
  const { turmas, alunos, criarTurma, atualizarTurma, definirAlunos, avisar } = useEscola();

  const alunosIniciais = useMemo(
    () => (turma ? alunos.filter((a) => a.ativo && a.turmaId === turma.id).map((a) => a.id) : []),
    // Só no carregamento do formulário.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [turma?.id],
  );

  const [nome, setNome] = useState(turma?.nome ?? '');
  const [faixa, setFaixa] = useState<FaixaEtaria | null>(turma?.faixaEtaria ?? null);
  const [selecionados, setSelecionados] = useState<string[]>(alunosIniciais);

  const nomeLimpo = nome.trim();
  const nomeDuplicado = turmas.some(
    (t) => t.id !== turma?.id && t.nome.trim().toLocaleLowerCase('pt-BR') === nomeLimpo.toLocaleLowerCase('pt-BR'),
  );
  const nomeOk = nomeLimpo.length > 0 && !nomeDuplicado;
  const podeVincular = nomeOk && faixa !== null;

  const alterado =
    nome !== (turma?.nome ?? '') ||
    faixa !== (turma?.faixaEtaria ?? null) ||
    selecionados.length !== alunosIniciais.length ||
    selecionados.some((id) => !alunosIniciais.includes(id));

  const salvar = () => {
    if (!podeVincular || !faixa) return;
    const dados = { nome: nomeLimpo, faixaEtaria: faixa };
    if (turma) {
      atualizarTurma(turma.id, dados);
      definirAlunos(turma.id, selecionados);
      avisar('turmas', `Turma "${nomeLimpo}" atualizada.`);
    } else {
      criarTurma(dados, selecionados);
      const n = selecionados.length;
      avisar(
        'turmas',
        n > 0
          ? `Turma "${nomeLimpo}" criada com ${n} aluno${n > 1 ? 's' : ''}.`
          : `Turma "${nomeLimpo}" criada. Vincule alunos quando quiser.`,
      );
    }
    sairDoFormulario('/turmas');
  };

  return (
    <FormScreen
      title={turma ? 'Editar turma' : 'Nova turma'}
      fallbackHref="/turmas"
      dirty={alterado}
      footer={
        <PrimaryButton
          title={turma ? 'Salvar alterações' : 'Salvar turma'}
          width={240}
          height={48}
          disabled={!podeVincular}
          onPress={salvar}
          labelStyle={formFieldStyles.saveLabel}
        />
      }
    >
      <FormStep numero={1} titulo="Nome da turma" concluida={nomeOk}>
        <FormField
          label="Nome da turma"
          labelStyle={formFieldStyles.hiddenLabel}
          value={nome}
          onChangeText={setNome}
          placeholder="Ex.: Classe 5, Juniores, Casais..."
          autoCapitalize="sentences"
          maxLength={40}
          height={48}
          inputTextStyle={formFieldStyles.inputText}
        />
        {nomeDuplicado ? (
          <HelperText type="error" visible style={formFieldStyles.helper}>
            Já existe uma turma com esse nome.
          </HelperText>
        ) : null}
      </FormStep>

      <FormStep numero={2} titulo="Faixa etária" concluida={faixa !== null}>
        <FilterChips
          layout="wrap"
          options={OPCOES_FAIXA}
          value={faixa}
          onChange={setFaixa}
          accessibilityLabel="Faixa etária"
        />
      </FormStep>

      <FormStep
        numero={3}
        titulo="Vincular alunos"
        subtitulo="Opcional — você pode vincular depois."
        concluida={podeVincular && selecionados.length > 0}
        bloqueada={!podeVincular}
        mensagemBloqueio="Preencha o nome e a faixa etária para liberar o vínculo com alunos."
      >
        <AlunoSelector turmaId={turma?.id} selecionados={selecionados} onChange={setSelecionados} />
      </FormStep>
    </FormScreen>
  );
}
