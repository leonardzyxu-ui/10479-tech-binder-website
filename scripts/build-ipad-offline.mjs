#!/usr/bin/env node

import { mkdir, readFile, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(scriptDirectory, "..");
const sourcePath = path.join(root, "index.html");
const outputDirectory = path.join(root, "ipad-offline");
const outputPath = path.join(outputDirectory, "index.html");

const mimeTypes = new Map([
  [".gif", "image/gif"],
  [".jpeg", "image/jpeg"],
  [".jpg", "image/jpeg"],
  [".otf", "font/otf"],
  [".png", "image/png"],
  [".svg", "image/svg+xml"],
  [".ttf", "font/ttf"],
  [".webp", "image/webp"],
  [".woff", "font/woff"],
  [".woff2", "font/woff2"]
]);

const embedded = new Map();
const sha256 = value => createHash("sha256").update(value).digest("hex");

const assertInsideRoot = filePath => {
  const relative = path.relative(root, filePath);
  if (relative.startsWith("..") || path.isAbsolute(relative)) {
    throw new Error(`Refusing to embed a file outside the binder: ${filePath}`);
  }
  return relative;
};

const resolveLocal = (reference, baseDirectory = root) => {
  const clean = reference.trim().split(/[?#]/, 1)[0];
  if (!clean || /^(?:data:|blob:|https?:|mailto:|tel:|#|javascript:)/i.test(clean)) return null;
  return path.resolve(baseDirectory, decodeURIComponent(clean));
};

const asDataURL = async filePath => {
  const absolute = path.resolve(filePath);
  const relative = assertInsideRoot(absolute);
  if (embedded.has(absolute)) return embedded.get(absolute).url;

  const mimeType = mimeTypes.get(path.extname(absolute).toLowerCase());
  if (!mimeType) throw new Error(`Unsupported embedded asset: ${relative}`);
  const bytes = await readFile(absolute);
  const url = `data:${mimeType};base64,${bytes.toString("base64")}`;
  embedded.set(absolute, { relative, bytes: bytes.length, url });
  return url;
};

const inlineCss = async cssPath => {
  const absolute = path.resolve(cssPath);
  let css = await readFile(absolute, "utf8");
  const matches = [...css.matchAll(/url\(\s*(["']?)([^"')]+)\1\s*\)/gi)];
  for (const match of matches) {
    const asset = resolveLocal(match[2], path.dirname(absolute));
    if (!asset) continue;
    css = css.replace(match[0], `url("${await asDataURL(asset)}")`);
  }
  return css;
};

const replaceStylesheets = async html => {
  const tags = [...html.matchAll(/<link\b[^>]*>/gi)].map(match => match[0]);
  for (const tag of tags) {
    const rel = tag.match(/\brel=["']([^"']+)["']/i)?.[1] || "";
    const href = tag.match(/\bhref=["']([^"']+)["']/i)?.[1] || "";
    if (!rel.split(/\s+/).includes("stylesheet") || !href) continue;
    const stylesheet = resolveLocal(href);
    if (!stylesheet) continue;
    const css = await inlineCss(stylesheet);
    html = html.replace(tag, () => `<style data-offline-source="${path.relative(root, stylesheet)}">\n${css}\n</style>`);
  }
  return html;
};

const replaceIcons = async html => {
  const tags = [...html.matchAll(/<link\b[^>]*>/gi)].map(match => match[0]);
  for (const tag of tags) {
    const rel = tag.match(/\brel=["']([^"']+)["']/i)?.[1] || "";
    const href = tag.match(/\bhref=["']([^"']+)["']/i)?.[1] || "";
    if (!/(?:^|\s)(?:icon|apple-touch-icon)(?:\s|$)/.test(rel) || !href) continue;
    const icon = resolveLocal(href);
    if (!icon) continue;
    html = html.replace(tag, tag.replace(href, await asDataURL(icon)));
  }
  return html;
};

const replaceImages = async html => {
  const matches = [...html.matchAll(/(<(?:img|source)\b[^>]*\bsrc=["'])([^"']+)(["'])/gi)];
  for (const match of matches) {
    const asset = resolveLocal(match[2]);
    if (!asset) continue;
    html = html.replace(match[0], `${match[1]}${await asDataURL(asset)}${match[3]}`);
  }
  return html;
};

const replaceExternalScript = async (html, reference) => {
  const scriptPath = path.join(root, reference);
  const source = await readFile(scriptPath, "utf8");
  const escaped = reference.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const pattern = new RegExp(`<script\\b[^>]*\\bsrc=["']${escaped}["'][^>]*>\\s*<\\/script>`, "i");
  if (!pattern.test(html)) throw new Error(`Missing script tag for ${reference}`);
  return html.replace(pattern, () => `<script data-offline-source="${reference}">\n${source}\n</script>`);
};

const replaceOfflineModelLoader = async html => {
  const reference = "binder_assets/10479/3d/nexus-web-data.js";
  const source = await readFile(path.join(root, reference), "utf8");
  const pattern = /<script>\s*if \(window\.location\.protocol === ["']file:["']\) \{[\s\S]*?document\.write\([\s\S]*?\);\s*\}\s*<\/script>/i;
  if (!pattern.test(html)) throw new Error("Missing current file-protocol GLB fallback loader.");
  return html.replace(pattern, () => `<script data-offline-source="${reference}">\n${source}\n</script>`);
};

const removeServiceWorkerRegistration = html => html.replace(
  /<script>\s*if \(["']serviceWorker["'] in navigator[\s\S]*?<\/script>/i,
  "<script>/* Single-file iPad edition: no service worker or server required. */</script>"
);

const validateStandalone = html => {
  const forbidden = [
    /<link\b[^>]*\brel=["']stylesheet["']/i,
    /<link\b[^>]*\brel=["']manifest["']/i,
    /<script\b[^>]*\bsrc=/i,
    /<(?:img|source|video)\b[^>]*\bsrc=["'](?!data:|blob:)/i,
    /url\(\s*["']?(?!data:|blob:)[^"')]+/,
    /data-model=["'][^"']+\.glb/i,
    /navigator\.serviceWorker\.register/i
  ];
  for (const pattern of forbidden) {
    const match = html.match(pattern);
    if (match) {
      const start = Math.max(0, match.index - 120);
      const context = html.slice(start, match.index + match[0].length + 180).replace(/\s+/g, " ");
      throw new Error(`Standalone validation failed: ${context}`);
    }
  }
  for (const required of [
    "window.NEXUS_GLB_BASE64",
    "data-nexus-viewer",
    "NEXUS 3D",
    "viewport-fit=cover",
    "data-offline-source=\"assets/10479-3d-viewer.bundle.js\""
  ]) {
    if (!html.includes(required)) throw new Error(`Standalone validation missing: ${required}`);
  }
};

let html = await readFile(sourcePath, "utf8");
html = html.replace(
  /<meta\s+name=["']viewport["'][^>]*>/i,
  '<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">'
);
html = html.replace(/<link\b[^>]*\brel=["']manifest["'][^>]*>\s*/i, "");
html = await replaceIcons(html);
html = await replaceStylesheets(html);
html = await replaceImages(html);
html = html.replace(/data-model=["'][^"']+["']/i, 'data-model=""');
html = await replaceExternalScript(html, "assets/10479-site.js");
html = await replaceOfflineModelLoader(html);
html = await replaceExternalScript(html, "assets/10479-3d-viewer.bundle.js");
html = removeServiceWorkerRegistration(html);
html = html.replace("</head>", '    <meta name="offline-package" content="single-file-current-glb">\n  </head>');
validateStandalone(html);

await mkdir(outputDirectory, { recursive: true });
await writeFile(outputPath, html);

const outputBytes = Buffer.byteLength(html);
const glb = await readFile(path.join(root, "binder_assets/10479/3d/nexus-web.glb"));
console.log(JSON.stringify({
  ok: true,
  source: path.relative(root, sourcePath),
  output: path.relative(root, outputPath),
  outputBytes,
  outputMiB: Number((outputBytes / 1024 / 1024).toFixed(2)),
  embeddedAssets: embedded.size,
  glbBytes: glb.length,
  glbSha256: sha256(glb),
  outputSha256: sha256(Buffer.from(html))
}, null, 2));
