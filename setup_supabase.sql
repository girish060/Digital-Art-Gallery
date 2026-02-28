-- Supabase Database Schema for Artify-v2

-- Enable UUID extension if not already enabled
create extension if not exists "uuid-ossp";

-- Create profiles table
create table public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  username text unique,
  full_name text,
  bio text,
  website text,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security
alter table public.profiles enable row level security;

-- Create policies for profiles
create policy "Public profiles are viewable by everyone." on profiles
  for select using (true);

create policy "Users can insert their own profile." on profiles
  for insert with check (auth.uid() = id);

create policy "Users can update own profile." on profiles
  for update using (auth.uid() = id);

-- Create artworks table
create table public.artworks (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text,
  price numeric,
  image_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  artist_id uuid references auth.users(id) on delete cascade not null,
  status text default 'active' check (status in ('active', 'inactive')),
  likes integer default 0
);

alter table public.artworks enable row level security;

-- Create policies for artworks
create policy "Artworks are viewable by everyone." on artworks
  for select using (true);

create policy "Users can insert their own artworks." on artworks
  for insert with check (auth.uid() = artist_id);

create policy "Users can update own artworks." on artworks
  for update using (auth.uid() = artist_id);

-- Create artwork_likes table
create table public.artwork_likes (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  artwork_id uuid references artworks(id) on delete cascade not null,
  unique(user_id, artwork_id)
);

alter table public.artwork_likes enable row level security;

-- Create policies for artwork_likes
create policy "Users can view their own likes." on artwork_likes
  for select using (auth.uid() = user_id);

create policy "Users can insert their own likes." on artwork_likes
  for insert with check (auth.uid() = user_id);

create policy "Users can delete their own likes." on artwork_likes
  for delete using (auth.uid() = user_id);

-- Function to increment likes
create or replace function increment_likes(artwork_id uuid)
returns void as $$
begin
  update artworks set likes = likes + 1 where id = artwork_id;
end;
$$ language plpgsql security definer;

-- Function to decrement likes
create or replace function decrement_likes(artwork_id uuid)
returns void as $$
begin
  update artworks set likes = likes - 1 where id = artwork_id;
end;
$$ language plpgsql security definer;

-- Create storage bucket for artworks (optional, run in SQL Editor if needed)
-- insert into storage.buckets (id, name, public) values ('artworks', 'artworks', true);
