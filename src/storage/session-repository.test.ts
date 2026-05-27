import { describe, expect, it, vi } from "vitest";
import { formatDuration, localDateKey, type WorkSession } from "@/domain/work-session";
import { LocalStorageSessionRepository } from "@/storage/session-repository";

const session: WorkSession = {
  id: "session-1",
  date: "2026-05-26",
  startedAt: "2026-05-26T09:00:00.000Z",
  endedAt: "2026-05-26T09:25:00.000Z",
  durationSeconds: 1500,
  memo: "Task 2 work",
  createdAt: "2026-05-26T09:25:00.000Z",
};

describe("work session helpers", () => {
  it("formats a local date key and duration", () => {
    expect(localDateKey(new Date(2026, 4, 26))).toBe("2026-05-26");
    expect(formatDuration(3661)).toBe("01:01:01");
  });
});

describe("LocalStorageSessionRepository", () => {
  it("saves sessions in a versioned envelope and reloads them", () => {
    const repository = new LocalStorageSessionRepository();

    repository.save(session);

    expect(JSON.parse(localStorage.getItem("time-scheduler.sessions") ?? "")).toEqual({
      version: 1,
      sessions: [session],
    });
    expect(repository.load()).toEqual([session]);
  });

  it("returns no sessions for malformed JSON", () => {
    localStorage.setItem("time-scheduler.sessions", "{not-json");

    expect(new LocalStorageSessionRepository().load()).toEqual([]);
  });

  it("returns no sessions when storage cannot be read", () => {
    const getItem = vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("Storage access denied");
    });

    try {
      expect(new LocalStorageSessionRepository().load()).toEqual([]);
    } finally {
      getItem.mockRestore();
    }
  });

  it.each([
    { version: 2, sessions: [session] },
    { version: 1, sessions: [{ ...session, durationSeconds: 0 }] },
    { version: 1, sessions: [{ ...session, memo: 42 }] },
  ])("returns no sessions for an invalid persisted envelope", (storedData) => {
    localStorage.setItem("time-scheduler.sessions", JSON.stringify(storedData));

    expect(new LocalStorageSessionRepository().load()).toEqual([]);
  });

  it.each([0, Number.POSITIVE_INFINITY, 1.5])(
    "rejects duration %s when saving",
    (durationSeconds) => {
      const repository = new LocalStorageSessionRepository();
      const setItem = vi.spyOn(Storage.prototype, "setItem");

      try {
        expect(() =>
          repository.save({ ...session, durationSeconds }),
        ).toThrow("Invalid work session");
        expect(setItem).not.toHaveBeenCalled();
      } finally {
        setItem.mockRestore();
      }
    },
  );
});
