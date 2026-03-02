create table if not exists public.user_goals (
  user_id text primary key,
  payload jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.holdings (
  user_id text not null,
  ticker text not null,
  shares numeric not null default 0,
  avg_cost numeric not null default 0,
  cagr_ovr numeric,
  primary key (user_id, ticker)
);

create table if not exists public.allocations (
  user_id text not null,
  ticker text not null,
  weight numeric not null default 0,
  primary key (user_id, ticker)
);

create table if not exists public.expense_goals (
  user_id text not null,
  id text not null,
  label text not null,
  amount numeric not null default 0,
  created_at bigint not null,
  primary key (user_id, id)
);

alter table public.user_goals enable row level security;
alter table public.holdings enable row level security;
alter table public.allocations enable row level security;
alter table public.expense_goals enable row level security;

create policy "users own goal rows" on public.user_goals
  for all
  using (auth.uid()::text = user_id)
  with check (auth.uid()::text = user_id);

create policy "users own holdings rows" on public.holdings
  for all
  using (auth.uid()::text = user_id)
  with check (auth.uid()::text = user_id);

create policy "users own allocations rows" on public.allocations
  for all
  using (auth.uid()::text = user_id)
  with check (auth.uid()::text = user_id);

create policy "users own expense goals rows" on public.expense_goals
  for all
  using (auth.uid()::text = user_id)
  with check (auth.uid()::text = user_id);
