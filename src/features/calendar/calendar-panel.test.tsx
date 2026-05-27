import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { WorkSession } from "@/domain/work-session";
import { CalendarPanel } from "@/features/calendar/calendar-panel";

function session(overrides: Partial<WorkSession>): WorkSession {
  return {
    id: overrides.id ?? "session-1",
    date: overrides.date ?? "2026-05-26",
    startedAt: overrides.startedAt ?? "2026-05-26T09:00:00.000Z",
    endedAt: overrides.endedAt ?? "2026-05-26T09:25:00.000Z",
    durationSeconds: overrides.durationSeconds ?? 1500,
    memo: overrides.memo ?? "",
    createdAt: overrides.createdAt ?? "2026-05-26T09:25:00.000Z",
  };
}

function setup(sessions: WorkSession[] = []) {
  const onSelectDate = vi.fn();

  render(<CalendarPanel sessions={sessions} onSelectDate={onSelectDate} />);
  vi.useRealTimers();
  const user = userEvent.setup();

  return { onSelectDate, user };
}

describe("CalendarPanel", () => {
  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  it("renders monthly summary and details for a selected day", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-05-26T09:00:00.000Z"));

    const sessions = [
      session({
        id: "late",
        startedAt: "2026-05-26T10:00:00.000Z",
        endedAt: "2026-05-26T10:45:00.000Z",
        durationSeconds: 2700,
        memo: "정리",
      }),
      session({
        id: "early",
        startedAt: "2026-05-26T09:00:00.000Z",
        endedAt: "2026-05-26T11:00:00.000Z",
        durationSeconds: 7200,
        memo: "",
      }),
      session({
        id: "other-day",
        date: "2026-05-27",
        startedAt: "2026-05-27T13:00:00.000Z",
        endedAt: "2026-05-27T13:30:00.000Z",
        durationSeconds: 1800,
        memo: "오후 기록",
      }),
    ];

    const { onSelectDate, user } = setup(sessions);

    expect(screen.getByRole("heading", { name: "캘린더" })).toBeInTheDocument();
    expect(screen.getByText("2026년 5월")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "이전 달" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "다음 달" })).toBeInTheDocument();

    for (const day of ["일", "월", "화", "수", "목", "금", "토"]) {
      expect(screen.getByText(day)).toBeInTheDocument();
    }

    const dayCell = screen.getByRole("button", { name: /26일/ });
    expect(dayCell).toHaveTextContent("26일");
    expect(dayCell).toHaveTextContent("2건");
    expect(dayCell).toHaveTextContent("02:45:00");
    expect(screen.getByRole("button", { name: /27일/ })).toHaveTextContent("00:30:00");

    await user.click(dayCell);

    expect(onSelectDate).toHaveBeenCalledWith("2026-05-26");
    expect(screen.getByText("09:00 - 11:00")).toBeInTheDocument();
    expect(screen.getByText("10:00 - 10:45")).toBeInTheDocument();
    expect(screen.getAllByText("메모 없음")).toHaveLength(1);
    expect(screen.getByText("정리")).toBeInTheDocument();

    const blocks = screen.getAllByLabelText("작업 시간대");
    expect(blocks).toHaveLength(2);
    expect(within(blocks[0]).getByRole("presentation")).toHaveStyle({
      top: "37.5%",
      height: "8.333333333333332%",
    });
  });

  it("shows an empty state when a selected day has no sessions", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-05-26T09:00:00.000Z"));

    const { user } = setup([]);

    await user.click(screen.getByRole("button", { name: /26일/ }));

    expect(screen.getByText("저장된 기록이 없습니다.")).toBeInTheDocument();
  });

  it("keeps the selected date aligned when navigating months", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-05-26T09:00:00.000Z"));

    const sessions = [
      session({
        id: "june",
        date: "2026-06-01",
        startedAt: "2026-06-01T08:00:00.000Z",
        endedAt: "2026-06-01T09:00:00.000Z",
        durationSeconds: 3600,
        memo: "다음달 작업",
      }),
    ];

    const { onSelectDate, user } = setup(sessions);

    await user.click(screen.getByRole("button", { name: "다음 달" }));

    expect(onSelectDate).toHaveBeenCalledWith("2026-06-01");
    expect(screen.getByText("2026년 6월")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^1일/ })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(screen.getByText("08:00 - 09:00")).toBeInTheDocument();
  });

  it("moves to the month of a newly controlled selected date", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-05-26T09:00:00.000Z"));
    const onSelectDate = vi.fn();
    const { rerender } = render(
      <CalendarPanel
        sessions={[]}
        selectedDate="2026-06-01"
        initialMonth={new Date(2026, 5, 1)}
        onSelectDate={onSelectDate}
      />,
    );

    expect(screen.getByText("2026년 6월")).toBeInTheDocument();

    rerender(
      <CalendarPanel
        sessions={[]}
        selectedDate="2026-05-26"
        initialMonth={new Date(2026, 5, 1)}
        onSelectDate={onSelectDate}
      />,
    );

    expect(screen.getByText("2026년 5월")).toBeInTheDocument();
  });
});
