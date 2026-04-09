# MANTIX PCM v2 — Especificação Técnica Completa

> **Documento para uso como prompt-base no Cursor AI.**
> Atualizado em: 09/04/2026
> Schema de referência: `supabase-schema-v2.sql`
> Stack: Next.js 14 (App Router) + Supabase + Tailwind CSS + shadcn/ui
> Deploy: Vercel | DB: Supabase Cloud

---

## 1. Visão do Produto

### O que é o Mantix

Sistema de **PCM (Planejamento e Controle de Manutenção) + Controle Metrológico** para prestadoras de serviço de manutenção industrial e PMEs industriais de pequeno e médio porte (5 a 50 técnicos).

Substitui planilhas de Excel e controles manuais por um sistema web/mobile que gerencia ativos produtivos, instrumentos de medição, planos preventivos, ordens de serviço com checklist fotográfico, calibrações com certificados anexados, e gera relatórios automáticos com rastreabilidade para auditorias ISO 9001.

### Quem usa

| Persona | O que faz no sistema |
|---------|---------------------|
| **Gestor / PCM** | Cadastra ativos, cria planos preventivos, monitora dashboard, gera relatórios, controla calibrações |
| **Técnico de campo** | Recebe OS no celular, preenche checklist com fotos, registra conclusão com assinatura |
| **Administrador** | Gerencia empresa, usuários, categorias, configurações |

### Posicionamento competitivo

| Aspecto | Produttivo | Tractian | **Mantix** |
|---------|-----------|---------|-----------|
| Foco | Horizontal (qualquer setor) | Enterprise industrial (IoT + CMMS) | PME industrial (PCM + Metrológico) |
| Controle metrológico | Não tem | Parcial (via CMMS) | **Nativo** (calibrações, certificados, alertas, rastreabilidade) |
| Checklists | Genéricos customizáveis | Configuráveis | **Pré-montados para NR-13, NR-12, rotativos** + customizáveis |
| Grade de planejamento | Calendário simples | Sim | **Grade anual visual (ativo × mês)** — linguagem real do PCM |
| Imutabilidade / Auditoria | Básica | Sim | **Triggers no banco** — OS fechada e calibração são imutáveis |
| IA (fase 2) | Transcrição de áudio | Análise vibração/IoT | **Análise visual de fotos + contexto industrial** |
| Preço-alvo | ~R$200-500/mês | R$2.000+/mês | **R$300-1.000/mês** |
| Cliente típico | Empresa de facilities, HVAC | Fábrica grande (200+ funcionários) | **Prestadora de manutenção 5-50 técnicos** |

---

## 2. Arquitetura Técnica

### Stack

| Camada | Tecnologia | Justificativa |
|--------|-----------|---------------|
| Frontend | Next.js 14 (App Router) + React Server Components | SSR, performance, familiar ao dev |
| UI | Tailwind CSS + shadcn/ui | Componentes acessíveis, customizáveis, consistentes |
| Auth | Supabase Auth | Login email/telefone, JWT, multi-tenant via RLS |
| Database | Supabase (PostgreSQL 15) | RLS, Realtime, Edge Functions, pg_cron |
| Storage | Supabase Storage | Fotos (com thumbnails), certificados PDF |
| Deploy | Vercel | CD automático via GitHub, Edge Functions, domínio custom |
| Automação (fase 2) | n8n (Docker em VPS) | Alertas WhatsApp, geração de PDF, pipelines de IA |
| IA (fase 2) | Claude API (Vision) | Análise de fotos de campo, transcrição de áudio, resumo de serviço |

### Multi-tenancy

O sistema é multi-tenant por design. Toda tabela relevante possui `company_id` e está protegida por Row Level Security (RLS) usando a função helper `public.get_current_company_id()` para performance.

Regras:
- Usuário só acessa dados da sua empresa
- Admin pode editar configurações da empresa
- Manager e Technician não editam empresa
- Templates globais (`is_global = true`) são visíveis para todos em modo leitura
- Primeiro usuário de uma empresa é automaticamente `admin`

### Custo estimado de infraestrutura (MVP)

| Serviço | Custo mensal |
|---------|-------------|
| Vercel Pro | R$ 100 |
| Supabase Pro | R$ 125 |
| Domínio .com.br | R$ 10 |
| **Total** | **~R$ 235/mês** |

