import { describe, expect, it } from "vitest";
import { formatDuration, localDateKey, type WorkSession } from "@/domain/work-session";
import { monthCells, sessionsForDate, summarizeSessions } from "@/features/calendar/calendar-utils";

function session(overrides: Partial<WorkSession>): WorkSession {
  return {
    id: overrides.id ?? "session-1",
    date: overrides.date ?? "2026-05-26",
    startedAt: overrides.startedAt ?? "2026-05-26T09:00:00.000Z",
    endedAt: overrides.endedAt ?? "2026-05-26T09:25:00.000Z",
    durationSeconds: overrides.durationSeconds ?? 1500,
    memo: overrides.memo ?? "",
    createdAt: overrides.createdAt ?? "2026-05-26T09:25:00.000Z",
  };
}

describe("calendar utils", () => {
  it("summarizes session count and duration by date", () => {
    const sessions = [
      session({ id: "a", durationSeconds: 600, date: "2026-05-26" }),
      session({
        id: "b",
        durationSeconds: 900,
        date: "2026-05-26",
        startedAt: "2026-05-26T10:00:00.000Z",
        endedAt: "2026-05-26T10:15:00.000Z",
      }),
      session({
        id: "c",
        durationSeconds: 1200,
        date: "2026-05-27",
        startedAt: "2026-05-27T09:00:00.000Z",
        endedAt: "2026-05-27T09:20:00.000Z",
      }),
    ];

    expect(summarizeSessions(sessions)).toEqual({
      "2026-05-26": { count: 2, durationSeconds: 1500 },
      "2026-05-27": { count: 1, durationSeconds: 1200 },
    });
  });

  it("returns leading and trailing null cells for a month grid", () => {
    const month = new Date(2026, 4, 1);
    const cells = monthCells(month);
    const firstDayOffset = month.getDay();
    const daysInMonth = new Date(2026, 5, 0).getDate();

    expect(cells.length % 7).toBe(0);
    expect(cells.filter((cell) => cell !== null)).toHaveLength(daysInMonth);
    expect(cells.slice(0, firstDayOffset)).toEqual(Array(firstDayOffset).fill(null));
    expect(cells.at(-1)).toBeNull();
  });

  it("handles leap-year february month grids", () => {
    const cells = monthCells(new Date(2024, 1, 1));

    expect(cells.filter((cell) => cell !== null)).toHaveLength(29);
    expect(cells.length % 7).toBe(0);
  });

  it("returns only sessions for the requested local date in start order", () => {
    const sessions = [
      session({
        id: "late",
        startedAt: "2026-05-26T10:00:00.000Z",
        endedAt: "2026-05-26T10:10:00.000Z",
        durationSeconds: 600,
      }),
      session({
        id: "early",
        startedAt: "2026-05-26T09:00:00.000Z",
        endedAt: "2026-05-26T09:15:00.000Z",
        durationSeconds: 900,
      }),
      session({
        id: "other-day",
        date: "2026-05-27",
        startedAt: "2026-05-27T09:00:00.000Z",
        endedAt: "2026-05-27T09:15:00.000Z",
        durationSeconds: 900,
      }),
    ];

    expect(
      sessionsForDate(sessions, new Date("2026-05-26T12:00:00.000Z")).map((session) => session.id),
    ).toEqual(["early", "late"]);
  });

  it("keeps work-session formatting helpers available for calendar consumers", () => {
    expect(formatDuration(3661)).toBe("01:01:01");
    expect(localDateKey(new Date(2026, 4, 26))).toBe("2026-05-26");
  });
});
