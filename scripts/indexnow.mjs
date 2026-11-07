#!/usr/bin/env node
// Pings IndexNow (Bing, Yandex, Seznam, Naver) with every canonical URL in the
// live sitemap, or with the URLs passed on the command line.
// Usage:
//   npm run indexnow                 submit everything in the sitemap
//   npm run indexnow -- <url> [...]  submit specific pages (e.g. a new article)
//   npm run indexnow -- --dry-run    print the payload without sending
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const extraUrls = args.filter((a) => !a.startsWith("--"));
const base = (process.env.SITE_URL ?? "https://anaquran.com").replace(
  /\/$/,
  ""
);
const publicDir = path.join(process.cwd(), "public");
const endpoint = "https://api.indexnow.org/indexnow";

const keyFile = (await readdir(publicDir)).find((f) =>
  /^[a-f0-9]{32}\.txt$/.test(f)
);
if (!keyFile) {
  console.error(
    "No IndexNow key file found in public/ (expected <32 hex chars>.txt)."
  );
  process.exit(1);
}
const key = (await readFile(path.join(publicDir, keyFile), "utf8")).trim();
if (key !== keyFile.slice(0, -4)) {
  console.error(
    `${keyFile} must contain its own filename without the extension.`
  );
  process.exit(1);
}

let urls = extraUrls;
if (urls.length === 0) {
  const res = await fetch(`${base}/sitemap.xml`);
  if (!res.ok) {
    console.error(`Could not read ${base}/sitemap.xml (${res.status}).`);
    process.exit(1);
  }
  const xml = await res.text();
  urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].trim());
}

if (urls.length === 0) {
  console.error("No URLs to submit.");
  process.exit(1);
}

const site = new URL(urls[0]).origin;
const foreign = urls.filter((u) => new URL(u).origin !== site);
if (foreign.length > 0) {
  console.error(
    `All URLs must share the sitemap host ${site}. Offending:\n${foreign.join("\n")}`
  );
  process.exit(1);
}

const payload = {
  host: new URL(site).host,
  key,
  keyLocation: `${site}/${keyFile}`,
  urlList: urls,
};

console.log(`IndexNow: ${urls.length} URL(s) for ${payload.host}`);
console.log(`Key file: ${payload.keyLocation}`);

if (dryRun) {
  console.log(JSON.stringify(payload, null, 2));
  process.exit(0);
}

const res = await fetch(endpoint, {
  method: "POST",
  headers: { "Content-Type": "application/json; charset=utf-8" },
  body: JSON.stringify(payload),
});

const detail = await res.text();
console.log(
  `Response: ${res.status} ${res.statusText}${detail ? ` — ${detail.slice(0, 300)}` : ""}`
);

if (res.status === 200 || res.status === 202) {
  console.log("Accepted. Bing will re-crawl these URLs shortly.");
  process.exit(0);
}

const hints = {
  400: "Malformed request — check the payload shape.",
  403: "Key rejected — confirm the key file is live at keyLocation.",
  422: "URLs do not belong to the declared host, or the key does not match.",
  429: "Too many submissions — retry later.",
};
console.error(hints[res.status] ?? "IndexNow rejected the submission.");
process.exit(1);
