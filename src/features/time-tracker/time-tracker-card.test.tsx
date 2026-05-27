import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { WorkSession } from "@/domain/work-session";
import { TimeTrackerCard } from "@/features/time-tracker/time-tracker-card";

function setup() {
  const onSave = vi.fn<(session: WorkSession) => void>();
  const user = userEvent.setup();

  render(<TimeTrackerCard onSave={onSave} />);

  return { onSave, user };
}

function startClock() {
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2026-05-26T09:00:00.000Z"));
}

function advance(milliseconds: number) {
  act(() => {
    vi.advanceTimersByTime(milliseconds);
  });
}

describe("TimeTrackerCard", () => {
  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  it("saves a stopped measured session with its memo and resets the timer", async () => {
    const { onSave, user } = setup();

    expect(screen.getByText("시간 기록기")).toBeInTheDocument();
    expect(screen.getByText(/캘린더/)).toBeInTheDocument();
    expect(screen.getByText("00:00:00")).toBeInTheDocument();

    const memo = screen.getByRole("textbox", { name: "작업 메모" });
    expect(memo).toHaveAttribute("placeholder", "무엇에 집중했나요?");

    await user.type(memo, "  설계 검토  ");
    startClock();
    fireEvent.click(screen.getByRole("button", { name: "재생" }));
    expect(screen.getByRole("button", { name: "재생" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "저장" })).toBeDisabled();

    advance(3_000);
    expect(screen.getByText("00:00:03")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "정지" }));
    expect(screen.getByRole("button", { name: "저장" })).toBeEnabled();
    fireEvent.click(screen.getByRole("button", { name: "저장" }));

    expect(onSave).toHaveBeenCalledOnce();
    expect(onSave).toHaveBeenCalledWith({
      id: expect.stringMatching(
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
      ),
      date: "2026-05-26",
      startedAt: "2026-05-26T09:00:00.000Z",
      endedAt: "2026-05-26T09:00:03.000Z",
      durationSeconds: 3,
      memo: "설계 검토",
      createdAt: "2026-05-26T09:00:03.000Z",
    });
    expect(screen.getByText("00:00:00")).toBeInTheDocument();
    expect(memo).toHaveValue("");
    expect(screen.getByRole("button", { name: "저장" })).toBeDisabled();
  });

  it("accumulates measured segments without paused time and preserves first and last timestamps", () => {
    const { onSave } = setup();
    startClock();

    fireEvent.click(screen.getByRole("button", { name: "재생" }));
    advance(2_000);
    fireEvent.click(screen.getByRole("button", { name: "정지" }));

    advance(10_000);
    expect(screen.getByText("00:00:02")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "재생" }));
    advance(4_000);
    fireEvent.click(screen.getByRole("button", { name: "정지" }));
    expect(screen.getByText("00:00:06")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "저장" }));

    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({
        startedAt: "2026-05-26T09:00:00.000Z",
        endedAt: "2026-05-26T09:00:16.000Z",
        durationSeconds: 6,
      }),
    );
  });

  it("does not enable saving without at least one stopped whole second", () => {
    const { onSave } = setup();
    startClock();
    const save = screen.getByRole("button", { name: "저장" });

    expect(save).toBeDisabled();

    fireEvent.click(screen.getByRole("button", { name: "재생" }));
    advance(999);
    fireEvent.click(screen.getByRole("button", { name: "정지" }));

    expect(screen.getByText("00:00:00")).toBeInTheDocument();
    expect(save).toBeDisabled();
    expect(onSave).not.toHaveBeenCalled();
  });

  it("saves when stopped sub-second segments combine into one whole second", () => {
    const { onSave } = setup();
    startClock();

    fireEvent.click(screen.getByRole("button", { name: "재생" }));
    advance(600);
    fireEvent.click(screen.getByRole("button", { name: "정지" }));
    advance(5_000);
    fireEvent.click(screen.getByRole("button", { name: "재생" }));
    advance(600);
    fireEvent.click(screen.getByRole("button", { name: "정지" }));

    expect(screen.getByText("00:00:01")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "저장" })).toBeEnabled();
    fireEvent.click(screen.getByRole("button", { name: "저장" }));

    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({
        startedAt: "2026-05-26T09:00:00.000Z",
        endedAt: "2026-05-26T09:00:06.200Z",
        durationSeconds: 1,
      }),
    );
  });
});
