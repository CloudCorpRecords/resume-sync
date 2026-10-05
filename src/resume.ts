import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  ExternalHyperlink,
  HeadingLevel,
} from "docx";
import type { PinnedRepo } from "./github.js";

export function cleanDescription(d: string): string {
  d = (d || "A personal project.").trim().replace(/\s+/g, " ");
  return d.endsWith(".") ? d : d + ".";
}

export function repoTags(r: PinnedRepo): string[] {
  return [...r.languages, ...r.topics].slice(0, 4);
}

export function renderMarkdown(repos: PinnedRepo[]): string {
  return repos
    .map((r) => {
      const links = [`[Code](${r.url})`];
      if (r.homepageUrl) links.unshift(`[Live](${r.homepageUrl})`);
      const tags = repoTags(r)
        .map((t) => `\`${t}\``)
        .join(" ");
      return `**${r.name}** — ${cleanDescription(r.description)} ${links.join(" · ")}\n${tags}`;
    })
    .join("\n\n");
}

export async function renderDocx(repos: PinnedRepo[]): Promise<Buffer> {
  const children: Paragraph[] = [
    new Paragraph({ text: "Projects", heading: HeadingLevel.HEADING_1 }),
  ];

  for (const r of repos) {
    const linkRuns = [];
    if (r.homepageUrl) {
      linkRuns.push(
        new ExternalHyperlink({
          children: [new TextRun({ text: "Live", style: "Hyperlink" })],
          link: r.homepageUrl,
        }),
        new TextRun(" · ")
      );
    }
    linkRuns.push(
      new ExternalHyperlink({
        children: [new TextRun({ text: "Code", style: "Hyperlink" })],
        link: r.url,
      })
    );

    children.push(
      new Paragraph({
        children: [
          new TextRun({ text: r.name, bold: true }),
          new TextRun(` — ${cleanDescription(r.description)} `),
          ...linkRuns,
        ],
      }),
      new Paragraph({
        children: [
          new TextRun({ text: repoTags(r).join(" · "), italics: true, size: 20 }),
        ],
      }),
      new Paragraph({ text: "" })
    );
  }

  const doc = new Document({ sections: [{ children }] });
  return Buffer.from(await Packer.toBuffer(doc));
}

export function replaceInplace(template: string, section: string): string {
  const replaced = template.replace(
    /<!-- PROJECTS:START -->[\s\S]*?<!-- PROJECTS:END -->/,
    `<!-- PROJECTS:START -->\n${section}\n<!-- PROJECTS:END -->`
  );
  if (replaced === template) {
    throw new Error("No <!-- PROJECTS:START --> ... <!-- PROJECTS:END --> markers found in template");
  }
  return replaced;
}
