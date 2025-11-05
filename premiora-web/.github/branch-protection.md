# Regras de Proteção de Branch

Este documento descreve as regras de proteção de branch recomendadas para o repositório Premiora-TCC.

## Configuração no GitHub

Acesse: **Settings** → **Branches** → **Add rule**

### Para Branch `main`

#### Regras Obrigatórias

- [x] Require a pull request before merging
- [x] Require approvals (mínimo 1)
- [x] Dismiss stale pull request approvals when new commits are pushed
- [x] Require status checks to pass before merging
- [x] Require branches to be up to date before merging

#### Status Checks Obrigatórios

- [x] CI / test (required)
- [x] CI / lint (required)
- [x] CI / build (required)

#### Restrições de Push

- [x] Restrict who can push to matching branches
- [x] Allow force pushes: **NÃO** (desmarcado)
- [x] Allow deletions: **NÃO** (desmarcado)

### Para Branch `develop` (se existir)

#### Regras Obrigatórias

- [x] Require a pull request before merging
- [x] Require approvals (mínimo 1)
- [x] Dismiss stale pull request approvals when new commits are pushed

#### Status Checks Obrigatórios

- [x] CI / test (required)
- [x] CI / lint (required)
- [x] CI / build (required)

## Por Que Essas Regras São Importantes

### Segurança

- **Aprovações obrigatórias**: Garantem que pelo menos uma pessoa revisou o código
- **Status checks**: Impedem merge de código que não compila ou falha nos testes
- **Branch up-to-date**: Evita conflitos e garante que o código está atualizado

### Qualidade

- **Dismiss stale approvals**: Força re-revisão quando há novos commits
- **No force push**: Preserva histórico do Git
- **No deletions**: Protege branches importantes

### Automação

- **Auto merge**: Funciona apenas quando todas as condições são atendidas
- **CI obrigatória**: Garante que o código está sempre testado

## Como Configurar

1. Vá para o repositório no GitHub
2. **Settings** → **Branches**
3. **Add rule**
4. Configure conforme especificado acima
5. **Create** ou **Save changes**

## Verificação

Para verificar se as regras estão ativas:

```bash
# Verificar regras de proteção (requer GitHub CLI)
gh api repos/{owner}/{repo}/branches/main/protection
```

Ou simplesmente tente fazer push direto para main - deve ser bloqueado.

## Troubleshooting

### Auto Merge Não Funciona

1. **Verifique se todas as regras de proteção estão ativas**
2. **Confirme que o PR tem as labels corretas** (`auto-merge`, `dependencies`, etc.)
3. **Verifique se todos os status checks passaram**
4. **Confirme que há pelo menos 1 aprovação**

### PR Bloqueado

1. **Status checks falhando**: Corrija os erros de CI
2. **Branch desatualizada**: Faça merge/rebase da main
3. **Faltam aprovações**: Peça revisão de outro maintainer

## Labels Importantes

- `auto-merge`: Ativa merge automático
- `dependencies`: Para updates de dependências
- `do-not-merge`: Bloqueia auto merge
- `work-in-progress`: PR em desenvolvimento
