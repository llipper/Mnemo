# Context Runtime

> **Persistent project memory for AI coding agents.**

Projeto **open-source, gratuito e local-first** para fornecer memória persistente, decisões, estado e contexto otimizado para agentes de programação.

O Context Runtime **não é um SaaS**, não é uma IDE e não é outro agente de programação.

Ele roda localmente no terminal dentro do projeto e funciona como uma camada compartilhada entre ferramentas como:

```text id="8w4d2v"
Claude Code
Codex
Gemini CLI
outros agentes compatíveis
```

A ideia central é simples:

> **O modelo pode mudar. A memória do projeto permanece.**

---

# 1. Problema

Hoje um desenvolvedor pode trabalhar usando:

```text id="8aqk26"
Claude Code
     ↓
Codex
     ↓
outro agente
     ↓
Claude novamente
```

Cada agente possui seu próprio contexto.

Ao trocar de agente ou iniciar uma nova sessão, parte do projeto precisa ser reconstruída:

* o que estava sendo feito;
* o que já foi concluído;
* decisões tomadas;
* arquitetura atual;
* abordagens rejeitadas;
* erros anteriores;
* restrições;
* próximos passos;
* arquivos relevantes.

Isso gera:

```text id="xd45im"
releitura
+
tokens
+
tempo
+
inconsistências
```

O Context Runtime mantém esse conhecimento **fora dos modelos**.

---

# 2. Nova arquitetura

```text id="42wjfl"
             DESENVOLVEDOR
                   │
                   ▼
              Terminal
                   │
                   ▼
          ┌─────────────────┐
          │ Context Runtime │
          │     LOCAL       │
          └────────┬────────┘
                   │
        ┌──────────┼──────────┐
        │          │          │
        ▼          ▼          ▼
    Claude       Codex     Gemini CLI
     Code                    / outros
        │          │          │
        └──────────┼──────────┘
                   │
                   ▼
               Projeto
```

Não existe servidor obrigatório.

Não existe conta obrigatória.

Não existe assinatura.

Não existe dashboard obrigatório.

---

# 3. Experiência desejada

O usuário instala:

```bash id="pc7b14"
npm install -g context-runtime
```

ou futuramente:

```bash id="8n0hzy"
brew install context-runtime
```

Entra no projeto:

```bash id="d3cxxr"
cd meu-projeto
```

Executa:

```bash id="ve8k75"
ctx
```

O Context Runtime identifica:

```text id="f7xz2c"
✓ Git repository detected
✓ Project detected: Next.js
✓ Node.js detected
✓ Claude Code detected
✓ Codex detected

Context Runtime ready.
```

Então:

```text id="9ysu2n"
Select agent

> Claude Code
  Codex
  Gemini
  Auto
```

Ou diretamente:

```bash id="2fb6kl"
ctx claude
```

```bash id="7h57bd"
ctx codex
```

---

# 4. O ponto mais importante

O Context Runtime **não substitui** o Claude Code ou Codex.

Ele inicia o agente com o contexto correto.

Exemplo:

```bash id="q3ey4p"
ctx codex
```

Internamente:

```text id="0ad3gz"
1. Detect project

2. Read current state

3. Determine current task

4. Retrieve relevant decisions

5. Retrieve constraints

6. Retrieve previous failures

7. Build minimal context

8. Start Codex

9. Provide context

10. Observe resulting project changes

11. Update memory
```

---

# 5. Primeiro uso

Ao executar:

```bash id="3wy6pu"
ctx
```

pela primeira vez:

```text id="jz48jr"
No Context Runtime found.

Initialize project memory?

> Yes
```

Cria:

```text id="z1bq11"
project/
│
├── .context/
│   ├── context.db
│   ├── config.json
│   ├── state.json
│   └── logs/
│
├── .contextignore
│
├── src/
├── package.json
└── ...
```

---

# 6. Bootstrap inteligente

O Context Runtime não deve enviar imediatamente o repositório inteiro para uma IA.

Primeiro executa análise local barata.

Identifica:

```text id="b6g77a"
package.json

pyproject.toml

Cargo.toml

go.mod

Dockerfile

docker-compose.yml

.git

README

migrations

principais diretórios
```

Constrói um mapa inicial.

Exemplo:

```text id="hhd4gl"
PROJECT

Type:
Next.js application

Language:
TypeScript

Database:
PostgreSQL

Important directories:
src/
app/
components/
lib/
db/

Infrastructure:
Docker

Git:
yes
```

Somente informações necessárias são enviadas ao agente.

---

# 7. Funcionamento entre agentes

Imagine que o usuário execute:

```bash id="q2wpx5"
ctx claude
```

Claude trabalha durante algum tempo.

Durante a sessão são registrados eventos:

