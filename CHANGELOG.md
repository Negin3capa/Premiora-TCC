# Registro de Alterações (Changelog)

Todas as alterações notáveis neste projeto serão documentadas neste arquivo.

O formato é baseado no [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
e este projeto adere ao [Versionamento Semântico](https://semver.org/spec/v2.0.0.html).

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
