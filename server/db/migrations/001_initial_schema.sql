create table if not exists reports (
  id text primary key,
  user_id text,
  mode text not null,
  question text,
  summary text not null,
  full_report_markdown text not null,
  model_name text not null,
  remaining_credits integer not null default 0,
  usage_metadata jsonb,
  created_at timestamptz not null default now()
);

create table if not exists orders (
  id text primary key,
  user_id text,
  order_type text not null,
  amount_fen integer not null,
  payment_channel text not null,
  payment_status text not null,
  provider_order_id text,
  entitlement_value integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists follow_ups (
  id text primary key,
  report_id text not null references reports(id) on delete cascade,
  user_id text,
  user_message text not null,
  assistant_message text not null,
  remaining_credits_after integer not null,
  created_at timestamptz not null default now()
);