```text id="eazd2h"
TASK_STARTED

FILE_CHANGED

FILE_CREATED

DECISION_DETECTED

ERROR_OCCURRED

ATTEMPT_FAILED

TASK_COMPLETED
```

O Memory Engine processa esses eventos.

Ao terminar:

```text id="swtc66"
Checkpoint CP-0042 created.
```

Depois o usuário executa:

```bash id="1cq2qi"
ctx codex
```

Codex não precisa receber a conversa do Claude.

Recebe:

```text id="hjxip4"
PROJECT STATE

Current goal:
Authentication system.

Completed:
- Firebase integration
- Token validation

Current task:
Role middleware.

Important decisions:
- Firebase handles authentication.
- PostgreSQL handles authorization.

Constraints:
- Never authorize by email.
- Authorization happens server-side.

Previous failure:
- Client-side authorization was rejected.

Relevant files:
- src/auth/firebase.ts
- src/middleware/auth.ts
- db/schema/users.sql

Last checkpoint:
CP-0042
```

E continua.

---

# 8. Agente auxiliar de memória

A arquitetura possui dois papéis diferentes.

```text id="up8wx8"
┌────────────────────┐
│ Coding Agent       │
│                    │
│ Claude / Codex     │
└─────────┬──────────┘
          │
        events
          │
          ▼
┌────────────────────┐
│ Memory Engine      │
│                    │
│ small / local      │
└─────────┬──────────┘
          │
          ▼
     context.db
```

O Coding Agent resolve problemas.

O Memory Engine mantém continuidade.

O Memory Engine deve ser muito mais barato.

Sempre que possível:

```text id="y2hwqt"
rules
parsers
Git
AST
SQLite
heuristics
```

devem ser usados antes de chamar qualquer modelo.

---

# 9. Modelo pequeno opcional

O usuário poderá escolher como interpretar eventos complexos.

Exemplo:

```text id="n6dsnt"
memory_engine:

  mode: local

  model:
    provider: ollama
    model: qwen-small
```

Ou:

```text id="ezugof"
memory_engine:

  provider: existing_agent
```

Nesse caso o próprio agente atual pode realizar pequenas operações de memória.

O projeto não deve exigir API paga para funcionar.

---

# 10. Memória incremental

Essa é uma regra arquitetural importante.

Não fazer:

```text id="v5m9jp"
Conversation: 80k tokens
        ↓
LLM
        ↓
Summary
```

Preferir:

```text id="k8lzuj"
event
 ↓
update

event
 ↓
update

event
 ↓
update
```

Exemplo:

```text id="stbrwi"
git diff
    ↓
FILE_CHANGED
    ↓
classify
    ↓
update relationship
```

O custo cresce com as **mudanças**, não com todo o histórico acumulado.

---

# 11. Tipos de memória

Inicialmente:

```text id="j80oq2"
FACT

DECISION

CONSTRAINT

TASK

FAILURE

CHECKPOINT

ASSUMPTION
```

Não transformar automaticamente toda conversa em memória.

---

# 12. Decision Memory

Exemplo:

```text id="6tzhgn"
D-001

Decision:
Use PostgreSQL.

Status:
SUPERSEDED

Superseded by:
D-018
```

Atual:

```text id="6q3udl"
D-018

Decision:
Use PostgreSQL hosted on Neon.

Status:
ACTIVE
```

Quando outro agente assumir, recebe apenas `D-018`.

Se precisar:

```bash id="zqxgzg"
ctx why database
```

O histórico completo poderá ser consultado.

---

# 13. Failure Memory

Exemplo:

```text id="0amw2b"
F-014

Attempt:
Use email as authorization identity.

Result:
FAILED

Reason:
Email can change.

Resolution:
Use immutable authentication UID.
```

Outro agente tentando repetir:

```text id="lqqi63"
⚠ Previous failed approach detected.

F-014
```

---

# 14. Context Compiler

Quando o usuário executa:

```bash id="2rl55p"
ctx codex
```

o runtime monta um pacote.

Não simplesmente:

```text id="y53ev3"
dump(memory)
```

Ele seleciona:

```text id="64a5qi"
CURRENT STATE

CURRENT TASK

CRITICAL CONSTRAINTS

ACTIVE DECISIONS

RELEVANT FAILURES

RELEVANT FILES

LAST CHECKPOINT
```

---

# 15. Token Budget

Configuração:

```json id="5lqxrx"
{
  "contextBudget": 2000
}
```

Ou:

```bash id="yypkac"
ctx codex --context-budget 2000
```

O runtime tenta permanecer dentro desse limite.

Exemplo:

```text id="z44d0c"
Available memory:
142,804 tokens

Context selected:
7,421

Context compiled:
1,847

Avoided:
140,957

Reduction:
98.7%
```

---

# 16. Contexto progressivo

O agente recebe primeiro somente o essencial.

Se precisar:

