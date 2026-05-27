import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";
import { formatDuration, localDateKey, type WorkSession } from "@/domain/work-session";
import { monthCells, sessionsForDate, summarizeSessions } from "@/features/calendar/calendar-utils";

type CalendarPanelProps = {
  sessions: WorkSession[];
  selectedDate?: string;
  onSelectDate: (dateKey: string) => void;
  initialMonth?: Date;
  className?: string;
};

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

function formatClockTime(value: string): string {
  const date = new Date(value);
  return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(
    2,
    "0",
  )}`;
}

function getMonthTitle(month: Date): string {
  return `${month.getFullYear()}년 ${month.getMonth() + 1}월`;
}

function getMonthStart(month: Date): Date {
  return new Date(month.getFullYear(), month.getMonth(), 1);
}

function parseDateKey(dateKey: string): Date {
  const [year, month, day] = dateKey.split("-").map((part) => Number(part));
  return new Date(year, month - 1, day);
}

function shiftMonth(month: Date, offset: number): Date {
  return new Date(month.getFullYear(), month.getMonth() + offset, 1);
}

function getDayStartSeconds(date: Date): number {
  return date.getHours() * 60 * 60 + date.getMinutes() * 60 + date.getSeconds();
}

function getTimelineStyle(session: WorkSession) {
  const start = new Date(session.startedAt);
  const startSeconds = getDayStartSeconds(start);
  const durationSeconds = Math.min(
    session.durationSeconds,
    Math.max(0, 24 * 60 * 60 - startSeconds),
  );

  return {
    top: `${(startSeconds / (24 * 60 * 60)) * 100}%`,
    height: `${Math.max((durationSeconds / (24 * 60 * 60)) * 100, 2)}%`,
  };
}

export function CalendarPanel({
  sessions,
  selectedDate: controlledSelectedDate,
  onSelectDate,
  initialMonth,
  className,
}: CalendarPanelProps) {
  const today = new Date();
  const [internalVisibleMonth, setInternalVisibleMonth] = useState(() =>
    getMonthStart(initialMonth ?? today),
  );
  const [internalSelectedDate, setInternalSelectedDate] = useState(() =>
    localDateKey(today),
  );
  const selectedDate = controlledSelectedDate ?? internalSelectedDate;
  const visibleMonth =
    controlledSelectedDate === undefined
      ? internalVisibleMonth
      : getMonthStart(parseDateKey(controlledSelectedDate));

  const summaries = summarizeSessions(sessions);
  const selectedSessions = sessionsForDate(sessions, parseDateKey(selectedDate));
  const monthTitle = getMonthTitle(visibleMonth);
  const cells = monthCells(visibleMonth);

  function handleSelectDate(dateKey: string) {
    setInternalSelectedDate(dateKey);
    onSelectDate(dateKey);
  }

  function handleShiftMonth(offset: number) {
    const nextMonth = shiftMonth(visibleMonth, offset);
    const dateKey = localDateKey(nextMonth);
    setInternalVisibleMonth(nextMonth);
    setInternalSelectedDate(dateKey);
    onSelectDate(dateKey);
  }

  return (
    <Card className={className}>
      <CardHeader className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="leading-none font-semibold">캘린더</h2>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleShiftMonth(-1)}
            >
              이전 달
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleShiftMonth(1)}
            >
              다음 달
            </Button>
          </div>
        </div>
        <div className="text-sm font-medium text-muted-foreground">{monthTitle}</div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div
          className="grid grid-cols-7 gap-2 text-center text-sm font-medium text-muted-foreground"
          aria-label="요일"
        >
          {WEEKDAYS.map((weekday) => (
            <div key={weekday}>{weekday}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-2">
          {cells.map((day, index) => {
            if (day === null) {
              return <div key={`empty-${index}`} className="min-h-20 rounded-md" />;
            }

            const date = new Date(
              visibleMonth.getFullYear(),
              visibleMonth.getMonth(),
              day,
            );
            const dateKey = localDateKey(date);
            const summary = summaries[dateKey];
            const isSelected = dateKey === selectedDate;

            return (
              <Button
                key={dateKey}
                type="button"
                variant={isSelected ? "secondary" : "outline"}
                className="h-auto min-h-20 flex-col items-start justify-start gap-1 p-3 text-left"
                onClick={() => handleSelectDate(dateKey)}
                aria-pressed={isSelected}
              >
                <span className="font-medium">{day}일</span>
                {summary ? (
                  <span className="text-xs text-muted-foreground">
                    {formatDuration(summary.durationSeconds)} · {summary.count}건
                  </span>
                ) : null}
              </Button>
            );
          })}
        </div>

        <section aria-label="선택한 날짜 상세" className="space-y-3">
          <div className="text-sm font-medium text-muted-foreground">{selectedDate}</div>
          {selectedSessions.length === 0 ? (
            <p className="text-sm text-muted-foreground">저장된 기록이 없습니다.</p>
          ) : (
            <div className="space-y-4">
              {selectedSessions.map((session) => {
                return (
                  <article
                    key={session.id}
                    className="rounded-lg border p-4 space-y-3"
                    aria-label={`${session.date} 작업 상세`}
                  >
                    <div className="flex flex-wrap items-center gap-3 text-sm">
                      <span className="font-medium">{formatDuration(session.durationSeconds)}</span>
                      <span className="text-muted-foreground">
                        {formatClockTime(session.startedAt)} - {formatClockTime(session.endedAt)}
                      </span>
                    </div>
                    <p className="text-sm">
                      {session.memo.trim() ? session.memo : "메모 없음"}
                    </p>
                    <div
                      aria-label="작업 시간대"
                      className="relative h-20 overflow-hidden rounded-md border bg-muted/40"
                    >
                      <div
                        role="presentation"
                        className="absolute left-2 right-2 rounded bg-primary/70"
                        style={getTimelineStyle(session)}
                      />
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </CardContent>
    </Card>
  );
}
