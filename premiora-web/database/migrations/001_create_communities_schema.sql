-- Schema para sistema de comunidades Premiora
-- Este arquivo cria todas as tabelas necessárias para o sistema de comunidades

-- Extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabela principal de comunidades
CREATE TABLE communities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE, -- nome único da comunidade (ex: tecnologia, arte)
  display_name TEXT NOT NULL, -- nome de exibição (ex: "Tecnologia & Inovação")
  description TEXT,
  banner_url TEXT,
  avatar_url TEXT,
  creator_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  is_private BOOLEAN DEFAULT FALSE,
  member_count INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de membros das comunidades
CREATE TABLE community_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  community_id UUID NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('creator', 'moderator', 'member')),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(community_id, user_id)
);

-- Tabela de tiers dentro das comunidades (mapeia para tiers do Patreon-like)
CREATE TABLE community_tiers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  community_id UUID NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
  name TEXT NOT NULL, -- nome do tier (ex: "Bronze", "Prata", "Ouro")
  description TEXT,
  required_creator_tier TEXT, -- tier necessário no Patreon-like do criador
  color TEXT DEFAULT '#6B7280', -- cor do tier
  permissions JSONB DEFAULT '{}', -- permissões específicas do tier
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(community_id, name)
);

-- Tabela de conteúdo das comunidades (posts e vídeos publicados em comunidades)
CREATE TABLE community_content (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  community_id UUID NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
  content_id TEXT NOT NULL, -- ID do conteúdo (pode ser post ou vídeo)
  content_type TEXT NOT NULL CHECK (content_type IN ('post', 'video')),
  author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  published_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_pinned BOOLEAN DEFAULT FALSE,
  UNIQUE(community_id, content_id, content_type)
);

-- Tabela de flairs de posts
CREATE TABLE post_flairs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  community_id UUID NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  text TEXT NOT NULL,
  color TEXT DEFAULT '#6B7280',
  background_color TEXT DEFAULT '#F3F4F6',
  min_tier_id UUID REFERENCES community_tiers(id) ON DELETE SET NULL, -- tier mínimo necessário
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(community_id, name)
);

-- Tabela de flairs de usuários
CREATE TABLE user_flairs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  community_id UUID NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  flair_id UUID NOT NULL REFERENCES post_flairs(id) ON DELETE CASCADE,
  assigned_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(community_id, user_id, flair_id)
);

-- Tabela de tags das comunidades
CREATE TABLE community_tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  community_id UUID NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  color TEXT DEFAULT '#6B7280',
  is_moderator_only BOOLEAN DEFAULT FALSE,
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(community_id, name)
);

-- Tabela de tags aplicadas ao conteúdo
CREATE TABLE content_tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  community_id UUID NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
  content_id TEXT NOT NULL,
  content_type TEXT NOT NULL CHECK (content_type IN ('post', 'video')),
  tag_id UUID NOT NULL REFERENCES community_tags(id) ON DELETE CASCADE,
  tagged_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tagged_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(community_id, content_id, content_type, tag_id)
);

-- Índices para performance
CREATE INDEX idx_communities_creator_id ON communities(creator_id);
CREATE INDEX idx_communities_name ON communities(name);
CREATE INDEX idx_communities_is_private ON communities(is_private);
CREATE INDEX idx_community_members_community_id ON community_members(community_id);
CREATE INDEX idx_community_members_user_id ON community_members(user_id);
CREATE INDEX idx_community_members_role ON community_members(role);
CREATE INDEX idx_community_tiers_community_id ON community_tiers(community_id);
CREATE INDEX idx_community_content_community_id ON community_content(community_id);
CREATE INDEX idx_community_content_content_id ON community_content(content_id);
CREATE INDEX idx_community_content_author_id ON community_content(author_id);
CREATE INDEX idx_post_flairs_community_id ON post_flairs(community_id);
CREATE INDEX idx_user_flairs_community_id ON user_flairs(community_id);
CREATE INDEX idx_user_flairs_user_id ON user_flairs(user_id);
CREATE INDEX idx_community_tags_community_id ON community_tags(community_id);
CREATE INDEX idx_content_tags_community_id ON content_tags(community_id);
CREATE INDEX idx_content_tags_content_id ON content_tags(content_id);

-- Row Level Security (RLS) Policies

-- Communities: público pode ver, apenas criador pode modificar
ALTER TABLE communities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Communities are viewable by everyone" ON communities
  FOR SELECT USING (true);

CREATE POLICY "Users can create communities" ON communities
  FOR INSERT WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Community creators can update their communities" ON communities
  FOR UPDATE USING (auth.uid() = creator_id);

CREATE POLICY "Community creators can delete their communities" ON communities
  FOR DELETE USING (auth.uid() = creator_id);

