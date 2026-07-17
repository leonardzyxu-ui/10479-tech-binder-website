import { cp, mkdir, rm } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const hostingDir = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const sourceDir = resolve(hostingDir, "..");
const targetDir = resolve(hostingDir, "public/binder");

await rm(targetDir, { recursive: true, force: true });
await mkdir(targetDir, { recursive: true });

for (const entry of ["index.html", "favicon.png", "assets", "binder_assets", "fonts"]) {
  await cp(resolve(sourceDir, entry), resolve(targetDir, entry), { recursive: true });
}

// HTTP deployments load the binary GLB directly; this data URL copy is for file:// only.
await rm(resolve(targetDir, "binder_assets/10479/3d/nexus-web-data.js"), {
  force: true,
});
