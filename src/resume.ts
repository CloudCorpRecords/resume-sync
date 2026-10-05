import type { PinnedRepo } from "./github.js";

function cleanDescription(d: string): string {
  // strip leading "Learn how to" style casual phrasing is left to the LLM polisher (v4);
  // v1 just trims and ensures it ends with a period.
  d = d.trim().replace(/\s+/g, " ");
  return d.endsWith(".") ? d : d + ".";
}

export function renderMarkdown(repos: PinnedRepo[]): string {
  return repos
    .map((r) => {
      const tags = [...r.languages, ...r.topics].slice(0, 4);
      const links = [`[Code](${r.url})`];
      if (r.homepageUrl) links.unshift(`[Live](${r.homepageUrl})`);
      return (
        `**${r.name}** — ${cleanDescription(r.description)} ${links.join(" · ")}\n` +
        tags.map((t) => `\`${t}\``).join(" ")
      );
    })
    .join("\n\n");
}

export function replaceInplace(template: string, section: string): string {
  return template.replace(
    /<!-- PROJECTS:START -->[\s\S]*?<!-- PROJECTS:END -->/,
    `<!-- PROJECTS:START -->\n${section}\n<!-- PROJECTS:END -->`
  );
}
