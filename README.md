# Premiora-TCC

Projeto SaaS, buscando unir as qualidades do Patreon/Discord/Reddit/Youtube em um só lugar.

## Descrição

O Premiora é uma plataforma revolucionária que combina o melhor de múltiplas redes sociais e plataformas de monetização em um único ecossistema. Criadores de conteúdo podem construir comunidades engajadas, compartilhar conteúdo diversificado e monetizar suas criações de forma inteligente, tudo em um só lugar.

Para informações detalhadas sobre a arquitetura técnica, padrões de design e decisões técnicas, consulte o arquivo [ARCHITECTURE.md](./ARCHITECTURE.md).

## Arquitetura

O projeto é estruturado da seguinte forma:

### Frontend

- **Framework**: React 19.2.0 com TypeScript ~5.9.3
- **Build Tool**: Vite ^7.1.7
- **Roteamento**: React Router DOM ^7.9.4
- **Estilização**: CSS personalizado (App.css, style.css)

### Autenticação

- **Provedor**: Supabase
- **Métodos**: Login com Google OAuth, Facebook OAuth e email/senha
- **Contexto**: AuthContext para gerenciamento de estado de autenticação

### Estrutura de Arquivos

```
premiora-web/
├── src/
│   ├── pages/           # Componentes de página
│   │   ├── LandingPage.tsx
│   │   ├── HomePage.tsx
│   │   └── Login.tsx
│   ├── components/      # Componentes reutilizáveis
│   │   ├── auth/        # Componentes de autenticação
│   │   │   ├── ProtectedRoute.tsx
│   │   │   └── PublicRoute.tsx
│   │   ├── common/      # Componentes comuns
│   │   │   ├── CommunityDropdown.tsx
│   │   │   ├── ErrorBoundary.tsx
│   │   │   └── FileUpload.tsx
│   │   ├── content/     # Componentes de conteúdo
│   │   │   ├── ContentCard.tsx
│   │   │   ├── Feed.tsx
│   │   │   └── HomePage.tsx (removido - movido para pages/)
│   │   ├── forms/       # Componentes de formulários
│   │   │   └── Benefits.tsx
│   │   ├── landing/     # Componentes da landing page
│   │   │   ├── Header.tsx
│   │   │   ├── Hero.tsx
│   │   │   ├── Features.tsx
│   │   │   ├── Testimonials.tsx
│   │   │   ├── Pricing.tsx
│   │   │   ├── FAQ.tsx
│   │   │   ├── CTA.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── HowItWorks.tsx
│   │   │   ├── SocialProof.tsx
│   │   │   └── index.ts
│   │   ├── layout/      # Componentes de layout
│   │   │   ├── Header.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   ├── Navbar.tsx
│   │   │   └── index.ts
│   │   └── modals/      # Componentes de modal
│   │       ├── CreateCommunityModal.tsx
│   │       ├── CreateContentModal.tsx
│   │       ├── CreatePostModal.tsx
│   │       ├── CreateVideoModal.tsx
│   │       └── index.ts
│   ├── hooks/           # Hooks customizados
│   │   └── useAuth.ts
│   ├── contexts/        # Contextos React
│   │   └── AuthContext.tsx
│   ├── types/           # Definições de tipos TypeScript
│   │   └── content.ts
│   ├── utils/           # Utilitários e configurações
│   │   ├── constants.ts
│   │   └── supabaseClient.ts
│   ├── styles/          # Arquivos de estilo
│   │   ├── globals.css
│   │   ├── HomePage.css
│   │   ├── landing-page.css
│   │   ├── login.css
│   │   └── modals.css
│   ├── App.tsx          # Componente principal com roteamento
│   └── main.ts          # Ponto de entrada da aplicação
├── public/              # Assets públicos
│   └── vite.svg
├── dist/                # Build de produção (gerado automaticamente)
├── package.json         # Dependências e scripts
├── tsconfig.json        # Configuração TypeScript
└── index.html           # Template HTML
```

### Fluxo de Autenticação

