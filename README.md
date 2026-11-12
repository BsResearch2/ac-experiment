# Content Creator Experiment

Static social-media simulation with three participant pages: Welcome/Prolific ID, Practice, and Main Task. GitHub Pages serves the interface; Supabase stores new main-task events.

## Conditions

| URL | Process controls | Main-task performance feedback |
|---|---|---|
| `/hh/` | Recommending, Monitoring, Restricting | Rating, Rewarding, Ad Revenue |
| `/hl/` | Recommending, Monitoring, Restricting | None; thank-you confirmation |
| `/lh/` | None | Rating, Rewarding, Ad Revenue |
| `/ll/` | None | None; thank-you confirmation |

The root URL is another HH entry point and shares its browser-local history. Each other condition has its own history namespace. IDs are self-entered and are not verified accounts.

HH/HL share `app.js`; LH and LL have their own participant scripts. All use `app.css` plus any condition-specific CSS, and load the shared `scoring.js`.

## Task and publishing

Participants create content about themselves: interests, experiences, hobbies, opinions, or perspectives. Task reminders use 18px bold text on Welcome and the Practice/Main introductions.

- HH/HL recommend **at least 80 words** and require **five distinct hashtags** to publish. Duplicates count once. Missing hashtags open an explanatory popup; drafts are retained. Met criteria turn green.
- LH/LL have no process-control panels, word counter, or word/hashtag requirements. Hashtags and their adaptive suggestions are optional; posts with zero hashtags may publish.
- Every condition requires nonempty post text.
- Adaptive hashtag lists update locally as tags are selected or typed. Suggestions exclude selected tags and duplicates; they never select themselves.

## Practice and main task

A new ID begins with a blank Practice composer. One practice publication unlocks **Continue to the main task**. Practice has no performance feedback or revision invitation, never uploads to Supabase, and stays in a separate browser-local record.

The Main Task starts with a fresh composer and history; the Existing IDs resume their saved stage, drafts, and posts in the same browser. Clearing site data or switching devices does not restore this browser-local history from Supabase.

HH/LH show feedback in the right-hand panel after publication (above the composer on mobile). Under 80 words gives below-average outcomes; **exactly 80 or more gives above-average outcomes**. Separate hashtag fields do not contribute to word count. Values are uniformly sampled and rounded to two decimal places:

| Metric | Platform benchmark | Below average | Above average |
|---|---:|---:|---:|
| Engagement rate | 3.5% | 1.10–1.45% | 4.55–4.90% |
| Visibility boost | +5% | +1.00–1.50% | +10.50–15.00% |
| Ad revenue | $5.20 | $1.12–$1.64 | $10.00–$15.00 |

These are researcher-defined simulation parameters, not measured platform benchmarks or standard deviations. LH reveals the word criterion in feedback after posting, without offering it as process guidance beforehand.

Only a below-average HH/LH main-task result invites revision:

> Your post received an overall evaluation of **BELOW AVERAGE**. If you would like, revise your post to include **at least 80 words**, while keeping the content focused on yourself.

Original text/hashtags stay in the composer; a revision creates a linked record instead of overwriting the original. Participants may start a new post instead. Above-average publication clears the composer. HL/LL generate no performance outcomes or revision invitations and show **Thank you! Your post has been published.**

## Supabase connection

Public project URL and publishable key are configured in `config.js`, `hh/config.js`, `hl/config.js`, `lh/config.js`, and `ll/config.js`. Only public browser keys belong here—never database passwords or secret/service-role keys. Anonymous submissions send the public key in the `apikey` header, not as a Bearer token.

For a fresh database, create the researcher Auth account, replace `RESEARCHER_EMAIL_HERE` in `database.sql`, and run it in Supabase SQL Editor. The project owner has reported running this schema setup already. Re-running is not needed merely to configure the app.

The schema permits anonymous inserts, denies anonymous reads/updates/deletes, and restricts authenticated reads to the configured researcher Auth user ID. Inspect any independently added policies because permissive RLS policies can combine. The app does not authenticate participant identity.

Every new main-task publication saves:

