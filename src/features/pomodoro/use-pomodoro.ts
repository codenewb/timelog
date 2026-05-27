import { useEffect, useRef, useState } from "react";

type PomodoroTimer = {
  remainingSeconds: number;
  isRunning: boolean;
  chooseDuration: (seconds: number) => void;
  start: () => void;
  pause: () => void;
  reset: () => void;
};

export function usePomodoro(playAlarm: () => void): PomodoroTimer {
  const [durationSeconds, setDurationSeconds] = useState(25 * 60);
  const [remainingSeconds, setRemainingSeconds] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const completionAnnounced = useRef(false);

  useEffect(() => {
    if (remainingSeconds > 0) {
      completionAnnounced.current = false;
      return;
    }

    if (!completionAnnounced.current) {
      completionAnnounced.current = true;
      playAlarm();
    }
  }, [remainingSeconds, playAlarm]);

  useEffect(() => {
    if (!isRunning) {
      return;
    }

    const interval = window.setInterval(() => {
      setRemainingSeconds((seconds) => {
        if (seconds <= 1) {
          window.clearInterval(interval);
          setIsRunning(false);
          return 0;
        }

        return seconds - 1;
      });
    }, 1000);

    return () => {
      window.clearInterval(interval);
    };
  }, [isRunning]);

  function chooseDuration(seconds: number) {
    setDurationSeconds(seconds);
    setRemainingSeconds(seconds);
    setIsRunning(false);
  }

  return {
    remainingSeconds,
    isRunning,
    chooseDuration,
    start: () => setIsRunning(true),
    pause: () => setIsRunning(false),
    reset: () => {
      setIsRunning(false);
      setRemainingSeconds(durationSeconds);
    },
  };
}
