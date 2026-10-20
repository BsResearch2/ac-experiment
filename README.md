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
- Process-high texts: "We strongly recommend that your post be at least 80 words."; "Your post must include at least 5 relevant hashtags before it can be published."; red pulsing "Live Tracking of your content creation process".
- Recommending and Restricting panels turn green on meeting 80 words and 5 hashtags, respectively.
- **Hashtag restriction enforced:** Publishing requires at least 5 distinct hashtags from the hashtag field or suggested chips. Duplicate hashtags count once. A blocked attempt preserves the draft and generates no post or outcome feedback. Posts under 80 words can publish with enough hashtags, but always receive below-average outcomes.
- Following publication, high-outcome feedback shows Rating, Rewarding, Sanctioning using the supplied baseline 3.5% engagement, +5% visibility, $5.20 ad revenue.
- Posts under 80 words always receive below-average outcomes. Posts with 80 or more words always receive above-average engagement and visibility outcomes, with a milder revenue sanction. Word count uses whitespace-separated words in the post body, excluding the separate hashtag field. Engagement and visibility share that condition: engagement and visibility are uniformly sampled 30–40% below or above their fixed benchmarks (3.5% and +5%). This gives 2.10–2.45% engagement and +3.00–3.50% visibility below average, or 4.55–4.90% engagement and +6.50–7.00% visibility above average. Ad revenue is sampled 30–40% below $5.20 for below-average posts ($3.12–$3.64), or 10–15% below for above-average posts ($4.42–$4.68). Values are rounded to two decimal places. These deviations are researcher-defined, not estimated standard deviations. Below-average statements and scores are red. Above-average rating and rewarding statements/scores are green; the milder sanction statement and revenue are amber yellow.
- Each name edit, bio edit, and published post is saved as an append-only event with Prolific ID and timestamp; post records also contain the unshown heuristic personalness score (0–100).

## Study limitations to resolve before live launch
- **Returning sessions:** For privacy, anonymous participants cannot read from the research database. Their Prolific ID and local history are remembered only on the same browser; remote prior posts/profile are not automatically restored. A secure, participant-specific resume function would require a separate server-side token architecture (not a publicly guessable Prolific ID).
- **Identity:** Someone could enter another participant's Prolific ID. Prefer passing a signed participant token through Qualtrics or Prolific, verified server-side, for production.
- **Database write-only:** Profile edits and published posts are recorded remotely when configured; browser-local history now restores after refresh for the same Prolific ID. Remote records are not reloaded. This avoids exposing confidential researcher data through anonymous SELECT.
- **Researcher view:** Supabase email/password authentication; the email-enforced RLS policy protects reads. Deploy `admin.html` at a private researcher URL when possible; merely hiding the URL is not a security control.
- **Compliance:** Ensure privacy notice covers Prolific IDs, text submissions, timestamps, and behavioral scoring. No independent validation of the heuristic personalness score is implied.
- **Outcomes:** The screenshot supplies rating and reward ranges for above/below and only a *below-average* ad-revenue range. It is not yet a fully specified 2×2 trial randomizer. Experimental assignment and reproducible random seeds should be finalized before the live study.
- **Backend paused:** With empty database configuration, the app is usable and retains browser-local posts, profile changes, and drafts for each Prolific ID. No responses are collected in a researcher database until it is configured. When a database is configured, failed writes preserve drafts and prevent unsaved changes from appearing as recorded.

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

## Adaptive hashtag suggestions
Selecting or entering hashtags expands the suggested list using local topic matching and related-tag templates. Suggestions exclude selected tags and duplicates, show up to 16 options, and reset with a new draft. Participants must select suggestions themselves; the app never adds them automatically. No external AI service or participant text upload is used for this feature. Outcome probabilities and publication requirements are unchanged.

## Feedback placement
Each published post shows its own Rating, Rewarding, and Sanctioning cards directly below its content and hashtags. Earlier posts retain their original feedback, including after restoring browser-local history. AI Guidance remains alongside the composer (above it on mobile). Successful publication scrolls to the new post, respecting reduced-motion preferences.

## Browser history by participant
Posts, original feedback values, name/bio, and unfinished drafts are saved in localStorage under a separate key for each exact, trimmed Prolific ID. Entering the same ID in the same browser restores that history; a previously unseen ID starts fresh. Switching IDs does not delete another ID’s history. This is browser-local convenience storage, not authentication or a researcher database: anyone with access to that browser and ID can reopen its history. Clearing site data, private browsing expiration, or changing devices loses access. Storage failures display a message instead of claiming the history was saved. Responses from before this feature cannot be recovered after their page session ended. Backend collection remains separate.

## AI control placement
AI RECOMMENDING appears inside the white composer card, directly above its Composer heading; AI RESTRICTING sits above the hashtag field, with “at least 5 hashtags” bold in both unmet/met messages. AI MONITORING remains in the right sidebar on desktop. Labels retain their AI attribution when requirements are met. Mobile shows monitoring before the recommendation/composer.
