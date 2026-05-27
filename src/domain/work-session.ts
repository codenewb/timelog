export type WorkSession = {
  id: string;
  date: string;
  startedAt: string;
  endedAt: string;
  durationSeconds: number;
  memo: string;
  createdAt: string;
};

export function isValidWorkSession(value: unknown): value is WorkSession {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const session = value as Record<string, unknown>;
  return (
    typeof session.id === "string" &&
    typeof session.date === "string" &&
    typeof session.startedAt === "string" &&
    typeof session.endedAt === "string" &&
    typeof session.durationSeconds === "number" &&
    Number.isFinite(session.durationSeconds) &&
    Number.isInteger(session.durationSeconds) &&
    session.durationSeconds > 0 &&
    typeof session.memo === "string" &&
    typeof session.createdAt === "string"
  );
}

export function localDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;
  return [hours, minutes, remainingSeconds]
    .map((part) => String(part).padStart(2, "0"))
    .join(":");
}
