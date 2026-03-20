create table if not exists users (
  id text primary key,
  identity_provider text not null,
  provider_subject text,
  display_name text not null,
  created_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now()
);

create unique index if not exists users_identity_provider_subject_uidx
  on users(identity_provider, provider_subject)
  where provider_subject is not null;

create index if not exists users_last_seen_at_idx
  on users(last_seen_at desc);