Nota: n8n e Claude API entram na fase 2, adicionando ~R$60/mês.

---

## 3. Módulos do MVP

### Módulo 1: Cadastro de Ativos (Semana 1)

Dois tipos de ativos no mesmo cadastro, diferenciados por `asset_type` com regras de consistência no banco (CHECK constraints):

**Equipamentos Produtivos** (`equipment`):
- Furadeiras, lixadeiras, geradores, compressores, tornos, soldas, etc.
- Campos: tag (código interno), nome, fabricante, modelo, nº série, localização (hierárquica), criticidade (A/B/C), foto, status (ativo/inativo/manutenção/descartado)
- Agrupados por categoria customizável e localização (Planta → Setor → Área)
- **Restrição**: não aceita campos de calibração preenchidos

**Instrumentos de Medição** (`instrument`):
- Paquímetros, torquímetros, multímetros, manômetros, micrômetros, etc.
- Todos os campos de equipamento + campos metrológicos obrigatórios:
  - Faixa de medição (ex: "0-150mm")
  - Resolução (ex: "0.01mm")
  - Precisão (ex: "±0.02mm")
  - Frequência de calibração em dias (obrigatório, > 0)
  - Data da última e próxima calibração
  - Empresa calibradora
  - Status da calibração (válido / vencendo / vencido / pendente)
- **Alerta visual**: badge verde (válido), amarelo (vence em 30 dias), vermelho (vencido)
- **Restrição**: obrigatoriamente precisa de frequência de calibração

**QR Code**: Cada ativo recebe QR Code gerado automaticamente. Ao escanear, abre a ficha do ativo com histórico completo de OS e calibrações.

**Telas:**
- `/assets` — Lista com filtros (tipo, categoria, localização, status, criticidade), busca por tag/nome, contadores por status
- `/assets/[id]` — Ficha do ativo com tabs: Dados Gerais | Histórico de OS | Calibrações | Fotos
- `/assets/new` — Formulário adaptativo (campos mudam conforme `asset_type` selecionado)
- `/assets/[id]/edit` — Edição (mesmo formulário adaptativo)

**Regras de negócio:**
- Tag é única por empresa
- Ao trocar status para "descartado", confirmar com modal
- Foto principal via upload ou câmera do dispositivo
- QR Code gerado com UUID do ativo, renderizado como SVG

---

### Módulo 2: Controle de Calibrações (Semana 1-2)

Gerencia o ciclo metrológico completo dos instrumentos com rastreabilidade para auditoria.

**Fluxo operacional:**
1. Instrumento cadastrado com frequência de calibração (ex: 365 dias)
2. Sistema calcula `next_calibration_date` automaticamente
3. Dashboard e painel de calibrações mostram alertas de vencimento
4. Instrumento é enviado para empresa calibradora externa
5. Ao retornar, o técnico registra: data da calibração, empresa, nº certificado, resultado (aprovado/reprovado/ajustado), custo
6. Upload do PDF do certificado (armazenado no Supabase Storage)
7. Certificado fica vinculado ao instrumento — acessível via QR Code
8. Sistema atualiza automaticamente `next_calibration_date` e `calibration_status` do ativo (trigger no banco)
9. Função `refresh_calibration_statuses()` roda diariamente via pg_cron para manter status atualizados

**Imutabilidade:** Calibração registrada é `is_locked = true` por padrão. Trigger impede qualquer UPDATE. Para corrigir erro, é necessário registrar nova calibração com nota explicativa.

**Telas:**
- `/calibrations` — Painel com 3 colunas visuais: Vencidas (vermelho) | Vencendo em 30 dias (amarelo) | Válidas (verde). Cada card mostra: tag, nome, dias restantes, empresa calibradora
- `/calibrations/new?asset_id=xxx` — Formulário de registro com upload de certificado PDF
- `/assets/[id]#calibrations` — Tab na ficha do ativo: histórico de calibrações com links para certificados

**Regras de negócio:**
- Só instrumentos (`asset_type = 'instrument'`) aparecem no painel de calibrações
- Calibração vencida mostra badge vermelho na ficha do ativo e na lista de ativos
- PDF do certificado é armazenado em `storage/calibrations/{company_id}/{asset_id}/{calibration_id}.pdf`
- Resultado "reprovado" marca instrumento com alerta especial

