-- ==============================================================================
-- 🌿 Agri AI — Supabase PostgreSQL Database Schema
-- ==============================================================================
-- Run this SQL in your Supabase Project:
-- Supabase Dashboard -> SQL Editor -> New Query -> Paste & Run
-- ==============================================================================

-- 1. Enable UUID Extension (standard in PostgreSQL/Supabase)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ------------------------------------------------------------------------------
-- Table 1: profiles
-- Stores farmer identity and contact info (linked to Supabase auth.users)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    phone TEXT,
    village TEXT,
    district TEXT DEFAULT 'Hyderabad',
    state TEXT DEFAULT 'Telangana',
    preferred_lang TEXT DEFAULT 'te',
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ------------------------------------------------------------------------------
-- Table 2: farmer_profiles
-- Stores agricultural & farm property details (acres, crop, soil)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.farmer_profiles (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    land_acres NUMERIC DEFAULT 2.5,
    soil_type TEXT DEFAULT 'Red Loam',
    primary_crop TEXT DEFAULT 'Tomato',
    farming_type TEXT DEFAULT 'Natural / Organic',
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ------------------------------------------------------------------------------
-- Table 3: predictions
-- Stores disease diagnosis history for each farmer
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.predictions (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    disease_name TEXT NOT NULL,
    display_name TEXT NOT NULL,
    confidence NUMERIC(5, 2) NOT NULL,
    severity TEXT,
    crop_type TEXT,
    pesticide TEXT,
    fertilizer TEXT,
    location_village TEXT,
    image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ------------------------------------------------------------------------------
-- Indexes for Performance
-- ------------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_predictions_user_id ON public.predictions(user_id);
CREATE INDEX IF NOT EXISTS idx_predictions_created_at ON public.predictions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_profiles_phone ON public.profiles(phone);
CREATE INDEX IF NOT EXISTS idx_profiles_district ON public.profiles(district);

-- ------------------------------------------------------------------------------
-- Row Level Security (RLS) Setup
-- ------------------------------------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.farmer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.predictions ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile"
    ON public.profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Service role full access on profiles" ON public.profiles;
CREATE POLICY "Service role full access on profiles"
    ON public.profiles FOR ALL
    USING (auth.role() = 'service_role');

-- Farmer Profiles Policies
DROP POLICY IF EXISTS "Users can view own farmer profile" ON public.farmer_profiles;
CREATE POLICY "Users can view own farmer profile"
    ON public.farmer_profiles FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own farmer profile" ON public.farmer_profiles;
CREATE POLICY "Users can update own farmer profile"
    ON public.farmer_profiles FOR UPDATE
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own farmer profile" ON public.farmer_profiles;
CREATE POLICY "Users can insert own farmer profile"
    ON public.farmer_profiles FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Service role full access on farmer_profiles" ON public.farmer_profiles;
CREATE POLICY "Service role full access on farmer_profiles"
    ON public.farmer_profiles FOR ALL
    USING (auth.role() = 'service_role');

-- Predictions Policies
DROP POLICY IF EXISTS "Users can view own predictions" ON public.predictions;
CREATE POLICY "Users can view own predictions"
    ON public.predictions FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own predictions" ON public.predictions;
CREATE POLICY "Users can insert own predictions"
    ON public.predictions FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own predictions" ON public.predictions;
CREATE POLICY "Users can delete own predictions"
    ON public.predictions FOR DELETE
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Service role full access on predictions" ON public.predictions;
CREATE POLICY "Service role full access on predictions"
    ON public.predictions FOR ALL
    USING (auth.role() = 'service_role');

-- ------------------------------------------------------------------------------
-- Automatic Profile Creation Trigger
-- When a user signs up in Supabase auth.users, automatically create their
-- public.profiles and public.farmer_profiles rows!
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, phone, village, district, preferred_lang)
    VALUES (
        new.id,
        COALESCE(new.raw_user_meta_data->>'full_name', 'Farmer'),
        COALESCE(new.raw_user_meta_data->>'phone', ''),
        COALESCE(new.raw_user_meta_data->>'village', ''),
        COALESCE(new.raw_user_meta_data->>'district', 'Hyderabad'),
        COALESCE(new.raw_user_meta_data->>'preferred_lang', 'te')
    )
    ON CONFLICT (id) DO NOTHING;

    INSERT INTO public.farmer_profiles (user_id)
    VALUES (new.id)
    ON CONFLICT (user_id) DO NOTHING;

    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger definition on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==============================================================================
-- Schema setup complete!
-- ==============================================================================
