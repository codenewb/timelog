import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { formatDuration, type WorkSession } from "@/domain/work-session";
import { useTimeTracker } from "@/features/time-tracker/use-time-tracker";

type TimeTrackerCardProps = {
  onSave: (session: WorkSession) => void;
};

export function TimeTrackerCard({ onSave }: TimeTrackerCardProps) {
  const [memo, setMemo] = useState("");
  const timer = useTimeTracker();

  function handleSave() {
    const session = timer.save(memo);
    if (!session) {
      return;
    }

    onSave(session);
    setMemo("");
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>시간 기록기</CardTitle>
        <CardDescription>
          저장한 측정 기록은 캘린더에서 확인할 수 있습니다.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div aria-live="polite" className="text-3xl font-semibold tabular-nums">
          {formatDuration(timer.elapsedSeconds)}
        </div>
        <div className="space-y-2">
          <label htmlFor="time-tracker-memo" className="text-sm font-medium">
            작업 메모
          </label>
          <Textarea
            id="time-tracker-memo"
            value={memo}
            placeholder="무엇에 집중했나요?"
            onChange={(event) => setMemo(event.target.value)}
          />
        </div>
      </CardContent>
      <CardFooter className="gap-2">
        <Button type="button" onClick={timer.play} disabled={timer.isRunning}>
          재생
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={timer.stop}
          disabled={!timer.isRunning}
        >
          정지
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={handleSave}
          disabled={!timer.canSave}
        >
          저장
        </Button>
      </CardFooter>
    </Card>
  );
}
