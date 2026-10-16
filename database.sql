-- Run in your Supabase SQL Editor. Replace RESEARCHER_EMAIL_HERE with your
-- exact Supabase Auth user email, then create that user in Auth > Users.
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
create index if not exists events_prolific_time on public.experiment_events(prolific_id,created_at);
alter table public.experiment_events enable row level security;
revoke all on public.experiment_events from public;
grant usage on schema public to anon, authenticated;
grant insert on public.experiment_events to anon;
grant select on public.experiment_events to authenticated;
-- Public users can only add new event rows, not view, update, or delete them.
create policy "anonymous may submit data only" on public.experiment_events
 for insert to anon with check (true);
-- Critical: only YOUR authenticated Supabase account can view saved responses.
create policy "researcher reads records" on public.experiment_events
 for select to authenticated using ((auth.jwt()->>'email')='RESEARCHER_EMAIL_HERE');
-- Optional security hardening: use a server function + abuse prevention for recruitment.
-- Note: Prolific IDs entered by participants are not independently verified.
