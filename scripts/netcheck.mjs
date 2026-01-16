#!/usr/bin/env node
import http from "http";
import https from "https";
import { URL } from "url";

const DEFAULT_ORIGIN = "https://www.tihiydom.com";
const TIMEOUT_MS = 8000;
const MAX_ASSETS = 30;
const MAX_HTML_BYTES = 2 * 1024 * 1024;

const args = process.argv.slice(2);
const resolveMap = new Map();
let baseInput = "";

for (let i = 0; i < args.length; i += 1) {
  const arg = args[i];
  if (arg === "--resolve") {
    const value = args[i + 1];
    i += 1;
    if (!value) {
      console.error("Missing value for --resolve (expected host:ip)");
      process.exit(1);
    }
    const idx = value.lastIndexOf(":");
    if (idx <= 0 || idx === value.length - 1) {
      console.error(`Invalid --resolve value: ${value} (expected host:ip)`);
      process.exit(1);
    }
    const host = value.slice(0, idx);
    const ip = value.slice(idx + 1);
    resolveMap.set(host, ip);
  } else if (!arg.startsWith("-") && !baseInput) {
    baseInput = arg;
  }
}

const baseUrl = baseInput || DEFAULT_ORIGIN;
const origin = new URL(
  /^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//.test(baseUrl) ? baseUrl : `https://${baseUrl}`,
);
const rootUrl = new URL("/", origin);

function requestOnce(targetUrl, options = {}) {
  const url = typeof targetUrl === "string" ? new URL(targetUrl) : targetUrl;
  const useHttps = url.protocol === "https:";
  const lib = useHttps ? https : http;
  const resolveIp = resolveMap.get(url.hostname);
  const headers = { ...(options.headers || {}) };
  if (resolveIp) {
    headers.Host = url.host;
  }

  const requestOptions = {
    method: options.method || "GET",
    protocol: url.protocol,
    hostname: resolveIp || url.hostname,
    port: url.port || (useHttps ? 443 : 80),
    path: `${url.pathname}${url.search}`,
    headers,
    servername: resolveIp && useHttps ? url.hostname : undefined,
  };

  const start = Date.now();

  return new Promise((resolve) => {
    const req = lib.request(requestOptions, (res) => {
      res.on("data", () => {});
      res.on("end", () => {
        resolve({
          status: res.statusCode || 0,
          timeMs: Date.now() - start,
          error: null,
        });
      });
    });

    const timer = setTimeout(() => {
      req.destroy(new Error("timeout"));
    }, options.timeoutMs || TIMEOUT_MS);

    req.on("error", (err) => {
      clearTimeout(timer);
      resolve({
        status: 0,
        timeMs: Date.now() - start,
        error: err?.message || "request_error",
      });
    });

    req.on("close", () => clearTimeout(timer));
    req.end();
  });
}

async function fetchHtml(url) {
  const useHttps = url.protocol === "https:";
  const lib = useHttps ? https : http;
  const resolveIp = resolveMap.get(url.hostname);
  const headers = resolveIp ? { Host: url.host } : {};
  const requestOptions = {
    method: "GET",
    protocol: url.protocol,
    hostname: resolveIp || url.hostname,
    port: url.port || (useHttps ? 443 : 80),
    path: `${url.pathname}${url.search}`,
    headers,
    servername: resolveIp && useHttps ? url.hostname : undefined,
  };

  return new Promise((resolve, reject) => {
    const req = lib.request(requestOptions, (res) => {
      const chunks = [];
      let total = 0;
      res.on("data", (chunk) => {
        total += chunk.length;
        if (total > MAX_HTML_BYTES) {
          req.destroy(new Error("html_too_large"));
          return;
        }
        chunks.push(chunk);
      });
      res.on("end", () => {
        resolve(Buffer.concat(chunks).toString("utf8"));
      });
    });

    const timer = setTimeout(() => {
      req.destroy(new Error("timeout"));
    }, TIMEOUT_MS);

    req.on("error", (err) => {
      clearTimeout(timer);
      reject(err);
    });

    req.on("close", () => clearTimeout(timer));
    req.end();
  });
}

function extractAssets(html, baseOrigin) {
  const pattern = /\/_next\/static\/[^"'\\s)]+?\.(?:js|css)(?:\\?[^"'\\s)]*)?/g;
  const matches = html.match(pattern) || [];
  const unique = [];
  const seen = new Set();
  for (const match of matches) {
    if (seen.has(match)) continue;
    seen.add(match);
    unique.push(new URL(match, baseOrigin).toString());
    if (unique.length >= MAX_ASSETS) break;
  }
  return unique;
}

async function checkAsset(url) {
  const headResult = await requestOnce(url, { method: "HEAD" });
  if (headResult.status === 405 || headResult.status === 501) {
    const rangeResult = await requestOnce(url, {
      method: "GET",
      headers: { Range: "bytes=0-0" },
    });
    return { url, ...rangeResult };
  }
  return { url, ...headResult };
}

function formatTable(rows) {
  const headers = ["url", "status", "time_ms", "error"];
  const widths = headers.map((h) => h.length);
  for (const row of rows) {
    widths[0] = Math.max(widths[0], row.url.length);
    widths[1] = Math.max(widths[1], String(row.status).length);
    widths[2] = Math.max(widths[2], String(row.time_ms).length);
    widths[3] = Math.max(widths[3], row.error.length);
  }

  const line = headers
    .map((h, i) => h.padEnd(widths[i], " "))
    .join("  ");
  const divider = widths.map((w) => "-".repeat(w)).join("  ");
  const body = rows
    .map((row) =>
      [row.url, row.status, row.time_ms, row.error]
        .map((v, i) => String(v).padEnd(widths[i], " "))
        .join("  "),
    )
    .join("\n");
  return [line, divider, body].join("\n");
}

async function main() {
  let html = "";
  try {
    html = await fetchHtml(rootUrl);
  } catch (err) {
    console.error(`Failed to fetch HTML from ${rootUrl.toString()}: ${err?.message || err}`);
    process.exit(1);
  }

  const assets = extractAssets(html, origin);
  if (assets.length === 0) {
    console.error("No /_next/static/*.js or *.css assets found in HTML.");
    process.exit(1);
  }

  const results = [];
  let ok = true;
  for (const url of assets) {
    const result = await checkAsset(url);
    const status = result.status || 0;
    const isOk = status >= 200 && status < 400 && !result.error;
    if (!isOk) ok = false;
    results.push({
      url,
      status: status || "-",
      time_ms: result.timeMs || "-",
      error: result.error || "",
    });
  }

  console.log(formatTable(results));
  process.exit(ok ? 0 : 1);
}

main().catch((err) => {
  console.error(err?.message || err);
  process.exit(1);
});
