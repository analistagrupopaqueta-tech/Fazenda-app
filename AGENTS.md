<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Contexto do Projeto: Fazenda Viçosa (fazenda-app)

## Features do Sistema — Fazenda App v5

### 🔄 Features Adaptadas (já existiam, foram modificadas)

**Autenticação**
- Login com email e senha.
- Perfil global único por usuário (gestor ou operador).
- Gestor cria operadores via Edge Function (`criar-usuario` no Supabase).
- Primeiro gestor criado manualmente via SQL no painel do Supabase.

**Lote**
- CRUD completo (só gestor).
- Campos: nome, descrição, número de animais, peso médio, ativo.
- Agora isolado por fazenda (`fazenda_id` obrigatório).
- Nome único por fazenda (não mais global).

**Piquete**
- CRUD completo (só gestor).
- Campos: nome, área (ha), ativo.
- Agora isolado por fazenda (`fazenda_id` obrigatório).
- Nome único por fazenda (não mais global).
- Novo campo: aproveitamento do pasto (percentual 0–100%, opcional).
- Relação com lote inferida via `movimentacao_gado` (sem FK direta).

**Movimentação de Gado**
- Registro de entrada e saída por lote e piquete.
- Entrada exige quantidade obrigatória.
- Altura do pasto opcional — 5 medições + média calculada automaticamente pelo banco.
- Constraint: todas as alturas ou nenhuma (tudo ou nada).
- Agora isolado por fazenda (`fazenda_id` obrigatório).
- Novo campo: qualidade do solo (Bom, Sementado, Seco).

**Chuva**
- Registro de data, volume (mm) e observação.
- Agora isolado por fazenda (`fazenda_id` obrigatório).

**Cocho**
- Registro de kg por lote e data.
- Agora isolado por fazenda (`fazenda_id` obrigatório).

**Atividade no Campo**
- Fluxo condicional: Tipo → Modalidade → Produto → Unidade → Volume.
- Constraints de negócio aplicadas no banco:
  - **Adubação** → modalidade: Manual ou Trator | unidade: Sacos ou Kg | sem produto.
  - **Herbicida** → modalidade: Costal, Stihl ou Trator | unidade: Baldes ou Jatão | com produto.
  - **Roçagem** → modalidade: Foice, Roçadeira ou Enxada | sem unidade | produto opcional.
- Produto agora é FK para tabela `produto` (era enum fixo).
- Novo campo: `quantidade_unidade` — obrigatório quando unidade for Sacos ou Baldes.
- Agora isolado por fazenda (`fazenda_id` obrigatório).

**Produtos**
- Antes: enum fixo no banco (`produto_atividade`).
- Agora: tabela dinâmica por fazenda.
- Gestor cadastra e gerencia produtos pelo sistema.
- Cada produto vinculado a uma categoria fixa.
- Produtos iniciais pré-cadastrados por categoria.

### 🆕 Features Novas

**Fazenda**
- Criar fazenda — só gestor.
- Editar fazenda (nome, localização).
- Listar fazendas do usuário.
- Trocar de fazenda ativa — usuário alterna entre fazendas no app.
- Dados completamente isolados entre fazendas.

**Vínculo Usuário ↔ Fazenda**
- Tabela `fazenda_usuario` como ponte entre usuários e fazendas.
- Gestor vincula operadores à fazenda.
- Um usuário pode pertencer a várias fazendas.
- RLS garante que ninguém acessa dados de fazenda alheia.

**Categorias de Produto**
- Fixas no banco — Adubação, Herbicida, Roçagem.
- Globais: mesmas categorias para todas as fazendas.
- Base para filtrar produtos no formulário de atividade.
- Ninguém cria ou edita categorias pelo app.

**Produtos Dinâmicos**
- Gestor cadastra novos produtos pelo sistema.
- Produtos vinculados à categoria e à fazenda.
- Listagem filtrada por categoria no formulário.
- Produtos iniciais pré-inseridos no schema:
  - Adubação: Ureia, Super simples, Calcário, Potássio, Bufa de Mineiro.
  - Herbicida: Tiririca, Amargoso, Capim, Limão.
  - Roçagem: Tiririca, Amargoso, Capim, Limão.

**Qualidade do Solo**
- Campo opcional na movimentação de gado.
- Enum fixo: Bom, Sementado, Seco.

**Quantidade de Unidade**
- Campo obrigatório quando unidade for Sacos ou Baldes.
- Indica quantos sacos ou baldes foram utilizados na atividade.

