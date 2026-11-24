# Personal agent action contract

The agent is designed as a tool-using assistant, not an unrestricted automation script.

## Action lifecycle
1. The voice/chat model interprets the user's request and creates a structured action.
2. The backend validates the action and records it in `agent_actions`.
3. Actions that contact another person, send a message, change a timetable, or place an external call remain `awaiting_approval`.
4. The owner reviews the exact recipient, content and timing in the app.
5. Only an approved action may be handed to a configured provider adapter.
6. Provider result and delivery status are written back to the action record.

## Supported action types
- `create_reminder`: title, details, ISO-8601 reminder time and channel.
- `call_contact`: recipient identity/number, purpose and approved spoken message.
- `send_message`: recipient and exact message text.
- `daily_report`: report window and delivery channel.
- `update_schedule`: event identifier and proposed changes.

## Safety rules
- Never call a contact based on a guessed or ambiguous match. Ask the owner to select the correct contact.
- Before an outbound call or message, show who will be contacted and the exact message. Require explicit approval.
- Identify the system as an AI assistant to the other party. Do not impersonate the owner.
- Do not record or transcribe a call unless the applicable consent requirements are satisfied.
- Store only the minimum caller information required for the requested follow-up.
- Never claim an action is completed until the provider confirms it.

## API boundaries
- Agent service endpoints under `/api/agent/*` that accept `INTERNAL_API_SECRET` are server-to-server only.
- The approval endpoint requires the owner's private dashboard session.
- An action marked `approved` is not yet executed; a provider worker must process it and persist the confirmed result.
- No voice model, telephony provider or contact-book adapter is configured in this repository yet.
