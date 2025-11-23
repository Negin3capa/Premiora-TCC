# Premiora-TCC

Projeto SaaS, buscando unir as qualidades do Patreon/Twitter/Reddit/Youtube em um só lugar.

## Descrição

O Premiora é uma plataforma revolucionária que combina o melhor de múltiplas redes sociais e plataformas de monetização em um único ecossistema. Criadores de conteúdo podem construir comunidades engajadas, compartilhar conteúdo diversificado e monetizar suas criações de forma inteligente, tudo em um só lugar.

## Arquitetura

O projeto segue uma arquitetura **Component-Based Architecture** com princípios de **Separação de Responsabilidades** e **Reutilização de Código**. A estrutura foi recentemente refatorada para melhorar a manutenibilidade e escalabilidade.

Para informações detalhadas sobre a arquitetura técnica, padrões de design e decisões técnicas, consulte o arquivo [ARCHITECTURE.md](./ARCHITECTURE.md).

### Tecnologias Principais

- **Framework**: React 19.2.0 com TypeScript ~5.9.3
- **Build Tool**: Vite ^7.2.2 com code splitting otimizado
- **Roteamento**: React Router DOM ^7.9.4
- **Backend**: Supabase (PostgreSQL + Auth + Storage + Edge Functions)
- **Estilização**: CSS personalizado com variáveis CSS e suporte a temas
- **Ícones**: Lucide React ^0.553.0
- **Captcha**: HCaptcha React ^1.14.0
- **Git Hooks**: Husky ^9.1.7 + Commitlint ^20.1.0
- **Context API**: Gerenciamento de estado global com 4 contexts especializados
- **Hooks Customizados**: Lógica reutilizável extraída para hooks

### Autenticação

- **Provedor**: Supabase Auth
- **Métodos**: Login com Google OAuth, Facebook OAuth e email/senha
- **Gerenciamento**: AuthService + AuthContext para estado global
- **Proteção**: ProtectedRoute e PublicRoute para controle de acesso

### Sistema de Tiers (Monetização)

O Premiora implementa um sistema de monetização inspirado no Patreon, onde criadores têm controle total sobre suas assinaturas:

#### Funcionalidades do Sistema de Tiers

- **Controle Total do Criador**: Criadores definem nome, preço e benefícios de cada tier
- **Acesso Hierárquico**: Conteúdo organizado por níveis (public, supporters, premium)
- **Conteúdo Exclusivo**: Posts, vídeos e recursos bloqueados para não-assinantes
- **Preview de Conteúdo**: Amostra do conteúdo premium para atrair assinantes
- **Gestão de Assinaturas**: Interface completa para gerenciar tiers e assinantes

#### Níveis de Acesso

```typescript
type AccessLevel = "public" | "supporters" | "premium";
```

- **Public**: Conteúdo gratuito acessível a todos
- **Supporters**: Conteúdo exclusivo para assinantes básicos
- **Premium**: Conteúdo VIP com benefícios exclusivos

#### Benefícios por Tier

- **Perfil do Criador**: Acesso a conteúdo exclusivo no perfil
- **Comunidades Privadas**: Participação em grupos restritos
- **Conteúdo Premium**: Posts, vídeos e recursos especiais
- **Interação Direta**: Comunicação privilegiada com o criador

### Estrutura de Arquivos