---

### Módulo 3: Planos de Manutenção Preventiva (Semana 2)

Substitui a planilha anual de preventivas com geração automática de OS.

**Configuração do plano:**
- Vincular a um ativo específico
- Nome e descrição do plano
- Frequência: diária, semanal, quinzenal, mensal, bimestral, trimestral, semestral, anual, ou custom (N dias)
- Vincular a um template de checklist (opcional)
- Técnico responsável padrão (`default_assignee`)
- Tempo estimado de execução (minutos)
- Janela de execução (`execution_window_days`): quantos dias antes do vencimento a OS é gerada (padrão: 3)
- Tolerância de atraso (`tolerance_days`): quantos dias após o vencimento ainda é aceitável (define `due_date` da OS)
- Centro de custo / setor (texto livre, para relatórios)
- Herdar criticidade do ativo (se sim, a OS gerada recebe prioridade proporcional: A→high, B→medium, C→low)

**Geração automática de OS:**
- Função `generate_preventive_work_orders()` roda diariamente às 06:00 BRT via pg_cron
- Verifica planos ativos onde `next_due_date` está dentro da janela de execução
- Cria OS com status `planned`, título automático (nome do plano + tag do ativo)
- Não duplica: se já existe OS planned/open/in_progress para o mesmo plano na mesma data, pula
- Após gerar, avança `next_due_date` conforme frequência do plano

**Grade anual (visualização principal):**
- Tabela visual: linhas = ativos, colunas = meses (Jan-Dez)
- Células coloridas por status: verde (concluída), amarelo (pendente/planejada), vermelho (atrasada), cinza (não programada)
- Clicar na célula abre a OS correspondente ou cria nova se não existir
- Filtros: ano, setor/localização, criticidade, responsável

**Telas:**
- `/plans` — Lista de planos ativos com status de próxima execução, ativo vinculado, frequência
- `/plans/[id]` — Detalhes do plano + histórico de execuções (lista de OS geradas)
- `/plans/new` — Formulário de criação de plano
- `/planning` — **Grade anual interativa** (principal ferramenta do gestor de PCM)
- `/planning?year=2026` — Grade filtrada por ano

---

### Módulo 4: Templates de Checklist (Semana 2-3)

Biblioteca de checklists reutilizáveis vinculados a planos ou usados em OS avulsas.

**Estrutura do template:**
- Nome, descrição, categoria (ex: "Preventiva", "Corretiva", "Inspeção NR-13")
- Grupos de itens (ex: "Parte Elétrica", "Parte Mecânica", "Segurança", "Lubrificação")
- Itens dentro de cada grupo com:
  - Descrição do que verificar
  - Tipo de resposta:
    - `check` — Conformidade: OK / NOK / NA
    - `measure` — Valor numérico com unidade e limites (min/max). Ex: "Temperatura: ___°C (limite: 60-80°C)"
    - `photo` — Foto obrigatória
    - `text` — Texto livre (observação)
    - `select` — Seleção de opções. Ex: "Bom | Regular | Ruim"
  - Foto obrigatória (flag por item)
  - Exige nota se NOK (flag por item, padrão: sim)
- Ordem dos itens (sort_order, com drag and drop na UI)
- Flag `is_global` para templates padrão do sistema (somente leitura para empresas)

**Templates pré-criados (valor imediato):**
1. Inspeção geral de equipamento rotativo (20 itens)
2. Preventiva de compressor de ar (25 itens)
3. Inspeção simplificada NR-13 — vasos de pressão (15 itens)
4. Inspeção simplificada NR-12 — máquinas e equipamentos (18 itens)
5. Checklist de recebimento de ativo novo (10 itens)
6. Verificação de instrumento de medição antes do uso (8 itens)

**Telas:**
- `/templates` — Biblioteca com filtros por categoria, busca por nome
- `/templates/[id]` — Editor visual: grupos e itens com drag and drop, preview do checklist
- `/templates/new` — Criar do zero ou duplicar existente
- `/templates/[id]/preview` — Visualização como o técnico vai ver no app

---

### Módulo 5: Ordens de Serviço (Semana 3-4)

Core operacional do sistema. OS digital completa com checklist, fotos, assinatura e rastreabilidade.

