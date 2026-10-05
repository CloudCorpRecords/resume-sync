import { fetchPinnedRepos } from "./github.js";
import { renderMarkdown, replaceInplace } from "./resume.js";
import { writeFileSync, readFileSync } from "fs";

const login = process.env.GITHUB_LOGIN || "CloudCorpRecords";
const repos = await fetchPinnedRepos(login);
const section = renderMarkdown(repos);

const outIdx = process.argv.indexOf("--output");
const inplace = process.argv.includes("--inplace");

if (inplace) {
  const file = process.argv[process.argv.indexOf("--inplace") + 1];
  const tpl = readFileSync(file, "utf8");
  writeFileSync(file, replaceInplace(tpl, section));
  console.log(`Projects section replaced in ${file}`);
} else if (outIdx !== -1) {
  const file = process.argv[outIdx + 1];
  writeFileSync(file, section + "\n");
  console.log(`Wrote ${file}`);
} else {
  console.log(section);
}