```
premiora-web/
├── src/
│   ├── components/      # Componentes React organizados por domínio
│   │   ├── auth/        # Componentes de autenticação
│   │   │   ├── AuthForm.tsx
│   │   │   ├── ProfileSetupGuard.tsx
│   │   │   ├── ProtectedRoute.tsx
│   │   │   ├── ProviderButtons.tsx
│   │   │   └── PublicRoute.tsx
│   │   ├── common/      # Componentes reutilizáveis
│   │   │   ├── CommunityDropdown.tsx
│   │   │   ├── ErrorBoundary.tsx
│   │   │   ├── FileUpload.tsx
│   │   │   ├── NotificationContainer.tsx
│   │   │   └── SearchResults.tsx
│   │   ├── content/     # Componentes de conteúdo e feed
│   │   │   ├── ContentCard.tsx
│   │   │   ├── Feed.tsx
│   │   │   ├── UserSuggestions.tsx
│   │   │   └── index.ts
│   │   ├── ContentCard/ # Componentes específicos de cards
│   │   │   ├── CardActions.tsx
│   │   │   ├── ContentCard.tsx
│   │   │   ├── index.ts
│   │   │   ├── PostCard.tsx
│   │   │   ├── ProfileCard.tsx
│   │   │   └── VideoCard.tsx
│   │   ├── forms/       # Componentes de formulários
│   │   │   └── Benefits.tsx
│   │   ├── landing/     # Componentes da landing page
│   │   │   ├── CTA.tsx
│   │   │   ├── FAQ.tsx
│   │   │   ├── Features.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── Header.tsx
│   │   │   ├── Hero.tsx
│   │   │   ├── HowItWorks.tsx
│   │   │   ├── Pricing.tsx
│   │   │   ├── SocialProof.tsx
│   │   │   ├── Testimonials.tsx
│   │   │   └── index.ts
│   │   ├── layout/      # Componentes de layout estrutural
│   │   │   ├── FeedSidebar.tsx
│   │   │   ├── Header.tsx
│   │   │   ├── index.ts
│   │   │   ├── MobileBottomBar.tsx
│   │   │   ├── Navbar.tsx
│   │   │   ├── RootLayout.tsx
│   │   │   └── Sidebar.tsx
│   │   ├── modals/      # Componentes modais
│   │   │   ├── CreateCommunityModal.tsx
│   │   │   ├── CreateContentModal.tsx
│   │   │   ├── CreatePostModal.tsx
│   │   │   ├── CreateVideoModal.tsx
│   │   │   ├── index.ts
│   │   │   ├── PostViewModal.tsx
│   │   │   └── VideoViewModal.tsx
│   │   └── profile/     # Componentes de perfil do usuário
│   │       ├── FeaturedPost.module.css
│   │       ├── FeaturedPost.tsx
│   │       ├── ImageCropModal.module.css
│   │       ├── ImageCropModal.tsx
│   │       ├── index.ts
│   │       ├── PostCard.module.css
│   │       ├── PostCard.tsx
│   │       ├── ProfileBanner.module.css
│   │       ├── ProfileBanner.tsx
│   │       ├── ProfileBannerEditable.module.css
│   │       ├── ProfileBannerEditable.tsx
│   │       ├── RecentPosts.module.css
│   │       └── RecentPosts.tsx
│   ├── contexts/        # Contextos React para estado global
│   │   ├── AuthContext.tsx
│   │   ├── ModalContext.tsx
│   │   ├── NotificationContext.tsx
│   │   └── UIContext.tsx
│   ├── hooks/           # Hooks customizados para lógica reutilizável
│   │   ├── useAuth.ts
│   │   ├── useFeed.ts
│   │   ├── useInfiniteScroll.ts
│   │   ├── useModal.ts
│   │   ├── useNotification.ts
│   │   ├── useProfileEdit.ts
│   │   ├── useProfileSetup.ts
│   │   ├── useSearch.ts
│   │   └── useUI.ts
│   ├── lib/             # Bibliotecas e configurações
│   │   └── supabaseAuth.ts
│   ├── pages/           # Componentes de página (rotas)
│   │   ├── AuthCallback.tsx
│   │   ├── CommunitiesPage.tsx
│   │   ├── CommunityPage.tsx
│   │   ├── CreateCommunityPage.tsx
│   │   ├── Dashboard.tsx
│   │   ├── EmailConfirmation.tsx
│   │   │   ├── EmailConfirmationSuccess.tsx
│   │   ├── ExplorePage.tsx
│   │   ├── HomePage.tsx
│   │   ├── LandingPage.tsx
│   │   ├── Login.tsx
│   │   ├── MessagesPage.tsx
│   │   ├── NotificationsPage.tsx
│   │   ├── PostViewPage.tsx
│   │   ├── ProfileEditPage.tsx
│   │   ├── ProfilePage.tsx
│   │   ├── ProfileSetup.tsx
│   │   ├── SearchResultsPage.tsx
│   │   ├── SettingsPage.tsx
│   │   └── Signup.tsx
│   ├── services/        # Serviços organizados por domínio (arquitetura modular)
│   │   ├── auth/        # Serviços de autenticação
│   │   │   ├── EmailAuthService.ts
│   │   │   ├── index.ts
│   │   │   ├── OAuthService.ts
│   │   │   ├── ProfileService.ts
│   │   │   └── RedirectService.ts
│   │   ├── authService.ts  # Serviço legado (manter compatibilidade)
│   │   ├── content/     # Serviços de conteúdo
│   │   │   ├── ContentTransformer.ts
│   │   │   ├── FeedService.ts
│   │   │   ├── FileUploadService.ts
│   │   │   ├── index.ts
│   │   │   ├── PostService.ts
│   │   │   ├── SearchService.ts
│   │   │   └── VideoService.ts
│   │   └── contentService.ts # Serviço legado (manter compatibilidade)
│   ├── styles/          # Arquivos de estilo organizados
│   │   ├── CommunitiesPage.css
│   │   ├── CommunityPage.css
│   │   ├── ContentCard.css
│   │   ├── FeedSidebar.css
│   │   ├── globals.css
│   │   ├── Header.css
│   │   ├── HomePage.css
│   │   ├── landing-page.css
│   │   ├── login.css
│   │   ├── MessagesPage.css
│   │   ├── modals.css
│   │   ├── notifications.css
│   │   ├── NotificationsPage.css
│   │   ├── RootLayout.css
│   │   ├── SettingsPage.css
│   │   ├── Sidebar.css
│   │   └── UserSuggestions.css
│   ├── types/           # Definições TypeScript organizadas por domínio
│   │   ├── auth.ts      # Tipos de autenticação
│   │   ├── community.ts # Tipos de comunidades
│   │   ├── content.ts   # Tipos de conteúdo
│   │   ├── modal.ts     # Tipos de modais
│   │   ├── notification.ts # Tipos de notificações
│   │   ├── profile.ts   # Tipos de perfil
│   │   └── ui.ts        # Tipos de interface do usuário
│   ├── utils/           # Utilitários e configurações
│   │   ├── communityUtils.ts
│   │   ├── constants.ts
│   │   ├── generateUniqueUsername.ts
│   │   ├── mediaUtils.ts
│   │   ├── profileUtils.ts
│   │   ├── supabaseAdminClient.ts
│   │   └── supabaseClient.ts
│   ├── App.tsx          # Componente raiz com roteamento
│   └── main.tsx         # Ponto de entrada da aplicação
├── public/              # Assets públicos
│   └── vite.svg
├── .env.example         # Exemplo de variáveis de ambiente
├── .gitignore           # Arquivos ignorados pelo Git
├── index.html           # Template HTML
├── package.json         # Dependências e scripts
├── tsconfig.json        # Configuração TypeScript
├── vite.config.ts       # Configuração Vite
└── dist/                # Build de produção (gerado automaticamente)
```

