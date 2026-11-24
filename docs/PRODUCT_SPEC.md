# ASOMIDDIN AI — Product Specification

## Vision
A personal assistant that combines a TATU LMS companion, a responsive web dashboard, an Android app, natural voice interaction, and consent-based call assistance.

## Core user journeys

### LMS companion
- Authenticate to the LMS manually through the supported login flow.
- Read the student's enrolled courses, assignments, deadlines and timetable.
- Detect new assignments, changed deadlines, updated task details and removed tasks.
- Keep a history of sync runs and report partial failures instead of silently accepting incomplete data.
- Schedule reminders 5 days and 4 days before a deadline, with duplicate prevention and timezone Asia/Tashkent.
- Later extend to grades, rooms and attendance only after the corresponding LMS pages are verified.

### Web dashboard
- Show today's timetable, upcoming deadlines, overdue work, course list, grades when available, and sync health.
- Display last successful synchronization and actionable error states.
- Provide settings for reminder preferences, quiet hours and connected devices.
- Work on mobile and desktop.

### Android companion
- Kotlin application for HONOR X5c and compatible Android devices.
- Voice conversation screen, push/local notifications, schedule and call-summary inbox.
- Request microphone, notification and other permissions only when the user enables the corresponding feature.
- Do not silently record or intercept cellular call audio.

### Voice assistant
- Real-time speech input and spoken output.
- Assistant can answer general questions and query the user's authorized LMS data.
- Show clear listening/speaking/muted states and allow immediate interruption.
- Do not claim to perform actions unless the backend confirms them.

### Call assistance
- Determine busy/free state from timetable plus user-controlled calendar and manual status.
- Route calls only through a carrier feature or telephony provider that supports the required flow.
- Identify itself as an AI assistant, ask permission before recording/transcribing where required, and allow callers to decline.
- Capture caller identity if provided, reason, urgency, requested action and callback preference.
- Notify the user and offer a callback at a free time; never place a callback without the user's configured permission.

## Architecture
- Next.js + TypeScript web application.
- Node.js + Playwright worker for LMS browser automation.
- PostgreSQL/Supabase for user, course, task, schedule, sync, reminder and call-summary records.
- Kotlin Android application.
- Voice provider adapter and telephony provider adapter so vendors can be changed without rewriting product logic.

## Non-functional requirements
- Asia/Tashkent timezone for schedules and reminders.
- Idempotent synchronization and reminder generation.
- Secrets and LMS session state never committed to Git.
- Manual OneID/CAPTCHA login; no access-control bypass.
- Authenticated APIs, server-side authorization and least-privilege database policies.
- Logs must redact credentials, cookies, tokens, phone numbers and sensitive conversation text.
- Tests for parsing, change detection, timezone boundaries, duplicate reminders and authorization.

## Delivery acceptance
The project is complete only after web, worker, Android, voice and call-assistance flows have been implemented to the supported extent, deployed, and tested. Unsupported carrier/device capabilities must be clearly documented rather than simulated.