**Tipos de OS:**
- `preventive` — Gerada automaticamente pelo plano, ou criada manualmente
- `corrective` — Aberta manualmente quando algo quebra ou falha
- `inspection` — Verificação programada (ronda, inspeção visual)
- `calibration` — Vinculada ao módulo metrológico

**Ciclo de vida (status):**
```
planned → open → in_progress → completed
                              → cancelled
```

**Numeração:** Formato `WO-2026-000001`, sequencial por empresa (trigger `generate_wo_number()` com contador atômico na tabela `companies`). Nunca repete, nunca conflita entre tenants.

**Campos da OS:**
- Número (gerado automaticamente)
- Tipo, status, prioridade (low/medium/high/critical)
- Ativo vinculado (obrigatório)
- Plano de origem (se preventiva automática)
- Template de checklist vinculado
- Título e descrição
- Descrição da falha (para corretivas)
- Técnico atribuído
- Solicitante (texto livre — pode ser externo)
- Data programada, data de início, data de conclusão, data limite
- GPS (capturado automaticamente pelo app ao iniciar/concluir)
- Notas do técnico (texto)
- Resumo gerado por IA (campo `ai_summary`, preenchido assincronamente — fase 2)
- Assinatura digital do técnico (imagem capturada no canvas)
- Assinatura do cliente (opcional)
- Duração real (calculada: `completed_at - started_at`)

**Checklist da OS:**
- Ao abrir a OS, os itens do template vinculado são copiados para `work_order_items`
- Técnico preenche item a item no celular:
  - Check: toca OK, NOK ou NA
  - Measure: digita valor numérico (campo valida contra min/max, destaca em vermelho se fora)
  - Photo: abre câmera, captura, salva com timestamp e GPS
  - Text: campo de texto livre
  - Select: seleção de opção
- Se item é NOK e `requires_note_on_nok = true`, campo de nota fica obrigatório
- Se item tem `requires_photo = true`, OS não pode ser finalizada sem foto naquele item

**Finalização da OS:**
1. Técnico preenche todos os itens obrigatórios
2. Sistema valida: fotos obrigatórias presentes, medições dentro ou fora dos limites
3. Técnico assina digitalmente
4. Opcional: assinatura do cliente
5. Status muda para `completed`
6. Timestamp, duração e GPS são registrados
7. Relatório PDF é gerado automaticamente (fase 2: via n8n)
8. **Imutabilidade ativa**: triggers no banco impedem qualquer alteração na OS, itens e fotos após conclusão

**Telas:**
- `/work-orders` — Lista com filtros (status, tipo, técnico, ativo, período, prioridade), contadores por status
- `/work-orders/[id]` — Detalhes + checklist interativo para preenchimento
- `/work-orders/[id]/report` — Relatório visual (preview antes de gerar PDF)
- `/work-orders/new` — Criar OS manual (corretiva/inspeção) com seleção de ativo e template

---

### Módulo 6: Dashboard (Semana 4)

Visão executiva para o gestor de PCM. Primeira tela após login.

**KPIs principais** (via função `get_dashboard_kpis()`):
- Total de ativos ativos
- Total de instrumentos
- Calibrações vencidas (vermelho, com número)
- Calibrações vencendo em 30 dias (amarelo)
- Preventivas atrasadas (vermelho)
- OS abertas (em andamento)
- OS concluídas no mês
- Taxa de conformidade (% de planos em dia)

**Visualizações:**
- Cards de KPI com cor e ícone (topo da página)
- Gráfico de barras empilhadas: OS por mês (preventiva vs corretiva vs inspeção) — últimos 6 meses
- Lista de próximas ações: 5 próximas preventivas + 5 próximas calibrações a vencer
- Alertas em destaque: itens urgentes com link direto

**Tela:**
- `/dashboard` — Página inicial após login (rota padrão para autenticados)

---

## 4. Estrutura de Pastas

