import { Document, Packer, Paragraph, TextRun, HeadingLevel, BorderStyle, ExternalHyperlink } from "docx";
import { formatPeriod, contactItems } from "../src/helpers.mjs";

const ACCENT = "1D4ED8";
const MUTED = "555555";

const heading = (text) =>
  new Paragraph({
    spacing: { before: 280, after: 100 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: ACCENT, space: 2 } },
    children: [new TextRun({ text: text.toUpperCase(), bold: true, color: ACCENT, size: 22 })],
  });

const bullet = (text) => new Paragraph({ text, bullet: { level: 0 }, spacing: { after: 40 } });

export async function buildDocx(cv) {
  const { basics: b, labels: l } = cv;
  const contact = [];
  contactItems(cv).forEach((c, i) => {
    if (i) contact.push(new TextRun({ text: "  ·  ", color: MUTED }));
    contact.push(
      c.href
        ? new ExternalHyperlink({ link: c.href, children: [new TextRun({ text: c.text, style: "Hyperlink" })] })
        : new TextRun({ text: c.text, color: MUTED })
    );
  });

  const children = [
    new Paragraph({ heading: HeadingLevel.TITLE, children: [new TextRun({ text: b.name, bold: true, size: 52 })] }),
    new Paragraph({ children: [new TextRun({ text: b.title, color: ACCENT, bold: true, size: 26 })] }),
    new Paragraph({ spacing: { after: 120 }, children: contact }),

    heading(l.profile),
    ...cv.summary.map((p) => new Paragraph({ text: p, spacing: { after: 100 } })),

    heading(l.skills),
    ...cv.skills.map(
      (s) =>
        new Paragraph({
          spacing: { after: 40 },
          children: [new TextRun({ text: `${s.group}: `, bold: true }), new TextRun(s.items.join(", "))],
        })
    ),

    heading(l.experience),
    ...cv.experience.flatMap((e) => [
      new Paragraph({
        spacing: { before: 160 },
        keepNext: true,
        children: [
          new TextRun({ text: e.role, bold: true }),
          new TextRun({ text: ` · ${e.company}`, color: MUTED }),
        ],
      }),
      new Paragraph({
        keepNext: true,
        spacing: { after: 60 },
        children: [new TextRun({ text: `${formatPeriod(e, cv)} · ${e.location}`, color: MUTED, size: 20 })],
      }),
      ...e.highlights.map(bullet),
    ]),

    ...(cv.projects?.length
      ? [
          heading(l.projects),
          ...cv.projects.flatMap((p) => [
            new Paragraph({
              spacing: { before: 100 },
              keepNext: true,
              children: [
                new TextRun({ text: p.name, bold: true }),
                new TextRun({ text: ` · ${p.context}`, color: MUTED, size: 20 }),
              ],
            }),
            new Paragraph({ text: p.description, spacing: { after: 20 } }),
            new Paragraph({
              spacing: { after: 60 },
              children: [new TextRun({ text: p.tags.join(" · "), color: ACCENT, size: 19 })],
            }),
          ]),
        ]
      : []),

    heading(l.education),
    ...cv.education.map(
      (e) =>
        new Paragraph({
          spacing: { after: 40 },
          children: [
            new TextRun({ text: e.title, bold: true }),
            new TextRun({ text: ` — ${e.institution} (${e.period})`, color: MUTED }),
          ],
        })
    ),

    heading(l.languages),
    ...cv.languages.map(
      (x) => new Paragraph({ spacing: { after: 20 }, children: [new TextRun({ text: x.name, bold: true }), new TextRun(` – ${x.level}`)] })
    ),

    heading(l.interests),
    new Paragraph({ text: cv.interests }),
  ];

  const doc = new Document({
    creator: b.name,
    title: `${b.name} — ${b.title}`,
    styles: { default: { document: { run: { font: "Calibri", size: 21 } } } },
    sections: [{ properties: { page: { margin: { top: 900, bottom: 900, left: 1000, right: 1000 } } }, children }],
  });
  return Packer.toBuffer(doc);
}
