// One-time sign-in so the flag API can call Gemini on Vertex AI with your OAuth client.
//
//   npm run google:auth
//
// Reads GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET from .env, opens Google sign-in, and saves
// GOOGLE_REFRESH_TOKEN (and GCP_PROJECT_ID if you type one) back into .env. Secrets are never
// printed. The OAuth client must be a "Desktop app", or a "Web application" with
// http://localhost:8085/oauth2callback as an authorised redirect URI.

import { readFileSync, writeFileSync } from "node:fs";
import { createServer } from "node:http";
import { createInterface } from "node:readline/promises";
import { OAuth2Client } from "google-auth-library";

const ENV_FILE = ".env";
const PORT = 8085;
const REDIRECT = `http://localhost:${PORT}/oauth2callback`;
const SCOPES = ["https://www.googleapis.com/auth/cloud-platform"];

function readEnv() {
  let text = "";
  try {
    text = readFileSync(ENV_FILE, "utf8");
  } catch {
    // No .env yet.
  }
  const values = {};
  for (const line of text.split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m) values[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
  return { text, values };
}

function setEnv(text, key, value) {
  const line = `${key}=${value}`;
  const re = new RegExp(`^\\s*${key}\\s*=.*$`, "m");
  if (re.test(text)) return text.replace(re, line);
  return `${text}${text.endsWith("\n") || text === "" ? "" : "\n"}${line}\n`;
}

const { text, values } = readEnv();
const clientId = values.GOOGLE_CLIENT_ID;
const clientSecret = values.GOOGLE_CLIENT_SECRET;
if (!clientId || !clientSecret) {
  console.error("Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in .env first.");
  process.exit(1);
}

const client = new OAuth2Client({ clientId, clientSecret, redirectUri: REDIRECT });
const url = client.generateAuthUrl({ access_type: "offline", prompt: "consent", scope: SCOPES });

const code = await new Promise((resolve, reject) => {
  const server = createServer((req, res) => {
    const u = new URL(req.url ?? "/", REDIRECT);
    if (u.pathname !== "/oauth2callback") {
      res.writeHead(404).end();
      return;
    }
    const error = u.searchParams.get("error");
    const value = u.searchParams.get("code");
    res.writeHead(200, { "content-type": "text/plain" });
    res.end(value ? "Signed in. You can close this tab." : `Sign-in failed: ${error ?? "no code"}`);
    server.close();
    if (value) resolve(value);
    else reject(new Error(error ?? "no code"));
  });
  server.listen(PORT, "localhost", () => {
    console.log("Open this link and sign in with the Google account that has Vertex AI access:\n");
    console.log(url, "\n");
  });
});

const { tokens } = await client.getToken(code);
if (!tokens.refresh_token) {
  console.error("Google returned no refresh token. Remove the app's access at");
  console.error("https://myaccount.google.com/permissions and run this again.");
  process.exit(1);
}

let next = setEnv(text, "GOOGLE_REFRESH_TOKEN", tokens.refresh_token);
if (!values.GCP_PROJECT_ID) {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  const project = (await rl.question("GCP project ID with Vertex AI enabled: ")).trim();
  rl.close();
  if (project) next = setEnv(next, "GCP_PROJECT_ID", project);
}
writeFileSync(ENV_FILE, next);
console.log("Saved GOOGLE_REFRESH_TOKEN to .env. Set FLAG_AI=on and restart `npm run dev`.");