```
src/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   ├── register/page.tsx
│   │   └── layout.tsx              ← Layout público (sem sidebar)
│   ├── (app)/
│   │   ├── layout.tsx              ← Layout autenticado (sidebar + header + breadcrumb)
│   │   ├── dashboard/page.tsx
│   │   ├── assets/
│   │   │   ├── page.tsx            ← Lista de ativos
│   │   │   ├── [id]/page.tsx       ← Ficha do ativo (tabs)
│   │   │   ├── [id]/edit/page.tsx  ← Edição
│   │   │   └── new/page.tsx        ← Cadastro
│   │   ├── calibrations/
│   │   │   ├── page.tsx            ← Painel de calibrações (3 colunas)
│   │   │   └── new/page.tsx        ← Registrar calibração
│   │   ├── plans/
│   │   │   ├── page.tsx            ← Lista de planos
│   │   │   ├── [id]/page.tsx       ← Detalhes do plano
│   │   │   └── new/page.tsx        ← Criar plano
│   │   ├── planning/
│   │   │   └── page.tsx            ← Grade anual interativa
│   │   ├── work-orders/
│   │   │   ├── page.tsx            ← Lista de OS
│   │   │   ├── [id]/page.tsx       ← Detalhes + checklist
│   │   │   ├── [id]/report/page.tsx ← Preview do relatório
│   │   │   └── new/page.tsx        ← Criar OS manual
│   │   ├── templates/
│   │   │   ├── page.tsx            ← Biblioteca
│   │   │   ├── [id]/page.tsx       ← Editor de template
│   │   │   └── new/page.tsx        ← Criar template
│   │   └── settings/
│   │       ├── page.tsx            ← Configurações da empresa
│   │       ├── users/page.tsx      ← Gerenciar usuários
│   │       ├── categories/page.tsx ← Categorias de ativos
│   │       └── locations/page.tsx  ← Localizações
│   └── api/
│       ├── reports/[id]/route.ts   ← Geração de PDF
│       ├── cron/
│       │   ├── generate-os/route.ts    ← Endpoint para pg_cron ou Vercel Cron
│       │   └── refresh-calibrations/route.ts
│       └── webhooks/
│           └── n8n/route.ts        ← Webhook para automações
├── components/
│   ├── ui/                         ← shadcn/ui (button, card, dialog, table, etc.)
│   ├── assets/
│   │   ├── asset-form.tsx          ← Formulário adaptativo por tipo
│   │   ├── asset-list.tsx
│   │   ├── asset-card.tsx
│   │   └── qr-code-badge.tsx
│   ├── calibrations/
│   │   ├── calibration-panel.tsx   ← Painel 3 colunas
│   │   ├── calibration-form.tsx
│   │   └── calibration-history.tsx
│   ├── work-orders/
│   │   ├── wo-list.tsx
│   │   ├── wo-checklist.tsx        ← Checklist interativo
│   │   ├── wo-photo-capture.tsx    ← Câmera + upload
│   │   ├── wo-signature.tsx        ← Canvas de assinatura
│   │   └── wo-report-preview.tsx
│   ├── planning/
│   │   └── annual-grid.tsx         ← Grade anual (ativo × mês)
│   ├── dashboard/
│   │   ├── kpi-cards.tsx
│   │   ├── os-chart.tsx
│   │   └── upcoming-actions.tsx
│   └── shared/
│       ├── sidebar.tsx
│       ├── header.tsx
│       ├── breadcrumb.tsx
│       ├── status-badge.tsx
│       ├── criticality-badge.tsx
│       ├── calibration-badge.tsx
│       ├── photo-gallery.tsx
│       └── empty-state.tsx
├── lib/
│   ├── supabase/
│   │   ├── client.ts               ← createBrowserClient
│   │   ├── server.ts               ← createServerClient (RSC)
│   │   └── middleware.ts            ← Auth middleware
│   ├── utils.ts                    ← Formatação, datas, helpers
│   ├── constants.ts                ← Frequências, status, labels em PT-BR
│   └── types/
│       └── database.ts             ← Types gerados via `supabase gen types`
├── hooks/
│   ├── use-company.ts              ← Dados da empresa do usuário logado
│   ├── use-assets.ts
│   ├── use-work-orders.ts
│   ├── use-calibrations.ts
│   ├── use-plans.ts
│   └── use-dashboard.ts
└── styles/
    └── globals.css                 ← Tailwind base + variáveis customizadas
```

---

## 5. Regras de Negócio Consolidadas

