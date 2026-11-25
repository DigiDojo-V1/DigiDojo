# Gemini and rate limiting on Vercel

The flag API (`src/app/api/flag/*`) uses Gemini on Vertex AI for two jobs:

| Endpoint | Model env var | What it does |
| --- | --- | --- |
| `POST /api/flag/chips` | `GEMINI_CHIPS_MODEL` (Flash-Lite tier) | Suggests 4 "Why is this suspicious?" reasons for what the player flagged |
| `POST /api/flag/judge` | `GEMINI_JUDGE_MODEL` (Flash tier) | Grades the player's optional explanation for bonus points |

Everything is optional. Without the env vars, chips come from `fallbackChips()` and explanations aren't graded. The game still plays fully, so local development needs no setup.

## 1. Google Cloud

1. Create or pick a GCP project, and note its **project ID**.
2. Enable the **Vertex AI API** (`aiplatform.googleapis.com`).
3. Go to IAM → Service accounts and create `digidojo-flag-api`. Give it the **Vertex AI User** role (`roles/aiplatform.user`) and nothing else.
4. On that service account, go to Keys → Add key → JSON, and download it. Treat this file as a password: never commit it.
5. In Vertex AI Model Garden, choose the current Flash-Lite and Flash model ids available in your location.

## 2. Vercel env vars

Add these in Project → Settings → Environment Variables (Production and Preview):

| Name | Value |
| --- | --- |
| `GCP_SERVICE_ACCOUNT_JSON` | The whole JSON key file, pasted as is |
| `GCP_PROJECT_ID` | Your project ID |
| `GCP_LOCATION` | `global`, or a region such as `asia-south1` |
| `GEMINI_CHIPS_MODEL` | The Flash-Lite model id |
| `GEMINI_JUDGE_MODEL` | The Flash model id |

Mark `GCP_SERVICE_ACCOUNT_JSON` as **Sensitive**. Rotate the key in GCP if it ever leaks.

## 3. Rate limiting (Upstash Redis)

1. In Vercel, open Storage (Marketplace) → Upstash → Redis, create a database and connect it to the project. This sets `KV_REST_API_URL` and `KV_REST_API_TOKEN`, or `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`. Either pair works.
2. The limits are per caller (a hashed IP, never the raw one) and are set in `src/server/ratelimit.ts`:
   - chips: 30 requests per minute
   - judge: 10 requests per minute

   A caller over the limit gets a 429. The client then quietly uses its own chips, or shows "couldn't check" for an explanation.

Without Upstash the API is not rate limited, and a warning is printed in development. Always set it up for production.

## 4. Local development

Copy `.env.example` to `.env.local` and fill in what you have. `.env*` files are git-ignored, except `.env.example`.

## Privacy

- Nothing a player types is stored or logged by the server.
- Redis holds only a hashed caller id and a counter.
- Prompts put player text in tagged data blocks and tell the model to ignore any instructions inside them.
- The server rebuilds the flagged text from scenario data, so the client never sends, and can't fake, the answer key.
