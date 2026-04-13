-- Users table (extends auth.users)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Trigger to automatically create profile for new users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, avatar_url)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url'
  );

  -- Automatically add new user to the default server
  INSERT INTO public.server_members (profile_id, server_id, role)
  VALUES (new.id, '123e4567-e89b-12d3-a456-426614174000', 'GUEST')
  ON CONFLICT DO NOTHING;

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();


-- Servers (Guilds)
CREATE TABLE public.servers (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  image_url TEXT,
  invite_code TEXT UNIQUE,
  owner_id UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Server Members
CREATE TABLE public.server_members (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  role TEXT DEFAULT 'GUEST' CHECK (role IN ('ADMIN', 'MODERATOR', 'GUEST')),
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  server_id UUID REFERENCES public.servers(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(profile_id, server_id)
);

-- Channels
CREATE TABLE public.channels (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT DEFAULT 'TEXT' CHECK (type IN ('TEXT', 'AUDIO', 'VIDEO')),
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  server_id UUID REFERENCES public.servers(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Messages
CREATE TABLE public.messages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  content TEXT NOT NULL,
  file_url TEXT,
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  channel_id UUID REFERENCES public.channels(id) ON DELETE CASCADE NOT NULL,
  deleted BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Set up Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.servers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.server_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Enable Realtime for relevant tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.channels;
ALTER PUBLICATION supabase_realtime ADD TABLE public.server_members;

-- Triggers for updated_at
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_messages_updated_at
BEFORE UPDATE ON public.messages
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

-- Basic RLS Policies (For prototyping, these can be tightened later)
CREATE POLICY "Public profiles are viewable by everyone." ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile." ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile." ON public.profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Servers are viewable by members." ON public.servers FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.server_members WHERE server_id = public.servers.id AND profile_id = auth.uid())
);
CREATE POLICY "Anyone can create a server." ON public.servers FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Members are viewable by everyone." ON public.server_members FOR SELECT USING (true);
CREATE POLICY "Anyone can join a server." ON public.server_members FOR INSERT WITH CHECK (auth.uid() = profile_id);

CREATE POLICY "Channels are viewable by members." ON public.channels FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.server_members WHERE server_id = public.channels.server_id AND profile_id = auth.uid())
);
CREATE POLICY "Admins/Mods can create channels." ON public.channels FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.server_members WHERE server_id = public.channels.server_id AND profile_id = auth.uid() AND role IN ('ADMIN', 'MODERATOR'))
);

CREATE POLICY "Messages are viewable by channel members." ON public.messages FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.channels c JOIN public.server_members sm ON c.server_id = sm.server_id WHERE c.id = public.messages.channel_id AND sm.profile_id = auth.uid())
);
CREATE POLICY "Members can send messages." ON public.messages FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.channels c JOIN public.server_members sm ON c.server_id = sm.server_id WHERE c.id = public.messages.channel_id AND sm.profile_id = auth.uid())
);


-- Seed Initial Data for the Default Server and Channels
INSERT INTO public.servers (id, name, invite_code)
VALUES ('123e4567-e89b-12d3-a456-426614174000', 'Default Server', 'DEFAULT')
ON CONFLICT DO NOTHING;

INSERT INTO public.channels (id, name, type, server_id)
VALUES
  ('123e4567-e89b-12d3-a456-426614174000', 'general', 'TEXT', '123e4567-e89b-12d3-a456-426614174000'),
  ('123e4567-e89b-12d3-a456-426614174001', 'random', 'TEXT', '123e4567-e89b-12d3-a456-426614174000'),
  ('voice-123e4567-e89b-12d3-a456-426614174002', 'General Voice', 'AUDIO', '123e4567-e89b-12d3-a456-426614174000')
ON CONFLICT DO NOTHING;