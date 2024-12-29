create or replace function create_profiles_if_not_exists()
returns void
language plpgsql
security definer
as $$
begin
  -- Create profiles table if it doesn't exist
  if not exists (select from pg_tables where schemaname = 'public' and tablename = 'profiles') then
    create table public.profiles (
      id uuid references auth.users on delete cascade primary key,
      full_name text,
      phone text,
      address text,
      city text,
      country text,
      tax_id text,
      created_at timestamp with time zone default timezone('utc'::text, now()) not null,
      updated_at timestamp with time zone default timezone('utc'::text, now()) not null
    );

    -- Enable RLS
    alter table profiles enable row level security;

    -- Create policies
    create policy "Users can view their own profile" on profiles
      for select using (auth.uid() = id);

    create policy "Users can update their own profile" on profiles
      for update using (auth.uid() = id);

    create policy "Users can insert their own profile" on profiles
      for insert with check (auth.uid() = id);
  end if;
end;
$$;
