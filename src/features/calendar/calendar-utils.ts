import { localDateKey, type WorkSession } from "@/domain/work-session";

export type SessionSummary = {
  count: number;
  durationSeconds: number;
};

export function summarizeSessions(
  sessions: WorkSession[],
): Record<string, SessionSummary> {
  return sessions.reduce<Record<string, SessionSummary>>((summary, session) => {
    const current = summary[session.date] ?? { count: 0, durationSeconds: 0 };
    summary[session.date] = {
      count: current.count + 1,
      durationSeconds: current.durationSeconds + session.durationSeconds,
    };
    return summary;
  }, {});
}

export function monthCells(month: Date): Array<number | null> {
  const year = month.getFullYear();
  const monthIndex = month.getMonth();
  const firstDay = new Date(year, monthIndex, 1);
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();

  const cells: Array<number | null> = Array(firstDay.getDay()).fill(null);
  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push(day);
  }

  while (cells.length % 7 !== 0) {
    cells.push(null);
  }

  return cells;
}

export function sessionsForDate(
  sessions: WorkSession[],
  date: Date,
): WorkSession[] {
  const dateKey = localDateKey(date);
  return sessions
    .filter((session) => session.date === dateKey)
    .slice()
    .sort((left, right) => {
      return new Date(left.startedAt).getTime() - new Date(right.startedAt).getTime();
    });
}
