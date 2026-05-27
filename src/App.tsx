import { localDateKey } from "@/domain/work-session";
import { CalendarPanel } from "@/features/calendar/calendar-panel";
import { PomodoroCard } from "@/features/pomodoro/pomodoro-card";
import { TimeTrackerCard } from "@/features/time-tracker/time-tracker-card";
import { useSessionStore } from "@/store/session-store";

export default function App() {
  const sessions = useSessionStore((state) => state.sessions);
  const selectedDate =
    useSessionStore((state) => state.selectedDate) || localDateKey(new Date());
  const addSession = useSessionStore((state) => state.addSession);
  const selectDate = useSessionStore((state) => state.selectDate);

  return (
    <main className="min-h-screen bg-background px-4 py-6 text-foreground md:px-8">
      <div className="mx-auto max-w-6xl">
        <header className="mb-7">
          <p className="mb-2 text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">
            Time Scheduler
          </p>
          <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
            오늘의 시간을 기록하세요
          </h1>
          <p className="mt-2 text-muted-foreground">
            측정한 작업은 직접 저장한 뒤 캘린더에서 확인할 수 있습니다.
          </p>
        </header>
        <div className="grid gap-5 lg:grid-cols-2">
          <TimeTrackerCard
            onSave={(session) => {
              addSession(session);
              selectDate(session.date);
            }}
          />
          <PomodoroCard />
          <CalendarPanel
            className="lg:col-span-2"
            sessions={sessions}
            selectedDate={selectedDate}
            onSelectDate={selectDate}
          />
        </div>
      </div>
    </main>
  );
}
