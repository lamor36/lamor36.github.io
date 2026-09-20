import {
  Document, Packer, Paragraph, TextRun, BorderStyle, ExternalHyperlink, Table, TableRow, TableCell,
  WidthType, ShadingType, TabStopType, Tab, Footer, PageNumber, AlignmentType, TableLayoutType,
} from "docx";
import { formatPeriod, contactItems } from "../src/helpers.mjs";

const W = 10206; // content width in twips (A4, 1.5 cm margins)
const C = { navy: "0F172A", accent: "4F46E5", accentSoft: "8EA2FF", muted: "566178", tint: "F1F3FD", line: "DFE4F1", text: "1F2937" };
const FONT = "Calibri";
const NONE = { style: BorderStyle.NONE, size: 0, color: "FFFFFF" };
const noBorders = { top: NONE, bottom: NONE, left: NONE, right: NONE };

const run = (text, o = {}) => new TextRun({ text, font: FONT, color: C.text, ...o });
const para = (children, o = {}) => new Paragraph({ children: Array.isArray(children) ? children : [children], ...o });

const heading = (text) =>
  new Paragraph({
    keepNext: true,
    spacing: { before: 300, after: 120 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 8, color: C.accent, space: 3 } },
    children: [run(text.toUpperCase(), { bold: true, color: C.accent, size: 22, characterSpacing: 30 })],
  });

const bullet = (text) =>
  new Paragraph({ bullet: { level: 0 }, spacing: { after: 50 }, children: [run(text, { size: 20 })] });

// Title on the left, date on the right (tab stop).
const titleLine = (left, right, sub) => [
  new Paragraph({
    keepNext: true,
    spacing: { before: 160 },
    tabStops: [{ type: TabStopType.RIGHT, position: W }],
    children: [run(left, { bold: true, size: 22 }), new TextRun({ children: [new Tab(), right], font: FONT, color: C.accent, size: 19, bold: true })],
  }),
  ...(sub ? [new Paragraph({ keepNext: true, spacing: { after: 60 }, children: [run(sub, { color: C.muted, size: 20 })] })] : []),
];

const projectBlock = (title, list, link) =>
  list?.length
    ? [
        heading(title),
        ...list.flatMap((p) => [
          ...titleLine(p.name, p.context),
          new Paragraph({ spacing: { after: 30 }, children: [run(p.description, { size: 20 })] }),
          new Paragraph({ spacing: { after: 80 }, children: [run(p.tags.join("  ·  "), { color: C.accent, size: 18, bold: true })] }),
        ]),
        ...(link
          ? [
              new Paragraph({
                spacing: { before: 60 },
                children: [new ExternalHyperlink({ link: link.url, children: [run(`${link.label}: ${link.url}`, { color: C.accent, underline: {}, size: 20 })] })],
              }),
            ]
          : []),
      ]
    : [];

const banner = (cv) => {
  const { basics: b } = cv;
  const contact = [];
  contactItems(cv).forEach((c, i) => {
    if (i) contact.push(run("   |   ", { color: C.accentSoft, size: 19 }));
    contact.push(
      c.href
        ? new ExternalHyperlink({ link: c.href, children: [run(c.text, { color: "FFFFFF", underline: {}, size: 19 })] })
        : run(c.text, { color: "FFFFFF", size: 19 })
    );
  });
  return new Table({
    width: { size: W, type: WidthType.DXA },
    columnWidths: [W],
    borders: { ...noBorders, insideHorizontal: NONE, insideVertical: NONE },
    rows: [
      new TableRow({
        children: [
          new TableCell({
            width: { size: W, type: WidthType.DXA },
            shading: { type: ShadingType.CLEAR, fill: C.navy, color: "auto" },
            margins: { top: 300, bottom: 260, left: 360, right: 360 },
            borders: noBorders,
            children: [
              new Paragraph({ children: [run(b.name, { bold: true, size: 60, color: "FFFFFF" })] }),
              new Paragraph({ spacing: { before: 40, after: 120 }, children: [run(b.title, { size: 25, color: C.accentSoft, bold: true })] }),
              new Paragraph({ children: contact }),
            ],
          }),
        ],
      }),
    ],
  });
};

