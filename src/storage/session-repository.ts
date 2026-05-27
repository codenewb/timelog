import { isValidWorkSession, type WorkSession } from "@/domain/work-session";

type PersistedSessionData = {
  version: 1;
  sessions: WorkSession[];
};

export interface SessionRepository {
  load(): WorkSession[];
  save(session: WorkSession): void;
}

function isPersistedSessionData(value: unknown): value is PersistedSessionData {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const data = value as Record<string, unknown>;
  return (
    data.version === 1 &&
    Array.isArray(data.sessions) &&
    data.sessions.every(isValidWorkSession)
  );
}

export class LocalStorageSessionRepository implements SessionRepository {
  constructor(private readonly key = "time-scheduler.sessions") {}

  load(): WorkSession[] {
    try {
      const storedData = localStorage.getItem(this.key);
      if (storedData === null) {
        return [];
      }

      const data: unknown = JSON.parse(storedData);
      return isPersistedSessionData(data) ? data.sessions : [];
    } catch {
      return [];
    }
  }

  save(session: WorkSession): void {
    if (!isValidWorkSession(session)) {
      throw new Error("Invalid work session");
    }

    const data: PersistedSessionData = {
      version: 1,
      sessions: [...this.load(), session],
    };
    localStorage.setItem(this.key, JSON.stringify(data));
  }
}
