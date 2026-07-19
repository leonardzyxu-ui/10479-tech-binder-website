import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

async function renderRoot() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request("http://localhost/", {
      headers: { accept: "text/html" },
      redirect: "manual",
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );
}

test("redirects the site root to the static Tech Binder", async () => {
  const response = await renderRoot();
  assert.equal(response.status, 307);
  assert.equal(
    new URL(response.headers.get("location"), "http://localhost").pathname,
    "/binder/index.html",
  );
});

test("packages the complete installable Team 10479 binder", async () => {
  const publicRoot = new URL("../public/binder/", import.meta.url);
  const html = await readFile(new URL("index.html", publicRoot), "utf8");

  assert.match(html, /id="robot-3d"/);
  assert.match(html, /id="strategy"/);
  assert.match(html, /id="localization"/);
  assert.match(html, /id="autonomous-control"/);
  assert.match(html, /id="systems-control"/);
  assert.match(html, /id="turret-algorithms"/);
  assert.match(html, /20 轮耦合求解/);
  assert.doesNotMatch(html, /爬升机构|攀爬机构/);
  assert.match(html, /Powerhouse Simulator/);
  assert.match(html, /PowerScout/);
  assert.match(html, /扫码查看技术手册/);
  assert.match(html, /site-qr\.png/);
  assert.match(html, /manifest\.webmanifest/);
  assert.match(html, /serviceWorker\.register/);

  await Promise.all([
    access(new URL("binder_assets/10479/site-qr.png", publicRoot)),
    access(new URL("binder_assets/10479/tech-diagrams/kalman.svg", publicRoot)),
    access(new URL("binder_assets/10479/tech-diagrams/dynamic-passing.svg", publicRoot)),
    access(new URL("binder_assets/10479/simulator-overview.png", publicRoot)),
    access(new URL("binder_assets/10479/3d/nexus-web.glb", publicRoot)),
    access(new URL("assets/10479-3d-viewer.bundle.js", publicRoot)),
    access(new URL("manifest.webmanifest", publicRoot)),
    access(new URL("service-worker.js", publicRoot)),
    access(new URL("pwa-icon-192.png", publicRoot)),
    access(new URL("pwa-icon-512.png", publicRoot)),
  ]);
});
