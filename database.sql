-- Run in the Supabase SQL Editor as the project administrator.
-- Replace RESEARCHER_EMAIL_HERE with the researcher Auth email before running.
-- This preserves records and pins researcher access to the configured Auth user ID.
begin;
create table if not exists public.experiment_events (
 id bigint generated always as identity primary key,
 created_at timestamptz not null default now(),
 prolific_id text not null check (char_length(prolific_id) between 1 and 100),
 condition text not null,
 event_type text not null check (event_type in ('Name Updated','Bio Updated','Post Published')),
 detail text not null,
 personalness_score integer check (personalness_score between 0 and 100),
 feedback jsonb
);
alter table public.experiment_events add column if not exists sentiment_score numeric;
alter table public.experiment_events add column if not exists scoring_method text;
create index if not exists events_prolific_time on public.experiment_events(prolific_id,created_at);
alter table public.experiment_events enable row level security;
revoke all on public.experiment_events from public, anon, authenticated;
grant usage on schema public to anon, authenticated;
grant insert on public.experiment_events to anon;
grant select on public.experiment_events to authenticated;
drop policy if exists "anonymous may submit data only" on public.experiment_events;
create policy "anonymous may submit data only" on public.experiment_events
 for insert to anon with check (true);
drop policy if exists "researcher reads records" on public.experiment_events;
do $$
declare researcher_id uuid;
begin
 select id into researcher_id from auth.users where lower(email)=lower('RESEARCHER_EMAIL_HERE');
 if researcher_id is null then raise exception 'Researcher account not found.'; end if;
 execute format('create policy "researcher reads records" on public.experiment_events for select to authenticated using (auth.uid() = %L::uuid)', researcher_id);
end $$;
commit;
-- Only records created after connection are uploaded. Existing local history is not imported.
-- Participant IDs are self-entered, not authenticated identities. Practice stays local-only.
