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
- **Hashtag restriction enforced:** Publishing requires at least 5 distinct hashtags from the hashtag field or suggested chips. Duplicate hashtags count once. A blocked attempt preserves the draft and generates no post or outcome feedback. The 80-word threshold remains a recommendation.
- Following publication, high-outcome feedback shows Rating, Rewarding, Sanctioning using the supplied baseline 3.5% engagement, +5% visibility, $5.20 ad revenue.
- In `config.js`, `outcomeValence:'mixed'` (default) chooses above or below with equal probability on each publication, independently of post content. Engagement and visibility share that condition: below gives 2.8–3.3% engagement and +3.0–4.5% visibility; above gives 3.7–4.2% engagement and +5.5–7.0% visibility. Ad revenue always remains $3.70–$4.90, below the $5.20 average. Set `outcomeValence` to `'below'` or `'above'` to force engagement/visibility for a fixed experimental condition.
- Each name edit, bio edit, and published post is saved as an append-only event with Prolific ID and timestamp; post records also contain the unshown heuristic personalness score (0–100).

## Study limitations to resolve before live launch
- **Returning sessions:** For privacy, anonymous participants cannot read from the research database. Their Prolific ID is remembered/suggested only on the same browser, but remote prior posts/profile are not automatically restored. A secure, participant-specific resume function would require a separate server-side token architecture (not a publicly guessable Prolific ID).
- **Identity:** Someone could enter another participant's Prolific ID. Prefer passing a signed participant token through Qualtrics or Prolific, verified server-side, for production.
- **Database write-only:** Profile edits and published posts are recorded in the database but are not reloaded after a refresh. While open, a participant sees only posts from the current page session. This avoids exposing confidential researcher data through anonymous SELECT.
- **Researcher view:** Supabase email/password authentication; the email-enforced RLS policy protects reads. Deploy `admin.html` at a private researcher URL when possible; merely hiding the URL is not a security control.
- **Compliance:** Ensure privacy notice covers Prolific IDs, text submissions, timestamps, and behavioral scoring. No independent validation of the heuristic personalness score is implied.
- **Outcomes:** The screenshot supplies rating and reward ranges for above/below and only a *below-average* ad-revenue range. It is not yet a fully specified 2×2 trial randomizer. Experimental assignment and reproducible random seeds should be finalized before the live study.
- **Backend paused:** With empty database configuration, the app is usable for the current session. Posts and profile changes are not saved and disappear on refresh. When a database is configured, failed writes preserve drafts and prevent unsaved changes from appearing as recorded.

## Local development and hosting
Run `python3 -m http.server 8000 --bind 127.0.0.1` from the repository root.
For GitHub Pages, choose Settings > Pages > Deploy from a branch > main > / (root).
GitHub Pages only hosts the interface; it cannot store participant submissions.

## Future database activation
Create a project at https://supabase.com/dashboard (the free tier can be used).
Follow steps 2–4 above: run database.sql with your researcher email, create your
researcher account, then set the public project URL and legacy anon key in config.js.
Use the legacy anon key with this build's Bearer header; never a service-role or
secret key. Commit the public config and wait for hosting to update. Before using
the study, submit a pilot response, confirm it appears in admin.html, and verify
anonymous reads are denied. Until this is done, real persistence is unverified.
