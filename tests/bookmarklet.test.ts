import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { GET } from "../app/api/ipl/bookmarklet/route.ts";

describe("IPL bookmarklet endpoint", () => {
  it("returns a bookmarklet that posts extracted data to the IPL API", async () => {
    const response = await GET(
      new Request("http://localhost:3000/api/ipl/bookmarklet"),
    );
    const script = await response.text();

    assert.equal(
      response.headers.get("content-type"),
      "text/plain; charset=utf-8",
    );
    assert.match(script, /^javascript:\(async\(\)=>/);
    assert.match(script, /#leadersList/);
    assert.match(script, /fetch\(endpoint,\{method:"POST"/);
    assert.match(script, /"http:\/\/localhost:3000\/api\/ipl"/);
  });

  it("extracts data only and does not rewrite or style the fantasy page", async () => {
    const response = await GET(
      new Request("http://localhost:3000/api/ipl/bookmarklet"),
    );
    const script = await response.text();

    assert.equal(script.includes("document.write"), false);
    assert.equal(script.includes("document.open"), false);
    assert.equal(script.includes("<style>"), false);
    assert.equal(script.includes("<table"), false);
  });
});
