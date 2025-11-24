# Registro de Alterações (Changelog)

Todas as alterações notáveis neste projeto serão documentadas neste arquivo.

O formato é baseado no [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
e este projeto adere ao [Versionamento Semântico](https://semver.org/spec/v2.0.0.html).

## [0.14.0] - 24/11/25

### Adicionado

- **Painel do Criador (Creator Dashboard)**
  - Implementada a página do painel do criador (`CreatorDashboardPage.tsx`) com configurações e estilos.
  - Adicionados componentes para análise de dados do criador, serviços de pagamento e gerenciamento de assinaturas.
  - Nova página de perfil do criador com navegação por abas (visão geral, pagamentos, configurações).

- **Integração com Stripe para Pagamentos**
  - Adicionada documentação de integração com o Stripe e variáveis de ambiente.
  - Implementadas migrações de banco de dados para tabelas de assinaturas.
  - Adicionado link de assinaturas na barra lateral e na navegação mobile.

### Alterado

- **Estilos e UI**
  - Ajustado o estilo do painel do criador para uma melhor experiência de usuário.
  - Simplificadas as importações em `MobileBottomBar` e `SettingsPage`.
  - Limpeza de importações não utilizadas no `PaymentService`.

## [0.13.0] - 24/11/25

### Adicionado

- **Aprimoramentos em Cards de Vídeo**
  - Melhorias visuais e funcionais no `VideoCard.tsx`
  - Atualizações no modal de criação de vídeo (`CreateVideoModal.tsx`)
  - Refinamentos de estilo para experiência de visualização de vídeo

- **Melhorias na Exibição de Conteúdo**
  - Refatoração do `ContentCard.tsx` para melhor performance e manutenção
  - Atualizações nos serviços de Feed e Post para otimização de entrega de conteúdo
  - Ajustes de layout na página de visualização de post (`PostViewPage.tsx`)

### Alterado

- **Estilos e UI**
  - Atualização de estilos em `ContentCard.css` e `CreatePostModal.css`
  - Melhorias na responsividade e apresentação de cards de conteúdo

## [0.12.0] - 23/11/25

### Adicionado

- **Otimização de Performance**
  - Implementação de `GlobalPrefetchCache` para carregamento antecipado de dados
  - Prefetch inteligente de perfil e feed ao passar o mouse nos itens de navegação (Home e Profile)
  - Melhoria significativa na percepção de velocidade de navegação

- **Identidade Visual Refinada**
  - Suporte a logo em versão clara (`premiora-logo-light.png`) para melhor contraste em temas escuros/claros
  - Atualização dinâmica de logo baseada no tema em Sidebar, Header e Login
  - Refinamento de estilos globais e componentes para maior consistência visual

### Alterado

- **Melhorias de UI/UX**
  - Ajustes de espaçamento e layout na Sidebar e ProfileSidebar
  - Polimento visual na Landing Page (Header, Footer, Hero)
  - Atualização de estilos em componentes de conteúdo e comunidade

## [0.11.0] - 23/11/25

### Adicionado

- **Autenticação Google Aprimorada**
  - Implementação do Google One Tap (notificação) funcional com autenticação real via Supabase
  - Suporte a login via popup ("mini window") para o botão "Entrar com Google", melhorando a UX
  - Otimização do fechamento do popup para minimizar flash de conteúdo
  - Correção de race condition no carregamento do Dashboard após login

### Corrigido

- Bug onde o Google One Tap não aparecia ou não autenticava corretamente
- Bug onde o Dashboard carregava vazio após login rápido via OAuth
- Melhoria na detecção de sessão para fechamento automático de janelas de login

## [0.10.0] - 23/11/25

### Adicionado

- **Experiência de Mídia Aprimorada**
  - Modal de imagem aprimorado com barra lateral de conteúdo para visualização imersiva
  - Navegação de clique em imagens nos componentes `ContentCard` e `PostCard`

- **Melhorias na Comunidade e Post**
  - Nova seção `CommunityInfoSection` para informações detalhadas da comunidade
  - Layout da página `PostViewPage` otimizado

- **Busca Aprimorada**
  - Dropdown de busca agora exibe avatares de usuários e comunidades
  - Melhoria no serviço de busca para exibição correta de nomes de usuários

### Alterado

- **Refatoração do Sistema de Comentários**
  - Layout e funcionalidades dos componentes de comentário refatorados para uma experiência estilo "Twitter"
  - Estilos atualizados para maior consistência visual

## [0.9.0] - 23/11/25

### Adicionado

- **Sistema de Busca Global**
  - Funcionalidade de busca global com dropdown interativo
  - Nova página de resultados de busca (`SearchResultsPage`)
  - Integração de serviço de busca unificado

- **Melhorias no Dashboard**
  - Barra lateral direita (RightSidebar) com busca, tópicos em tendência e sugestões de usuários para seguir
  - Novas páginas de Dashboard e Visualização de Post (PostView) com estilos dedicados
  - Seção de "Quem Seguir" (WhoToFollow) e "Tópicos em Alta" (TrendingSection)

- **Novas Páginas e Navegação**
  - Implementação das páginas Configurações, Explorar e Comunidades
  - Componentes e estilos associados para as novas rotas

- **Sistema de Comunidades Aprimorado**
  - Criação de posts em comunidades
  - Suporte a flairs (etiquetas)
  - Componentes de exibição de conteúdo otimizados

### Alterado

- **Refatoração de Componentes**
  - Refatoração dos componentes e estilos relacionados à busca para maior consistência
  - Melhorias na funcionalidade e interface do usuário para elementos de busca

## [0.8.0] - 22/11/25

### Adicionado

- **Redesign Completo da Landing Page**
  - Nova estética premium inspirada no Patreon com tema escuro e acentos vibrantes
  - Layouts modernos: Timeline (Como Funciona), Masonry (Depoimentos), Bento Grid (Funcionalidades), Accordion (FAQ)
  - Animações de scroll (`fade-up`, `scale-in`) e interações refinadas
  - Seção Hero redesenhada com tipografia de impacto e mockup 3D

- **Melhorias de UX/UI**
  - **Header**: Layout em Grid para alinhamento preciso (Logo à esquerda, Nav ao centro, Botões à direita)
  - **Navegação**: Scroll suave (`scroll-behavior: smooth`) e links funcionais para todas as seções
  - **Pricing**: Alinhamento corrigido (Premium ao lado do Pro) e destaque visual para o plano Pro
  - **Features**: Bento Grid otimizado (layout 4x2 compacto sem espaços vazios)
  - **CTA**: Nova seção de chamada para ação com gradientes e botões de alto contraste
  - **Polimento Visual**: Glow centralizado nos botões e correção de visibilidade de texto em hover nos botões vermelhos

### Alterado

- **Estilos Globais**
  - Variáveis de cor e espaçamento padronizadas em `landing-page.css`
  - Tipografia atualizada para família Inter com novos pesos e tracking
  - Remoção de restrições de largura (`max-width`) na Navbar para layout fluido

### Corrigido

- Bug visual onde o texto dos botões vermelhos (Login, CTA, Pro Plan) desaparecia no hover
- Desalinhamento do efeito de "glow" nos botões CTA
- Links de navegação do header quebrados (seções sem ID correspondente)

## [0.7.0] - 22/11/25

### Adicionado

- **Sistema Completo de Canal de Criador**
  - Página de configuração do canal de criador (`CreatorChannelSetupPage`) com interface intuitiva
  - Componente `SubscriptionConfig` para gerenciamento de níveis de assinatura (tiers)
  - Componente `CommunityConnection` para vincular comunidades ao canal
  - Skeleton loaders para melhor experiência durante carregamento
  - Sistema de avisos de alterações não salvas antes de sair da página
  - Estados vazios (empty states) com call-to-action quando não há tiers configurados

- **Integração com Página de Perfil**
  - Modal de assinatura (`SubscriptionModal`) exibindo tiers disponíveis
  - Botão "Become a member" no banner do perfil
  - Aba Community conectada ao canal do criador
  - Serviço `CreatorChannelService` para operações CRUD de canais

- **Melhorias de UI/UX**
  - Logo Premiora adicionado em todos os sidebars (Sidebar, ProfileSidebar)
  - ProfileSidebar agora usado consistentemente em todas as páginas de perfil
  - Navegação de tabs consistente entre perfil próprio e de terceiros
  - Ícones de navegação alinhados e ordenados entre Sidebar e ProfileSidebar
  - Melhorias de acessibilidade com `aria-label` em botões e navegação por teclado

- **Componentes de Layout**
  - `SubscriptionConfigSkeleton` para loading states
  - Estilos CSS dedicados para todos os novos componentes
  - Suporte responsivo para mobile e desktop

### Alterado

- **ProfilePage**
  - Agora usa ProfileSidebar para perfil próprio (anteriormente usava Sidebar completo)
  - Header tabs exibidos de forma consistente em todos os perfis
  - Margens ajustadas para largura do ProfileSidebar (60px)

- **Sidebar e ProfileSidebar**
  - Logo Premiora substituiu texto/SVG em todos os sidebars
  - Ícones redimensionados para manter proporções adequadas
  - Ordem de navegação padronizada: Home, Explore, Notifications, Messages, Following, Communities, Profile, Settings

- **Estilos CSS**
  - Novos estilos para logo em `Sidebar.css`, `ProfileSidebar.css`, `login.css`, `landing-page.css`
  - Estilos para `SubscriptionConfig.css` com suporte a skeleton e empty states
  - Estilos para `SubscriptionModal.css` com design premium

### Corrigido

- Erros de tipo TypeScript em `CreatorChannelSetupPage`
- Estrutura de objeto `CreatorChannelConfig` alinhada com interface
- Chamada `saveCreatorChannel` com argumento `creatorId` correto
- Código duplicado removido em `SubscriptionConfig.tsx`
- Variável `isOwnProfile` não utilizada removida de `ProfilePage.tsx`

### Técnico

- Migração de banco de dados para sistema de canais de criador
- Políticas RLS (Row Level Security) para tabelas de canais
- Funções do banco para gerenciamento de benefícios de assinatura
- Build verificado e passando sem erros

## [0.6.0] - 21/11/25

### Corrigido

- Problemas de política RLS (Row Level Security) no Creator Channel causando erros 403 Forbidden ao salvar configurações de canal
- Violações de restrição de chave estrangeira (23503) ao inserir benefícios de assinatura
- Implementação adequada de `supabaseAdmin` para operações de escrita para contornar políticas RLS em `CreatorChannelService.ts`
- Criação sequencial de tiers e benefícios para prevenir violações de restrição de chave estrangeira

### Adicionado

- Integração de autenticação Google One Tap para experiência de login aprimorada
- Sistema de tendências de conteúdo aprimorado com algoritmos de detecção melhorados

### Alterado

- `CreatorChannelService.saveCreatorChannel()` agora usa `supabaseAdmin` para todas as operações de escrita
- Tratamento de erros e logging aprimorados nas operações de canal de criador
- Processamento sequencial de tiers de assinatura e benefícios para garantir integridade referencial

## [0.5.0] - 18/11/25

### Adicionado

- Sistema completo de tendências de conteúdos com detecção de tópicos trending ([#XX](https://github.com/Negin3capa/Premiora-TCC/pull/XX))
- Serviço TrendCelebrity (TrendingService) para cliente React com busca e filtros de tópicos
- Edge Function do Supabase para processamento de sinais de tendência executada periodicamente a cada 5 minutos
- Algoritmo de detecção de burst baseado em z-score com cálculo de estatísticas de baseline
- Sistema de pontuação composto com análise de múltiplas janelas (1h, 4h, 1dia) e pesos dinâmicos
- Github Actions workflow para automação do processamento de sinais de tendência
- Migração de banco de dados completa do sistema de tendências (005_create_trending_system.sql)
- Tabelas de dados principais: trending_topics, topic_signals, hashtag_mentions
- Materialized views para otimização de performance de consultas de tendências
- Indexação avançada e políticas RLS para segurança dos dados de tendências
- Métricas de engajamento incluindo likes, comentários e visualizações nos cálculos de trending
- Sistema de análise de velocidade de crescimento de tópicos para detecção de tendências emergentes

## [0.4.0] - 18/11/25

### Adicionado

- Sistema completo de comentários para posts com interface React integrada
- Componentes de comentários: formulário, lista, itens individuais e estilos dedicados
- Serviço de comentários com operações CRUD para gerenciamento de comentários
- Hook customizado para gerenciamento de estado de comentários
- Migração de banco de dados para estrutura de comentários (004_add_comments_system.sql)
- Integração do sistema de comentários na página de visualização de posts

## [0.3.3] - 18/11/25

### Alterado

- Convenção de commits padrão agora é opcional (warnings em vez de erros), facilitando contribuições sem rigidez excessiva
- Configuração do Commitlint ajustada para permitir maior flexibilidade no desenvolvimento

## [0.3.2] - 18/11/25

### Adicionado

- Novo componente `CommunityPostSidebar` para páginas de posts de comunidade com informações da comunidade, funcionalidades de participar/sair, estatísticas e regras
- Detecção responsiva automática na barra de navegação móvel (apenas em dispositivos móveis)
- Pré-seleção automática de comunidade ao criar vídeos (quando o usuário está em uma página de comunidade)

### Alterado

- Aprimoramentos na interface da barra lateral do perfil com melhor experiência de criação de conteúdo
- Melhorias visuais no layout do feed, página inicial, visualização de posts e estilos da sidebar
- Refatoração do componente RootLayout com melhorias de performance

## [0.3.1] - 16/11/25

### Corrigido

- Sistema de rastreamento de processamento OAuth callback para prevenir duplicações
- Melhoria no fluxo de autenticação OAuth para evitar problemas de refresh e sessão
- Gerenciamento aprimorado de estado de sessão no contexto de autenticação

### Alterado

- Funções utilitárias adicionadas para rastreamento de callbacks OAuth
- Melhorias na documentação com formatação aprimorada das tabelas

## [0.3.0] - 14/11/25

### Adicionado

- Sistema de abas de perfil com seções de posts, comunidade e loja ([#45](https://github.com/Negin3capa/Premiora-TCC/pull/45))
- Sistema de seguir com abas de feed
- Sugestões de usuários e barra lateral de perfil
- Página de exploração com funcionalidade completa ([#41](https://github.com/Negin3capa/Premiora-TCC/pull/41))
- Criação de comunidades com edição ao vivo
- Edição inline para campos da comunidade
- Sistema de edição de banner da comunidade
- Funcionalidade de cancelar edição de perfil sem alterações
- Melhorias na funcionalidade do feed e performance do dashboard ([#46](https://github.com/Negin3capa/Premiora-TCC/pull/46))

### Corrigido

- Permite que o botão cancelar funcione sem alterações na edição de perfil
- Resolve conflitos de renderização de sombra de texto em inputs transparentes
- Corrige direção do texto em campos de edição ao vivo
- Posicionamento do botão de edição do banner da comunidade

### Alterado

- Melhorias na interface das páginas e componentes ([#50](https://github.com/Negin3capa/Premiora-TCC/pull/50))
- Refatoração de componentes do feed e adição de funcionalidade de busca ([#47](https://github.com/Negin3capa/Premiora-TCC/pull/47))
- Aprimoramentos na interface com modal de busca e melhorias no layout do feed ([#48](https://github.com/Negin3capa/Premiora-TCC/pull/48))
- Adição de página de busca mobile ([#49](https://github.com/Negin3capa/Premiora-TCC/pull/49))
- Melhorias no layout e estilos para cabeçalho, barra mobile e componentes de perfil

## [0.2.0] - 08/11/25

### Adicionado

- Sistema de busca global abrangente ([#36](https://github.com/Negin3capa/Premiora-TCC/pull/36))
- Timeline com atualizações em tempo real e paginação por cursor ([#40](https://github.com/Negin3capa/Premiora-TCC/pull/40))
- Sistema abrangente de gerenciamento de conteúdo ([#34](https://github.com/Negin3capa/Premiora-TCC/pull/34))
- Modal de visualização de posts atualizado ([#32](https://github.com/Negin3capa/Premiora-TCC/pull/32))
- Reorganização da estrutura de serviços e componentes ([#33](https://github.com/Negin3capa/Premiora-TCC/pull/33))

### Alterado

- Melhorias nos componentes da interface do usuário ([#37](https://github.com/Negin3capa/Premiora-TCC/pull/37), [#38](https://github.com/Negin3capa/Premiora-TCC/pull/38), [#39](https://github.com/Negin3capa/Premiora-TCC/pull/39))
- Refatoração e melhorias no código ([#35](https://github.com/Negin3capa/Premiora-TCC/pull/35))

## [0.1.0] - 05/11/25

### Adicionado

- Configuração inicial do projeto com React, TypeScript e Vite
- Integração com Supabase para serviços backend
- Sistema de autenticação com registro e login de usuários
- Funcionalidades de criação e gerenciamento de comunidades
- Criação de conteúdo (posts, vídeos) com suporte a mídia rica
- Sistema de feed com scroll infinito e atualizações em tempo real
- Gerenciamento de perfil de usuário com banners e avatares personalizáveis
- Funcionalidade de busca em conteúdo e comunidades
- Sistema de notificações para interações do usuário
- Design responsivo para mobile com componentes dedicados
- Funcionalidade de corte e upload de imagens
- Integração WebSocket para recursos em tempo real
- Sistema de confirmação de email
- Funcionalidade de seguir/deixar de seguir usuários
- Moderação de conteúdo e regras da comunidade
- Página inicial com demonstração de recursos
- Página de configurações para preferências do usuário
- Simplificação da criação de perfil OAuth com dados temporários ([#31](https://github.com/Negin3capa/Premiora-TCC/pull/31))

### Alterado

- Implementação de tipos TypeScript adequados e interfaces
- Adicionado ESLint e Prettier para qualidade de código
- Configurado Husky para hooks de pré-commit
- Configurado Commitlint para commits convencionais
- Adicionados limites de erro abrangentes
- Implementado gerenciamento adequado de estado com React Context
- Adicionada camada de serviço para interações de API
- Configurado Vite para desenvolvimento e processo de build otimizados

### Dependências

- React 19.2.0
- TypeScript 5.9.3
- Vite 7.2.2
- Supabase JS 2.81.0
- React Router DOM 7.9.4
- Lucide React para ícones
- HCaptcha para proteção contra bots
- React Easy Crop para edição de imagens
