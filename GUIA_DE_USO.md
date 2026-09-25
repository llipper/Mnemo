# Guia de uso do Mnemo

Este documento apresenta os comandos do Mnemo na ordem recomendada, desde a instalação local do código-fonte até o uso diário em projetos.

## 1. Requisitos

Antes de começar, confirme as ferramentas instaladas:

```powershell
node --version
pnpm --version
git --version
```

Requisitos mínimos:

- Node.js 22 ou superior;
- pnpm;
- Git recomendado;
- pelo menos um agente compatível instalado: Codex, Claude Code ou Gemini CLI.

Para verificar os agentes disponíveis:

```powershell
codex --version
claude --version
gemini --version
```

Não é necessário instalar todos os agentes.

## 2. Clonar o Mnemo

```powershell
git clone https://github.com/llipper/Mnemo.git
cd Mnemo
```

## 3. Instalar as dependências

```powershell
pnpm install
```

Se o pnpm informar que ignorou o script de build do `better-sqlite3`, autorize somente esse pacote:

```powershell
pnpm approve-builds
```

Selecione `better-sqlite3` e confirme. Não autorize pacotes desconhecidos indiscriminadamente.

## 4. Validar o código

Execute as verificações na seguinte ordem:

```powershell
pnpm typecheck
pnpm lint
pnpm test
pnpm build
```

Cada comando possui uma função diferente:

- `typecheck`: verifica os tipos TypeScript;
- `lint`: verifica padrões e problemas estáticos;
- `test`: executa os testes automatizados;
- `build`: gera os arquivos distribuíveis em `dist/`.

## 5. Disponibilizar o comando globalmente

Dentro da pasta do Mnemo:

```powershell
npm link
```

Confirme a instalação:

```powershell
ctx --version
mnemo --version
```

Os comandos `ctx` e `mnemo` apontam para o mesmo programa.

## 6. Entrar no projeto que utilizará memória

Saia da pasta do Mnemo e entre no projeto desejado:

```powershell
cd C:\caminho\do\seu-projeto
```

## 7. Inicializar o Mnemo no projeto

```powershell
ctx init
```

Para definir nome e orçamento de contexto:

```powershell
ctx init --name meu-projeto --context-budget 2000
```

O comando cria a pasta local `.context/`, que contém o banco SQLite e o estado do projeto. Essa pasta não deve ser enviada ao Git.

## 8. Verificar a instalação do projeto

```powershell
ctx doctor
ctx status
```

`ctx doctor` verifica Node.js, Git, agentes, configuração, banco e permissões locais.

## 9. Registrar a tarefa atual

```powershell
ctx task "Implementar autenticação" "Adicionar autenticação e autorização no servidor" --importance 100
```

Registre apenas tarefas concretas. Quando uma tarefa terminar, use o identificador retornado:

```powershell
ctx complete T-IDENTIFICADOR
```

## 10. Registrar decisões

```powershell
ctx decide "Banco de dados" "Usar PostgreSQL para os dados da aplicação" --importance 90
```

Quando uma decisão for substituída, primeiro registre a nova decisão:

```powershell
ctx decide "Banco de dados gerenciado" "Usar PostgreSQL hospedado no Neon" --importance 90
```

Depois marque a antiga como substituída:

```powershell
ctx supersede D-DECISAO-ANTIGA D-DECISAO-NOVA
```

## 11. Registrar restrições

```powershell
ctx constrain "Autorização" "Toda autorização deve acontecer no backend" --importance 100
```

Restrições representam regras que os próximos agentes não podem ignorar.

## 12. Registrar fatos

```powershell
ctx remember "Identidade do produto" "O projeto é local-first e funciona offline" --importance 80
```

Fatos devem representar informações duráveis sobre o projeto.

## 13. Registrar abordagens que falharam

```powershell
ctx fail "Autorização por email" "Foi rejeitada porque o email pode mudar; usar um identificador imutável" --importance 90
```

Isso evita que outro agente repita uma abordagem já rejeitada.

## 14. Registrar uma suposição

```powershell
ctx assume "Volume inicial" "O sistema terá menos de mil eventos por dia na primeira versão" --importance 50
```

