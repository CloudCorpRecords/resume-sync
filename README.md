# Resume Sync

Your resume's Projects section, generated from your GitHub — never stale again. One command reads your pinned repos and rewrites the projects block with current descriptions, tech stacks, and links.

## Why this exists

Resumes rot. You ship a new repo, the resume still lists last quarter's projects — or describes them the way they looked six months ago. This makes the resume a build artifact: source of truth is GitHub, output is a fresh projects section on every run.

## For AI builders (read this first)

Small CLI, three stages, no magic:

1. **Fetch** (`src/github.ts`) — pinned repos via GitHub API, including languages + topics + description
2. **Render** (`src/resume.ts`) — pinned repos → Markdown projects section (and optionally DOCX)
3. **Write** — stdout, file, or in-place section replace between `<!-- PROJECTS:START -->` markers

## Repo structure

```
resume-sync/
├── src/
│   ├── index.ts      # CLI: resume-sync [--format md|docx] [--output FILE]
│   ├── github.ts     # ← fetch pinned repos (GraphQL: pinnedItems)
│   └── resume.ts     # ← render projects section from repo data
└── examples/
    └── projects.md   # sample output
```

## CLI usage

```bash
# print the projects section as Markdown
npx resume-sync

# write it to a file
npx resume-sync --output projects.md

# replace the section inside an existing resume template
npx resume-sync --inplace resume-template.md
```

## Rendering rules

Each pinned repo becomes one bullet block:

```markdown
**Cliqwise** — MCP-first AI video clipping: agents submit videos via MCP, the server edits and returns viral clips. [Live](https://clipwise.replit.app) · [Code](https://github.com/CloudCorpRecords/cliqwise)
`TypeScript` `MCP`
```

Rules:
- Lead with what it DOES, not what it IS (description field, cleaned up)
- Append Live link only if the repo has a homepage/demo URL set
- Tech tags from top 3 languages + topics, max 4
- Skip forks and archived repos automatically
- Order: pinned order (most important first)

## Setup

```bash
npm install
export GITHUB_TOKEN=ghp_...   # needs read:user scope
npm run dev
```

## Status: v1 built and tested

The full CLI is implemented, typechecked, and covered by tests (`npm test` — 8/8 passing), plus an end-to-end smoke test through the real code path (GraphQL mapping → Markdown → DOCX):

- GitHub GraphQL fetch of pinned repos (forks + archived auto-filtered)
- Markdown render per the formatting rules
- DOCX render (valid .docx via the `docx` package)
- `--output FILE`, `--format md|docx`, `--inplace TEMPLATE` with `<!-- PROJECTS:START/END -->` markers

Usage: `GITHUB_TOKEN=ghp_... npm run dev -- --output projects.md`
Tests: `npm test` · Typecheck: `node node_modules/typescript/bin/tsc --noEmit`

## Tech stack

`TypeScript` `GitHub GraphQL API` `docx`

## Roadmap

- [ ] v1: Markdown output from pinned repos
- [ ] v2: `--inplace` template replacement
- [ ] v3: DOCX output
- [ ] v4: LLM description polisher

## License

MIT
