import { readFileSync, existsSync } from "node:fs";
import path from "node:path";
import { formatPeriod, contactItems } from "./helpers.mjs";

const esc = (s) =>
  String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
const pretty = (u) => u.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "");

// Print-first layout used for the PDF: dark sidebar + main column.
export function renderPrint(cv, { css, root }) {
  const { basics: b, labels: l } = cv;
  const contacts = contactItems(cv)
    .map((c) => {
      const text = c.href?.startsWith("http") ? pretty(c.href) : c.text;
      return c.href ? `<li><a href="${esc(c.href)}">${esc(text)}</a></li>` : `<li>${esc(text)}</li>`;
    })
    .join("");

  let photo = "";
  if (b.photo) {
    const file = path.join(root, "public", b.photo.replace(/^assets\//, ""));
    if (existsSync(file)) {
      const ext = path.extname(file).slice(1).replace("jpg", "jpeg");
      const mime = ext === "svg" ? "image/svg+xml" : `image/${ext}`;
      photo = `<img class="photo" src="data:${mime};base64,${readFileSync(file).toString("base64")}" alt="">`;
    }
  }

  const skills = cv.skills
    .map((s) => `<div class="sk"><h4>${esc(s.group)}</h4><p>${s.items.map(esc).join(" · ")}</p></div>`)
    .join("");

  const jobs = cv.experience
    .map(
      (e) => `<article class="job">
  <div class="row"><h3>${esc(e.role)}</h3><span class="date">${esc(formatPeriod(e, cv))}</span></div>
  <p class="co">${esc(e.company)} · ${esc(e.location)}</p>
  <ul>${e.highlights.map((h) => `<li>${esc(h)}</li>`).join("")}</ul>
</article>`
    )
    .join("");

  const projects = (list = []) =>
    list
      .map(
        (p) => `<article class="proj">
  <div class="row"><h3>${esc(p.name)}</h3><span class="date">${esc(p.context)}</span></div>
  <p>${esc(p.description)}</p>
  <p class="tags">${p.tags.map(esc).join(" · ")}</p>
</article>`
      )
      .join("");

  const edu = cv.education
    .map((e) => `<li><strong>${esc(e.title)}</strong><span>${esc(e.institution)}</span><em>${esc(e.period)}</em></li>`)
    .join("");

  const stats = (cv.stats || [])
    .map((s) => `<div><strong>${esc(s.value)}</strong><span>${esc(s.label)}</span></div>`)
    .join("");

  const section = (title, body) => (body ? `<section><h2>${esc(title)}</h2>${body}</section>` : "");
  const link = cv.personalProjectsLink;

  return `<!doctype html>
<html lang="${cv.lang}"><head><meta charset="utf-8">
<title>${esc(b.name)} — ${esc(b.title)}</title>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@500;700&display=swap">
<style>${css}</style></head>
<body>
<table class="sheet"><thead><tr><td></td></tr></thead><tfoot><tr><td></td></tr></tfoot><tbody><tr><td>
<aside class="side">
  ${photo}
  <div class="block"><h2>${esc(l.contact)}</h2><ul class="contact">${contacts}</ul></div>
  <div class="block"><h2>${esc(l.skills)}</h2>${skills}</div>
  <div class="block"><h2>${esc(l.education)}</h2><ul class="edu">${edu}</ul></div>
  <div class="block"><h2>${esc(l.languages)}</h2><ul class="lang">${cv.languages
    .map((x) => `<li><strong>${esc(x.name)}</strong> ${esc(x.level)}</li>`)
    .join("")}</ul></div>
</aside>
<main class="main">
  <header>
    <h1>${esc(b.name)}</h1>
    <p class="role">${esc(b.title)}</p>
  </header>
  ${stats ? `<div class="stats">${stats}</div>` : ""}
  ${section(l.profile, cv.summary.map((p) => `<p>${esc(p)}</p>`).join(""))}
  ${section(l.experience, jobs)}
  ${section(l.projects, projects(cv.projects))}
  ${section(
    l.personalProjects,
    projects(cv.personalProjects) +
      (link ? `<p class="doc"><a href="${esc(link.url)}">${esc(link.label)}: ${esc(pretty(link.url))}</a></p>` : "")
  )}
  ${section(l.interests, `<p>${esc(cv.interests)}</p>`)}
</main>
</td></tr></tbody></table>
</body></html>`;
}
