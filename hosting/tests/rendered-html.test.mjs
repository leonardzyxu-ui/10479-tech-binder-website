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

test("packages the complete Team 10479 binder and QR", async () => {
  const publicRoot = new URL("../public/binder/", import.meta.url);
  const html = await readFile(new URL("index.html", publicRoot), "utf8");

  assert.match(html, /id="robot-3d"/);
  assert.match(html, /Powerhouse Simulator/);
  assert.match(html, /PowerScout/);
  assert.match(html, /扫码查看技术手册/);
  assert.match(html, /site-qr\.png/);

  await Promise.all([
    access(new URL("binder_assets/10479/site-qr.png", publicRoot)),
    access(new URL("binder_assets/10479/3d/nexus-web.glb", publicRoot)),
    access(new URL("assets/10479-3d-viewer.bundle.js", publicRoot)),
  ]);
});