- `prolific_id`, condition, event type, database timestamp;
- post text, hashtags, stage, post ID, revision-of ID in `detail` JSON;
- `personalness_score` and `scoring_method`;
- simulated feedback JSON for HH/LH; null feedback for HL/LL.

Profile creation/editing is removed in all conditions. Historical profile events remain in the database. Practice posts remain local. Previously stored browser posts are not uploaded automatically. Failed remote writes preserve the draft and do not claim publication.

## Personalness scoring; sentiment deferred

All four conditions use the same existing **exploratory keyword heuristic**, implemented once in `scoring.js` and recorded as `keyword-heuristic-v1`. It never changes displayed performance feedback.

The retained rubric awards 35 points for a personal pronoun, 15 for audience-related pronouns, 20 for a listed emotion/reflection word, and 15 for at least two hashtags. A subtotal of at least 50 receives another 15, capped at 100. Its hashtag component can covary with experimental compliance, so it should not be treated as a validated independent disclosure measure. Preserve raw text/hashtags to support later rescoring and human validation.

Sentiment analysis is not implemented. `sentiment_score` remains available for later work; positive/negative tone is distinct from personal disclosure.

## Researcher dashboard

Open `/admin.html` and sign in with the researcher account created in Supabase Authentication. The root `config.js` supplies the same project connection. Database RLS, not the page URL, controls reading.

The dashboard shows PID, condition, event, stage, personalness score, scoring method, and readable post/profile detail. Filter by PID and export CSV, including original raw detail, parsed post text, IDs/revision links, hashtags, and feedback. No researcher password or session token belongs in repository files.

## Development and verification

From the repository root:

```sh
python3 -m http.server 8000 --bind 127.0.0.1
```

GitHub Pages should deploy `main` from `/ (root)`. No build or dependency install is required to serve the app.

Local browser tests with mocked Supabase requests cover all four conditions, practice isolation, payloads/public-key headers, consistent personalness scoring, original/revision linkage, optional LH/LL hashtags, failure/draft recovery, history, and mobile layout. The dashboard was checked with mocked Auth/data for filtering, readable CSV, escaped post text, and logout cleanup.

**Live verification remains outstanding:** this workspace's proxy currently blocks the Supabase project domain. A draft domain addition has been saved in environment settings; it does not itself apply or publish the network change. Before collecting study data, publish a pilot main-task post in each condition, verify the records through the researcher dashboard, and confirm anonymous reads are denied. Local mocks do not establish live database connectivity, RLS enforcement, or successful researcher authentication.

## High-process live requirement indicators
HH/HL (and the root HH entry) state: “The algorithm recommends that your post contain at least 80 words to meet platform writing guidelines.” Monitoring explicitly attributes writing/hashtag checks to the platform algorithm and shows live `Writing requirement: n/80 words` and `Hashtag requirement: n/5 hashtags`. Hashtag progress includes selected tags plus deduplicated hashtags currently typed in the input; clearing/removing tags and restoring drafts update these counts. Progress is not capped at the threshold. Only hashtag compliance blocks publication; the existing word-count outcome rule is unchanged. LH/LL remain unaffected.

## Profile removal
All participant entry points omit the creator profile card, editable name/bio, and avatars. Post cards show the timestamp, content, and hashtags. New submissions no longer include creator name or bio, and no profile-edit events are generated. Prolific ID entry, condition-specific storage keys, existing post history and historical backend records are preserved.

## Practice continuation placement
In every condition, Continue to the main task sits directly below the publication confirmation in the composer. It is disabled until one practice post has been published, then appears with a reminder that participants can practice again or continue. A practice publication scrolls the continuation area into view while respecting reduced-motion preferences. The continuation area is hidden during the main task.

## Concise practice introduction
All conditions show “Practice run” and a short explanation to publish at least one practice post, then use Continue to the main task below the composer. The top practice box hides the repeated self-focused task reminder; the separate YOUR TASK box retains the full instruction. Main-task and welcome instructions remain unchanged.

## Distinct practice actions
Continue to the main task uses a green primary button in all conditions. After the first practice publication, its area is highlighted and the publish button becomes an outlined secondary action labeled Publish another practice post. Main-task publication returns to the normal publish style. Navigation rules and experimental conditions are unchanged.
