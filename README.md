# Content Creator Experiment — first build

This version recreates the **High Process Control × High Outcome Control** participant interface from the supplied screenshot, and uses the supplied 2×2 design matrix for its post-publication outcome feedback.

## Included
- `index.html`: public, mobile-friendly participant-facing simulation; no Pave account or participant login.
- `admin.html`: private researcher view, Supabase Auth login, Prolific ID filter, CSV export.
- `database.sql`: one append-only events table and Row Level Security (RLS) so anonymous visitors may *insert* but cannot *read* any records; authorized researcher can read.
- `config.js`: Supabase credentials (public anon key only), initial condition and feedback valence.

## Setup before collecting real research data
1. Create a Supabase project under your control, in a region appropriate to your IRB/data-management protocol.
2. In Supabase **SQL Editor**, run `database.sql`, first replacing `RESEARCHER_EMAIL_HERE` with your actual researcher login email. The check is exact and case-sensitive.
3. Create your researcher login in Supabase **Authentication > Users**, using that exact email and a strong password. Disable public self-registration if unnecessary.
4. Under **Project Settings > API**, copy the Project URL and **anon/publishable** key into `config.js`. **Never put a secret/service-role key into this file.**
5. Host these four files together on HTTPS, for example using Netlify or GitHub Pages. Open `index.html` in a private browser window to test participant access. The public site does not require a Pave account.
6. Submit a test post, then open `admin.html`, sign in with your researcher credentials, and verify that the test records appear. Test anonymous database read is denied. Remove pilot records before recruitment if required by your protocol.
7. Do not recruit until privacy/security, consent and IRB requirements are reviewed. Because this public app allows anonymous writes, consider adding server-side rate limiting/bot protection (e.g., Supabase Edge Function) and capacity planning.

## Experimental behavior
- Process-high texts: "We strongly recommend that your post be at least 80 words."; "Your post must include at least 5 relevant hashtags before it can be published."; red pulsing "Live AI Tracking".
- Recommending and Restricting panels turn green on meeting 80 words and 5 hashtags, respectively.
- **As in the prior Pave version, the hashtag requirement is displayed but publishing is not actually blocked.** Change this only after deciding how to operationalize Restricting.
- Following publication, high-outcome feedback shows Rating, Rewarding, Sanctioning using the supplied baseline 3.5% engagement, +5% visibility, $5.20 ad revenue.
- In `config.js`, `outcomeValence:'below'` generates engagement 2.8–3.3%, visibility +3.0–4.5%, ad revenue $3.70–4.90, each on publishing. `outcomeValence:'above'` generates engagement 3.7–4.2%, visibility +5.5–7.0%; **above-average ad-revenue range was not supplied** and displays as unspecified rather than inventing it.
- Each name edit, bio edit, and published post is saved as an append-only event with Prolific ID and timestamp; post records also contain the unshown heuristic personalness score (0–100).

## Study limitations to resolve before live launch
- **Returning sessions:** For privacy, anonymous participants cannot read from the research database. Their Prolific ID is remembered/suggested only on the same browser, but remote prior posts/profile are not automatically restored. A secure, participant-specific resume function would require a separate server-side token architecture (not a publicly guessable Prolific ID).
- **Identity:** Someone could enter another participant's Prolific ID. Prefer passing a signed participant token through Qualtrics or Prolific, verified server-side, for production.
- **Database write-only:** Profile edits and published posts are recorded in the database but are not reloaded after a refresh. While open, a participant sees only posts from the current page session. This avoids exposing confidential researcher data through anonymous SELECT.
- **Researcher view:** Supabase email/password authentication; the email-enforced RLS policy protects reads. Deploy `admin.html` at a private researcher URL when possible; merely hiding the URL is not a security control.
- **Compliance:** Ensure privacy notice covers Prolific IDs, text submissions, timestamps, and behavioral scoring. No independent validation of the heuristic personalness score is implied.
- **Outcomes:** The screenshot supplies rating and reward ranges for above/below and only a *below-average* ad-revenue range. It is not yet a fully specified 2×2 trial randomizer. Experimental assignment and reproducible random seeds should be finalized before the live study.
- **Database required:** There is no demo mode. When config is empty, participants cannot begin. Posts appear and drafts clear only after a successful database write. Failed saves preserve the draft for retry; profile changes apply only after successful saving.

## Local development and hosting
Run `python3 -m http.server 8000 --bind 127.0.0.1` from the repository root.
For GitHub Pages, choose Settings > Pages > Deploy from a branch > main > / (root).
GitHub Pages only hosts the interface; it cannot store participant submissions.

## Required database activation
Create a project at https://supabase.com/dashboard (the free tier can be used).
Follow steps 2–4 above: run database.sql with your researcher email, create your
researcher account, then set the public project URL and legacy anon key in config.js.
Use the legacy anon key with this build's Bearer header; never a service-role or
secret key. Commit the public config and wait for hosting to update. Before using
the study, submit a pilot response, confirm it appears in admin.html, and verify
anonymous reads are denied. Until this is done, real persistence is unverified.
