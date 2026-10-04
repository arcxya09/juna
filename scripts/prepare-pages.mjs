import { rmSync, cpSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const source = resolve("dist/client");
if (!existsSync(`${source}/index.html`)) throw new Error("Static export did not produce index.html");
const output = resolve("out");
rmSync(output, { recursive: true, force: true });
mkdirSync(output, { recursive: true });
cpSync(source, output, { recursive: true });
writeFileSync(`${output}/.nojekyll`, "");
cpSync(`${output}/index.html`, `${output}/404.html`);
const html = readFileSync(`${output}/index.html`, "utf8");
for (const match of html.matchAll(/(?:src|href)="([^"]+)"/g)) {
  const url = match[1];
  const local = url.startsWith("https://arcxya09.github.io/juna/")
    ? url.slice("https://arcxya09.github.io/juna".length)
    : url.startsWith("/juna/") ? url.slice("/juna".length) : null;
  if (local && !existsSync(`${output}${local.split(/[?#]/)[0]}`)) throw new Error(`Missing exported asset: ${url}`);
}
if (!html.includes("深入地底") || !html.includes("研究成果")) throw new Error("Homepage content missing");
console.log("GitHub Pages export validated: out/");
