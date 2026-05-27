import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { StrictMode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { PomodoroCard } from "@/features/pomodoro/pomodoro-card";

function setup() {
  const playAlarm = vi.fn();

  render(<PomodoroCard playAlarm={playAlarm} />);

  return { playAlarm };
}

describe("PomodoroCard", () => {
  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  it("uses a custom minute countdown and plays its alarm when complete", () => {
    vi.useFakeTimers();
    const { playAlarm } = setup();

    fireEvent.change(screen.getByRole("spinbutton", { name: "직접 시간 (분)" }), {
      target: { value: "1" },
    });
    fireEvent.click(screen.getByRole("button", { name: "직접 설정" }));
    fireEvent.click(screen.getByRole("button", { name: "시작" }));

    act(() => {
      vi.advanceTimersByTime(60_000);
    });

    expect(screen.getByText("00:00:00")).toBeInTheDocument();
    expect(playAlarm).toHaveBeenCalledOnce();
    expect(screen.getByText("대기")).toBeInTheDocument();
  });

  it("switches between presets and resets an interrupted countdown", () => {
    vi.useFakeTimers();
    setup();

    fireEvent.click(screen.getByRole("button", { name: "휴식 5분" }));
    expect(screen.getByText("00:05:00")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "시작" }));
    act(() => {
      vi.advanceTimersByTime(2_000);
    });
    expect(screen.getByText("00:04:58")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "일시정지" }));
    fireEvent.click(screen.getByRole("button", { name: "초기화" }));
    expect(screen.getByText("00:05:00")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "작업 25분" }));
    expect(screen.getByText("00:25:00")).toBeInTheDocument();
  });

  it("rejects a custom duration that is not a positive whole minute", () => {
    setup();

    fireEvent.change(screen.getByRole("spinbutton", { name: "직접 시간 (분)" }), {
      target: { value: "0" },
    });
    fireEvent.click(screen.getByRole("button", { name: "직접 설정" }));

    expect(screen.getByRole("alert")).toHaveTextContent("1분 이상의 정수를 입력하세요.");
    expect(screen.getByText("00:25:00")).toBeInTheDocument();
  });

  it("plays the completion alarm once when rendered in strict mode", () => {
    vi.useFakeTimers();
    const playAlarm = vi.fn();
    render(
      <StrictMode>
        <PomodoroCard playAlarm={playAlarm} />
      </StrictMode>,
    );

    fireEvent.change(screen.getByRole("spinbutton", { name: "직접 시간 (분)" }), {
      target: { value: "1" },
    });
    fireEvent.click(screen.getByRole("button", { name: "직접 설정" }));
    fireEvent.click(screen.getByRole("button", { name: "시작" }));
    act(() => {
      vi.advanceTimersByTime(60_000);
    });

    expect(playAlarm).toHaveBeenCalledOnce();
  });
});
