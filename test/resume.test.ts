import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  cleanDescription,
  repoTags,
  renderMarkdown,
  renderDocx,
  replaceInplace,
} from "../src/resume.js";
import type { PinnedRepo } from "../src/github.js";

const repos: PinnedRepo[] = [
  {
    name: "cliqwise",
    description: "MCP-first AI video clipping: agents submit videos via MCP, the server edits and returns viral clips",
    url: "https://github.com/CloudCorpRecords/cliqwise",
    homepageUrl: "https://clipwise.replit.app",
    languages: ["TypeScript"],
    topics: ["mcp", "ai", "video", "typescript", "extra-should-be-cut"],
  },
  {
    name: "sudohired",
    description: "",
    url: "https://github.com/CloudCorpRecords/sudohired",
    homepageUrl: null,
    languages: ["TypeScript", "Python"],
    topics: ["ai-agents"],
  },
];

describe("cleanDescription", () => {
  it("trims, collapses whitespace, ensures trailing period", () => {
    assert.equal(cleanDescription("  hello   world "), "hello world.");
    assert.equal(cleanDescription("already done."), "already done.");
  });
  it("falls back for empty descriptions", () => {
    assert.equal(cleanDescription(""), "A personal project.");
  });
});

describe("repoTags", () => {
  it("merges languages + topics, caps at 4", () => {
    assert.deepEqual(repoTags(repos[0]), ["TypeScript", "mcp", "ai", "video"]);
  });
});

describe("renderMarkdown", () => {
  it("renders name, description, links, tags", () => {
    const md = renderMarkdown(repos);
    assert.ok(md.includes("**cliqwise**"));
    assert.ok(md.includes("[Live](https://clipwise.replit.app)"));
    assert.ok(md.includes("[Code](https://github.com/CloudCorpRecords/cliqwise)"));
    assert.ok(md.includes("`TypeScript`"));
  });
  it("omits Live link when no homepage", () => {
    const md = renderMarkdown([repos[1]]);
    assert.ok(!md.includes("[Live]"));
    assert.ok(md.includes("A personal project."));
  });
});

describe("replaceInplace", () => {
  it("replaces the marked section", () => {
    const tpl = "# Resume\n<!-- PROJECTS:START -->\nold\n<!-- PROJECTS:END -->\nbye";
    const out = replaceInplace(tpl, "NEW");
    assert.ok(out.includes("<!-- PROJECTS:START -->\nNEW\n<!-- PROJECTS:END -->"));
    assert.ok(!out.includes("old"));
    assert.ok(out.includes("bye"));
  });
  it("throws when markers are missing", () => {
    assert.throws(() => replaceInplace("no markers", "x"), /markers/);
  });
});

describe("renderDocx", () => {
  it("produces a non-empty buffer", async () => {
    const buf = await renderDocx(repos);
    assert.ok(Buffer.isBuffer(buf));
    assert.ok(buf.length > 1000);
    // DOCX is a zip — starts with PK
    assert.equal(buf[0], 0x50);
    assert.equal(buf[1], 0x4b);
  });
});
