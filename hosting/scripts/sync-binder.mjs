import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const hostingDir = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const sourceDir = resolve(hostingDir, "..");
const targetDir = resolve(hostingDir, "public/binder");

await rm(targetDir, { recursive: true, force: true });
await mkdir(targetDir, { recursive: true });

for (const entry of [
  "index.html",
  "favicon.png",
  "manifest.webmanifest",
  "pwa-icon-192.png",
  "pwa-icon-512.png",
  "service-worker.js",
  "assets",
  "binder_assets",
  "fonts",
]) {
  await cp(resolve(sourceDir, entry), resolve(targetDir, entry), { recursive: true });
}

// HTTP deployments load the binary GLB directly; this data URL copy is for file:// only.
await rm(resolve(targetDir, "binder_assets/10479/3d/nexus-web-data.js"), {
  force: true,
});

await cp(
  resolve(sourceDir, "hosted-assets/nexus-web.glb"),
  resolve(targetDir, "binder_assets/10479/3d/nexus-web.glb"),
);

const hostedIndexPath = resolve(targetDir, "index.html");
const hostedIndex = await readFile(hostedIndexPath, "utf8");
await writeFile(
  hostedIndexPath,
  hostedIndex.replace(
    "1,763,000 triangles",
    "424,162 triangles · Hosted LOD",
  ),
);
