/**
 * fuzzydate — turn precise *or* fuzzy date expressions into a (start, end) span.
 *
 *   parse("2023-05-14").startISO   // "2023-05-14"  (start === end)
 *   parse("2025 Q2").endISO        // "2025-06-30"
 *   parse("2023-2024").endISO      // "2024-12-31"
 *
 * The span is always inclusive on both ends: for a precise date start === end,
 * for a fuzzy one the span covers the whole period the expression can refer to.
 *
 * All Date objects are anchored at UTC midnight, so they are immune to local
 * time zones and DST. Compare them with .getTime() or use the ISO accessors.
 */

// ---------------------------------------------------------------------------
// result types
// ---------------------------------------------------------------------------

export const PRECISIONS = [
  "day",
  "week",
  "month",
  "quarter",
  "half",
  "year",
  "decade",
] as const;

/** How coarse the expression was. */
export type Precision = (typeof PRECISIONS)[number];

/** Precise -> vague. Use for sorting or picking the coarser of two spans. */
export const precisionRank: Record<Precision, number> = {
  day: 1,
  week: 2,
  month: 3,
  quarter: 4,
  half: 5,
  year: 6,
  decade: 7,
};

export class FuzzyDateError extends Error {
  readonly input: string;
  constructor(message: string, input: string) {
    super(message);
    this.name = "FuzzyDateError";
    this.input = input;
  }
}

export type DateLike = Date | FuzzyDate | string | number;

const DAY_MS = 86_400_000;

export class FuzzyDate {
  readonly #start: number;
  readonly #end: number;
  readonly precision: Precision;
  readonly isRange: boolean;
  /** The original input, trimmed. */
  readonly text: string;

  constructor(
    start: Date,
    end: Date,
    precision: Precision,
    isRange = false,
    text = "",
  ) {
    if (end.getTime() < start.getTime()) {
      throw new FuzzyDateError(
        `end ${iso(end)} precedes start ${iso(start)}`,
        text,
      );
    }
    this.#start = start.getTime();
    this.#end = end.getTime();
    this.precision = precision;
    this.isRange = isRange;
    this.text = text;
    Object.freeze(this);
  }

