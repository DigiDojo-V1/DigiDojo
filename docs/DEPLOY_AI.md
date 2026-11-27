# AI reason chips and marking (OpenAI) on Vercel

The flag API (`src/app/api/flag/*`) can use OpenAI for two jobs:

| Endpoint               | Default model  | What it does                                                               |
| ---------------------- | -------------- | -------------------------------------------------------------------------- |
| `POST /api/flag/chips` | `gpt-5.4-nano` | Writes the 4 "Why is this suspicious?" reasons for what the player flagged |
| `POST /api/flag/judge` | `gpt-5.4-mini` | Marks the player's written explanation for bonus points                    |

## The switch: `FLAG_AI`

- **`FLAG_AI=on` and `OPENAI_API_KEY` set:** the model writes the reasons and marks explanations, and the "In your own words" box shows in the flag popup.
- **Otherwise (the default):** reasons come from `fallbackChips()`, nothing is marked, and the note box is hidden.

If OpenAI is slow, failing or over the rate limit, that one request quietly falls back to the built-in reasons. The game never breaks. The timeouts are 5 s for reasons and 8 s for marking.

- **Models:** override them with `OPENAI_CHIPS_MODEL` and `OPENAI_JUDGE_MODEL`.
- **Reasoning:** turned off (`effort: "none"`) for speed.
- **Answer format:** answers are forced into a strict JSON schema.
- **Storage:** requests are sent with `store: false`.

## What the model sees

- **Reason chips:** only the words the player highlighted (never the rest of the message, so the labels can't hint at red flags elsewhere), the dojo's takeaways as learning goals, and which tactic must be an option. The model may answer `trivial: true` with no options, and the player then explains in their own words.
  - The server works out which red flag (if any) the highlight caught from the scenario data. It always puts the right reason among the 4, and shuffles them.
- **Marking:** the highlighted words, the red flag's label and explanation (the rubric), and the player's note.
  - Player text sits in tagged data blocks, and the prompt says to ignore any instructions inside them.

## Vercel env vars

Add `FLAG_AI=on` and `OPENAI_API_KEY` (mark it Sensitive) in Project → Settings → Environment Variables, for Production and Preview.

## Rate limiting (Upstash Redis)

1. In Vercel, open Storage (Marketplace) → Upstash → Redis, create a database and connect it. This sets `KV_REST_API_URL`/`KV_REST_API_TOKEN` or `UPSTASH_REDIS_REST_URL`/`UPSTASH_REDIS_REST_TOKEN`.
2. The limits are per hashed caller id and are set in `src/server/ratelimit.ts`:
   - chips: 30 requests per minute
   - judge: 10 requests per minute

   A caller over the limit gets a 429, and the client falls back.

Without Upstash the API isn't rate limited, and a warning is printed in development. Always set it up for production.

## Privacy

- Nothing a player types is stored or logged by our server. Failed calls log only the error message.
- Redis holds only a hashed caller id and a counter.
