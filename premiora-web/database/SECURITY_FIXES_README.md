# Correções de Segurança - Supabase Advisor

Este documento descreve as correções implementadas para resolver os avisos de segurança identificados pelo Supabase Advisor.

## Avisos Resolvidos

### 1. ✅ `function_search_path_mutable` - 13 funções corrigidas

**Problema**: Funções PostgreSQL sem `search_path` fixo são vulneráveis a ataques de injeção de search_path.

**Solução**: Adicionado `SET search_path = public` a todas as funções existentes.

**Funções corrigidas**:

- `update_member_count()` - Atualiza contagem de membros
- `update_tag_usage_count()` - Atualiza contagem de uso das tags
- `update_updated_at_column()` - Atualiza timestamp updated_at
- `is_community_member()` - Verifica membership
- `is_community_moderator()` - Verifica moderador/criador
- `can_access_community()` - Verifica acesso a comunidades
- `refresh_community_stats()` - Atualiza view materializada
- `get_community_feed()` - Busca feed paginado
- `update_users_updated_at()` - Atualiza timestamp de usuários
- `trigger_refresh_community_stats()` - Trigger de refresh
- `log_slow_query()` - Registra queries lentas
- `reindex_performance_critical_tables()` - Reindexa tabelas
- `vacuum_analyze_critical_tables()` - Executa vacuum analyze

### 2. ✅ `materialized_view_in_api` - View protegida

**Problema**: A view materializada `community_stats` estava acessível via Data APIs sem restrições.

**Solução**: Revogadas permissões SELECT dos roles `anon` e `authenticated` na view materializada. Como materialized views não suportam RLS no PostgreSQL, a proteção é feita através de controle de permissões.

### 3. ⚠️ `auth_leaked_password_protection` - Configuração manual necessária

**Problema**: Proteção contra vazamento de senhas desabilitada no Supabase Auth.

**Solução**: Deve ser habilitada manualmente no dashboard do Supabase (não pode ser feito via SQL).

## Como Aplicar as Correções

### Passo 1: Executar a Migração SQL

A migração está localizada em: `database/migrations/003_security_fixes.sql`

**Opção A - Via Supabase CLI** (recomendado):

```bash
# Se você tem o Supabase CLI instalado
supabase db push

# Ou aplicar apenas esta migração específica
supabase db reset  # Se quiser recriar tudo
# ou
psql -f database/migrations/003_security_fixes.sql
```

**Opção B - Via Dashboard do Supabase**:

1. Acesse seu projeto no [Supabase Dashboard](https://supabase.com/dashboard)
2. Vá para "SQL Editor"
3. Copie e cole o conteúdo do arquivo `003_security_fixes.sql`
4. Execute a query

### Passo 2: Configurar Proteção de Senhas

1. Acesse o [Supabase Dashboard](https://supabase.com/dashboard)
2. Vá para **Authentication > Settings**
3. Na seção **"Security Settings"**, habilite:
   - ✅ **"Enable password leak protection"**

### Passo 3: Verificar Correções

Após aplicar a migração:

1. **Verifique no Supabase Advisor**:
   - Os avisos `function_search_path_mutable` e `materialized_view_in_api` devem desaparecer
   - O aviso `auth_leaked_password_protection` deve desaparecer após habilitar no dashboard

2. **Teste as funções**:
   - Verifique se todas as funcionalidades continuam funcionando
   - Teste operações de comunidades, posts, e feeds

## Detalhes Técnicos

### Search Path Security

O `search_path` controla quais schemas o PostgreSQL procura por objetos. Sem um search_path fixo, um atacante poderia:

1. Criar objetos maliciosos em schemas não-intencionais
2. Forçar funções a usar versões maliciosas de funções/tabelas
3. Executar código arbitrário através de injeção

**Exemplo de ataque prevenido**:

```sql
-- Sem search_path fixo, um atacante poderia criar:
CREATE FUNCTION public.now() RETURNS timestamp AS $$
  -- Código malicioso aqui
$$ LANGUAGE plpgsql;

-- E forçar a função update_updated_at_column a usar isso
```

### Proteção da View Materializada

Como materialized views não suportam Row Level Security (RLS) no PostgreSQL, a proteção da view `community_stats` é feita através de controle de permissões:

**Permissões revogadas**:

```sql
-- Revogar acesso direto via Data APIs
REVOKE SELECT ON community_stats FROM anon;
REVOKE SELECT ON community_stats FROM authenticated;

-- Manter acesso para operações internas (service_role)
-- GRANT SELECT ON community_stats TO service_role;
```

**Resultado**: A view não pode mais ser acessada diretamente via Data APIs, forçando o uso de funções que implementam validação de segurança apropriada.

## Arquivos Modificados

- ✅ `database/migrations/003_security_fixes.sql` - Nova migração criada
- ✅ `database/SECURITY_FIXES_README.md` - Este documento

## Próximos Passos

1. ✅ Aplicar a migração no ambiente de desenvolvimento
2. ⏳ Testar todas as funcionalidades
3. ⏳ Aplicar no ambiente de produção
4. ⏳ Monitorar logs por possíveis problemas

## Logs Esperados

Após executar a migração, você deve ver no console:

```
NOTICE:  Migração de segurança aplicada com sucesso!
NOTICE:  Search_path corrigido em todas as funções.
NOTICE:  Permissões revogadas da view materializada community_stats para roles da API.
NOTICE:  Verifique o dashboard do Supabase para habilitar proteção contra vazamento de senhas.
```

## Suporte

Se encontrar problemas:

1. Verifique os logs do PostgreSQL
2. Teste cada função individualmente
3. Confirme que todas as permissões estão corretas
4. Verifique se o RLS não está bloqueando acessos legítimos