### Ativos
1. Tag é única por empresa
2. Equipamento não aceita campos de calibração (CHECK constraint no banco)
3. Instrumento obrigatoriamente tem `calibration_frequency_days > 0` (CHECK constraint)
4. Ao descartar ativo, planos vinculados são desativados automaticamente
5. QR Code contém UUID do ativo — abre ficha completa ao escanear

### Calibrações
6. Calibração registrada é imutável (trigger `prevent_calibration_update`)
7. Ao registrar calibração, ativo é atualizado automaticamente (trigger `update_asset_on_calibration`)
8. Status de calibração é recalculado diariamente (pg_cron `refresh_calibration_statuses`)
9. Certificado PDF é armazenado no Supabase Storage com path estruturado
10. Para corrigir erro, registra-se nova calibração com nota — nunca edita a anterior

### Planos Preventivos
11. Frequência `custom` exige `frequency_days > 0` (CHECK constraint)
12. OS é gerada automaticamente quando `next_due_date` entra na janela de execução
13. Geração não duplica: verifica se já existe OS planned/open/in_progress para o plano
14. Após gerar, `next_due_date` avança conforme frequência
15. Prioridade da OS herda da criticidade do ativo se `inherits_criticality = true`

### Ordens de Serviço
16. Numeração `WO-YYYY-NNNNNN` sequencial por empresa (trigger atômico)
17. OS completa ou cancelada é imutável (trigger `prevent_closed_wo_update`)
18. OS completa não pode ser deletada (trigger `prevent_closed_wo_delete`)
19. Itens de checklist de OS fechada não podem ser alterados (trigger `prevent_closed_wo_items_update`)
20. Exceção: campo `ai_summary` pode ser atualizado após conclusão (processamento assíncrono)
21. Fotos obrigatórias devem ser preenchidas antes de finalizar
22. Medições fora dos limites (min/max) são destacadas visualmente mas não impedem conclusão

### Multi-tenant
23. Toda query filtra por `company_id` via RLS
24. Função `public.get_current_company_id()` é `STABLE SECURITY DEFINER` para performance
25. Templates globais são visíveis para todos, editáveis apenas por admin do sistema
26. Primeiro usuário da empresa é automaticamente `admin`

---

## 6. Sequência de Prompts para o Cursor

### Prompt 1 — Setup do projeto (Dia 1)
```
Crie um projeto Next.js 14 com App Router, TypeScript, Tailwind CSS e shadcn/ui.
Configure Supabase como backend (auth + database + storage).
Crie o layout autenticado com sidebar responsiva (colapsável no mobile),
header com nome do usuário e empresa, e breadcrumb automático.
Página de login com email/senha usando Supabase Auth.
Middleware que redireciona para /login se não autenticado e para /dashboard se autenticado.
O tema visual deve ser escuro (dark mode) com acento em amarelo/âmbar (#F59E0B).
Idioma da interface: Português do Brasil.
```

### Prompt 2 — Módulo de Ativos (Dia 2-3)
```
Crie o módulo de ativos com CRUD completo.
- Página /assets: tabela com colunas (tag, nome, tipo, categoria, localização, criticidade, status).
  Filtros por tipo (equipamento/instrumento), categoria, localização, status, criticidade.
  Busca por tag ou nome. Contador de resultados.
- Página /assets/new: formulário adaptativo — ao selecionar tipo "instrument", mostrar
  campos adicionais de calibração (faixa, resolução, precisão, frequência, empresa calibradora).
  Upload de foto principal. Seleção de categoria e localização em dropdowns.
- Página /assets/[id]: ficha do ativo com tabs (Dados Gerais, Histórico de OS, Calibrações, Fotos).
  Badge de criticidade (A=vermelho, B=amarelo, C=verde).
  Badge de calibração para instrumentos (válido/vencendo/vencido).
  QR Code renderizado como SVG.
- Página /assets/[id]/edit: mesmo formulário do cadastro, pré-preenchido.
Use Supabase para todas as operações. Respeite os tipos do schema v2.
```

