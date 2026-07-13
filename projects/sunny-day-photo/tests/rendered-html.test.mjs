import assert from "node:assert/strict";
import test from "node:test";

const developmentPreviewMeta =
  /<meta(?=[^>]*\bname=["']codex-preview["'])(?=[^>]*\bcontent=["']development["'])[^>]*>/i;

test("renders the complete Sunny Day Photo landing page", async () => {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  const response = await worker.fetch(
    new Request("http://localhost/", {
      headers: { accept: "text/html" },
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

  assert.equal(response.status, 200);
  assert.match(
    response.headers.get("content-type") ?? "",
    /^text\/html\b/i,
  );
  const html = await response.text();

  assert.match(html, developmentPreviewMeta);
  assert.match(html, /Sunny Day Photo/);
  assert.match(html, /個人プロフィール撮影/);
  assert.match(html, /家族・記念撮影/);
  assert.match(html, /イベント撮影/);
  assert.match(html, /よくある質問/);
  assert.match(html, /<details[^>]*>/i);
  assert.match(
    html,
    /https:\/\/docs\.google\.com\/forms\/d\/e\/1FAIpQLSfhV2fyFLb0QSjpd3NGI8KEYjbQ1JUaiDMPeOP15aPLQJOATw\/viewform/,
  );
  assert.match(html, /ポートフォリオ用に制作した架空のサービス/);
});
