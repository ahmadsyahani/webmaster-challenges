-- Apply after 20261001_secure_assessment.sql. Keeps all existing attempts/results.
begin;
alter table public.assessment_attempts add column prodi text not null default '';
alter table public.assessment_attempts drop constraint if exists assessment_attempts_nrp_fkey;
-- Retire invite-based entry. Historical invite rows can remain as an archive.
drop function public.assessment_start(text,text);
create function public.assessment_register(p_nrp text, p_nama text, p_prodi text, p_kelas text)
returns jsonb language plpgsql security invoker set search_path = public as $$
declare a assessment_attempts; legacy_exists boolean;
begin
  if p_nrp is null or p_nrp !~ '^[0-9]{5,20}$'
    or p_nama is null or length(trim(p_nama)) not between 1 and 100
    or p_prodi is null or length(trim(p_prodi)) not between 1 and 100
    or p_kelas is null or length(trim(p_kelas)) not between 1 and 50 then
    raise exception 'APP:400:Lengkapi nama, NRP, prodi, dan kelas dengan benar.';
  end if;
  if to_regclass('public.submissions') is not null then
    execute 'select exists(select 1 from public.submissions where nrp::text=$1)' into legacy_exists using p_nrp;
    if legacy_exists then raise exception 'APP:409:NRP sudah pernah mengumpulkan tes. Hubungi panitia bila ada kesalahan.'; end if;
  end if;
  insert into assessment_attempts(nrp,nama,prodi,kelas)
    values(p_nrp,trim(p_nama),trim(p_prodi),trim(p_kelas)) on conflict(nrp) do nothing returning * into a;
  if not found then
    raise exception 'APP:409:NRP sudah terdaftar. Lanjutkan dari browser yang dipakai sebelumnya, atau hubungi panitia.';
  end if;
  return to_jsonb(a);
end $$;
revoke all on function public.assessment_register(text,text,text,text) from public, anon, authenticated;
grant execute on function public.assessment_register(text,text,text,text) to service_role;
commit;
