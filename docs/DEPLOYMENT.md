# Deployment

## Vercel (web)
1. Import this repository into Vercel and select the Next.js framework.
2. Add variables from `.env.example` only when their corresponding integrations are configured.
3. Never expose `SUPABASE_SERVICE_ROLE_KEY`, voice provider secrets, telephony tokens or LMS session data with a `NEXT_PUBLIC_` prefix.
4. Deploy and verify `/api/health`.

## Render (worker)
1. Create a Docker Background Worker from this repository.
2. Configure a persistent disk mounted at `/data` and set `LMS_DATA_DIR=/data`.
3. Add a Secret File named `lms-storage-state.json` containing the storage state exported after the account owner manually signs in to the LMS. Do not commit this file.
4. The worker entrypoint copies the secret file into `/data/.auth/` and starts the monitor.
5. Confirm the worker logs show a successful sync. Re-authenticate manually when the LMS session expires.

## Current limitations
The repository bootstrap does not yet include the complete LMS DOM extraction scripts or a shared database schema. The dashboard's `/api/lms/status` currently reads local worker files only and therefore cannot see a separate Render disk from Vercel. Implement the Supabase sync layer before treating dashboard data as live.

The telephony feature requires a provider and supported call routing. Android does not grant a normal app unrestricted access to cellular call audio. Voice and telephony must be integrated and tested with explicit user/caller consent.
