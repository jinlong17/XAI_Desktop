/**
 * AC-FIXTURES-1..5: mock-fixture shape correctness.
 */
import { describe, it, expect } from "vitest";

import {
  WEATHER,
  STICKIES,
  MAILS,
  UPCOMING,
  CAL_EVENTS,
  bilingual,
} from "../internal/fixtures.js";

describe("AC-FIXTURES-1: WEATHER shape", () => {
  it("has bilingual city + temp + hi/lo + bilingual condition + icon + 5-day forecast", () => {
    expect(WEATHER.city.en.length).toBeGreaterThan(0);
    expect(WEATHER.city.zh.length).toBeGreaterThan(0);
    expect(typeof WEATHER.temp).toBe("number");
    expect(typeof WEATHER.hi).toBe("number");
    expect(typeof WEATHER.lo).toBe("number");
    expect(WEATHER.condition.en.length).toBeGreaterThan(0);
    expect(WEATHER.condition.zh.length).toBeGreaterThan(0);
    expect(["sun", "cloud", "rain"]).toContain(WEATHER.icon);
    expect(WEATHER.forecast).toHaveLength(5);
    for (const d of WEATHER.forecast) {
      expect(d.d.en.length).toBeGreaterThan(0);
      expect(d.d.zh.length).toBeGreaterThan(0);
      expect(typeof d.hi).toBe("number");
      expect(typeof d.lo).toBe("number");
      expect(["sun", "cloud", "rain"]).toContain(d.ico);
    }
  });
});

describe("AC-FIXTURES-2: STICKIES shape", () => {
  it("has 3 entries each with id + color + bilingual text", () => {
    expect(STICKIES).toHaveLength(3);
    for (const s of STICKIES) {
      expect(typeof s.id).toBe("string");
      expect(typeof s.color).toBe("string");
      expect(s.text.en.length).toBeGreaterThan(0);
      expect(s.text.zh.length).toBeGreaterThan(0);
    }
  });
});

describe("AC-FIXTURES-3: MAILS shape", () => {
  it("has 4 entries each with id + from + bilingual subj + time + unread bool", () => {
    expect(MAILS).toHaveLength(4);
    for (const m of MAILS) {
      expect(typeof m.id).toBe("string");
      expect(typeof m.from).toBe("string");
      expect(m.subj.en.length).toBeGreaterThan(0);
      expect(m.subj.zh.length).toBeGreaterThan(0);
      expect(typeof m.time).toBe("string");
      expect(typeof m.unread).toBe("boolean");
    }
  });
});

describe("AC-FIXTURES-4: UPCOMING shape", () => {
  it("has 4 entries each with id + date + bilingual month + bilingual title + time", () => {
    expect(UPCOMING).toHaveLength(4);
    for (const e of UPCOMING) {
      expect(typeof e.id).toBe("string");
      expect(typeof e.date).toBe("string");
      expect(e.month.en.length).toBeGreaterThan(0);
      expect(e.month.zh.length).toBeGreaterThan(0);
      expect(e.title.en.length).toBeGreaterThan(0);
      expect(e.title.zh.length).toBeGreaterThan(0);
      expect(typeof e.time).toBe("string");
    }
  });
});

describe("AC-FIXTURES-5: CAL_EVENTS shape", () => {
  it("is keyed by day number; each value is [{ c: <color> }]", () => {
    for (const [day, events] of Object.entries(CAL_EVENTS)) {
      const dayN = Number(day);
      expect(Number.isInteger(dayN)).toBe(true);
      expect(dayN).toBeGreaterThanOrEqual(1);
      expect(dayN).toBeLessThanOrEqual(31);
      expect(Array.isArray(events)).toBe(true);
      for (const ev of events) {
        expect(["mint", "amber", "blue", "violet"]).toContain(ev.c);
      }
    }
  });
});

describe("bilingual helper", () => {
  it("returns lang-specific value", () => {
    expect(bilingual({ en: "Hello", zh: "你好" }, "en")).toBe("Hello");
    expect(bilingual({ en: "Hello", zh: "你好" }, "zh")).toBe("你好");
  });
});
