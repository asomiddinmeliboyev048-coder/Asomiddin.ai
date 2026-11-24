# Deployment and first-run setup

## Vercel — private web dashboard
1. Import this repository into Vercel and select Next.js.
2. Set `APP_ACCESS_PASSWORD` to a strong private password.
3. Set `APP_SESSION_TOKEN` to a cryptographically random secret of at least 32 bytes. Keep it private.
4. Set `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` for server-side data access. The service-role key must never use a `NEXT_PUBLIC_` prefix.
5. Set `AI_OWNER_ID=primary`.
6. Apply every SQL migration in `supabase/migrations/` to the Supabase project.
7. Deploy and verify `/api/health`; open `/login` and sign in with the private password.

## Render — LMS background worker
1. Create a Docker Background Worker from this repository.
2. Configure a persistent disk mounted at `/data`.
3. Set `LMS_DATA_DIR=/data`, `LMS_SYNC_INTERVAL_MS=21600000`, `LMS_URL=https://lms.tuit.uz`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, and `AI_OWNER_ID=primary`.
4. Add a Secret File named `lms-storage-state.json` containing the storage state exported after the account owner manually signs in to the LMS. Do not commit this file.
5. The entrypoint copies the secret file into `/data/.auth/` and starts the worker.
6. Confirm the worker logs show a successful LMS read and Supabase sync. Re-authenticate manually when the LMS session expires.

## LMS manual authentication
For a local/manual login run `npm run lms:login` in an environment with a visible browser. Complete OneID and CAPTCHA yourself. The generated `.auth/lms-storage-state.json` is sensitive and must stay out of Git.

## Current integration boundaries
- LMS extraction uses Moodle-style course and assignment link patterns as a starting point. The selectors and due-date extraction must be validated against the actual authenticated TATU LMS account before grades, exact deadlines, or pass-score calculations are trusted.
- The call-summary and reminder APIs are server-to-server endpoints protected by `INTERNAL_API_SECRET`; do not call them from an untrusted browser.
- The web dashboard currently uses a single-owner password gate. Replace it with Supabase Auth and per-user RLS before supporting multiple users.
- Voice and telephony provider credentials are not yet wired. Call routing depends on a supported carrier or telephony provider; Android alone cannot intercept arbitrary cellular call audio.
- Disclose AI identity and obtain legally required consent before recording or transcribing calls.
