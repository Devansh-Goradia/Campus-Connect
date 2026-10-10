-- ═══════════════════════════════════════════════════════════════════════════
-- CampusConnect · Supabase PostgreSQL Schema + RLS
-- Run this in: Supabase Dashboard → SQL Editor → New Query → Run
-- ═══════════════════════════════════════════════════════════════════════════

-- ── 1. Users (extends auth.users) ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.users (
  id                  UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name        TEXT NOT NULL,
  email               TEXT UNIQUE NOT NULL,
  avatar_url          TEXT,
  campus_id_url       TEXT,
  verification_status TEXT NOT NULL DEFAULT 'pending'
                        CHECK (verification_status IN ('pending','approved','rejected')),
  instagram_handle    TEXT,
  linkedin_url        TEXT,
  created_at          TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_select_own" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "users_update_own" ON public.users
  FOR UPDATE USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Allow insert on sign-up (triggered by auth hook)
CREATE POLICY "users_insert_own" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);


-- ── 2. Interests (reference data, readable by all auth users) ─────────────
CREATE TABLE IF NOT EXISTS public.interests (
  id    SERIAL PRIMARY KEY,
  label TEXT UNIQUE NOT NULL,
  emoji TEXT NOT NULL,
  color TEXT NOT NULL
);

ALTER TABLE public.interests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "interests_select_auth" ON public.interests
  FOR SELECT TO authenticated USING (true);

INSERT INTO public.interests (label, emoji, color) VALUES
  ('AI / ML',          '🤖', 'blue'),
  ('Coding',           '💻', 'cyan'),
  ('Startup Pitching', '🚀', 'purple'),
  ('Gym',              '🏋️', 'green'),
  ('Trading',          '📈', 'yellow'),
  ('Nightlife',        '🌃', 'pink'),
  ('Drums',            '🥁', 'orange'),
  ('Photography',      '📸', 'rose'),
  ('Gaming',           '🎮', 'indigo'),
  ('Music Production', '🎧', 'violet'),
  ('Reading',          '📚', 'amber'),
  ('Film & Cinema',    '🎬', 'red')
ON CONFLICT (label) DO NOTHING;


-- ── 3. User Interests ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.user_interests (
  user_id     UUID REFERENCES public.users(id) ON DELETE CASCADE,
  interest_id INT  REFERENCES public.interests(id) ON DELETE CASCADE,
  PRIMARY KEY (user_id, interest_id)
);

ALTER TABLE public.user_interests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_interests_all_own" ON public.user_interests
  FOR ALL USING (auth.uid() = user_id);


-- ── 4. Chat Sessions ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.chat_sessions (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_a_id             UUID NOT NULL REFERENCES public.users(id),
  user_b_id             UUID NOT NULL REFERENCES public.users(id),
  alias_a               TEXT NOT NULL,
  alias_b               TEXT NOT NULL,
  avatar_a              TEXT NOT NULL,
  avatar_b              TEXT NOT NULL,
  shared_interests      TEXT[] NOT NULL,
  user_a_wants_reveal   BOOLEAN NOT NULL DEFAULT FALSE,
  user_b_wants_reveal   BOOLEAN NOT NULL DEFAULT FALSE,
  revealed_at           TIMESTAMPTZ,
  status                TEXT NOT NULL DEFAULT 'active'
                          CHECK (status IN ('active','revealed','ended')),
  created_at            TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.chat_sessions ENABLE ROW LEVEL SECURITY;

-- Participants can read their own sessions
CREATE POLICY "sessions_select_participant" ON public.chat_sessions
  FOR SELECT USING (
    auth.uid() = user_a_id OR auth.uid() = user_b_id
  );

-- User A can only update their own reveal flag
CREATE POLICY "sessions_update_a" ON public.chat_sessions
  FOR UPDATE USING (auth.uid() = user_a_id)
  WITH CHECK (auth.uid() = user_a_id);

-- User B can only update their own reveal flag
CREATE POLICY "sessions_update_b" ON public.chat_sessions
  FOR UPDATE USING (auth.uid() = user_b_id)
  WITH CHECK (auth.uid() = user_b_id);

-- Enable real-time
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_sessions;


-- ── 5. Messages ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.messages (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id  UUID NOT NULL REFERENCES public.chat_sessions(id) ON DELETE CASCADE,
  sender_id   UUID NOT NULL REFERENCES public.users(id),
  content     TEXT NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "messages_select_participant" ON public.messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.chat_sessions s
      WHERE s.id = session_id
        AND (s.user_a_id = auth.uid() OR s.user_b_id = auth.uid())
    )
  );

CREATE POLICY "messages_insert_participant" ON public.messages
  FOR INSERT WITH CHECK (
    sender_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM public.chat_sessions s
      WHERE s.id = session_id
        AND (s.user_a_id = auth.uid() OR s.user_b_id = auth.uid())
    )
  );

-- Enable real-time
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;


-- ── 6. Storage Buckets ────────────────────────────────────────────────────
-- Run these in Dashboard → Storage (or via API):
--
--   INSERT INTO storage.buckets (id, name, public)
--   VALUES ('avatars', 'avatars', true);
--
--   INSERT INTO storage.buckets (id, name, public)
--   VALUES ('campus-ids', 'campus-ids', false);  -- private!


-- ── 7. Auth Hook: auto-insert into public.users on sign-up ────────────────
-- Add this as a Database Function + Trigger:

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, display_name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', 'New User'),
    NEW.email
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
