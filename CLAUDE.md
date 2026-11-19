# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Estado do projeto

Projeto "Painel EBD" — VocÊ é um desenvolvedor fullstack que evai realizar um projeto para uma Igreja, esse projeto também será seu tcc da faculdade. Esse Proejto tem  omo finalidade criar um app Saas de gerenciamento de uma escola bíbliba dominical que possui turmas, alunos, ofertas (balanço finaceiro). Nesse link contém o caminho do figma para ver o projeto que está com o nome Painel EBD https://www.figma.com/design/gdfq2ou9jzLJ24vHtT8Pbz/Sem-t%C3%ADtulo?node-id=0-1&p=f&t=RimThKBjpiDZn9XN-0. Para acessar a conta basta entrar com o google na conta joabpontes.junior@gmail.com

Regras específicas do Expo (versões, comandos, Expo Router): @AGENTS.md

## Comandos

- `npm install` — instalar dependências
- `npm start` — servidor de desenvolvimento (abrir no celular com o app **Expo Go** lendo o QR code)
- `npm run web` — rodar no navegador
- `npm run typecheck` — checagem de tipos (`tsc --noEmit`)
- `npx expo install <pacote>` — SEMPRE usar para adicionar dependências (resolve versões compatíveis com o SDK)
- Testes: _a definir_

## Arquitetura

React Native	0.88 (via Expo SDK 58)
React Native Paper	v5.x
Expo Router (rotas por arquivo em `src/app/`)
PostgreSQL (via Supabase)	v15+ — backend ainda não implementado (fase atual: só frontend, dados em `src/data/mock.ts`)
Git	v2.40+

Estrutura:
- `src/app/(auth)/` — login, cadastro, esqueci-senha
- `src/app/(app)/` — área logada com barra inferior (home, turmas, alunos, relatorios, perfil). O `TabList`/`TabTrigger` precisa ficar direto no `_layout.tsx` (o `Tabs` de `expo-router/ui` lê os triggers dos filhos diretos).
- `src/app/(app)/turmas/` e `src/app/(app)/alunos/` — mesma estrutura: `index` (lista com pesquisa, filtro, editar/vincular/ativar), `nova|novo` e `[id]` (usam `TurmaForm` / `AlunoForm`).
- `src/app/(app)/relatorios/` — `index` (trimestre: resumo com saldo, visão por domingo / por turma / gastos, fechar trimestre), `[data]` (lançamento de um domingo, `AAAA-MM-DD`, via `LancamentoForm`) e `gastos/novo` + `gastos/[id]` (via `GastoForm`).
- `src/data/gastos.ts` — REGRA dos gastos (revistas, insumos, outros): nome, tipo, descrição opcional, valor e data; a data define o trimestre de onde o valor é abatido (saldo = ofertas − gastos; a Home usa os gastos do período). Retroativo permitido com o pop-up "Deseja realizar lançamentos retroativos?"; trimestre fechado não recebe/altera/exclui gastos; data futura não.
- `src/app/(app)/perfil/` — `index` (dados cadastrais do usuário, segurança, sair), `dados` (editar nome, e-mail, nascimento, telefone) e `senha` (alterar senha em 3 etapas: código no e-mail → confirmar código → senha atual + nova).
- `src/data/senha.ts` — REGRA da alteração de senha (código de 6 dígitos no e-mail, validade 10 min, reenvio após 60 s, 5 tentativas, requisitos da nova senha) e o caminho previsto no Supabase Auth (`reauthenticate` + `updateUser({ password, nonce })`). Hoje só front: o código aparece num aviso "Demonstração" e a senha de teste é `SENHA_MOCK` (`ebd12345`).
- `src/data/relatorio.ts` — regras do relatório: lançamento por domingo e por turma (chamada com os alunos da turma → presentes = alunos marcados, matriculados = alunos da chamada; visitantes, total = presentes + visitantes, bíblias, revistas, ofertas), trimestres e fechamento. Trimestre fechado = só consulta (as turmas ficam congeladas no fechamento); no trimestre aberto só entram turmas ativas. O fechamento só é liberado depois do último dia do trimestre. Trimestre aberto anterior ao atual = bloqueado até alguém liberar os "lançamentos retroativos" (botão no `TrimestreCard` + pop-up de confirmação; `bloqueioDo()` / `retroativosLiberados` no contexto). A Home (ofertas, gastos e presença) lê esses dados. Home: balanço e presença têm filtros de período independentes (dia = última aula lançada, semana = domingo a sábado atual, mês, trimestre, ano), os dois começando no trimestre atual (`intervaloDoPeriodo` / `lancamentosDoIntervalo`); presença = presentes ÷ matriculados das aulas do período.
- `src/data/EscolaContext.tsx` — estado em memória do usuário logado (`usuario`, senha), de turmas, alunos e relatório (`aulas`, `fechamentos`); trocar por Supabase depois. Desativar = soft delete (`ativa`/`ativo: false`); só alunos ativos aparecem/contam nas turmas. O `EscolaProvider` fica no layout RAIZ, por fora do `PaperProvider`, porque os pop-ups (Portal do Paper) também usam os dados.
- `src/components/` — componentes reutilizáveis. Telas de lista: `ListScreenHeader` + `FilterChips` + `ListTable`/`ListRow`. Formulários: `FormScreen` + `FormStep` (etapas numeradas; a etapa de vínculo fica bloqueada até as anteriores). Relatório: TrimestreCard, ResumoTrimestre, DomingoCard, TurmaTrimestreCard, MetricRow (os 6 números lado a lado), ChamadaTurma (lista de presença com checkbox), CounterField/MoneyField, StatusPill, GastoCard/GastoForm. Avisos (Snackbar) usam `key={aviso?.id}` para reiniciar o tempo a cada aviso novo. Teclado: o Expo Go não tem `react-native-keyboard-controller`, então o `FormScreen` usa `KeyboardAvoidingView behavior="padding"` e rola até o campo; campos novos devem chamar `useRevelarCampo()(ref)` no `onFocus`. Também: FormField, PrimaryButton, ConfirmDialog, SearchBar, AlunoSelector, TurmaPicker, Avatar, PresenceBar, BalanceSummary, BottomNav.
- `src/utils/masks.ts` — máscaras (data, telefone), `parseDate`, `calcularIdade`, `iniciais`.
- `src/theme/` — tokens de cor, fontes e tema do Paper extraídos do Figma. Não usar hex soltos nas telas.
- `assets/icons/*.svg` — importados como componentes (react-native-svg-transformer, ver `metro.config.js`)
- Aliases: `@/` → `src/`, `@assets/` → `assets/`

## Ambiente

- Windows 11, shell PowerShell 5.1 (sem `&&`/`||`; use `;` ou `if ($?) { ... }`).
- Idioma de comunicação com o usuário: português- BR.
