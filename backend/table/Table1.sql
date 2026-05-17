create table public.repositories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  repo_url text,
  source text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 🔐 Step 2: Enable Row Level Security (RLS) to secure the data
alter table public.repositories enable row level security;

-- 👤 Policy 1: Allow users to only view their own repositories
create policy "Allow users to read their own repos" 
on public.repositories for select 
using (auth.uid() = user_id);

-- 📥 Policy 2: Allow users to insert their own repositories
create policy "Allow users to insert their own repos" 
on public.repositories for insert 
with check (auth.uid() = user_id);

-- 🔄 Policy 3: Allow users to update their own repositories
create policy "Allow users to update their own repos" 
on public.repositories for update 
using (auth.uid() = user_id);

-- 🗑️ Policy 4: Allow users to delete their own repositories
create policy "Allow users to delete their own repos" 
on public.repositories for delete 
using (auth.uid() = user_id);
