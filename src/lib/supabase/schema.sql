-- Run this in Supabase SQL editor

create table if not exists profiles (
  id uuid primary key references auth.users on delete cascade,
  username text unique,
  created_at timestamptz default now()
);

create table if not exists sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  snippet_id text not null,
  language text not null,
  wpm integer not null,
  accuracy integer not null,
  errors integer not null,
  duration_ms integer not null,
  created_at timestamptz default now()
);

create table if not exists leaderboard (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  language text not null,
  best_wpm integer not null,
  updated_at timestamptz default now(),
  unique(user_id, language)
);

-- RLS policies
alter table profiles enable row level security;
alter table sessions enable row level security;
alter table leaderboard enable row level security;

create policy "Users can view own profile" on profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);
create policy "Users can insert own profile" on profiles for insert with check (auth.uid() = id);

create policy "Users can view own sessions" on sessions for select using (auth.uid() = user_id);
create policy "Users can insert own sessions" on sessions for insert with check (auth.uid() = user_id);

create policy "Leaderboard is public" on leaderboard for select using (true);
create policy "Users can upsert own leaderboard" on leaderboard for insert with check (auth.uid() = user_id);
create policy "Users can update own leaderboard" on leaderboard for update using (auth.uid() = user_id);

-- Function to auto-create profile on signup
create or replace function handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, username)
  values (new.id, new.raw_user_meta_data->>'user_name');
  return new;
end;
$$;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();
