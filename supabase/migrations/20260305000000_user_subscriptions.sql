create table if not exists public.user_subscriptions (
  user_id text primary key,
  tier text not null default 'free' check (tier in ('free', 'pro', 'pro_plus')),
  status text not null default 'inactive',
  current_period_end timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.user_subscriptions enable row level security;

create policy "users own subscription rows" on public.user_subscriptions
  for all
  using (auth.uid()::text = user_id)
  with check (auth.uid()::text = user_id);
