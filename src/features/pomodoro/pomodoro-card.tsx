import { useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { formatDuration } from "@/domain/work-session";
import { playCompletionTone, prepareAudio } from "@/features/pomodoro/audio";
import { usePomodoro } from "@/features/pomodoro/use-pomodoro";

type PomodoroCardProps = {
  playAlarm?: () => void;
};

export function PomodoroCard({
  playAlarm = playCompletionTone,
}: PomodoroCardProps) {
  const timer = usePomodoro(playAlarm);
  const [minutes, setMinutes] = useState("25");
  const [error, setError] = useState("");

  function useCustomDuration() {
    const value = Number(minutes);

    if (!Number.isInteger(value) || value < 1) {
      setError("1분 이상의 정수를 입력하세요.");
      return;
    }

    setError("");
    timer.chooseDuration(value * 60);
  }

  function start() {
    prepareAudio();
    timer.start();
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <CardTitle>포모도로</CardTitle>
          <Badge variant={timer.isRunning ? "default" : "secondary"}>
            {timer.isRunning ? "진행 중" : "대기"}
          </Badge>
        </div>
        <CardDescription>
          집중 또는 휴식 시간을 독립적으로 카운트다운합니다.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <p
          aria-live="polite"
          className="text-5xl font-semibold tracking-tight tabular-nums"
        >
          {formatDuration(timer.remainingSeconds)}
        </p>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="secondary"
            onClick={() => timer.chooseDuration(25 * 60)}
          >
            작업 25분
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => timer.chooseDuration(5 * 60)}
          >
            휴식 5분
          </Button>
        </div>
        <div className="flex gap-2">
          <Input
            aria-label="직접 시간 (분)"
            type="number"
            min="1"
            value={minutes}
            onChange={(event) => setMinutes(event.target.value)}
          />
          <Button type="button" variant="outline" onClick={useCustomDuration}>
            직접 설정
          </Button>
        </div>
        {error ? (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : null}
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            onClick={start}
            disabled={timer.isRunning || timer.remainingSeconds === 0}
          >
            시작
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={timer.pause}
            disabled={!timer.isRunning}
          >
            일시정지
          </Button>
          <Button type="button" variant="outline" onClick={timer.reset}>
            초기화
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