**Aproveitamento do Pasto**
- Campo opcional no piquete.
- Percentual numérico de 0 a 100%.
- Indica quanto do pasto foi consumido pelo gado.

**Funções de Segurança no Banco**
- `is_gestor()` — verifica se o usuário logado é gestor.
- `tem_acesso_fazenda(fazenda_id)` — verifica se o usuário pertence à fazenda.
- Ambas com SECURITY DEFINER — usadas pelas políticas RLS.

### 🔐 Permissões por Perfil

| Feature | Gestor | Operador |
|---|---|---|
| Criar fazenda | ✅ | ❌ |
| Editar fazenda | ✅ | ❌ |
| Trocar fazenda ativa | ✅ | ✅ |
| CRUD lote | ✅ | ❌ |
| Ver lote | ✅ | ✅ |
| CRUD piquete | ✅ | ❌ |
| Ver piquete | ✅ | ✅ |
| Registrar aproveitamento do pasto | ✅ | ❌ |
| CRUD produtos | ✅ | ❌ |
| Ver produtos | ✅ | ✅ |
| Criar operadores | ✅ | ❌ |
| Registrar chuva | ✅ | ✅ |
| Registrar movimentação de gado | ✅ | ✅ |
| Registrar cocho | ✅ | ✅ |
| Registrar atividade no campo | ✅ | ✅ |

### 🗄️ Enums do Banco

| Enum | Valores |
|---|---|
| `perfil_tipo` | gestor, operador |
| `tipo_operacao` | Entrada, Saída |
| `tipo_atividade` | Adubação, Herbicida, Roçagem |
| `modalidade_atividade` | Manual, Trator, Costal, Stihl, Foice, Roçadeira, Enxada |
| `unidade_atividade` | Sacos, Kg, Baldes, Jatão |
| `qualidade_solo` | Bom, Sementado, Seco |

## Requisitos do Projeto
- **Controle de Acesso (RBAC):** Dois perfis (`gestor` e `operador`). Módulos de Lotes, Piquetes e Usuários acessíveis apenas a gestores. Proteção via Middleware e Route Handlers.
- **Validação Rigorosa:** Bloqueio de datas futuras e de inputs negativos. Botão de "Salvar" (`submit`) deve permanecer desabilitado se os dados obrigatórios não forem preenchidos (Validação Incremental).
- **UI Otimista / Server Refresh:** Após qualquer mutação (POST/PUT/DELETE) bem sucedida no client, chamar `router.refresh()` para refletir instantaneamente a atualização no banco.
- **Backend For Frontend (BFF):** Nenhuma mutação é feita diretamente do client para o Supabase. Todas as operações passam por Route Handlers (`/api/*`).

## Tecnologias Usadas
- **Framework:** Next.js 16.2.4 (App Router)
- **Linguagem:** TypeScript 5
- **UI:** React 19 + Tailwind CSS 4
- **Banco de Dados / BaaS:** Supabase (PostgreSQL, Auth e Edge Functions)
- **Autenticação e Sessão:** `@supabase/ssr` (baseado em cookies SSR)

## Design System
- Desenvolvido utilizando as novas diretrizes do Tailwind CSS v4, com o escopo configurado em `@theme inline` dentro do `app/globals.css`.
- **Cores do Tema:**
  - `--primary`: `#2d5016` (Verde escuro)
  - `--primary-light`: `#7cb342` (Verde claro)
  - `--accent`: `#b8860b` (Dourado/Amarelo)
  - `--error`: `#dc2626` (Vermelho)
  - `--text`: `#1f2937` (Cinza escuro)
  - `--bg`: `#fafafa` (Cinza claro para fundos)
- **Tipografia:** Definida globalmente (Geist, Merriweather, Poppins).

## Padrões de Projeto e Arquitetura
- **Server/Client Split Rigoroso:**
  - `page.tsx`: *Server Components*. Buscam os dados no servidor e passam via props (proteção das chaves, maior segurança).
  - `*Client.tsx`: *Client Components*. Tratam estado (formulários, interações) e as chamadas via `fetch` para a API (BFF).
- **Clientes do Supabase por Contexto:**
  - `server.ts`: Cliente para Server Components e Route Handlers. Usa Cookies para preservar a autenticação.
  - `client.ts`: Cliente anon/public para o Client (quando necessário).
  - `admin.ts`: Apenas em endpoints internos restritos que exigem `service_role`.
- **Discriminadores em Tipagem:** Para formulários de CRUD, uso do padrão Discriminant Union: `{ tipo: 'criar' } | { tipo: 'editar'; registro: Entidade }`. Isso previne inconsistências de estado.
