import { formatPeriod, contactItems } from "./helpers.mjs";

const esc = (s) =>
  String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);

export function renderPage(cv, { langs, defaultLang, base, fileBase }) {
  const { basics: b, labels: l } = cv;
  const contacts = contactItems(cv);
  const initials = b.name.split(" ").map((w) => w[0]).join("").slice(0, 2);
  const [role, ...rest] = b.title.split("|").map((s) => s.trim());

  const langSwitch = langs
    .map((code) => {
      const href = code === defaultLang ? `${base || "./"}` : `${base}${code}/`;
      return `<a href="${href}" class="lang${code === cv.lang ? " active" : ""}" hreflang="${code}">${code.toUpperCase()}</a>`;
    })
    .join("");

  const ctas = contacts
    .filter((c) => c.href)
    .map((c) => `<a class="link" href="${esc(c.href)}" rel="noopener">${esc(c.text)}</a>`)
    .join("");
  const place = contacts.find((c) => !c.href);

  const stats = (cv.stats || [])
    .map((s) => `<div class="stat"><strong>${esc(s.value)}</strong><span>${esc(s.label)}</span></div>`)
    .join("");

  const skills = cv.skills
    .map(
      (s) => `<div class="card skill"><h3>${esc(s.group)}</h3><ul class="chips">${s.items
        .map((i) => `<li>${esc(i)}</li>`)
        .join("")}</ul></div>`
    )
    .join("");

  const jobs = cv.experience
    .map(
      (e, i) => `<article class="job${i === 0 ? " current" : ""}">
  <span class="dot" aria-hidden="true"></span>
  <div class="card">
    <p class="period">${esc(formatPeriod(e, cv))}</p>
    <h3>${esc(e.role)}</h3>
    <p class="company">${esc(e.company)} <span>· ${esc(e.location)}</span></p>
    <ul>${e.highlights.map((h) => `<li>${esc(h)}</li>`).join("")}</ul>
  </div>
</article>`
    )
    .join("");

  const projects = (cv.projects || [])
    .map(
      (p) => `<article class="card project">
  <p class="period">${esc(p.context)}</p>
  <h3>${esc(p.name)}</h3>
  <p class="muted">${esc(p.description)}</p>
  <ul class="chips">${p.tags.map((t) => `<li>${esc(t)}</li>`).join("")}</ul>
</article>`
    )
    .join("");

  const edu = cv.education
    .map(
      (e) => `<li class="card"><span class="period">${esc(e.period)}</span><strong>${esc(e.title)}</strong><span class="muted">${esc(e.institution)}</span></li>`
    )
    .join("");

  const langsList = cv.languages
    .map((x) => `<li><strong>${esc(x.name)}</strong><span class="muted">${esc(x.level)}</span></li>`)
    .join("");

  const nav = [
    ["about", l.profile],
    ["skills", l.skills],
    ["experience", l.experience],
    ...(projects ? [["projects", l.projects]] : []),
    ["education", l.education],
  ]
    .map(([id, t]) => `<a href="#${id}">${esc(t)}</a>`)
    .join("");

  return `<!doctype html>
<html lang="${cv.lang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(b.name)} — ${esc(role)}</title>
<meta name="description" content="${esc(cv.summary[0])}">
<meta property="og:title" content="${esc(b.name)} — ${esc(b.title)}">
<meta property="og:description" content="${esc(cv.summary[0])}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&family=Space+Grotesk:wght@500;700&display=swap">
<link rel="stylesheet" href="${base}assets/styles.css">
<script src="${base}assets/theme.js"></script>
</head>
<body>
<header class="nav no-print">
  <div class="nav-in">
    <a class="logo" href="#top" aria-label="${esc(b.name)}">${esc(initials)}</a>
    <nav class="links" aria-label="Sections">${nav}</nav>
    <div class="tools">
      <nav class="langs" aria-label="Language">${langSwitch}</nav>
      <button id="theme" type="button" aria-label="Toggle theme"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg></button>
    </div>
  </div>
</header>

<main id="top">
  <section class="hero">
    <div class="glow" aria-hidden="true"></div>
    <div class="wrap hero-in">
      <p class="eyebrow">${esc(role)}${rest.length ? ` <i>/</i> ${esc(rest.join(" / "))}` : ""}</p>
      <h1>${esc(b.name)}</h1>
      <p class="lead">${esc(cv.summary[0])}</p>
      <div class="cta no-print">
        <a class="btn primary" href="${fileBase}.pdf" download>↓ ${esc(l.downloadPdf)}</a>
        <a class="btn" href="${fileBase}.docx" download>↓ ${esc(l.downloadWord)}</a>
      </div>
      <p class="contacts">${place ? `<span>${esc(place.text)}</span>` : ""}${ctas}</p>
      ${stats ? `<div class="stats">${stats}</div>` : ""}
    </div>
  </section>

  <div class="wrap">
    <section id="about"><h2><span>01</span>${esc(l.profile)}</h2>
      <div class="about">${cv.summary.slice(1).map((p) => `<p>${esc(p)}</p>`).join("")}</div>
    </section>

    <section id="skills"><h2><span>02</span>${esc(l.skills)}</h2>
      <div class="skills">${skills}</div>
    </section>

    <section id="experience"><h2><span>03</span>${esc(l.experience)}</h2>
      <div class="timeline">${jobs}</div>
    </section>

    ${projects ? `<section id="projects"><h2><span>04</span>${esc(l.projects)}</h2>
      <div class="projects">${projects}</div>
    </section>` : ""}

    <section id="education"><h2><span>${projects ? "05" : "04"}</span>${esc(l.education)}</h2>
      <ul class="edu">${edu}</ul>
      <div class="split">
        <div><h3 class="sub">${esc(l.languages)}</h3><ul class="langlist">${langsList}</ul></div>
        <div><h3 class="sub">${esc(l.interests)}</h3><p class="muted">${esc(cv.interests)}</p></div>
      </div>
    </section>
  </div>
</main>
<footer class="foot no-print"><div class="wrap">© ${new Date().getFullYear()} ${esc(b.name)}</div></footer>
</body>
</html>
`;
}
