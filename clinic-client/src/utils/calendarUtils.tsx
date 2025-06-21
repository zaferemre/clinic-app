// src/components/Calendar/calendarUtils.ts

export function toDateTimeLocal(d: Date) {
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`;
}

export function assignColumns(events: { start: string; end: string }[]) {
  const sorted = [...events].sort(
    (a, b) => new Date(a.start).getTime() - new Date(b.start).getTime()
  );
  const result: ((typeof sorted)[0] & { col: number; colCount: number })[] = [];

  sorted.forEach((evt) => {
    const overlaps = sorted.filter(
      (o) =>
        !(
          new Date(o.end) <= new Date(evt.start) ||
          new Date(o.start) >= new Date(evt.end)
        )
    );
    const used = new Set<number>();
    overlaps.forEach((o) => {
      const r = result.find((r) => r.start === o.start && r.end === o.end);
      if (r?.col !== undefined) used.add(r.col);
    });
    let col = 0;
    while (used.has(col)) col++;
    result.push({ ...evt, col, colCount: overlaps.length });
  });

  return result;
}
