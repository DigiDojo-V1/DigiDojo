# Gemini and rate limiting on Vercel

The flag API (`src/app/api/flag/*`) can use Gemini for two jobs:

| Endpoint               | Default model              | What it does                                                               |
| ---------------------- | -------------------------- | -------------------------------------------------------------------------- |
| `POST /api/flag/chips` | `gemini-flash-lite-latest` | Writes the 4 "Why is this suspicious?" reasons for what the player flagged |
| `POST /api/flag/judge` | `gemini-flash-latest`      | Marks the player's written explanation for bonus points                    |

## The switch: `FLAG_AI`

- `FLAG_AI=on`: Gemini writes the reason chips and marks explanations. The "In your own words" box shows in the flag popup.
- Anything else, or unset (the default): reasons come from `fallbackChips()`, nothing is marked, and the note box is hidden.

If Gemini is on but slow, failing or over the rate limit, that one request quietly falls back to the built-in chips. The game never breaks.

Models default to Google's auto-updated aliases. Override them with `GEMINI_CHIPS_MODEL` and `GEMINI_JUDGE_MODEL`.

## Auth: set one of these

The server uses the first option that is fully set.

### 1. Gemini API key (simplest)

1. Create a key in Google AI Studio.
2. Set `GEMINI_API_KEY`.

### 2. Vertex AI with a service account (recommended for production)

1. In your GCP project, enable the **Vertex AI API**.
2. Create a service account with only the **Vertex AI User** role (`roles/aiplatform.user`).
3. Add a JSON key to it.
4. Set `GCP_SERVICE_ACCOUNT_JSON` to the whole JSON (on Vercel, mark it Sensitive), plus `GCP_PROJECT_ID` and optionally `GCP_LOCATION` (default `global`).

### 3. Vertex AI with an OAuth client (`GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`)

An OAuth client can't call Gemini on its own. It needs a one-time sign-in that produces a refresh token:

1. In Google Cloud Console → APIs & Services → Credentials, the OAuth client must be either:
   - a **Desktop app**, or
   - a **Web application** with `http://localhost:8085/oauth2callback` as an authorised redirect URI.

   If the consent screen is in Testing mode, add your Google account as a test user.

2. Enable the **Vertex AI API** in the project. The account you sign in with needs **Vertex AI User** on it.
3. Run `npm run google:auth`, open the link and sign in. The script saves `GOOGLE_REFRESH_TOKEN` (and `GCP_PROJECT_ID` if you type it) into `.env` without printing them.
4. Set `FLAG_AI=on` and restart `npm run dev`.

The calls then run as your Google account. That's fine for development; for production prefer option 2. If the consent screen stays in Testing mode, the refresh token expires after 7 days.

## Vercel env vars

Add the same variables in Project → Settings → Environment Variables (Production and Preview), including `FLAG_AI=on`.

## Rate limiting (Upstash Redis)

1. In Vercel, open Storage (Marketplace) → Upstash → Redis, create a database and connect it to the project. This sets `KV_REST_API_URL`/`KV_REST_API_TOKEN` or `UPSTASH_REDIS_REST_URL`/`UPSTASH_REDIS_REST_TOKEN`.
2. The limits are per hashed caller id and are set in `src/server/ratelimit.ts`:
   - chips: 30 requests per minute
   - judge: 10 requests per minute

   A caller over the limit gets a 429, and the client falls back.

Without Upstash the API isn't rate limited, and a warning is printed in development. Always set it up for production.

## Privacy

- Nothing a player types is stored or logged by the server.
- Redis holds only a hashed caller id and a counter.
- Prompts put player text in tagged data blocks and tell the model to ignore any instructions inside them.
- The server rebuilds the flagged text from scenario data, so the client never sends, and can't fake, the answer key.
