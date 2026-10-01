-- Existing attempts keep 15 questions; newly registered attempts use 20.
begin;

alter table public.assessment_attempts
  add column mcq_total integer not null default 15 check (mcq_total in (15, 20));
alter table public.assessment_attempts alter column mcq_total set default 20;

create or replace function public.assessment_mutate(
  p_id uuid, p_action text, p_payload jsonb default '{}', p_version integer default -1
)
returns jsonb language plpgsql security invoker set search_path = public as $$
declare a assessment_attempts; q text; option_value integer;
begin
  select * into a from assessment_attempts where id=p_id for update;
  if not found then raise exception 'APP:401:Sesi tidak ditemukan.'; end if;
  if a.phase in ('penalaran','coding') and clock_timestamp() >= a.expires_at then
    a.phase := 'grading'; a.version := a.version+1; a.submitted_at := a.expires_at;
  end if;
  if p_action in ('save_mcq','save_code','advance') and a.phase in ('penalaran','coding') then
    if p_version <> a.version then raise exception 'APP:409:Jawaban berubah di tab lain. Muat ulang halaman sebelum melanjutkan.'; end if;
    q := p_payload->>'questionId';
    if p_action='save_mcq' then
      if a.phase <> 'penalaran' then raise exception 'APP:409:Sesi penalaran sudah dikunci.'; end if;
      if q is null or q !~ '^([1-9]|1[0-9]|20)$' or q::integer > a.mcq_total
        or jsonb_typeof(p_payload->'option') is distinct from 'number'
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
      if jsonb_object_length_safe(a.mcq_answers) <> a.mcq_total then raise exception 'APP:400:Jawab seluruh soal penalaran sebelum lanjut.'; end if;
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

commit;
