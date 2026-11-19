import { useState } from 'react';
import { HelperText } from 'react-native-paper';

import { FormField } from '@/components/FormField';
import { FormScreen, FormStep, formFieldStyles, sairDoFormulario } from '@/components/FormScreen';
import { PrimaryButton } from '@/components/PrimaryButton';
import { nomeValido, telefoneValido } from '@/data/auth';
import { useAuth } from '@/data/AuthContext';
import { useEscola } from '@/data/EscolaContext';
import type { Usuario } from '@/data/mock';
import { maskDate, maskPhone, parseDate } from '@/utils/masks';

const SEM_DADOS: Usuario = { nome: '', email: '', telefone: '', nascimento: '' };

/**
 * Edição dos dados cadastrais do usuário logado (tabela `usuarios` no Supabase):
 * nome, nascimento e telefone. O e-mail é o login da conta e fica só para consulta.
 */
export default function DadosCadastraisScreen() {
  const { usuario: perfil, atualizarUsuario } = useAuth();
  const { avisar } = useEscola();
  const usuario = perfil ?? SEM_DADOS;

  const [form, setForm] = useState<Usuario>(usuario);
  const [tentouSalvar, setTentouSalvar] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [erroServidor, setErroServidor] = useState<string | null>(null);
  const set = (campo: keyof Usuario) => (valor: string) => {
    setErroServidor(null);
    setForm((f) => ({ ...f, [campo]: valor }));
  };

  const nomeOk = nomeValido(form.nome);
  const digitosNascimento = form.nascimento.replace(/\D/g, '').length;
  const nascimentoOk = !!parseDate(form.nascimento);
  const digitosTelefone = form.telefone.replace(/\D/g, '').length;
  const telefoneOk = telefoneValido(form.telefone);

  const alterado = (['nome', 'telefone', 'nascimento'] as const).some((k) => form[k] !== usuario[k]);

  const salvar = async () => {
    if (salvando) return;
    setTentouSalvar(true);
    if (!nomeOk || !nascimentoOk || !telefoneOk) return;
    setSalvando(true);
    const resultado = await atualizarUsuario({ nome: form.nome, telefone: form.telefone, nascimento: form.nascimento });
    setSalvando(false);
    if (!resultado.ok) {
      setErroServidor(resultado.erro);
      return;
    }
    avisar('perfil', 'Dados cadastrais atualizados.');
    sairDoFormulario('/perfil');
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
      title="Dados cadastrais"
      subtitle="Informações da sua conta"
      fallbackHref="/perfil"
      dirty={alterado && !salvando}
      footer={
        <PrimaryButton
          title={salvando ? 'Salvando…' : 'Salvar alterações'}
          width={240}
          height={48}
          onPress={salvar}
          loading={salvando}
          disabled={!alterado || salvando}
          labelStyle={formFieldStyles.saveLabel}
        />
      }
    >
      <FormStep numero={1} titulo="Identificação" concluida={nomeOk && nascimentoOk}>
        <FormField
          {...campo}
          label="Nome completo"
          value={form.nome}
          onChangeText={set('nome')}
          placeholder="Seu nome completo"
          autoCapitalize="words"
          autoComplete="name"
          maxLength={80}
          error={tentouSalvar && !nomeOk}
        />
        {tentouSalvar && !nomeOk ? (
          <HelperText type="error" visible style={formFieldStyles.helper}>
            Informe o nome completo.
          </HelperText>
        ) : null}
        <FormField
          {...campo}
          label="Data de nascimento"
          value={form.nascimento}
          onChangeText={(v) => set('nascimento')(maskDate(v))}
          placeholder="DD / MM / AAAA"
          keyboardType="number-pad"
          error={!nascimentoOk && (digitosNascimento === 8 || tentouSalvar)}
        />
        {!nascimentoOk && (digitosNascimento === 8 || tentouSalvar) ? (
          <HelperText type="error" visible style={formFieldStyles.helper}>
            Data de nascimento inválida.
          </HelperText>
        ) : null}
      </FormStep>

      <FormStep numero={2} titulo="Contato" concluida={telefoneOk}>
        <FormField
          {...campo}
          label="E-mail"
          value={form.email}
          editable={false}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <HelperText type="info" visible style={formFieldStyles.helper}>
          O e-mail é o login da conta e não pode ser alterado por aqui.
        </HelperText>
        <FormField
          {...campo}
          label="Telefone"
          value={form.telefone}
          onChangeText={(v) => set('telefone')(maskPhone(v))}
          placeholder="(11) 91234-5678"
          keyboardType="phone-pad"
          autoComplete="tel"
          error={tentouSalvar && !telefoneOk}
        />
        {tentouSalvar && !telefoneOk ? (
          <HelperText type="error" visible style={formFieldStyles.helper}>
            {digitosTelefone === 0 ? 'Informe o telefone.' : 'Telefone incompleto.'}
          </HelperText>
        ) : null}
        {erroServidor ? (
          <HelperText type="error" visible style={formFieldStyles.helper}>
            {erroServidor}
          </HelperText>
        ) : null}
      </FormStep>
    </FormScreen>
  );
}
