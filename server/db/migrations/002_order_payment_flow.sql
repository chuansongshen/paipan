alter table orders
  add column if not exists target_report_id text references reports(id) on delete set null,
  add column if not exists entitlement_status text not null default 'pending',
  add column if not exists payment_payload jsonb,
  add column if not exists paid_at timestamptz,
  add column if not exists updated_at timestamptz not null default now();