```text id="2nyl3q"
ctx.memory.get("authentication")

ctx.memory.why("database")

ctx.memory.failures("authorization")

ctx.memory.related("user_roles")
```

A informação adicional é recuperada sob demanda.

---

# 17. Integração ideal: MCP

Uma das formas de integração poderá ser um servidor MCP local.

```text id="4h6wh3"
Context Runtime
       │
       │ MCP
       ▼
Coding Agent
```

Ferramentas:

```text id="8ed42n"
memory_get

memory_search

memory_decisions

memory_failures

memory_constraints

memory_checkpoint

project_state

project_context

report_decision

report_failure

report_task_complete
```

Assim agentes compatíveis podem conversar diretamente com o Context Runtime.

---

# 18. Integração por arquivos

Nem todo agente precisa suportar a mesma integração.

O runtime também poderá gerar arquivos compatíveis com diferentes ferramentas.

Conceitualmente:

```text id="8cn0gi"
Context Runtime
       ↓
Adapter
       ↓
Claude / Codex / outro
```

Cada adapter conhece apenas:

```text id="22w4i7"
como iniciar o agente

como fornecer contexto

como disponibilizar ferramentas

como observar encerramento

como recuperar eventos
```

O núcleo não depende de um fornecedor específico.

---

# 19. Adapter Architecture

Estrutura:

```text id="n5irun"
src/
├── core/
│   ├── memory/
│   ├── context/
│   ├── events/
│   ├── repository/
│   └── checkpoints/
│
├── adapters/
│   ├── claude/
│   ├── codex/
│   ├── gemini/
│   └── generic/
│
├── mcp/
│
└── cli/
```

Interface:

```ts id="lsvrpo"
interface AgentAdapter {
  detect(): Promise<boolean>

  start(context: ContextPackage): Promise<void>

  capabilities(): AgentCapabilities
}
```

---

# 20. Comandos principais

Inicializar:

```bash id="2mr59g"
ctx init
```

Abrir agente:

```bash id="6xg1qy"
ctx claude
```

```bash id="6lwrbx"
ctx codex
```

Modo automático:

```bash id="g1yibd"
ctx
```

Estado:

```bash id="ueg5v2"
ctx status
```

Contexto:

```bash id="6tt0of"
ctx context
```

Decisões:

```bash id="jfyxx8"
ctx decisions
```

Falhas:

```bash id="3rh3qv"
ctx failures
```

Checkpoint:

```bash id="m4pno4"
ctx checkpoint
```

Histórico:

```bash id="o1nqwf"
ctx history
```

Diagnóstico:

```bash id="74wkp1"
ctx doctor
```

---

# 21. Comando mais importante

Idealmente o usuário acaba usando praticamente:

```bash id="34g6t9"
ctx
```

O runtime pergunta:

```text id="pxf3y7"
Continue with:

> Claude Code
  Codex
  Gemini
```

Depois:

```text id="uhgq8e"
Restoring project context...

Checkpoint:
CP-042

Context:
1,728 tokens

3 active decisions
2 critical constraints
1 relevant failure

Starting Codex...
```

E o terminal passa para o agente.

---

# 22. Encerramento

Quando o processo do agente termina:

```text id="0z0y0h"
Agent session finished.

Analyzing changes...

✓ 7 files changed
✓ 1 task completed
✓ 2 decisions detected
✓ 1 failed approach recorded

Checkpoint CP-043 created.

Memory updated.
```

Na próxima sessão, qualquer agente continua dali.

---

# 23. Git como fonte de verdade

O sistema não deve tentar substituir Git.

Git responde:

```text id="7a30o9"
WHAT changed?
WHEN?
WHO?
```

Context Runtime responde:

```text id="lwj7ws"
WHY?

WHAT WAS DECIDED?

WHAT FAILED?

WHAT IS CURRENT?

WHAT SHOULD HAPPEN NEXT?
```

Os dois sistemas trabalham juntos.

---

# 24. Open source

O projeto será:

```text id="b0aw2d"
Open source
Free
Local-first
Provider-independent
Model-independent
```

Objetivo:

> Qualquer desenvolvedor pode instalar e utilizar sem criar conta.

Uma licença permissiva poderá ser considerada, por exemplo:

```text id="3ekcge"
Apache-2.0

ou

MIT
```

A escolha definitiva será feita posteriormente.

---

# 25. Sem backend obrigatório

A arquitetura inicial não possui:

```text id="6twj01"
API central

PostgreSQL remoto

Redis

login

billing

telemetria obrigatória
```

Tudo necessário para o funcionamento básico reside localmente.

---

# 26. Banco

Primeira implementação:

```text id="sqo1bp"
.context/context.db
```

SQLite.

Tabelas:

```text id="g8dz77"
projects
memories
decisions
constraints
tasks
failures
checkpoints
events
entities
relationships
sources
context_packages
```

---

