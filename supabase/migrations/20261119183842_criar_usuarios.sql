-- Migration aplicada no projeto Supabase (versão 20261119183842, nome criar_usuarios).
-- Cópia versionada para documentação/reprodução. Não edite: crie uma migration nova.
--
-- Perfil público do usuário do Painel EBD.
-- Login, hash da senha (bcrypt), confirmação de e-mail e tokens de recuperação
-- ficam no Supabase Auth (auth.users / auth.one_time_tokens). Esta tabela guarda
-- os dados cadastrais e é criada automaticamente no cadastro (gatilho abaixo).

create table public.usuarios (
  id uuid primary key references auth.users (id) on delete cascade,
  nome text not null
    constraint usuarios_nome_tamanho check (char_length(btrim(nome)) between 2 and 80),
  email text not null
    constraint usuarios_email_unico unique
    constraint usuarios_email_minusculo check (email = lower(email)),
  telefone text not null
    constraint usuarios_telefone_formato check (regexp_replace(telefone, '\D', '', 'g') ~ '^\d{10,11}$'),
  data_nascimento date not null
    constraint usuarios_nascimento_valido check (data_nascimento >= date '1900-01-01' and data_nascimento <= current_date),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.usuarios is 'Dados cadastrais do usuário (1:1 com auth.users). Senha e tokens ficam no Supabase Auth.';
comment on column public.usuarios.email is 'Cópia do e-mail de auth.users, mantida em sincronia por gatilho. Não é editável pelo app.';
comment on column public.usuarios.telefone is 'Telefone com DDD, como digitado na máscara "(11) 91234-5678".';

-- ------------------------------------------------------------------ segurança (RLS)
alter table public.usuarios enable row level security;

create policy "usuario le o proprio perfil"
  on public.usuarios for select
  to authenticated
  using ((select auth.uid()) = id);

create policy "usuario atualiza o proprio perfil"
  on public.usuarios for update
  to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

-- Sem policy de insert/delete: a linha nasce pelo gatilho do cadastro e some junto com o auth.users.
-- O app só pode alterar nome, telefone e nascimento (id e e-mail ficam travados).
revoke all on public.usuarios from anon, authenticated;
grant select on public.usuarios to authenticated;
grant update (nome, telefone, data_nascimento) on public.usuarios to authenticated;

-- ------------------------------------------------------------------ updated_at
create function public.definir_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger usuarios_updated_at
  before update on public.usuarios
  for each row execute function public.definir_updated_at();

-- ------------------------------------------------------------------ cadastro → perfil
-- O app envia nome, telefone e data_nascimento em options.data do signUp.
-- Se algum faltar ou for inválido, o insert falha e o cadastro inteiro é desfeito.
create function public.criar_usuario_do_cadastro()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  dados jsonb := coalesce(new.raw_user_meta_data, '{}'::jsonb);
begin
  insert into public.usuarios (id, nome, email, telefone, data_nascimento)
  values (
    new.id,
    btrim(dados ->> 'nome'),
    lower(new.email),
    dados ->> 'telefone',
    (dados ->> 'data_nascimento')::date
  );
  return new;
end;
$$;

create trigger ao_cadastrar_usuario
  after insert on auth.users
  for each row execute function public.criar_usuario_do_cadastro();

-- ------------------------------------------------------------------ troca de e-mail
create function public.sincronizar_email_usuario()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.usuarios set email = lower(new.email) where id = new.id;
  return new;
end;
$$;

create trigger ao_trocar_email_usuario
  after update of email on auth.users
  for each row
  when (old.email is distinct from new.email)
  execute function public.sincronizar_email_usuario();

revoke execute on function public.definir_updated_at() from public, anon, authenticated;
revoke execute on function public.criar_usuario_do_cadastro() from public, anon, authenticated;
revoke execute on function public.sincronizar_email_usuario() from public, anon, authenticated;
