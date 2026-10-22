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
- Following publication, high-outcome feedback shows Rating, Rewarding, Ad Revenue with baselines of 3.5% engagement, +5% visibility, and $5.20 revenue.
- Posts under 80 words always receive below-average outcomes; posts with 80+ words always receive above-average outcomes. Word count uses whitespace-separated words in the post body, excluding the separate hashtag field. Publication requires five distinct hashtags. Values are uniformly sampled within the researcher-defined ranges below and rounded to two decimal places. These are specified ranges, not a shared percentage-deviation or standard-deviation rule. Below-average statements/scores are red; above-average statements/scores are green, including ad revenue. Existing stored posts retain their original values and applicable feedback.

| Metric | Platform average | Below-average outcome | Above-average outcome |
|---|---:|---:|---:|
| Engagement rate | 3.5% | 1.10–1.45% | 4.55–4.90% |
| Visibility boost | +5% | +1.00–1.50% | +10.50–15.00% |
| Ad revenue | $5.20 | $1.12–$1.64 | $10.00–$15.00 |

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
Each successful publication shows Rating, Rewarding, and Ad Revenue in the top-right panel (above the composer on mobile). Starting the next draft restores AI Guidance there. Feedback is no longer rendered beneath posts. Historical outcome values remain in each post’s browser-local record. After publishing, the app scrolls to feedback and respects reduced-motion preferences.

## Browser history by participant
Posts, original feedback values, name/bio, and unfinished drafts are saved in localStorage under a separate key for each exact, trimmed Prolific ID. Entering the same ID in the same browser restores that history; a previously unseen ID starts fresh. Switching IDs does not delete another ID’s history. This is browser-local convenience storage, not authentication or a researcher database: anyone with access to that browser and ID can reopen its history. Clearing site data, private browsing expiration, or changing devices loses access. Storage failures display a message instead of claiming the history was saved. Responses from before this feature cannot be recovered after their page session ended. Backend collection remains separate.

## AI control placement
AI RECOMMENDING appears inside the white composer card, directly above its Composer heading; AI RESTRICTING sits above the hashtag field, with “at least 5 hashtags” bold in both unmet/met messages. AI MONITORING remains in the right sidebar on desktop. Labels retain their AI attribution when requirements are met. Mobile shows monitoring before the recommendation/composer.

## Persistent monitoring indicator
AI Monitoring stays at the top of the right panel during both composing and feedback. Its larger activity indicator uses a 1.5-second pulse and expanding halo; reduced-motion preferences disable animation. The panel shows the same content-creation-process label and does not introduce additional tracking.

Ad Revenue has replaced Discoverability for new posts. Feedback explains higher or reduced revenue using the 80-word threshold. New saved events use `ad_revenue` in post detail and `revenue` in feedback JSON. Existing historical discoverability and revenue outcomes remain unchanged and supported for restoration.

## Review and revision
After publication, participants are explicitly asked to review the evaluation criteria and feedback and revise their post accordingly. Submitted text and hashtags stay in the composer, and the action becomes Publish revision. The original remains in history; each revision is a new post with its own feedback. Post details include `post_id` and `revision_of` so revisions can be linked without altering the append-only event schema. Revision state persists per ID with the draft. Clear draft starts an independent post without deleting history.

## Task reminders
The welcome/Prolific-ID page and main creation screen both show the self-focused task in 17px bold text. Revision prompts repeat the instruction to focus on the participant’s own interests, experiences, hobbies, opinions, or perspectives. These are the participant-facing stages available in this app; external recruitment or survey pages must be updated separately.

## Two-stage participant flow
New IDs enter Page 1 (Practice), using the same composer, word counter, adaptive hashtags, and AI Recommending/Monitoring/Restricting controls. At least one nonempty practice post with five distinct hashtags unlocks Continue to the main task. Practice generates no performance outcomes and never writes events to Supabase.
Page 2 (Main Task) begins with clear instructions to create, review feedback, and revise. Practice posts/drafts are kept in a separate browser-local session key; the profile carries forward, while the main composer and post history start fresh. Main events include `study_phase: main` in post detail. Stage progress persists by Prolific ID. Existing IDs with main-task history resume the main task without losing history. Practice is familiarization, not an additional experiment condition.
