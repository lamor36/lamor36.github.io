import { formatPeriod, contactItems } from "./helpers.mjs";

const esc = (s) =>
  String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);

export function renderPage(cv, { langs, defaultLang, base, fileBase, cvs }) {
  const { basics: b, labels: l } = cv;
  const contacts = contactItems(cv)
    .map((c) => (c.href ? `<a href="${esc(c.href)}" rel="noopener">${esc(c.text)}</a>` : `<span>${esc(c.text)}</span>`))
    .join("");

  const langSwitch = langs
    .map((code) => {
      const href = code === defaultLang ? `${base || "./"}` : `${base}${code}/`;
      return `<a href="${href}" class="lang${code === cv.lang ? " active" : ""}" hreflang="${code}">${code.toUpperCase()}</a>`;
    })
    .join("");

  const skills = cv.skills
    .map(
      (s) => `<div class="skill-group"><h3>${esc(s.group)}</h3><ul class="chips">${s.items
        .map((i) => `<li>${esc(i)}</li>`)
        .join("")}</ul></div>`
    )
    .join("");

  const jobs = cv.experience
    .map(
      (e) => `<article class="job">
  <header>
    <h3>${esc(e.role)} <span class="at">· ${esc(e.company)}</span></h3>
    <p class="meta">${esc(formatPeriod(e, cv))} · ${esc(e.location)}</p>
  </header>
  <ul>${e.highlights.map((h) => `<li>${esc(h)}</li>`).join("")}</ul>
</article>`
    )
    .join("");

  const edu = cv.education
    .map(
      (e) => `<li><strong>${esc(e.title)}</strong><span>${esc(e.institution)}</span><span class="meta">${esc(e.period)}</span></li>`
    )
    .join("");

  const langsList = cv.languages.map((x) => `<li><strong>${esc(x.name)}</strong> <span class="meta">${esc(x.level)}</span></li>`).join("");

  return `<!doctype html>
<html lang="${cv.lang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(b.name)} — ${esc(b.title)}</title>
<meta name="description" content="${esc(cv.summary[0])}">
<meta property="og:title" content="${esc(b.name)} — ${esc(b.title)}">
<meta property="og:description" content="${esc(cv.summary[0])}">
<link rel="stylesheet" href="${base}assets/styles.css">
<script src="${base}assets/theme.js"></script>
</head>
<body>
<div class="toolbar no-print">
  <nav class="langs" aria-label="Language">${langSwitch}</nav>
  <button id="theme" type="button" aria-label="Toggle theme">◐</button>
</div>
<main class="page">
  <header class="hero">
    <div>
      <h1>${esc(b.name)}</h1>
      <p class="title">${esc(b.title)}</p>
      <p class="contacts">${contacts}</p>
    </div>
    <div class="downloads no-print">
      <a class="btn" href="${fileBase}.pdf" download>${esc(l.downloadPdf)}</a>
      <a class="btn ghost" href="${fileBase}.docx" download>${esc(l.downloadWord)}</a>
    </div>
  </header>

  <section><h2>${esc(l.profile)}</h2>${cv.summary.map((p) => `<p>${esc(p)}</p>`).join("")}</section>
  <section><h2>${esc(l.skills)}</h2><div class="skills">${skills}</div></section>
  <section><h2>${esc(l.experience)}</h2>${jobs}</section>
  <section class="two">
    <div><h2>${esc(l.education)}</h2><ul class="edu">${edu}</ul></div>
    <div><h2>${esc(l.languages)}</h2><ul class="plain">${langsList}</ul>
    <h2>${esc(l.interests)}</h2><p>${esc(cv.interests)}</p></div>
  </section>
</main>
</body>
</html>
`;
}
