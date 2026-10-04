import { rmSync, cpSync, existsSync, mkdirSync, readFileSync, writeFileSync, readdirSync, statSync } from "node:fs";
import { resolve, join } from "node:path";

const site = "https://arcxya09.github.io/juna";
const source = resolve("dist/client");
if (!existsSync(`${source}/index.html`)) throw new Error("Static export did not produce index.html");
const output = resolve("out");
rmSync(output, { recursive: true, force: true });
mkdirSync(output, { recursive: true });
cpSync(source, output, { recursive: true });
writeFileSync(`${output}/.nojekyll`, "");

// Vinext beta prerenders dynamic routes without a trailing slash. Export
// directory indexes here so GitHub Pages serves canonical /slug/ URLs.
for (const section of ["publications", "research"]) {
  const directory = `${output}/${section}`;
  if (!existsSync(directory)) continue;
  for (const name of readdirSync(directory).filter(x => x.endsWith(".html"))) {
    const target = `${directory}/${name.slice(0, -5)}`;
    mkdirSync(target, { recursive: true });
    cpSync(`${directory}/${name}`, `${target}/index.html`);
    if (existsSync(`${directory}/${name.slice(0, -5)}.rsc`)) cpSync(`${directory}/${name.slice(0, -5)}.rsc`, `${target}/index.rsc`);
    rmSync(`${directory}/${name}`);
  }
}

const slugs = [...readFileSync("app/site-data.ts", "utf8").matchAll(/slug:\s*"([^"]+)"/g)].map(x => x[1]);
const researchIds = ["carbon", "neutron", "fluorine", "magnesium"];
const paths = ["/", ...slugs.map(slug => `/publications/${slug}/`), ...researchIds.map(id => `/research/${id}/`)];
for (const path of paths) {
  if (!existsSync(`${output}${path}index.html`)) throw new Error(`Missing static page: ${path}`);
}
writeFileSync(`${output}/sitemap.xml`, `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${paths.map(path => `<url><loc>${site}${path}</loc></url>`).join("")}</urlset>`);
writeFileSync(`${output}/robots.txt`, `User-agent: *\nAllow: /juna/\nSitemap: ${site}/sitemap.xml\n`);
writeFileSync(`${output}/404.html`, `<!doctype html><html lang="zh-CN"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>页面未找到 · JUNA</title><style>html{color-scheme:dark}body{background:#05090f;color:#e4effb;font-family:Arial,"Microsoft YaHei",sans-serif;margin:0;min-height:100svh;display:grid;place-items:center}main{max-width:620px;padding:40px}small{color:#8fb9de;letter-spacing:.14em}h1{font-size:clamp(2rem,7vw,3.5rem);font-weight:500;line-height:1.4}p{color:#94abc2;line-height:1.9}a{display:inline-flex;align-items:center;min-height:48px;padding:8px 22px;border:1px solid #7598b9;color:#d8edff;text-decoration:none;margin-top:20px}a:focus-visible{outline:2px solid #a1d4ff;outline-offset:5px}</style></head><body><main><small>JUNA / 404</small><h1>页面未找到<br>Page not found</h1><p>这个链接可能已经变更。请返回首页查看实验介绍与公开研究成果。<br>This page may have moved. Explore the experiment and its published research from the home page.</p><a href="/juna/">返回 JUNA 首页 / Return home →</a></main></body></html>`);

function files(dir) { return readdirSync(dir).flatMap(name => { const path = join(dir, name); return statSync(path).isDirectory() ? files(path) : [path]; }); }
let count = 0;
for (const file of files(output).filter(x => x.endsWith(".html"))) {
  const html = readFileSync(file, "utf8");
  for (const match of html.matchAll(/(?:src|href)="([^"]+)"/g)) {
    const url = match[1].replaceAll("&amp;", "&");
    const local = url.startsWith(`${site}/`) ? url.slice(site.length) : url.startsWith("/juna/") ? url.slice("/juna".length) : null;
    if (!local) continue;
    const path = `${output}${local.split(/[?#]/)[0]}`;
    if (!existsSync(path)) throw new Error(`Missing exported link or asset in ${file}: ${url}`);
    if (path.endsWith("/") && !existsSync(`${path}index.html`)) throw new Error(`Missing directory index: ${url}`);
  }
  count++;
}
const home = readFileSync(`${output}/index.html`, "utf8");
if (!home.includes("深入地底") || !home.includes("公开研究成果") || !home.includes("合作联系")) throw new Error("Homepage content missing");
console.log(`GitHub Pages export validated: ${count} HTML files, ${slugs.length} publication pages, sitemap and 404 page.`);