const statsRow = (stats) => {
  if (!stats?.length) return [];
  const gap = 120;
  const cw = Math.floor((W - gap * (stats.length - 1)) / stats.length);
  const cells = [];
  stats.forEach((s, i) => {
    if (i) cells.push(new TableCell({ width: { size: gap, type: WidthType.DXA }, borders: noBorders, children: [new Paragraph("")] }));
    cells.push(
      new TableCell({
        width: { size: cw, type: WidthType.DXA },
        shading: { type: ShadingType.CLEAR, fill: C.tint, color: "auto" },
        margins: { top: 100, bottom: 100, left: 160, right: 100 },
        borders: { top: NONE, bottom: NONE, right: NONE, left: { style: BorderStyle.SINGLE, size: 24, color: C.accent } },
        children: [
          new Paragraph({ children: [run(s.value, { bold: true, size: 34, color: C.accent })] }),
          new Paragraph({ children: [run(s.label, { size: 16, color: C.muted })] }),
        ],
      })
    );
  });
  const widths = stats.flatMap((_, i) => (i ? [gap, cw] : [cw]));
  return [
    new Paragraph({ spacing: { before: 120, after: 0 }, children: [] }),
    new Table({
      width: { size: W, type: WidthType.DXA },
      columnWidths: widths,
      layout: TableLayoutType.FIXED,
      borders: { ...noBorders, insideHorizontal: NONE, insideVertical: NONE },
      rows: [new TableRow({ children: cells })],
    }),
  ];
};

const twoColTable = (rows, leftW, leftBold = true, leftFill) =>
  new Table({
    width: { size: W, type: WidthType.DXA },
    columnWidths: [leftW, W - leftW],
    layout: TableLayoutType.FIXED,
    borders: { top: NONE, left: NONE, right: NONE, bottom: { style: BorderStyle.SINGLE, size: 4, color: C.line }, insideHorizontal: { style: BorderStyle.SINGLE, size: 4, color: C.line }, insideVertical: NONE },
    rows: rows.map(
      ([a, b]) =>
        new TableRow({
          cantSplit: true,
          children: [
            new TableCell({
              width: { size: leftW, type: WidthType.DXA },
              margins: { top: 70, bottom: 70, left: 120, right: 100 },
              shading: leftFill ? { type: ShadingType.CLEAR, fill: leftFill, color: "auto" } : undefined,
              borders: noBorders,
              children: [new Paragraph({ children: [run(a, { bold: leftBold, size: 20 })] })],
            }),
            new TableCell({
              width: { size: W - leftW, type: WidthType.DXA },
              margins: { top: 70, bottom: 70, left: 160, right: 100 },
              borders: noBorders,
              children: [new Paragraph({ children: [run(b, { size: 20 })] })],
            }),
          ],
        })
    ),
  });

export async function buildDocx(cv) {
  const { basics: b, labels: l } = cv;

  const children = [
    banner(cv),
    ...statsRow(cv.stats),

    heading(l.profile),
    ...cv.summary.map((p) => new Paragraph({ spacing: { after: 100 }, children: [run(p, { size: 21 })] })),

    heading(l.skills),
    twoColTable(cv.skills.map((s) => [s.group, s.items.join("  ·  ")]), 2400, true, C.tint),

    heading(l.experience),
    ...cv.experience.flatMap((e) => [
      ...titleLine(e.role, formatPeriod(e, cv), `${e.company} · ${e.location}`),
      ...e.highlights.map(bullet),
    ]),

    ...projectBlock(l.projects, cv.projects),
    ...projectBlock(l.personalProjects, cv.personalProjects, cv.personalProjectsLink),

    heading(l.education),
    ...cv.education.flatMap((e) => titleLine(e.title, e.period, e.institution)),

    heading(l.languages),
    new Paragraph({
      children: cv.languages.flatMap((x, i) => [
        ...(i ? [run("     ")] : []),
        run(x.name, { bold: true, size: 21 }),
        run(` — ${x.level}`, { color: C.muted, size: 21 }),
      ]),
    }),

    heading(l.interests),
    new Paragraph({ children: [run(cv.interests, { size: 21 })] }),
  ];

  const doc = new Document({
    creator: b.name,
    title: `${b.name} — ${b.title}`,
    // Explicit white page: Word's dark mode only inverts colours on an "automatic" page background.
    background: { color: "FFFFFF" },
    // Tech terms (RAG, IndexedDB, .NET...) would otherwise be underlined red by the spell checker.
    styles: { default: { document: { run: { font: FONT, size: 21, noProof: true, language: { value: cv.lang === "es" ? "es-ES" : "en-GB" } } } } },
    sections: [
      {
        properties: { page: { margin: { top: 850, bottom: 900, left: 850, right: 850, footer: 400 } } },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                tabStops: [{ type: TabStopType.RIGHT, position: W }],
                border: { top: { style: BorderStyle.SINGLE, size: 4, color: C.line, space: 4 } },
                children: [
                  run(`${b.name}  ·  ${b.title}`, { size: 16, color: C.muted }),
                  new TextRun({ children: [new Tab(), PageNumber.CURRENT, " / ", PageNumber.TOTAL_PAGES], font: FONT, size: 16, color: C.muted }),
                ],
              }),
            ],
          }),
        },
        children,
      },
    ],
  });
  return Packer.toBuffer(doc);
}