Use suposições para informações que ainda precisam ser verificadas. Não registre uma suposição como fato confirmado.

## 15. Criar o primeiro checkpoint

```powershell
ctx checkpoint "Estado inicial"
```

O checkpoint registra o estado do Git e a continuidade do projeto. Crie checkpoints após marcos relevantes, não depois de cada pequena alteração.

## 16. Visualizar o contexto compilado

```powershell
ctx context
```

Para usar outro orçamento:

```powershell
ctx context --budget 1500
```

Para filtrar por um assunto:

```powershell
ctx context --query autenticacao
```

Para receber a estrutura completa em JSON:

```powershell
ctx context --json
```

## 17. Iniciar um agente com o contexto

Para abrir um seletor com os agentes instalados:

```powershell
ctx
```

Para iniciar diretamente um agente:

```powershell
ctx codex
```

```powershell
ctx claude
```

```powershell
ctx gemini
```

O Mnemo compila o contexto antes de iniciar o agente e cria um checkpoint quando a sessão termina.

## 18. Consultar a memória

Listar todas as memórias ativas:

```powershell
ctx list
```

Pesquisar por um assunto:

```powershell
ctx list --query autenticacao
```

Consultar por que uma decisão foi tomada:

```powershell
ctx why "banco de dados"
```

Listar categorias específicas:

```powershell
ctx tasks
ctx decisions
ctx constraints
ctx failures
```

## 19. Consultar o histórico

```powershell
ctx history
```

Para limitar a quantidade de eventos:

```powershell
ctx history --limit 10
```

## 20. Criar checkpoints durante o desenvolvimento

```powershell
ctx checkpoint "Autenticação concluída"
```

Depois registre ou conclua a tarefa correspondente:

```powershell
ctx complete T-IDENTIFICADOR
```

## 21. Usar o servidor MCP

Para iniciar o servidor MCP local por `stdio`:

```powershell
ctx mcp
```

Configuração conceitual para um cliente MCP:

```json
{
  "mcpServers": {
    "mnemo": {
      "command": "ctx",
      "args": ["mcp"]
    }
  }
}
```

Ferramentas MCP disponíveis:

- `project_state`;
- `project_context`;
- `memory_search`;
- `memory_get`;
- `report_memory`;
- `memory_checkpoint`.

## 22. Fluxo diário recomendado

Ao começar o trabalho:

```powershell
cd C:\caminho\do\projeto
ctx status
ctx context
ctx codex
```

Durante o trabalho, registre somente informações duráveis:

```powershell
ctx decide "Título" "Decisão e justificativa"
ctx constrain "Título" "Restrição obrigatória"
ctx fail "Tentativa" "Motivo da falha e resolução"
```

Ao finalizar um marco:

```powershell
ctx complete T-IDENTIFICADOR
ctx checkpoint "Descrição do marco"
ctx status
```

## 23. Atualizar o Mnemo a partir do GitHub

Entre na pasta em que o Mnemo foi clonado:

```powershell
cd C:\caminho\do\Mnemo
git pull origin main
pnpm install
pnpm typecheck
pnpm test
pnpm build
npm link
```

Confirme a versão disponível:

```powershell
ctx --version
```

## 24. Remover o link global de desenvolvimento

Se quiser remover os comandos globais criados por `npm link`:

```powershell
npm unlink -g mnemo-context-runtime
```

Isso remove apenas o link global. Não apaga o código-fonte nem as memórias existentes nos projetos.

## 25. Comandos de ajuda

Ajuda geral:

```powershell
ctx --help
```

Ajuda de um comando específico:

```powershell
ctx init --help
ctx context --help
ctx list --help
```

## Resumo do primeiro uso

```powershell
git clone https://github.com/llipper/Mnemo.git
cd Mnemo
pnpm install
pnpm typecheck
pnpm lint
pnpm test
pnpm build
npm link
cd C:\caminho\do\seu-projeto
ctx init
ctx doctor
ctx task "Primeira tarefa" "Descrição da tarefa" --importance 100
ctx decide "Primeira decisão" "Descrição e justificativa" --importance 90
ctx constrain "Primeira restrição" "Regra obrigatória" --importance 100
ctx checkpoint "Estado inicial"
ctx context
ctx codex
```
