import { describe, expect, it, vi } from "vitest";
import type { WorkSession } from "@/domain/work-session";
import {
  LocalStorageSessionRepository,
  type SessionRepository,
} from "@/storage/session-repository";
import { createSessionStore } from "@/store/session-store";

const initialSession: WorkSession = {
  id: "session-1",
  date: "2026-05-26",
  startedAt: "2026-05-26T08:00:00.000Z",
  endedAt: "2026-05-26T08:30:00.000Z",
  durationSeconds: 1800,
  memo: "Initial session",
  createdAt: "2026-05-26T08:30:00.000Z",
};

const addedSession: WorkSession = {
  id: "session-2",
  date: "2026-05-26",
  startedAt: "2026-05-26T09:00:00.000Z",
  endedAt: "2026-05-26T09:45:00.000Z",
  durationSeconds: 2700,
  memo: "Added session",
  createdAt: "2026-05-26T09:45:00.000Z",
};

class MemorySessionRepository implements SessionRepository {
  readonly saved: WorkSession[] = [];

  constructor(private readonly loaded: WorkSession[]) {}

  load(): WorkSession[] {
    return this.loaded;
  }

  save(session: WorkSession): void {
    this.saved.push(session);
  }
}

describe("createSessionStore", () => {
  it("loads initial sessions and starts with no selected date", () => {
    const store = createSessionStore(new MemorySessionRepository([initialSession]));

    expect(store.getState().sessions).toEqual([initialSession]);
    expect(store.getState().selectedDate).toBe("");
  });

  it("does not initialize live state with an invalid loaded session", () => {
    const store = createSessionStore(
      new MemorySessionRepository([{ ...initialSession, durationSeconds: 0 }]),
    );

    expect(store.getState().sessions).toEqual([]);
  });

  it("persists and appends an added session", () => {
    const repository = new MemorySessionRepository([initialSession]);
    const store = createSessionStore(repository);

    store.getState().addSession(addedSession);

    expect(repository.saved).toEqual([addedSession]);
    expect(store.getState().sessions).toEqual([initialSession, addedSession]);
  });

  it("rejects an invalid session before saving or appending it", () => {
    const repository = new MemorySessionRepository([initialSession]);
    const store = createSessionStore(repository);

    expect(() =>
      store.getState().addSession({ ...addedSession, durationSeconds: 0 }),
    ).toThrow("Invalid work session");
    expect(repository.saved).toEqual([]);
    expect(store.getState().sessions).toEqual([initialSession]);
  });

  it("does not append a session when persistent storage rejects the write", () => {
    const store = createSessionStore(new LocalStorageSessionRepository());
    const setItem = vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("Storage write failed");
    });

    try {
      expect(() => store.getState().addSession(addedSession)).toThrow(
        "Storage write failed",
      );
      expect(store.getState().sessions).toEqual([]);
    } finally {
      setItem.mockRestore();
    }
  });

  it("updates the selected date", () => {
    const store = createSessionStore(new MemorySessionRepository([]));

    store.getState().selectDate("2026-05-26");

    expect(store.getState().selectedDate).toBe("2026-05-26");
  });
});
