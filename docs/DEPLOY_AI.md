# AI marking (OpenAI) on Vercel

The flag API (`src/app/api/flag/*`) can use OpenAI for one job:

| Endpoint               | Default model  | What it does                                            |
| ---------------------- | -------------- | ------------------------------------------------------- |
| `POST /api/flag/judge` | `gpt-5.4-mini` | Marks the player's written explanation for bonus points |

The "Why is this suspicious?" options never use AI: they come from `reasonChips()` in `src/engine/highlight.ts` and appear instantly.

## The switch: `FLAG_AI`

- **`FLAG_AI=on` and `OPENAI_API_KEY` set:** the "In your own words" box shows in the flag popup, and notes are marked in the background for the debrief.
- **Otherwise (the default):** nothing is marked and the note box is hidden.

The scenario page reads `FLAG_AI` on the server when it is built, so change the env var and redeploy to switch it.

If OpenAI is slow, failing or over the rate limit, the debrief says the note couldn't be marked. The game never breaks. The timeout is 8 s.

- **Model:** override it with `OPENAI_JUDGE_MODEL`.
- **Reasoning:** turned off (`effort: "none"`) for speed.
- **Answer format:** answers are forced into a strict JSON schema.
- **Storage:** requests are sent with `store: false`.

## What the model sees

The flagged sentence, the red flag's label and explanation (the rubric), the reason the player picked, and the player's note.

- The server works out which red flag (if any) the sentence caught from the scenario data, and only accepts exact sentence ranges. A false alarm is never sent to the model.
- Player text sits in tagged data blocks, and the prompt says to ignore any instructions inside them.

## Vercel env vars

Add `FLAG_AI=on` and `OPENAI_API_KEY` (mark it Sensitive) in Project → Settings → Environment Variables, for Production and Preview.

## Rate limiting (Upstash Redis)

1. In Vercel, open Storage (Marketplace) → Upstash → Redis, create a database and connect it. This sets `KV_REST_API_URL`/`KV_REST_API_TOKEN` or `UPSTASH_REDIS_REST_URL`/`UPSTASH_REDIS_REST_TOKEN`.
2. The limit is per hashed caller id and is set in `src/server/ratelimit.ts`: 10 judge requests per minute. A caller over the limit gets a 429.

Without Upstash the API isn't rate limited, and a warning is printed in development. Always set it up for production.

## Privacy

- Nothing a player types is stored or logged by our server. Failed calls log only the error message.
- Redis holds only a hashed caller id and a counter.
