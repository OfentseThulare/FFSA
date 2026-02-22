-- Run this in your Supabase SQL Editor to create the required tables

-- Teams Table
CREATE TABLE IF NOT EXISTS public.teams (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  "teamName" text NOT NULL,
  "managerName" text NOT NULL,
  "managerEmail" text NOT NULL,
  "managerPhone" text,
  "numPlayers" text,
  "homeGround" text,
  "notes" text,
  "status" text DEFAULT 'Pending Payment',
  "date" timestamp with time zone DEFAULT now()
);

-- Note: The frontend uses camelCase for properties, so we maintain quotes in SQL creation to prevent Postgres from lowercasing them automatically.

-- Players Table
CREATE TABLE IF NOT EXISTS public.players (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  "firstName" text NOT NULL,
  "lastName" text NOT NULL,
  "dob" text,
  "age" integer,
  "gender" text,
  "nationality" text,
  "idNumber" text,
  "email" text NOT NULL,
  "phone" text,
  "emergencyName" text,
  "emergencyPhone" text,
  "team" text,
  "offPos" text,
  "defPos" text,
  "medical" text,
  "photo" text,
  "status" text DEFAULT 'Registered',
  "date" timestamp with time zone DEFAULT now()
);

-- Set Row Level Security (RLS) to allow public inserts/selects for demo purposes
-- WARNING: In a production environment, you should secure these endpoints with proper auth!
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.players ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to teams" ON public.teams FOR SELECT USING (true);
CREATE POLICY "Allow public insert access to teams" ON public.teams FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public read access to players" ON public.players FOR SELECT USING (true);
CREATE POLICY "Allow public insert access to players" ON public.players FOR INSERT WITH CHECK (true);