### Fluxo de Autenticação

1. O usuário acessa a landing page ou página de login
2. O AuthProvider gerencia o estado de autenticação
3. Login via Google OAuth, Facebook OAuth ou email/senha
4. Perfil do usuário é sincronizado com a tabela 'users' no Supabase
5. Sessão é mantida e atualizada automaticamente

#### Segurança

- **Sem exposição de chaves**: As credenciais são armazenadas no servidor Supabase
- **OAuth seguro**: Utiliza fluxo OAuth 2.0 padrão da indústria
- **Validação server-side**: Toda autenticação é validada pelo Supabase

### CI/CD

- **Plataforma**: GitHub Actions com auto-merge inteligente
- **Conventional Commits**: Padrão de commits obrigatório com Commitlint
- **Git Hooks**: Husky para validação automática de commits
- **Auto-merge**: Fusão automática de PRs com labels específicas
- **Workflow**: Build, lint e testes automatizados em pushes e PRs
- **Ambiente**: Ubuntu com Node.js 20

#### Funcionalidades de CI/CD

- **Validação de Commits**: Commits seguem padrão conventional (feat, fix, refactor, etc.)
- **Linting Automático**: ESLint e TypeScript strict mode
- **Build Otimizado**: Code splitting e chunking inteligente
- **Auto-merge**: PRs com labels `auto-merge`, `dependencies` ou `automated` são mesclados automaticamente
- **Deploy Preview**: Ambiente de staging para testes (atualmente desabilitado)

#### Conventional Commits

```bash
# Exemplos de commits válidos
feat: adicionar sistema de autenticação Facebook
fix: corrigir bug no upload de imagens
refactor: reorganizar estrutura de serviços
docs: atualizar documentação do README
```

### Desenvolvimento

- **Git Hooks**: Husky + Commitlint para qualidade de commits
- **Linting**: ESLint integrado ao processo de build
- **TypeScript**: Configuração strict com checagem rigorosa de tipos
- **Code Splitting**: Otimização automática de bundles com Vite
- **Hot Reload**: Recarregamento instantâneo durante desenvolvimento

