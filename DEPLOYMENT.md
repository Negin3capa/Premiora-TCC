# 🚀 Guia de Deploy - Premiora Web

Este documento descreve como configurar e gerenciar os ambientes de deploy da aplicação Premiora Web.

## 📋 Visão Geral

A aplicação utiliza uma pipeline de CI/CD completa com:

- **GitHub Actions** para automação
- **Vercel** para hospedagem
- **Supabase** para backend
- **hCaptcha** para proteção contra bots

## 🏗️ Ambientes

### Desenvolvimento (Local)

- **Arquivo**: `.env`
- **Comando**: `npm run dev`
- **URL**: `http://localhost:5173`

### Staging/Preview

- **Arquivo**: `.env.staging`
- **Trigger**: Pull Requests
- **Deploy**: Automático no Vercel
- **Comentários**: URL gerada automaticamente no PR

### Produção

- **Arquivo**: `.env.production`
- **Trigger**: Push na branch `main`
- **Deploy**: Automático no Vercel
- **URL**: Configurada no projeto Vercel

## 🔧 Configuração Inicial

### 1. Vercel Setup

```bash
# Instalar Vercel CLI
npm install -g vercel

# Login no Vercel
vercel login

# Link do projeto (na pasta premiora-web)
cd premiora-web
vercel link
```

### 2. GitHub Secrets

Configure os seguintes secrets no repositório GitHub:

#### `VERCEL_TOKEN`

```bash
# Gerar token em https://vercel.com/account/tokens
vercel login
vercel link
# O token será usado automaticamente
```

#### `VITE_SUPABASE_URL`

```
your_supabase_project_url_here
```

#### `VITE_SUPABASE_ANON_KEY`

```
your_supabase_anon_key_here
```

#### `VITE_HCAPTCHA_SITE_KEY`

```
# Obter em https://dashboard.hcaptcha.com/
```

### 3. Environment Variables no Vercel

Configure as variáveis de ambiente no painel do Vercel:

```bash
# Para Production
vercel env add VITE_SUPABASE_URL production
vercel env add VITE_SUPABASE_ANON_KEY production
vercel env add VITE_HCAPTCHA_SITE_KEY production

# Para Preview/Staging
vercel env add VITE_SUPABASE_URL preview
vercel env add VITE_SUPABASE_ANON_KEY preview
vercel env add VITE_HCAPTCHA_SITE_KEY preview
```

## 📦 Processo de Deploy

### Deploy Automático

1. **Pull Request**: Cria deploy de preview automaticamente
2. **Merge na `main`**: Deploy em produção automaticamente
3. **Push na `develop`**: Build de testes (sem deploy)

### Deploy Manual

```bash
# Deploy para produção
cd premiora-web
vercel --prod

# Deploy para staging
vercel --staging
```

## 🔍 Monitoramento

### Vercel Dashboard

- **Analytics**: Performance e uso
- **Functions**: Logs de funções serverless
- **Deployments**: Histórico de deploys

### GitHub Actions

- **Workflows**: Status dos pipelines
- **Logs**: Detalhes de build e deploy
- **Artifacts**: Arquivos gerados

### Supabase

- **Logs**: Consultas e erros
- **Metrics**: Uso de recursos
- **Health**: Status do banco

## 🐛 Troubleshooting

### Problemas Comuns

#### Build Falhando

```bash
# Verificar logs do GitHub Actions
# Verificar variáveis de ambiente
# Verificar dependências: npm ci
```

#### Deploy Falhando

```bash
# Verificar token do Vercel
# Verificar configuração do projeto
# Verificar limites do plano
```

#### Ambiente Variables

```bash
# Verificar se secrets estão configurados
# Verificar se variáveis estão no Vercel
# Verificar nomes das variáveis (case-sensitive)
```

### Comandos Úteis

```bash
# Ver status do projeto
vercel ls

# Ver logs do deploy
vercel logs [deployment-url]

# Re-deploy forçado
vercel redeploy [deployment-url]

# Ver variáveis de ambiente
vercel env ls
```

## 🔒 Segurança

### Variáveis Sensíveis

- ✅ Nunca commite chaves reais no código
- ✅ Use sempre GitHub Secrets
- ✅ Configure variáveis no Vercel
- ✅ Use diferentes chaves por ambiente

### Headers de Segurança

Configurados automaticamente no `vercel.json`:

- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`

## 📊 Performance

### Otimizações Configuradas

- ✅ Code splitting automático
- ✅ Compressão Gzip/Brotli
- ✅ Cache de assets estáticos (1 ano)
- ✅ CDN global da Vercel
- ✅ Regiões otimizadas (gru1 - São Paulo)

### Monitoramento

- **Lighthouse**: Performance audits
- **Web Vitals**: Métricas Core Web Vitals
- **Vercel Analytics**: Dados de uso

## 🚀 Próximos Passos

### Melhorias Planejadas

- [ ] Configurar monitoring avançado (Sentry)
- [ ] Implementar testes E2E
- [ ] Configurar rollback automático
- [ ] Adicionar feature flags
- [ ] Implementar blue-green deployment

### Escalabilidade

- [ ] Configurar múltiplas regiões
- [ ] Implementar CDN customizado
- [ ] Otimizar bundle splitting
- [ ] Configurar caching avançado

## 📞 Suporte

Para problemas de deploy:

1. Verificar logs do GitHub Actions
2. Verificar dashboard do Vercel
3. Consultar documentação do Vercel
4. Abrir issue no repositório

---

**Última atualização**: 02 de Novembro de 2025
**Versão**: 1.0.0
