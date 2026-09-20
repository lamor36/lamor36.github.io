const monthName = (ym, lang) => {
  const [y, m] = ym.split("-").map(Number);
  const s = new Intl.DateTimeFormat(lang, { month: "short", year: "numeric", timeZone: "UTC" }).format(
    new Date(Date.UTC(y, m - 1, 1))
  );
  return s.replace(/\./g, "");
};

export const formatPeriod = (job, cv) =>
  `${monthName(job.start, cv.lang)} – ${job.end ? monthName(job.end, cv.lang) : cv.labels.present}`;

// Contact entries respecting basics.show flags (phone hidden by default).
export function contactItems(cv) {
  const { basics: b } = cv;
  const items = [];
  if (b.show.location && b.location) items.push({ text: b.location });
  if (b.show.email && b.email) items.push({ text: b.email, href: `mailto:${b.email}` });
  if (b.show.phone && b.phone) items.push({ text: b.phone, href: `tel:${b.phone.replace(/[^+\d]/g, "")}` });
  if (b.show.linkedin && b.linkedin)
    items.push({ text: "LinkedIn", href: b.linkedin });
  return items;
}
