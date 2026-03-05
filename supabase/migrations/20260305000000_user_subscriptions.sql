create table if not exists public.user_subscriptions (
  user_id text primary key,
  tier text not null default 'free',
  status text not null default 'unknown',
  current_period_end timestamptz null,
  updated_at timestamptz not null default now()
);

alter table public.user_subscriptions enable row level security;

create policy if not exists "users read own subscription"
  on public.user_subscriptions
  for select
  using (auth.uid()::text = user_id);
