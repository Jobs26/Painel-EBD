import { useState } from 'react';
import { HelperText } from 'react-native-paper';

import { FormField } from '@/components/FormField';
import { FormScreen, FormStep, formFieldStyles, sairDoFormulario } from '@/components/FormScreen';
import { PrimaryButton } from '@/components/PrimaryButton';
import { useEscola } from '@/data/EscolaContext';
import type { Usuario } from '@/data/mock';
import { maskDate, maskPhone, parseDate } from '@/utils/masks';

const EMAIL_VALIDO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Edição dos dados cadastrais do usuário logado: nome, e-mail, nascimento e telefone. */
export default function DadosCadastraisScreen() {
  const { usuario, atualizarUsuario, avisar } = useEscola();

  const [form, setForm] = useState<Usuario>(usuario);
  const [tentouSalvar, setTentouSalvar] = useState(false);
  const set = (campo: keyof Usuario) => (valor: string) => setForm((f) => ({ ...f, [campo]: valor }));

  const nomeOk = form.nome.trim().length > 0;
  const emailOk = EMAIL_VALIDO.test(form.email.trim());
  const digitosNascimento = form.nascimento.replace(/\D/g, '').length;
  const nascimentoOk = !!parseDate(form.nascimento);
  const digitosTelefone = form.telefone.replace(/\D/g, '').length;
  const telefoneOk = digitosTelefone >= 10;

  const alterado = (Object.keys(form) as (keyof Usuario)[]).some((k) => form[k] !== usuario[k]);

  const salvar = () => {
    setTentouSalvar(true);
    if (!nomeOk || !emailOk || !nascimentoOk || !telefoneOk) return;
    // TODO(backend): atualizar o perfil no Supabase (troca de e-mail pede confirmação no novo endereço).
    atualizarUsuario({ ...form, nome: form.nome.trim(), email: form.email.trim().toLowerCase() });
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
      dirty={alterado}
      footer={
        <PrimaryButton
          title="Salvar alterações"
          width={240}
          height={48}
          onPress={salvar}
          disabled={!alterado}
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
            Informe o nome.
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

      <FormStep numero={2} titulo="Contato" concluida={emailOk && telefoneOk}>
        <FormField
          {...campo}
          label="E-mail"
          value={form.email}
          onChangeText={set('email')}
          placeholder="example@example.com"
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          error={tentouSalvar && !emailOk}
        />
        {tentouSalvar && !emailOk ? (
          <HelperText type="error" visible style={formFieldStyles.helper}>
            E-mail inválido.
          </HelperText>
        ) : null}
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
      </FormStep>
    </FormScreen>
  );
}
