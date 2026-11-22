// Lets plain `node` run the repo's TypeScript scripts with no extra dependencies.
// Node 24 strips types itself; this hook adds what it doesn't do:
//   - the `@/` path alias from tsconfig.json (→ src/)
//   - extensionless relative imports (→ .ts, .tsx or /index.ts)
// Usage: node --import ./scripts/ts-resolve.mjs scripts/<script>.ts
import { existsSync } from "node:fs";
import { register } from "node:module";
import { fileURLToPath, pathToFileURL } from "node:url";

if (!import.meta.url.includes("?hooks")) {
  register(`${import.meta.url}?hooks`, import.meta.url);
}

const srcDir = new URL("../src/", import.meta.url);

function withExtension(url) {
  const path = fileURLToPath(url);
  if (/\.[cm]?[jt]sx?$/.test(path) && existsSync(path)) return url;
  for (const suffix of [".ts", ".tsx", "/index.ts"]) {
    if (existsSync(path + suffix)) return pathToFileURL(path + suffix).href;
  }
  return url;
}

export async function resolve(specifier, context, nextResolve) {
  if (specifier.startsWith("@/")) {
    return nextResolve(withExtension(new URL(specifier.slice(2), srcDir).href), context);
  }
  if ((specifier.startsWith("./") || specifier.startsWith("../")) && context.parentURL) {
    const url = new URL(specifier, context.parentURL);
    if (url.protocol === "file:" && !url.pathname.includes("/node_modules/")) {
      return nextResolve(withExtension(url.href), context);
    }
  }
  return nextResolve(specifier, context);
}
