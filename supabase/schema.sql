-- ==============================================================================
-- CAMPUS AUTOMASI - COMPLETE SUPABASE SQL SCHEMA
-- ==============================================================================

-- 1. Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Profiles Table (Stores user metadata, Telegram Chat ID, and Budget)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    telegram_chat_id BIGINT UNIQUE,
    weekly_budget NUMERIC(12, 2) DEFAULT 0.00 CHECK (weekly_budget >= 0),
    timezone TEXT DEFAULT 'Asia/Jakarta',
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger to auto-create profile on Supabase Auth signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id)
    VALUES (new.id)
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 3. Finance Tracker Table
DO $$ BEGIN
    CREATE TYPE transaction_category AS ENUM (
        'Transportasi', 
        'Uang Makan', 
        'Uang Print', 
        'Lain-lain'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    category transaction_category NOT NULL,
    amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
    note TEXT,
    transaction_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_transactions_user_date ON public.transactions(user_id, transaction_date);

-- 4. Class Schedule Table
CREATE TABLE IF NOT EXISTS public.classes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    course_name TEXT NOT NULL,
    day_of_week INT NOT NULL CHECK (day_of_week BETWEEN 0 AND 6), -- 0 = Sunday, 1 = Monday, etc.
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    room TEXT,
    lecturer TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_classes_schedule ON public.classes(day_of_week, start_time) WHERE is_active = TRUE;

-- 5. Task Management Table
CREATE TABLE IF NOT EXISTS public.tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    deadline TIMESTAMPTZ NOT NULL,
    is_completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tasks_deadline ON public.tasks(user_id, deadline) WHERE is_completed = FALSE;

-- 6. Quick Notes Table
CREATE TABLE IF NOT EXISTS public.quick_notes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    content TEXT DEFAULT '',
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Row Level Security (RLS) Setup
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quick_notes ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any to avoid errors on rerun
DROP POLICY IF EXISTS "Users access own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users access own transactions" ON public.transactions;
DROP POLICY IF EXISTS "Users access own classes" ON public.classes;
DROP POLICY IF EXISTS "Users access own tasks" ON public.tasks;
DROP POLICY IF EXISTS "Users access own quick notes" ON public.quick_notes;

CREATE POLICY "Users access own profile" ON public.profiles FOR ALL USING (auth.uid() = id);
CREATE POLICY "Users access own transactions" ON public.transactions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users access own classes" ON public.classes FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users access own tasks" ON public.tasks FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users access own quick notes" ON public.quick_notes FOR ALL USING (auth.uid() = user_id);

-- 8. Supabase Storage Setup for .ppt, .pptx, and .pdf
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'campus-files',
    'campus-files',
    false,
    52428800, -- 50MB Limit
    ARRAY[
        'application/pdf', 
        'application/vnd.ms-powerpoint', 
        'application/vnd.openxmlformats-officedocument.presentationml.presentation'
    ]
)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Allow authenticated user uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow user read own files" ON storage.objects;
DROP POLICY IF EXISTS "Allow user delete own files" ON storage.objects;

CREATE POLICY "Allow authenticated user uploads"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
    bucket_id = 'campus-files' AND 
    (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Allow user read own files"
ON storage.objects FOR SELECT TO authenticated
USING (
    bucket_id = 'campus-files' AND 
    (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Allow user delete own files"
ON storage.objects FOR DELETE TO authenticated
USING (
    bucket_id = 'campus-files' AND 
    (storage.foldername(name))[1] = auth.uid()::text
);