### Prompt 3 — Módulo de Calibrações (Dia 3-4)
```
Crie o módulo de controle metrológico.
- Página /calibrations: painel visual com 3 colunas lado a lado:
  Vencidas (borda vermelha) | Vencendo em 30 dias (borda amarela) | Válidas (borda verde).
  Cada card mostra: tag do instrumento, nome, dias restantes (ou dias atrasado),
  empresa calibradora, data da próxima calibração.
  Clicar no card abre a ficha do ativo na tab calibrações.
- Página /calibrations/new?asset_id=xxx: formulário com campos:
  data da calibração, próxima data, empresa, nº certificado, resultado (aprovado/reprovado/ajustado),
  custo, notas, upload de PDF do certificado.
  Ao salvar, o trigger do banco atualiza o ativo automaticamente.
- Na ficha do ativo (/assets/[id]), tab Calibrações: histórico em timeline vertical,
  cada item mostrando data, empresa, resultado, link para download do certificado PDF.
Use Supabase Storage para os PDFs em: calibrations/{company_id}/{asset_id}/{calibration_id}.pdf
```

### Prompt 4 — Templates de Checklist (Dia 4-5)
```
Crie o módulo de templates de checklist.
- Página /templates: lista com nome, categoria, quantidade de itens, se é global.
  Botão "Duplicar" para copiar template existente.
- Página /templates/new: formulário com nome, descrição, categoria.
  Editor de itens: adicionar grupos (seções), dentro de cada grupo adicionar itens.
  Cada item tem: descrição, tipo (check/measure/photo/text/select),
  e configurações condicionais (min/max/unit para measure, options para select,
  requires_photo, requires_note_on_nok).
  Drag and drop para reordenar itens e grupos.
- Página /templates/[id]: mesmo editor, pré-preenchido. Preview lateral mostrando
  como o técnico vai ver no checklist.
Crie 3 templates globais seed: "Inspeção Geral de Equipamento Rotativo" (20 itens),
"Preventiva de Compressor de Ar" (15 itens), "Verificação de Instrumento de Medição" (8 itens).
```

### Prompt 5 — Ordens de Serviço (Dia 5-7)
```
Crie o módulo de ordens de serviço (OS).
- Página /work-orders: tabela com colunas (nº WO, título, tipo, ativo, técnico, status,
  prioridade, data programada). Filtros por status, tipo, técnico, ativo, período.
  Contadores no topo: Planejadas | Abertas | Em Andamento | Concluídas (este mês).
  Badges coloridos por status e prioridade.
- Página /work-orders/new: criar OS manual. Selecionar tipo (corretiva/inspeção),
  ativo (dropdown com busca), template de checklist (opcional), técnico, prioridade,
  data programada, descrição, descrição da falha (se corretiva).
- Página /work-orders/[id]: visualização completa da OS.
  Se status é planned/open: botão "Iniciar Atendimento" (muda para in_progress, registra started_at e GPS).
  Se status é in_progress: checklist interativo.
    Cada item do checklist renderizado conforme tipo:
    - check: 3 botões (OK verde, NOK vermelho, NA cinza)
    - measure: input numérico com indicação de limite. Vermelho se fora do range.
    - photo: botão de câmera que abre captura. Preview da foto após tirar.
    - text: textarea
    - select: radio buttons com opções
    Se item NOK e requires_note_on_nok: campo de nota aparece obrigatório.
  Área de notas gerais do técnico (textarea).
  Botão "Finalizar OS": valida itens obrigatórios, abre canvas de assinatura digital,
  salva com completed_at + GPS + duração calculada. Status muda para completed.
  Após finalizar: OS fica em modo somente leitura (itens, fotos, dados não editáveis).
- Página /work-orders/[id]/report: preview do relatório em formato imprimível.
  Cabeçalho com logo e dados da empresa. Dados do ativo. Checklist preenchido com fotos.
  Notas. Assinatura. Botão "Gerar PDF" (fase 2: via API route).
```

### Prompt 6 — Planos e Grade Anual (Dia 7-8)
```
Crie o módulo de planos preventivos e a grade anual de planejamento.
- Página /plans: lista de planos com colunas (nome, ativo, frequência, próxima data,
  técnico padrão, status ativo/inativo). Filtro por ativo, frequência, status.
- Página /plans/new: formulário com todos os campos do maintenance_plans v2:
  ativo (dropdown), nome, frequência (dropdown), frequência custom (input condicional),
  template de checklist (dropdown), técnico padrão (dropdown), tempo estimado,
  janela de execução, tolerância, centro de custo, herdar criticidade (toggle).
  Data da primeira execução (next_due_date).
- Página /plans/[id]: detalhes + lista de OS geradas por este plano.
- Página /planning: GRADE ANUAL INTERATIVA.
  Tabela: linhas = ativos (com tag e nome), colunas = meses do ano (Jan-Dez).
  Seletor de ano no topo. Filtros: localização, criticidade, responsável.
  Cada célula mostra o status da preventiva daquele ativo naquele mês:
  - Verde com check: concluída
  - Amarelo com relógio: planejada/pendente
  - Vermelho com X: atrasada
  - Cinza: não programada
  Clicar na célula: se tem OS, abre a OS. Se não tem, oferece criar OS manual.
  Use Supabase query para cruzar maintenance_plans com work_orders do período.
```