-- Community Members: membros podem ver membros da comunidade
ALTER TABLE community_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Community members can view membership" ON community_members
  FOR SELECT USING (
    community_id IN (
      SELECT community_id FROM community_members
      WHERE user_id = auth.uid()
    ) OR
    community_id IN (
      SELECT id FROM communities WHERE creator_id = auth.uid()
    )
  );

CREATE POLICY "Users can join communities" ON community_members
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can leave communities, creators/mods can manage members" ON community_members
  FOR DELETE USING (
    auth.uid() = user_id OR
    community_id IN (
      SELECT community_id FROM community_members
      WHERE user_id = auth.uid() AND role IN ('creator', 'moderator')
    )
  );

-- Community Tiers: público pode ver, apenas criador pode modificar
ALTER TABLE community_tiers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Community tiers are viewable by everyone" ON community_tiers
  FOR SELECT USING (true);

CREATE POLICY "Community creators can manage tiers" ON community_tiers
  FOR ALL USING (
    community_id IN (
      SELECT id FROM communities WHERE creator_id = auth.uid()
    )
  );

-- Community Content: membros podem ver, autores podem gerenciar
ALTER TABLE community_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Community content viewable by members" ON community_content
  FOR SELECT USING (
    community_id IN (
      SELECT community_id FROM community_members
      WHERE user_id = auth.uid()
    ) OR
    community_id IN (
      SELECT id FROM communities WHERE NOT is_private
    )
  );

CREATE POLICY "Authors can add content to communities" ON community_content
  FOR INSERT WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Authors and mods can manage community content" ON community_content
  FOR ALL USING (
    auth.uid() = author_id OR
    community_id IN (
      SELECT community_id FROM community_members
      WHERE user_id = auth.uid() AND role IN ('creator', 'moderator')
    )
  );

-- Post Flairs: público pode ver, mods podem gerenciar
ALTER TABLE post_flairs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Post flairs are viewable by everyone" ON post_flairs
  FOR SELECT USING (true);

CREATE POLICY "Community mods can manage post flairs" ON post_flairs
  FOR ALL USING (
    community_id IN (
      SELECT community_id FROM community_members
      WHERE user_id = auth.uid() AND role IN ('creator', 'moderator')
    )
  );

-- User Flairs: público pode ver, mods podem gerenciar
ALTER TABLE user_flairs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "User flairs are viewable by everyone" ON user_flairs
  FOR SELECT USING (true);

CREATE POLICY "Community mods can manage user flairs" ON user_flairs
  FOR ALL USING (
    community_id IN (
      SELECT community_id FROM community_members
      WHERE user_id = auth.uid() AND role IN ('creator', 'moderator')
    )
  );

-- Community Tags: público pode ver, mods podem gerenciar
ALTER TABLE community_tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Community tags are viewable by everyone" ON community_tags
  FOR SELECT USING (true);

CREATE POLICY "Community mods can manage tags" ON community_tags
  FOR ALL USING (
    community_id IN (
      SELECT community_id FROM community_members
      WHERE user_id = auth.uid() AND role IN ('creator', 'moderator')
    )
  );

-- Content Tags: público pode ver, autores e mods podem gerenciar
ALTER TABLE content_tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Content tags are viewable by everyone" ON content_tags
  FOR SELECT USING (true);

CREATE POLICY "Authors and mods can manage content tags" ON content_tags
  FOR ALL USING (
    tagged_by = auth.uid() OR
    community_id IN (
      SELECT community_id FROM community_members
      WHERE user_id = auth.uid() AND role IN ('creator', 'moderator')
    )
  );

-- Funções auxiliares

-- Função para atualizar contagem de membros
CREATE OR REPLACE FUNCTION update_member_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE communities SET member_count = member_count + 1 WHERE id = NEW.community_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE communities SET member_count = member_count - 1 WHERE id = OLD.community_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar contagem de membros
CREATE TRIGGER update_member_count_trigger
  AFTER INSERT OR DELETE ON community_members
  FOR EACH ROW EXECUTE FUNCTION update_member_count();

-- Função para atualizar contagem de uso das tags
CREATE OR REPLACE FUNCTION update_tag_usage_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE community_tags SET usage_count = usage_count + 1 WHERE id = NEW.tag_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE community_tags SET usage_count = usage_count - 1 WHERE id = OLD.tag_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar contagem de uso das tags
CREATE TRIGGER update_tag_usage_count_trigger
  AFTER INSERT OR DELETE ON content_tags
  FOR EACH ROW EXECUTE FUNCTION update_tag_usage_count();

-- Trigger para atualizar updated_at das comunidades
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_communities_updated_at
  BEFORE UPDATE ON communities
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
