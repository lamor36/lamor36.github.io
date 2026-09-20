// Build: data/cv.<lang>.json -> dist/ (HTML) + PDF + DOCX for every language.
// Usage: node scripts/build.mjs [--no-pdf]
import { readFile, writeFile, mkdir, cp, rm, readdir } from "node:fs/promises";
import { fileURLToPath, pathToFileURL } from "node:url";
import path from "node:path";
import { renderPage } from "../src/template.mjs";
import { renderPrint } from "../src/print.mjs";
import { buildDocx } from "./docx.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dist = path.join(root, "dist");
const skipPdf = process.argv.includes("--no-pdf");

const files = (await readdir(path.join(root, "data"))).filter((f) => /^cv\.\w+\.json$/.test(f));
const cvs = await Promise.all(
  files.map(async (f) => JSON.parse(await readFile(path.join(root, "data", f), "utf8")))
);
const defaultLang = "es";
cvs.sort((a, b) => (a.lang === defaultLang ? -1 : b.lang === defaultLang ? 1 : a.lang.localeCompare(b.lang)));
const langs = cvs.map((c) => c.lang);
const fileBase = (cv) => `Martin-Lamorgese-CV-${cv.lang.toUpperCase()}`;
const outDir = (cv) => (cv.lang === defaultLang ? dist : path.join(dist, cv.lang));

await rm(dist, { recursive: true, force: true });
await mkdir(path.join(dist, "assets"), { recursive: true });
await cp(path.join(root, "src", "styles.css"), path.join(dist, "assets", "styles.css"));
await cp(path.join(root, "src", "theme.js"), path.join(dist, "assets", "theme.js"));
await writeFile(path.join(dist, ".nojekyll"), "");
// Static files (e.g. profile photo referenced by basics.photo) live in public/ -> dist/assets/
await cp(path.join(root, "public"), path.join(dist, "assets"), { recursive: true }).catch(() => {});

for (const cv of cvs) {
  const dir = outDir(cv);
  await mkdir(dir, { recursive: true });
  const base = cv.lang === defaultLang ? "" : "../";
  await writeFile(
    path.join(dir, "index.html"),
    renderPage(cv, { langs, defaultLang, base, fileBase: fileBase(cv), cvs })
  );
  await writeFile(path.join(dir, `${fileBase(cv)}.docx`), await buildDocx(cv));
}

if (!skipPdf) {
  const { default: puppeteer } = await import("puppeteer");
  const browser = await puppeteer.launch({ args: ["--no-sandbox"] });
  const css = await readFile(path.join(root, "src", "print.css"), "utf8");
  const tmp = path.join(root, ".build");
  await mkdir(tmp, { recursive: true });
  for (const cv of cvs) {
    // Dedicated print layout (src/print.mjs + print.css), separate from the web page.
    const html = path.join(tmp, `print-${cv.lang}.html`);
    await writeFile(html, renderPrint(cv, { css, root }));
    const page = await browser.newPage();
    await page.goto(pathToFileURL(html).href, { waitUntil: "networkidle0" });
    await page.pdf({
      path: path.join(outDir(cv), `${fileBase(cv)}.pdf`),
      format: "A4",
      printBackground: true,
      preferCSSPageSize: true,
    });
    await page.close();
  }
  await rm(tmp, { recursive: true, force: true });
  await browser.close();
}
console.log(`Built ${langs.join(", ")} -> dist/${skipPdf ? " (PDF skipped)" : ""}`);
