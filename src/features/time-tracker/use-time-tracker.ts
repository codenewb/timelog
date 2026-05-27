import { useEffect, useState } from "react";
import {
  localDateKey,
  type WorkSession,
} from "@/domain/work-session";

type TimeTracker = {
  elapsedSeconds: number;
  isRunning: boolean;
  canSave: boolean;
  play: () => void;
  stop: () => void;
  save: (memo: string) => WorkSession | undefined;
};

function millisecondsBetween(start: Date, end: Date): number {
  return end.getTime() - start.getTime();
}

export function useTimeTracker(): TimeTracker {
  const [startedAt, setStartedAt] = useState<Date | null>(null);
  const [activeStartedAt, setActiveStartedAt] = useState<Date | null>(null);
  const [endedAt, setEndedAt] = useState<Date | null>(null);
  const [accumulatedMilliseconds, setAccumulatedMilliseconds] = useState(0);
  const [currentTime, setCurrentTime] = useState(() => Date.now());

  const isRunning = activeStartedAt !== null;
  const measuredMilliseconds =
    accumulatedMilliseconds +
    (activeStartedAt
      ? millisecondsBetween(activeStartedAt, new Date(currentTime))
      : 0);
  const elapsedSeconds = Math.floor(measuredMilliseconds / 1000);

  useEffect(() => {
    if (!activeStartedAt) {
      return;
    }

    const interval = window.setInterval(() => {
      setCurrentTime(Date.now());
    }, 250);

    return () => {
      window.clearInterval(interval);
    };
  }, [activeStartedAt]);

  function play() {
    if (activeStartedAt) {
      return;
    }

    const playedAt = new Date();
    setStartedAt((firstStart) => firstStart ?? playedAt);
    setActiveStartedAt(playedAt);
    setCurrentTime(playedAt.getTime());
  }

  function stop() {
    if (!activeStartedAt) {
      return;
    }

    const stoppedAt = new Date();
    setAccumulatedMilliseconds(
      (milliseconds) =>
        milliseconds + millisecondsBetween(activeStartedAt, stoppedAt),
    );
    setActiveStartedAt(null);
    setEndedAt(stoppedAt);
    setCurrentTime(stoppedAt.getTime());
  }

  function save(memo: string): WorkSession | undefined {
    if (isRunning || elapsedSeconds < 1 || !startedAt || !endedAt) {
      return undefined;
    }

    const session: WorkSession = {
      id: crypto.randomUUID(),
      date: localDateKey(startedAt),
      startedAt: startedAt.toISOString(),
      endedAt: endedAt.toISOString(),
      durationSeconds: elapsedSeconds,
      memo: memo.trim(),
      createdAt: new Date().toISOString(),
    };

    setStartedAt(null);
    setEndedAt(null);
    setAccumulatedMilliseconds(0);
    setCurrentTime(Date.now());

    return session;
  }

  return {
    elapsedSeconds,
    isRunning,
    canSave: !isRunning && elapsedSeconds >= 1,
    play,
    stop,
    save,
  };
}
