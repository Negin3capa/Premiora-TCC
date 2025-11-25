# Integração Stripe - Guia de Configuração

Este documento explica como configurar a integração de pagamentos com Stripe na plataforma Premiora.

## Índice

1. [Pré-requisitos](#pré-requisitos)
2. [Configuração do Stripe](#configuração-do-stripe)
3. [Configuração do Supabase](#configuração-do-supabase)
4. [Variáveis de Ambiente](#variáveis-de-ambiente)
5. [Deploy das Edge Functions](#deploy-das-edge-functions)
6. [Configuração de Webhooks](#configuração-de-webhooks)
7. [Testes](#testes)
8. [Troubleshooting](#troubleshooting)

## Pré-requisitos

- Conta no [Stripe](https://dashboard.stripe.com/register)
- Projeto Supabase configurado
- Supabase CLI instalado (`npm install -g supabase`)
- Stripe CLI instalado (opcional, para testes locais)

## Configuração do Stripe

### 1. Criar Conta e Obter Chaves da API

1. Acesse o [Dashboard do Stripe](https://dashboard.stripe.com/)
2. Navegue para **Developers > API keys**
3. Copie as seguintes chaves (modo teste):
   - **Publishable key** (começa com `pk_test_`)
   - **Secret key** (começa com `sk_test_`)

### 2. Criar Produto e Preço

1. No Dashboard do Stripe, navegue para **Products**
2. Clique em **Add product**
3. Preencha os dados:
   - **Name**: Premium
   - **Description**: Assinatura Premium do Premiora
   - **Pricing model**: Recurring
   - **Price**: R$ 29,00
   - **Billing period**: Monthly
4. Clique em **Save product**
5. Copie o **Price ID** (começa com `price_`)

### 3. Configurar Webhook

1. No Dashboard do Stripe, navegue para **Developers > Webhooks**
2. Clique em **Add endpoint**
3. Configure:
   - **Endpoint URL**: `https://seu-projeto.supabase.co/functions/v1/stripe-webhook`
   - **Events to send**: Selecione `checkout.session.completed`
4. Clique em **Add endpoint**
5. Copie o **Signing secret** (começa com `whsec_`)

## Configuração do Supabase

### 1. Executar Migrations

Execute as migrations SQL no Supabase:

```bash
# No diretório premiora-web
supabase db push
```

Ou execute manualmente no SQL Editor do Supabase Dashboard:

1. `supabase-migrations/006_add_subscriptions_table.sql`
2. `supabase-migrations/007_ensure_tier_column.sql`

### 2. Configurar Secrets das Edge Functions

No Supabase Dashboard, navegue para **Edge Functions > Secrets** e adicione:

```bash
# Via CLI
supabase secrets set STRIPE_SECRET_KEY=sk_test_your_secret_key
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
```

Ou via Dashboard:

- `STRIPE_SECRET_KEY`: sua Secret Key do Stripe
- `STRIPE_WEBHOOK_SECRET`: seu Webhook Signing Secret

## Variáveis de Ambiente

### Frontend (.env)

Crie um arquivo `.env` na raiz do projeto `premiora-web`:

```env
# Supabase
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua_anon_key

# Stripe
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_sua_publishable_key
VITE_STRIPE_PREMIUM_PRICE_ID=price_seu_price_id
```

### Backend (Supabase Secrets)

As seguintes variáveis devem estar configuradas como secrets no Supabase:

- `STRIPE_SECRET_KEY`: Secret Key do Stripe
- `STRIPE_WEBHOOK_SECRET`: Webhook Signing Secret
- `SUPABASE_URL`: URL do projeto (já configurado automaticamente)
- `SUPABASE_SERVICE_ROLE_KEY`: Service Role Key (já configurado automaticamente)

## Deploy das Edge Functions

### 1. Login no Supabase

```bash
supabase login
```

### 2. Link ao Projeto

```bash
supabase link --project-ref seu-project-ref
```

### 3. Deploy das Functions

```bash
# Deploy da função create-checkout-session
supabase functions deploy create-checkout-session

# Deploy da função stripe-webhook
supabase functions deploy stripe-webhook
```

### 4. Verificar Deploy

```bash
supabase functions list
```

## Configuração de Webhooks

### Produção

1. No Dashboard do Stripe, configure o endpoint do webhook:

   ```
   https://seu-projeto.supabase.co/functions/v1/stripe-webhook
   ```

2. Selecione o evento: `checkout.session.completed`

3. Copie o Signing Secret e configure como secret no Supabase

### Desenvolvimento Local

Para testar webhooks localmente:

```bash
# 1. Instalar Stripe CLI
# Windows (com Scoop): scoop install stripe
# Mac: brew install stripe/stripe-cli/stripe

# 2. Login no Stripe
stripe login

# 3. Servir Edge Functions localmente
supabase functions serve

# 4. Em outro terminal, encaminhar webhooks
stripe listen --forward-to http://localhost:54321/functions/v1/stripe-webhook

# 5. Copiar o webhook secret exibido e configurar localmente
```

## Testes

### Teste Manual Completo

1. **Iniciar aplicação**:

   ```bash
   npm run dev
   ```

2. **Fazer login** na aplicação

3. **Navegar para** `/subscriptions`

4. **Clicar em "Subscribe"** no plano Premium

5. **Usar cartão de teste** do Stripe:
   - Número: `4242 4242 4242 4242`
   - Data: qualquer data futura
   - CVC: qualquer 3 dígitos
   - CEP: qualquer CEP válido

6. **Completar pagamento**

7. **Verificar**:
   - Redirecionamento para `/checkout/success`
   - Tier atualizado no banco de dados
   - Registro criado na tabela `subscriptions`

### Teste de Webhook com Stripe CLI

```bash
# Enviar evento de teste
stripe trigger checkout.session.completed
```

### Verificar Logs

```bash
# Logs das Edge Functions
supabase functions logs create-checkout-session
supabase functions logs stripe-webhook
```

## Troubleshooting

### Erro: "Price ID do Stripe não configurado"

**Solução**: Verifique se `VITE_STRIPE_PREMIUM_PRICE_ID` está definido no arquivo `.env`

### Erro: "Webhook signature verification failed"

**Solução**:

1. Verifique se `STRIPE_WEBHOOK_SECRET` está configurado corretamente
2. Certifique-se de que o endpoint do webhook no Stripe está correto
3. Verifique os logs da Edge Function

### Erro: "Usuário não autenticado"

**Solução**:

1. Verifique se o usuário está logado
2. Verifique se o token JWT está sendo enviado corretamente
3. Verifique os logs do navegador

### Tier não atualizado após pagamento

**Solução**:

1. Verifique os logs do webhook no Dashboard do Stripe
2. Verifique se o webhook está retornando status 200
3. Verifique se a migration `007_ensure_tier_column.sql` foi executada
4. Verifique os logs da Edge Function `stripe-webhook`

### Edge Function não encontrada

**Solução**:

```bash
# Re-deploy da função
supabase functions deploy create-checkout-session
supabase functions deploy stripe-webhook
```

## Modo Produção

Para usar em produção:

1. **Ativar modo produção** no Dashboard do Stripe
2. **Obter chaves de produção** (começam com `pk_live_` e `sk_live_`)
3. **Atualizar variáveis de ambiente** com chaves de produção
4. **Reconfigurar webhook** com endpoint de produção
5. **Testar fluxo completo** em ambiente de staging primeiro

## Recursos Adicionais

- [Documentação do Stripe Checkout](https://stripe.com/docs/payments/checkout)
- [Documentação de Webhooks do Stripe](https://stripe.com/docs/webhooks)
- [Documentação das Edge Functions do Supabase](https://supabase.com/docs/guides/functions)
- [Cartões de Teste do Stripe](https://stripe.com/docs/testing)

## Suporte

Para problemas ou dúvidas:

1. Verifique os logs das Edge Functions
2. Verifique o Dashboard do Stripe > Developers > Events
3. Consulte a documentação oficial do Stripe e Supabase