  /** Fresh Date at UTC midnight — mutating it cannot corrupt this instance. */
  get start(): Date {
    return new Date(this.#start);
  }

  get end(): Date {
    return new Date(this.#end);
  }

  get startISO(): string {
    return iso(this.start);
  }

  get endISO(): string {
    return iso(this.end);
  }

  get isExact(): boolean {
    return this.#start === this.#end;
  }

  /** Length of the span in days, inclusive. */
  get days(): number {
    return (this.#end - this.#start) / DAY_MS + 1;
  }

  get midpoint(): Date {
    return new Date(this.#start + Math.floor((this.#end - this.#start) / 2));
  }

  toTuple(): [Date, Date] {
    return [this.start, this.end];
  }

  contains(other: DateLike): boolean {
    if (other instanceof FuzzyDate) {
      return this.#start <= other.#start && other.#end <= this.#end;
    }
    const t = toMillis(other);
    return this.#start <= t && t <= this.#end;
  }

  overlaps(other: FuzzyDate): boolean {
    return this.#start <= other.#end && other.#start <= this.#end;
  }

  toString(): string {
    return this.isExact
      ? `${this.startISO} (${this.precision})`
      : `${this.startISO} .. ${this.endISO} (${this.precision})`;
  }

  toJSON() {
    return {
      start: this.startISO,
      end: this.endISO,
      precision: this.precision,
      isRange: this.isRange,
      text: this.text,
    };
  }
}

// ---------------------------------------------------------------------------
// date helpers (UTC only)
// ---------------------------------------------------------------------------

function utc(year: number, month: number, day: number): Date {
  const dt = new Date(Date.UTC(year, month - 1, day));
  if (year >= 0 && year < 100) dt.setUTCFullYear(year); // avoid 19xx mapping
  return dt;
}

function iso(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function toMillis(value: Date | string | number): number {
  if (value instanceof Date) return value.getTime();
  if (typeof value === "number") return value;
  const [y, m, d] = value.slice(0, 10).split("-").map(Number);
  return utc(y, m, d).getTime();
}

function daysInMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

function eom(year: number, month: number): Date {
  return utc(year, month, daysInMonth(year, month));
}

interface Span {
  start: Date;
  end: Date;
  precision: Precision;
}

const spanYear = (y: number): Span => ({
  start: utc(y, 1, 1),
  end: utc(y, 12, 31),
  precision: "year",
});

const spanMonth = (y: number, m: number): Span | null =>
  m >= 1 && m <= 12
    ? { start: utc(y, m, 1), end: eom(y, m), precision: "month" }
    : null;

const spanQuarter = (y: number, q: number): Span | null => {
  if (q < 1 || q > 4) return null;
  const first = 3 * (q - 1) + 1;
  return { start: utc(y, first, 1), end: eom(y, first + 2), precision: "quarter" };
};

const spanHalf = (y: number, h: number): Span | null => {
  if (h < 1 || h > 2) return null;
  const first = 6 * (h - 1) + 1;
  return { start: utc(y, first, 1), end: eom(y, first + 5), precision: "half" };
};

const spanDecade = (y0: number): Span => ({
  start: utc(y0, 1, 1),
  end: utc(y0 + 9, 12, 31),
  precision: "decade",
});

function spanDay(y: number, m: number, d: number): Span | null {
  if (m < 1 || m > 12 || d < 1 || d > 31) return null;
  const dt = utc(y, m, d);
  // JS silently rolls over Feb 30 -> Mar 2, so verify the round trip
  if (
    dt.getUTCFullYear() !== y ||
    dt.getUTCMonth() !== m - 1 ||
    dt.getUTCDate() !== d
  ) {
    return null;
  }
  return { start: dt, end: dt, precision: "day" };
}

function spanIsoWeek(year: number, week: number): Span | null {
  if (week < 1 || week > 53) return null;
  // ISO week 1 is the week containing Jan 4th
  const jan4 = utc(year, 1, 4);
  const dow = (jan4.getUTCDay() + 6) % 7; // Monday = 0
  const week1Monday = jan4.getTime() - dow * DAY_MS;
  const start = new Date(week1Monday + (week - 1) * 7 * DAY_MS);
  if (start.getUTCFullYear() > year) return null; // week 53 in a 52-week year
  return {
    start,
    end: new Date(start.getTime() + 6 * DAY_MS),
    precision: "week",
  };
}

// ---------------------------------------------------------------------------
// vocabulary
// ---------------------------------------------------------------------------

/** Extend this to support other languages. */
export const MONTHS: Record<string, number> = {
  january: 1, february: 2, march: 3, april: 4, may: 5, june: 6,
  july: 7, august: 8, september: 9, october: 10, november: 11, december: 12,
  jan: 1, feb: 2, mar: 3, apr: 4, jun: 6, jul: 7, aug: 8,
  sep: 9, sept: 9, oct: 10, nov: 11, dec: 12,
};

/** "early 2023" and friends -> an inclusive month range. */
const VAGUE_PARTS: Record<string, [number, number]> = {
  early: [1, 4],
  "beginning of": [1, 3],
  "start of": [1, 3],
  mid: [5, 8],
  "middle of": [5, 8],
  late: [9, 12],
  "end of": [10, 12],
};

const longestFirst = (keys: string[]) =>
  [...keys].sort((a, b) => b.length - a.length).join("|");

const PREFIX_RE =
  /^(?:in|on|at|during|from|between|circa|ca\.?|c\.?|around|about|approx\.?|approximately|somewhere in|sometime in|the)\s+/i;

/** Range separators, most specific first. */
const SEPARATORS = [
  /\s*\.{2,3}\s*/gi,
  /\s+(?:to|through|thru|until|till|and)\s+/gi,
  /\s+-\s+/gi,
  /-/gi,
  /\//gi,
];

// ---------------------------------------------------------------------------
// parser
// ---------------------------------------------------------------------------

export interface ParseOptions {
  /**
   * How to read ambiguous all-numeric dates like 05/04/2023.
   * true (default) -> 5 April (European), false -> 4 May (US).
   * Ignored when one component is > 12.
   */
  dayfirst?: boolean;
}

type Handler = (m: RegExpExecArray) => Span | null;

export class FuzzyDateParser {
  readonly dayfirst: boolean;
  readonly #patterns: Array<[RegExp, Handler]>;

  constructor(options: ParseOptions = {}) {
    this.dayfirst = options.dayfirst ?? true;
    const M = longestFirst(Object.keys(MONTHS));
    const V = longestFirst(Object.keys(VAGUE_PARTS));

    // order matters: most specific pattern first
    const specs: Array<[string, Handler]> = [
      // --- precise days (both separators must match) ---
      [String.raw`(\d{4})([-/.])(\d{1,2})\2(\d{1,2})`, (m) =>
        spanDay(+m[1], +m[3], +m[4])],
      [String.raw`(\d{1,2})([-/.])(\d{1,2})\2(\d{4})`, (m) =>
        this.#dmy(+m[1], +m[3], +m[4])],
      [String.raw`(\d{1,2})(?:st|nd|rd|th)?\s+(${M})\.?,?\s+(\d{4})`, (m) =>
        spanDay(+m[3], MONTHS[m[2].toLowerCase()], +m[1])],
      [String.raw`(${M})\.?\s+(\d{1,2})(?:st|nd|rd|th)?,?\s+(\d{4})`, (m) =>
        spanDay(+m[3], MONTHS[m[1].toLowerCase()], +m[2])],
      // --- ISO week ---
      [String.raw`(\d{4})[- ]?w\s*(\d{1,2})`, (m) => spanIsoWeek(+m[1], +m[2])],
      // --- quarters ---
      [String.raw`(\d{4})\s*[-/ ]?\s*q\s*(\d)`, (m) => spanQuarter(+m[1], +m[2])],
      [String.raw`q\s*(\d)\s*[-/ ]?\s*(\d{4})`, (m) => spanQuarter(+m[2], +m[1])],
      // --- halves / semesters ---
      [String.raw`(\d{4})\s*[-/ ]?\s*[hs]\s*(\d)`, (m) => spanHalf(+m[1], +m[2])],
      [String.raw`[hs]\s*(\d)\s*[-/ ]?\s*(\d{4})`, (m) => spanHalf(+m[2], +m[1])],
      // --- months ---
      [String.raw`(\d{4})\s*m\s*(\d{1,2})`, (m) => spanMonth(+m[1], +m[2])], // 2020M1
      [String.raw`(\d{4})[-/.](\d{1,2})`, (m) => spanMonth(+m[1], +m[2])], // 2019-12
      [String.raw`(\d{1,2})[-/.](\d{4})`, (m) => spanMonth(+m[2], +m[1])], // 12/2019
      [String.raw`(${M})\.?,?\s*(\d{4})`, (m) =>
        spanMonth(+m[2], MONTHS[m[1].toLowerCase()])], // Dec 2019
      [String.raw`(\d{4})\s*[-/ ]\s*(${M})\.?`, (m) =>
        spanMonth(+m[1], MONTHS[m[2].toLowerCase()])], // 2019 Dec
      // --- vague thirds of a year ---
      [String.raw`(${V})\s*-?\s*(\d{4})`, (m) => {
        const [lo, hi] = VAGUE_PARTS[m[1].toLowerCase()];
        const y = +m[2];
        return { start: utc(y, lo, 1), end: eom(y, hi), precision: "half" };
      }],
      // --- decades / years ---
      [String.raw`(\d{3}0)'?s`, (m) => spanDecade(+m[1])],
      [String.raw`(\d{4})`, (m) => spanYear(+m[1])],
    ];

    this.#patterns = specs.map(([src, fn]) => [
      new RegExp(`^(?:${src})$`, "i"),
      fn,
    ]);
  }

  // -- public API -----------------------------------------------------------

  parse(text: string): FuzzyDate {
    if (typeof text !== "string") {
      throw new FuzzyDateError(`expected a string, got ${typeof text}`, String(text));
    }
    const raw = text.trim();
    const s = FuzzyDateParser.normalize(raw);
    if (!s) throw new FuzzyDateError("empty date expression", raw);

    const atom = this.#atom(s);
    if (atom) {
      return new FuzzyDate(atom.start, atom.end, atom.precision, false, raw);
    }

    const range = this.#range(s, raw);
    if (range) {
      return new FuzzyDate(range.start, range.end, range.precision, true, raw);
    }

    throw new FuzzyDateError(`could not parse date expression: "${raw}"`, raw);
  }

  /** Like parse(), but returns null instead of throwing. */
  tryParse(text: string): FuzzyDate | null {
    try {
      return this.parse(text);
    } catch (err) {
      if (err instanceof FuzzyDateError) return null;
      throw err;
    }
  }

  parseAll(texts: Iterable<string>): FuzzyDate[] {
    return [...texts].map((t) => this.parse(t));
  }

  // -- internals ------------------------------------------------------------

  static normalize(text: string): string {
    let s = text.trim().toLowerCase();
    s = s.replace(/[\u2010-\u2015\u2212]/g, "-"); // unicode dashes
    s = s.replace(/\u00a0/g, " ").replace(/\u2019/g, "'");
    s = s.replace(/\s+/g, " ").replace(/-{2,}/g, "-");
    s = s.replace(/^~+/, "").trim();
    let previous: string;
    do {
      previous = s;
      s = s.replace(PREFIX_RE, "");
    } while (s !== previous);
    return s.replace(/^[\s.,;]+|[\s.,;]+$/g, "");
  }

  #dmy(a: number, b: number, year: number): Span | null {
    let day: number, month: number;
    if (a > 12) [day, month] = [a, b];
    else if (b > 12) [day, month] = [b, a];
    else [day, month] = this.dayfirst ? [a, b] : [b, a];
    return spanDay(year, month, day);
  }

  /** Parse a single (non-range) expression. */
  #atom(s: string): Span | null {
    const trimmed = s.trim();
    for (const [re, handler] of this.#patterns) {
      const m = re.exec(trimmed);
      if (m) {
        const span = handler(m);
        if (span) return span; // otherwise fall through to the next pattern
      }
    }
    return null;
  }

  /** Parse "A - B" style expressions. */
  #range(s: string, raw: string): Span | null {
    let backwards: [Date, Date] | null = null;

    for (const sep of SEPARATORS) {
      for (const m of s.matchAll(sep)) {
        const left = s.slice(0, m.index).trim();
        const right = s.slice(m.index + m[0].length).trim();
        if (!left || !right) continue;

        let a = this.#atom(left);
        let b = this.#atom(right);
        // let one side borrow the other's year: "Q1-Q3 2023", "Jan-Mar 2021"
        if (!a && b) a = this.#atom(`${left} ${b.start.getUTCFullYear()}`);
        else if (!b && a) b = this.#atom(`${right} ${a.start.getUTCFullYear()}`);
        if (!a || !b) continue;

        if (a.start.getTime() > b.end.getTime()) {
          backwards = [a.start, b.end];
          continue;
        }
        const precision =
          precisionRank[a.precision] >= precisionRank[b.precision]
            ? a.precision
            : b.precision;
        return { start: a.start, end: b.end, precision };
      }
    }

    if (backwards) {
      throw new FuzzyDateError(
        `range runs backwards: ${iso(backwards[0])} .. ${iso(backwards[1])}`,
        raw,
      );
    }
    return null;
  }
}

// ---------------------------------------------------------------------------
// module-level convenience
// ---------------------------------------------------------------------------

const DEFAULT_PARSER = new FuzzyDateParser();
const DAYLAST_PARSER = new FuzzyDateParser({ dayfirst: false });

const pick = (options?: ParseOptions) =>
  options?.dayfirst === false ? DAYLAST_PARSER : DEFAULT_PARSER;

/** Parse `text` into a FuzzyDate. Throws FuzzyDateError if it can't. */
export function parse(text: string, options?: ParseOptions): FuzzyDate {
  return pick(options).parse(text);
}

/** Like parse(), but returns null instead of throwing. */
export function tryParse(
  text: string,
  options?: ParseOptions,
): FuzzyDate | null {
  return pick(options).tryParse(text);
}