## Setup

### Pré-requisitos

- Node.js 18 ou superior
- npm ou yarn
- Conta no Supabase (para configuração da autenticação)
- Commitizen (para commits convencionais): `npm install -g commitizen`

### Instalação

1. Clone o repositório:

```bash
git clone <url-do-repositorio>
cd premiora-tcc
```

1. Instale as dependências do projeto e ferramentas de desenvolvimento:

```bash
cd premiora-web
npm install

# Ferramentas de desenvolvimento (no diretório raiz)
cd ..
npm install
```

1. Configure as variáveis de ambiente (se necessário):
   - O cliente Supabase já está configurado em `src/supabaseClient.ts`
   - Para produção, configure as chaves do Supabase adequadamente

2. Execute o projeto em modo desenvolvimento:

```bash
npm run dev
```

1. Para build de produção (compila TypeScript e gera bundle otimizado):

```bash
npm run build
```

1. Para preview do build:

```bash
npm run preview
```

## Uso

### Navegação

- **Página Inicial (/)**: Landing page com informações sobre a plataforma
- **Dashboard (/dashboard)**: Página principal após login com feed de conteúdo, tendências e sugestões
- **Explorar (/explore)**: Descubra novos conteúdos e criadores
- **Comunidades (/communities)**: Navegue e participe de comunidades
- **Configurações (/settings)**: Personalize sua experiência
- **Login (/login)**: Página de autenticação com opções de login via Google, Facebook ou email/senha

### Funcionalidades

#### Busca e Descoberta

- **Busca Global**: Encontre usuários, comunidades e posts rapidamente
- **Tendências**: Veja tópicos em alta e discussões populares
- **Sugestões**: Recomendações personalizadas de quem seguir

#### Autenticação e Usuários

- **Registro**: Crie uma conta usando email/senha, Google OAuth ou Facebook OAuth
- **Login**: Acesse sua conta existente com múltiplos provedores
- **Logout**: Desconecte-se da plataforma com limpeza de sessão
- **Perfil**: Gerencie seu perfil e configurações pessoais

#### Sistema de Tiers (Monetização)

- **Criação de Tiers**: Criadores definem níveis de assinatura (Supporters, Premium)
- **Controle de Acesso**: Conteúdo exclusivo baseado em tier do usuário
- **Preview de Conteúdo**: Amostra de conteúdo premium para não-assinantes
- **Gestão de Assinaturas**: Interface para gerenciar assinantes e tiers

#### Conteúdo e Feed

- **Posts e Vídeos**: Crie e compartilhe conteúdo diversificado
- **Feed Personalizado**: Timeline com conteúdo relevante
- **Upload de Arquivos**: Suporte a imagens e vídeos
- **Interação Social**: Likes, comentários e compartilhamento

#### Comunidades

- **Criação e Gestão**: Crie suas próprias comunidades com banners personalizados
- **Postagens**: Compartilhe conteúdo específico dentro de comunidades
- **Flairs**: Categorize discussões com etiquetas personalizadas
- **Integração com Tiers**: Controle de acesso baseado em assinatura
- **Moderação**: Ferramentas para gerenciar membros e conteúdo

### Servidor de Desenvolvimento

- Execute `npm run dev` para iniciar o servidor de desenvolvimento
- A aplicação estará disponível em `http://localhost:5173` (porta padrão do Vite)
- Modificações no código são recarregadas automaticamente
- OAuth redirects funcionam automaticamente com qualquer porta Vite

### Deploy

#### Status Atual: Vercel Temporariamente Desabilitado

O deploy no Vercel está temporariamente desabilitado para desenvolvimento local. Para reativar:

1. **Renomeie** `premiora-web/vercel.json.disabled` → `premiora-web/vercel.json`
2. **Descomente** o job `deploy-preview` no arquivo `.github/workflows/ci.yml`
3. **Configure Supabase** com URLs do Vercel em vez de localhost
4. **Remova** a nota de status em `DEPLOYMENT.md`

#### CI/CD Automatizado

- **GitHub Actions**: Build automatizado em pushes e pull requests
- **Ambiente**: Ubuntu com Node.js 20
- **Deploy**: Desabilitado até reativação do Vercel

## Tecnologias Utilizadas

