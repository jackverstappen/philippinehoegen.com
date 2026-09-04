/**
 * Display helpers for FuzzyDate.
 *
 * Everything reads the dates in UTC, matching how the parser builds them.
 * Formatting in local time would make the server and the browser disagree
 * for anyone west of UTC and give you a hydration mismatch.
 */

import type { FuzzyDate, Precision } from "./fuzzyDate";

/** The shape a FuzzyDate takes once it has been through JSON. */
export interface FuzzyDateJSON {
  start: string;
  end: string;
  precision: Precision;
  isRange: boolean;
  text: string;
}

export type FuzzyDateInput = FuzzyDate | FuzzyDateJSON;

function json(value: FuzzyDateInput): FuzzyDateJSON {
  return "toJSON" in value ? value.toJSON() : value;
}

const parts = (isoDate: string) => {
  const [y, m, d] = isoDate.split("-").map(Number) as [number, number, number];
  return { y, m, d };
};

const monthName = (isoDate: string, locale: string, month: "long" | "short") => {
  const { y, m, d } = parts(isoDate);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString(locale, {
    month,
    year: "numeric",
    timeZone: "UTC",
  });
};

/** ISO week number of a date, for "week 5, 2023" style labels. */
function isoWeek(isoDate: string): number {
  const { y, m, d } = parts(isoDate);
  const dt = new Date(Date.UTC(y, m - 1, d));
  const dow = (dt.getUTCDay() + 6) % 7;
  dt.setUTCDate(dt.getUTCDate() - dow + 3); // Thursday of this week
  const firstThursday = new Date(Date.UTC(dt.getUTCFullYear(), 0, 4));
  const firstDow = (firstThursday.getUTCDay() + 6) % 7;
  firstThursday.setUTCDate(firstThursday.getUTCDate() - firstDow + 3);
  return 1 + Math.round((dt.getTime() - firstThursday.getTime()) / 604_800_000);
}

/** Label one endpoint at the given granularity. */
function labelPoint(
  isoDate: string,
  precision: Precision,
  locale: string,
): string {
  const { y, m, d } = parts(isoDate);
  switch (precision) {
    case "day":
      return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString(locale, {
        dateStyle: "long",
        timeZone: "UTC",
      });
    case "week":
      return `W${String(isoWeek(isoDate)).padStart(2, "0")} ${y}`;
    case "month":
      return monthName(isoDate, locale, "long");
    case "quarter":
      return `Q${Math.floor((m - 1) / 3) + 1} ${y}`;
    case "half":
      return `H${m <= 6 ? 1 : 2} ${y}`;
    case "year":
      return String(y);
    case "decade":
      return `${Math.floor(y / 10) * 10}s`;
  }
}

/**
 * Human label for a span: "Q2 2025", "December 2019", "2023–2024",
 * "1 January 2020" and so on.
 */
export function formatFuzzyDate(
  value: FuzzyDateInput,
  locale = "en-GB",
): string {
  const { start, end, precision, isRange } = json(value);
  const first = parts(start);

  if (isRange) {
    const a = labelPoint(start, precision, locale);
    const b = labelPoint(end, precision, locale);
    return a === b ? a : `${a} – ${b}`;
  }

  // "early 2023" lands on half precision without being a real H1/H2
  if (precision === "half" && !(first.m === 1 || first.m === 7)) {
    return `${monthName(start, locale, "short")} – ${monthName(end, locale, "short")}`
      .replace(new RegExp(` ${first.y}`), "");
  }

  return labelPoint(start, precision, locale);
}

/**
 * A value for the HTML `datetime` attribute, or null when the span has no
 * valid representation (quarters, halves, decades, ranges). `<time>` only
 * accepts a fixed set of shapes, so don't invent one — render a <span>.
 */
export function toDateTimeAttr(value: FuzzyDateInput): string | null {
  const { start, precision, isRange } = json(value);
  if (isRange) return null;
  switch (precision) {
    case "day":
      return start;
    case "week":
      return `${parts(start).y}-W${String(isoWeek(start)).padStart(2, "0")}`;
    case "month":
      return start.slice(0, 7);
    case "year":
      return start.slice(0, 4);
    default:
      return null;
  }
}