import { fetchPinnedRepos } from "./github.js";
import { renderMarkdown, renderDocx, replaceInplace } from "./resume.js";
import { writeFileSync, readFileSync } from "node:fs";

function argValue(flag: string): string | undefined {
  const i = process.argv.indexOf(flag);
  return i !== -1 ? process.argv[i + 1] : undefined;
}

const login = process.env.GITHUB_LOGIN || "CloudCorpRecords";
const format = argValue("--format") || "md";
const output = argValue("--output");
const inplaceFile = argValue("--inplace");

if (!["md", "docx"].includes(format)) {
  console.error('Unknown --format. Use "md" or "docx".');
  process.exit(1);
}

if (!process.env.GITHUB_TOKEN) {
  console.error("GITHUB_TOKEN env var is not set.");
  process.exit(1);
}

const repos = await fetchPinnedRepos(login);

if (inplaceFile) {
  if (format !== "md") {
    console.error("--inplace only works with --format md");
    process.exit(1);
  }
  const section = renderMarkdown(repos);
  const tpl = readFileSync(inplaceFile, "utf8");
  writeFileSync(inplaceFile, replaceInplace(tpl, section));
  console.log(`Projects section replaced in ${inplaceFile} (${repos.length} repos)`);
} else if (format === "docx") {
  const buf = await renderDocx(repos);
  const file = output || "projects.docx";
  writeFileSync(file, buf);
  console.log(`Wrote ${file} (${repos.length} repos)`);
} else {
  const section = renderMarkdown(repos);
  if (output) {
    writeFileSync(output, section + "\n");
    console.log(`Wrote ${output} (${repos.length} repos)`);
  } else {
    console.log(section);
  }
}