1. O usuário acessa a landing page ou página de login
2. O AuthProvider gerencia o estado de autenticação
3. Login via Google OAuth, Facebook OAuth ou email/senha
4. Perfil do usuário é sincronizado com a tabela 'users' no Supabase
5. Sessão é mantida e atualizada automaticamente

### Integração Facebook OAuth

A aplicação suporta login com Facebook através do Supabase OAuth. A integração é implementada utilizando as seguintes funcionalidades:

#### Funcionalidades Implementadas

- **Login com Facebook**: Permite que usuários façam login utilizando suas contas do Facebook
- **Botão dedicado**: Interface intuitiva com botão azul característico do Facebook
- **Redirecionamento automático**: Após login bem-sucedido, redireciona para `/home`
- **Tratamento de erros**: Exibe mensagens específicas para falhas na autenticação

#### Implementação Técnica

```typescript
/**
 * Realiza login com Facebook usando OAuth do Supabase
 * Requer configuração prévia do aplicativo Facebook no Supabase
 */
const signInWithFacebook = async () => {
  setLoading(true);
  try {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "facebook",
      options: {
        redirectTo: `${window.location.origin}/home`,
      },
    });
    if (error) {
      console.error("Erro ao fazer login com Facebook:", error.message);
      throw error;
    }
  } catch (err) {
    setLoading(false);
    throw err;
  }
};
```

#### Configuração Necessária

Para ativar o login com Facebook, é necessário:

1. **Aplicativo Facebook**: Criar um app no [Facebook Developers](https://developers.facebook.com/)
2. **Supabase Dashboard**: Configurar as credenciais OAuth no painel do Supabase
3. **Permissões**: Solicitar permissões básicas (email, public_profile)
4. **URL de Redirecionamento**: Configurar URL de callback no Facebook e no Supabase

#### Componentes Modificados

- `AuthContext.tsx`: Adicionado método `signInWithFacebook` e interface atualizada
- `Login.tsx`: Adicionado botão Facebook e handler correspondente
- `index.css`: Estilos para `.facebook-login-button` e `.facebook-icon`

#### Segurança

- **Sem exposição de chaves**: As credenciais são armazenadas no servidor Supabase
- **OAuth seguro**: Utiliza fluxo OAuth 2.0 padrão da indústria
- **Validação server-side**: Toda autenticação é validada pelo Supabase

### CI/CD

- **Plataforma**: GitHub Actions
- **Workflow**: Build automatizado em pushes e pull requests para a branch main
- **Ambiente**: Ubuntu com Node.js 18

### Desenvolvimento

- **Linting**: Markdownlint para documentação
- **Formatação**: Prettier para padronização de código
- **TypeScript**: Configuração strict com checagem rigorosa de tipos

## Setup

### Pré-requisitos

- Node.js 18 ou superior
- npm ou yarn
- Conta no Supabase (para configuração da autenticação)

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
- **Login (/login)**: Página de autenticação com opções de login via Google ou email/senha

### Funcionalidades

- **Registro**: Crie uma conta usando email/senha ou Google OAuth
- **Login**: Acesse sua conta existente
- **Logout**: Desconecte-se da plataforma

### Servidor de Desenvolvimento

- Execute `npm run dev` para iniciar o servidor de desenvolvimento
- A aplicação estará disponível em `http://localhost:5173` (porta padrão do Vite)
- Modificações no código são recarregadas automaticamente

### Deploy

O projeto inclui configuração de CI/CD via GitHub Actions. Todo push para a branch main dispara um build automatizado que verifica a sintaxe e compila o projeto.

## Tecnologias Utilizadas

- **React 19**: Biblioteca para construção de interfaces
- **TypeScript**: Superset do JavaScript com tipagem estática
- **Vite**: Ferramenta de build rápida para projetos web
- **Supabase**: Plataforma backend-as-a-service para autenticação e banco de dados
- **React Router DOM**: Roteamento para aplicações React
- **GitHub Actions**: Automação de CI/CD

## Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -am 'Adiciona nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

## Licença

Este projeto está sob a licença MIT. Veja o arquivo LICENSE para mais detalhes.