- **React 19**: Biblioteca para construção de interfaces
- **TypeScript**: Superset do JavaScript com tipagem estática
- **Vite**: Ferramenta de build rápida para projetos web
- **Supabase**: Plataforma backend-as-a-service para autenticação e banco de dados
- **React Router DOM**: Roteamento para aplicações React
- **GitHub Actions**: Automação de CI/CD

## Contribuição

### Processo de Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças seguindo o padrão **Conventional Commits**
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

### Conventional Commits

Este projeto utiliza **Conventional Commits** para manter um histórico de mudanças claro e automatizar o versionamento. Todos os commits devem seguir o padrão:

```bash
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

#### Tipos de Commit

- `feat`: Nova funcionalidade
- `fix`: Correção de bug
- `refactor`: Refatoração de código (sem mudança funcional)
- `docs`: Mudanças na documentação
- `style`: Mudanças de estilo (formatação, etc.)
- `test`: Adição ou correção de testes
- `chore`: Mudanças em ferramentas, configurações, etc.

#### Exemplos

```bash
feat: adicionar sistema de autenticação Facebook
fix: corrigir bug no upload de imagens
refactor: reorganizar estrutura de serviços
docs: atualizar documentação do README
chore: atualizar dependências do package.json
```

#### Commits Inválidos

```bash
# ❌ Não usar
"adiciona nova feature"
"fix bug"
"update"
```

### Git Hooks

O projeto utiliza **Husky** para executar hooks de git automaticamente:

- **pre-commit**: Executa linting e formatação
- **commit-msg**: Valida formato do commit com Commitlint

### Pull Requests

- Use títulos descritivos seguindo conventional commits
- Adicione labels apropriadas para auto-merge quando aplicável:
  - `auto-merge`: PRs que podem ser mesclados automaticamente
  - `dependencies`: Atualizações de dependências
  - `automated`: Mudanças geradas por ferramentas
- Mantenha PRs pequenos e focados em uma funcionalidade
- Inclua testes quando aplicável

### Desenvolvimento Local

1. Instale dependências: `npm install`
2. Execute em modo desenvolvimento: `npm run dev`
3. Para commits, use: `npm run commit` (abre interface interativa)
4. Para build: `npm run build`

#### Como Usar o Comando de Commit

O projeto utiliza **Commitizen** para criar commits padronizados seguindo Conventional Commits.

##### Fluxo Completo de Commit

```bash
# 1. Fazer mudanças no código
# 2. Adicionar arquivos ao stage
git add .

# 3. Criar commit interativo
npm run commit

# 4. Seguir as instruções na tela:
#    - Selecionar tipo de commit
#    - Adicionar escopo (opcional)
#    - Descrição curta
#    - Descrição longa (opcional)
#    - Marcar breaking changes (se aplicável)

# 5. Verificar se o commit foi criado
git log --oneline -1

# 6. Enviar para repositório remoto
git push origin <nome-da-branch>
```

##### Tipos de Commit Disponíveis

| Tipo       | Descrição           | Exemplo                             |
| ---------- | ------------------- | ----------------------------------- |
| `feat`     | Nova funcionalidade | `feat: adicionar login com Google`  |
| `fix`      | Correção de bug     | `fix: corrigir upload de imagens`   |
| `docs`     | Documentação        | `docs: atualizar README`            |
| `style`    | Formatação          | `style: formatar código`            |
| `refactor` | Refatoração         | `refactor: reorganizar componentes` |
| `perf`     | Performance         | `perf: otimizar queries`            |
| `test`     | Testes              | `test: adicionar testes unitários`  |
| `chore`    | Ferramentas         | `chore: atualizar dependências`     |

##### Validação Automática

- **Git Hooks**: Commits são validados automaticamente pelo Husky
- **Commitlint**: Garante formato correto dos commits
- **Rejeição**: Commits fora do padrão são rejeitados

##### Troubleshooting

**Se aparecer "nothing to commit, working tree clean":**

```bash
# Verifique se há arquivos modificados
git status

# Adicione arquivos ao stage
git add .

# Tente novamente
npm run commit
```

**Se o commitizen não abrir a interface interativa:**

```bash
# Verifique se o commitizen está instalado
npm list cz-conventional-changelog

# Reinstale se necessário
npm install cz-conventional-changelog
```

**Se os git hooks não funcionarem:**

```bash
# Execute manualmente para testar
npx lint-staged
npx commitlint --edit .git/COMMIT_EDITMSG
```

## Licença

Este projeto está sob a licença MIT. Veja o arquivo LICENSE para mais detalhes.
