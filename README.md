# ASOMIDDIN AI

A personal AI assistant and TATU LMS companion for web and Android.

## Product goals

- LMS monitoring: courses, assignments, deadlines, schedule, rooms and grades.
- Detect new, updated, deadline-changed and removed assignments.
- Schedule reminders 5 and 4 days before deadlines.
- Responsive web dashboard.
- Android companion app for HONOR X5c and other Android devices.
- Natural, real-time voice conversations with an AI assistant.
- Consent-based call assistance: schedule-aware availability, supported call routing, caller disclosure, conversation summaries and callback reminders.

## Architecture

- Web: Next.js + TypeScript.
- Worker: Node.js + Playwright for LMS browser automation.
- Persistence: Supabase/PostgreSQL plus persistent worker storage as needed.
- Mobile: native Android (Kotlin).
- Voice: real-time speech interface backed by a voice-capable AI service.
- Telephony: supported carrier/telephony provider; Android alone cannot take over arbitrary cellular call audio.

## Security

- Never commit `.auth/`, `.local/`, `.env*`, cookies, session storage, API keys, tokens or private keys.
- LMS login remains manual. Do not bypass OneID, CAPTCHA or access controls.
- Supply secrets through deployment secret managers.
- Disclose AI identity and obtain legally required consent before call recording/transcription.

## Status

Current implementation status: the web dashboard, private password login, LMS monitoring worker, parser tests, Supabase schemas, text assistant endpoint, browser speech input/output and manual reminder management are present. LMS extraction still needs validation against an authenticated TATU account. Push delivery, real-time duplex voice, telephony routing and Android-to-server integration are not yet connected. No production deployment or device-level validation is claimed.

## Milestones

1. Establish a secure, buildable repository structure.
2. Restore and validate the LMS worker and monitoring state machine.
3. Add persistent application data and authenticated API routes.
4. Build the responsive dashboard and connect real data.
5. Build the Android companion app and notifications.
6. Add voice conversations.
7. Add consent-based telephony and schedule-aware call handling.
8. Deploy, run end-to-end checks and document operations.