### Prompt 7 — Dashboard (Dia 8-9)
```
Crie a página /dashboard como tela inicial após login.
No topo: 4 cards de KPI em grid responsivo (2x2 no mobile, 4x1 no desktop):
- Total de ativos ativos (ícone de engrenagem, azul)
- OS abertas (ícone de clipboard, amarelo)
- Preventivas atrasadas (ícone de alerta, vermelho)
- Calibrações vencidas (ícone de calibrador, vermelho)
Cada card com número grande, label, e link "Ver todos →".

Abaixo: 2 colunas no desktop.
Coluna esquerda: gráfico de barras empilhadas (recharts) com OS por mês nos últimos 6 meses.
Cores: preventiva (azul), corretiva (vermelho), inspeção (verde).
Coluna direita: lista "Próximas Ações" com os 5 itens mais urgentes
(preventivas a vencer + calibrações a vencer), ordenados por data.
Cada item com badge de tipo, nome do ativo, data, link direto.

Abaixo: card de "Taxa de Conformidade" com gauge visual (porcentagem em círculo)
e texto explicativo.

Use a função get_dashboard_kpis() do Supabase para buscar os dados.
Use Supabase Realtime para atualizar automaticamente quando uma OS é concluída.
```

### Prompt 8 — Configurações (Dia 9-10)
```
Crie o módulo de configurações da empresa.
- Página /settings: dados da empresa (nome, CNPJ, logo, telefone, email, endereço).
  Upload de logo. Somente admin pode editar.
- Página /settings/users: lista de usuários com nome, email, role, status.
  Convidar novo usuário (envia email via Supabase Auth).
  Alterar role (admin/manager/technician). Desativar usuário.
- Página /settings/categories: CRUD de categorias de ativos (nome, tipo, ícone).
- Página /settings/locations: CRUD de localizações com hierarquia (parent_id).
  Visualização em árvore: Planta → Setor → Área.
```

---

## 7. Fase 2 — IA e Automação (Mês 2-3)

Itens para implementar após o MVP estar rodando com clientes:

1. **Geração de PDF via n8n**: webhook do Supabase ao completar OS → n8n gera PDF com template → salva no Storage → notifica gestor via WhatsApp
2. **Transcrição de áudio**: técnico grava áudio no campo de notas → Claude API transcreve e estrutura → preenche `technician_notes` automaticamente
3. **Resumo de OS por IA**: ao completar OS, Claude API recebe o checklist preenchido + notas → gera `ai_summary` em linguagem técnica limpa
4. **Validação de fotos por IA**: foto do técnico → Claude Vision analisa se mostra o componente correto, se está nítida, se etiqueta é legível → resultado em `ai_validation` do item
5. **Alertas via WhatsApp**: n8n monitora preventivas e calibrações → envia mensagem formatada para gestor via Evolution API / UAZAPI
6. **PWA offline**: Service Worker para funcionamento em áreas sem sinal → sincroniza quando voltar online

---

## 8. Métricas de Sucesso do MVP

| Métrica | Meta para validação |
|---------|-------------------|
| Tempo de cadastro de 1 ativo | < 2 minutos |
| Tempo de preenchimento de checklist (20 itens com fotos) | < 15 minutos |
| Tempo de registro de calibração | < 3 minutos |
| Relatório PDF gerado após conclusão | < 30 segundos |
| Uptime do sistema | > 99.5% |
| Satisfação do primeiro cliente (IPB) | NPS ≥ 8 |
| Clientes pagantes em 90 dias | ≥ 3 |
| MRR em 90 dias | ≥ R$ 1.500 |
