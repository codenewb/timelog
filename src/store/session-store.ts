import { useStore } from "zustand";
import { createStore } from "zustand/vanilla";
import { isValidWorkSession, type WorkSession } from "@/domain/work-session";
import {
  LocalStorageSessionRepository,
  type SessionRepository,
} from "@/storage/session-repository";

export type SessionState = {
  sessions: WorkSession[];
  selectedDate: string;
  addSession: (session: WorkSession) => void;
  selectDate: (date: string) => void;
};

export function createSessionStore(repository: SessionRepository) {
  return createStore<SessionState>((set) => {
    const loadedSessions = repository.load();

    return {
      sessions: loadedSessions.every(isValidWorkSession) ? loadedSessions : [],
      selectedDate: "",
      addSession: (session) => {
        if (!isValidWorkSession(session)) {
          throw new Error("Invalid work session");
        }

        repository.save(session);
        set((state) => ({ sessions: [...state.sessions, session] }));
      },
      selectDate: (date) => set({ selectedDate: date }),
    };
  });
}

export const sessionStore = createSessionStore(
  new LocalStorageSessionRepository(),
);

export function useSessionStore<T>(selector: (state: SessionState) => T): T {
  return useStore(sessionStore, selector);
}
