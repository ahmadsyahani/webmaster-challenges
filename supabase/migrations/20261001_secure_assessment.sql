-- Run once in the Supabase SQL editor. Existing submissions are preserved.
begin;
create table public.assessment_invites (
  nrp text primary key check (nrp ~ '^[0-9]{5,20}$'),
  nama text not null, kelas text not null,
  token_hash text not null unique,
  created_at timestamptz not null default now()
);
create table public.assessment_attempts (
  id uuid primary key default gen_random_uuid(),
  nrp text not null unique references public.assessment_invites(nrp),
  nama text not null, kelas text not null,
  phase text not null default 'penalaran' check (phase in ('penalaran','coding','grading','submitted')),
  started_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '60 minutes'),
  version integer not null default 0,
  mcq_answers jsonb not null default '{}', codes jsonb not null default '{}',
  result jsonb, submitted_at timestamptz
);
create table public.assessment_limits (
  key text primary key, until_at timestamptz not null, count integer not null
);
alter table public.assessment_invites enable row level security;
alter table public.assessment_attempts enable row level security;
alter table public.assessment_limits enable row level security;
revoke all on public.assessment_invites, public.assessment_attempts, public.assessment_limits from anon, authenticated;
grant all on public.assessment_invites, public.assessment_attempts, public.assessment_limits to service_role;
-- Disable the former public read/write path without deleting historical results.
do $$ begin
  if to_regclass('public.submissions') is not null then
    alter table public.submissions enable row level security;
    revoke all on public.submissions from anon, authenticated;
    grant select on public.submissions to service_role;
  end if;
end $$;

create function public.assessment_rate_limit(p_key text, p_max integer, p_seconds integer)
returns void language plpgsql security invoker set search_path = public as $$
declare hits integer;
begin
  insert into assessment_limits(key,until_at,count) values(p_key,clock_timestamp()+make_interval(secs=>p_seconds),1)
  on conflict(key) do update set
    count = case when assessment_limits.until_at <= clock_timestamp() then 1 else assessment_limits.count+1 end,
    until_at = case when assessment_limits.until_at <= clock_timestamp() then clock_timestamp()+make_interval(secs=>p_seconds) else assessment_limits.until_at end
  returning count into hits;
  if hits > p_max then raise exception 'APP:429:Terlalu banyak permintaan. Tunggu sebentar lalu coba lagi.'; end if;
end $$;

create function public.assessment_start(p_nrp text, p_hash text)
returns jsonb language plpgsql security invoker set search_path = public as $$
declare invited assessment_invites; attempt assessment_attempts;
begin
  select * into invited from assessment_invites where nrp=p_nrp and token_hash=p_hash;
  if not found then raise exception 'APP:401:NRP atau kode akses tidak cocok.'; end if;
  -- One attempt per NRP; concurrent starts cannot create extra attempts.
  insert into assessment_attempts(nrp,nama,kelas) values(invited.nrp,invited.nama,invited.kelas)
    on conflict(nrp) do nothing;
  select * into attempt from assessment_attempts where nrp=p_nrp;
  return to_jsonb(attempt);
end $$;

create function public.assessment_mutate(p_id uuid, p_action text, p_payload jsonb default '{}', p_version integer default -1)
returns jsonb language plpgsql security invoker set search_path = public as $$
declare a assessment_attempts; q text; option_value integer;
begin
  select * into a from assessment_attempts where id=p_id for update;
  if not found then raise exception 'APP:401:Sesi tidak ditemukan.'; end if;
  -- Check the database clock AFTER acquiring the lock. Expiry permanently freezes the saved snapshot.
  if a.phase in ('penalaran','coding') and clock_timestamp() >= a.expires_at then
    a.phase := 'grading'; a.version := a.version+1; a.submitted_at := a.expires_at;
  end if;
  if p_action in ('save_mcq','save_code','advance') and a.phase in ('penalaran','coding') then
    if p_version <> a.version then raise exception 'APP:409:Jawaban berubah di tab lain. Muat ulang halaman sebelum melanjutkan.'; end if;
    q := p_payload->>'questionId';
    if p_action='save_mcq' then
      if a.phase <> 'penalaran' then raise exception 'APP:409:Sesi penalaran sudah dikunci.'; end if;
      if q is null or q !~ '^([1-9]|1[0-5])$' or jsonb_typeof(p_payload->'option') is distinct from 'number'
        or (p_payload->>'option') !~ '^[0-3]$' then raise exception 'APP:400:Jawaban tidak valid.'; end if;
      option_value := (p_payload->>'option')::integer;
      a.mcq_answers := jsonb_set(a.mcq_answers,array[q],to_jsonb(option_value));
    elsif p_action='save_code' then
      if a.phase <> 'coding' then raise exception 'APP:409:Selesaikan penalaran dahulu.'; end if;
      if q is null or q !~ '^([1-9]|10)$' or jsonb_typeof(p_payload->'code') is distinct from 'string'
        or length(p_payload->>'code') > 20000 then raise exception 'APP:400:Kode tidak valid atau melebihi 20000 karakter.'; end if;
      a.codes := jsonb_set(a.codes,array[q],p_payload->'code');
    else
      if a.phase <> 'penalaran' then raise exception 'APP:409:Sesi penalaran sudah dikunci.'; end if;
      if jsonb_object_length_safe(a.mcq_answers) <> 15 then raise exception 'APP:400:Jawab seluruh soal penalaran sebelum lanjut.'; end if;
      a.phase := 'coding';
    end if;
    a.version := a.version+1;
  elsif p_action='freeze' and a.phase in ('penalaran','coding') then
    if a.phase <> 'coding' then raise exception 'APP:409:Selesaikan penalaran dahulu.'; end if;
    if p_version <> a.version then raise exception 'APP:409:Jawaban berubah. Muat ulang dan periksa kembali.'; end if;
    a.phase := 'grading'; a.version := a.version+1; a.submitted_at := clock_timestamp();
  elsif p_action='finalize' and a.phase='grading' then
    a.result := p_payload; a.phase := 'submitted'; a.version := a.version+1;
  elsif p_action not in ('read','freeze','finalize','save_mcq','save_code','advance') then
    raise exception 'APP:400:Aksi tidak dikenal.';
  end if;
  update assessment_attempts set phase=a.phase,version=a.version,mcq_answers=a.mcq_answers,codes=a.codes,
    result=a.result,submitted_at=a.submitted_at where id=a.id;
  return to_jsonb(a);
end $$;

-- PostgreSQL has jsonb_object_keys, not jsonb_object_length.
create function public.jsonb_object_length_safe(value jsonb) returns integer
language sql immutable set search_path = public as $$ select count(*)::integer from jsonb_object_keys(value) $$;

revoke all on function public.assessment_start(text,text), public.assessment_mutate(uuid,text,jsonb,integer),
  public.assessment_rate_limit(text,integer,integer), public.jsonb_object_length_safe(jsonb) from public, anon, authenticated;
grant execute on function public.assessment_start(text,text), public.assessment_mutate(uuid,text,jsonb,integer),
  public.assessment_rate_limit(text,integer,integer), public.jsonb_object_length_safe(jsonb) to service_role;
commit;