# 27. Segurança

O Context Runtime nunca deve deliberadamente armazenar:

```text id="i8d48j"
API keys
passwords
tokens
cookies
private keys
credentials
```

Antes da persistência:

```text id="2ewg8w"
Event
 ↓
Secret Scanner
 ↓
Sanitizer
 ↓
Memory Engine
```

Suporte:

```text id="dpfqpx"
.contextignore
```

---

# 28. Offline

O núcleo deve funcionar offline.

Recursos que não precisam de modelo:

```text id="wkd4kh"
Git inspection

repository mapping

SQLite

event storage

decision retrieval

constraint retrieval

checkpoints

token estimation

context compilation básico
```

LLMs devem ser complementares, não uma dependência arquitetural obrigatória.

---

# 29. MVP real

## Fase 1 — Core

Construir:

```text id="62k9o8"
CLI

SQLite

Git integration

Event Store

Decision Store

Constraint Store

Failure Store

Task Store

Checkpoint Engine
```

---

## Fase 2 — Context

Construir:

```text id="i2dn8h"
Context Router

Context Compiler

Token Budget

Scope system

Current State
```

---

## Fase 3 — Primeiro adapter

Escolher **um agente primeiro**.

Implementar:

```text id="1f26bb"
ctx <agent>
```

Validar:

```text id="lh8txg"
start
→
context
→
work
→
events
→
checkpoint
→
resume
```

Somente depois implementar outros adapters.

---

## Fase 4 — MCP

Expor memória através de ferramentas locais.

---

## Fase 5 — Memory Agent

Adicionar interpretação inteligente incremental.

Pode utilizar:

```text id="fr1c70"
modelo local pequeno

ou

modelo já disponível no agente
```

---

# 30. Teste definitivo

Sessão 1:

```text id="3idk7k"
ctx claude
```

Claude cria uma feature.

Encerra.

Context Runtime cria:

```text id="8n9fq4"
CP-001
```

Sessão 2:

```text id="y6tvgx"
ctx codex
```

Codex recebe aproximadamente:

```text id="5mhbph"
1–2k tokens
```

Sem receber a conversa do Claude.

Codex deve conseguir responder corretamente:

```text id="ntg0xl"
O que estamos fazendo?

O que já foi feito?

Por que foi feito assim?

O que não posso mudar?

O que já deu errado?

Qual é o próximo passo?

Quais arquivos importam?
```

Se conseguir e continuar o desenvolvimento corretamente, o conceito foi validado.

---

# 31. Métrica principal

Não medir simplesmente:

```text id="pztd3w"
quantidade de memórias
```

Medir:

```text id="fpcx5v"
Context Efficiency
```

Conceitualmente:

```text id="a1qfcf"
informação útil entregue
────────────────────────
tokens enviados
```

Outras métricas locais:

```text id="dvhvbg"
Tokens avoided

Stale memories prevented

Repeated failures prevented

Agent handoffs

Context compilation time

Context retrieval precision
```

---

# 32. Filosofia

## Model is compute.

## Project owns memory.

## Git owns history.

## Context Runtime owns continuity.

---

# 33. Regra arquitetural

Nunca exigir que um agente leia toda a memória.

Nunca exigir que um agente leia toda a conversa anterior.

Nunca tratar uma conversa inteira como estado.

Nunca tratar uma decisão antiga como atual sem verificar seu status.

Nunca enviar contexto irrelevante apenas porque existe espaço na janela do modelo.

---

# 34. Visão

Hoje:

```text id="7izpxz"
Claude memory
Codex memory
Gemini memory
IDE memory
```

Cada ambiente é uma ilha.

A proposta:

```text id="ob58wz"
                  Claude
                     │
                     │
Codex ───── Context Runtime ───── Gemini
                     │
                     │
                 Other AI
```

Uma memória.

Vários agentes.

---

# 35. Definição final

**Context Runtime é uma ferramenta open-source e local-first executada pelo terminal que mantém o estado, decisões, restrições, falhas e continuidade de projetos entre diferentes agentes de programação, compilando apenas o contexto necessário para cada tarefa.**

O modelo pode ser substituído.

A sessão pode terminar.

A ferramenta pode mudar.

**O projeto não esquece.**

---

# 36. Primeira implementação

Não começar pelo Memory Agent inteligente.

Começar pelo fluxo mínimo:

```text id="gvzbqx"
ctx init
    ↓
SQLite

ctx decide
    ↓
Decision Store

ctx checkpoint
    ↓
Project State

ctx context
    ↓
Context Compiler

ctx <primeiro-agent>
    ↓
Agent Adapter
```

Depois provar:

```text id="mpqf0a"
Agent A
  ↓
checkpoint
  ↓
Agent B
```

sem entregar ao Agent B a conversa completa do Agent A.

Essa é a primeira milestone real do projeto.
