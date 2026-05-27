import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import App from "@/App";
import { sessionStore } from "@/store/session-store";

beforeEach(() => {
  sessionStore.setState({ sessions: [], selectedDate: "" });
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

it("adds an explicitly saved work session to the selected calendar date", () => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2026-05-26T09:00:00.000Z"));
  render(<App />);

  fireEvent.change(screen.getByRole("textbox", { name: "작업 메모" }), {
    target: { value: "저장 확인" },
  });
  fireEvent.click(screen.getByRole("button", { name: "재생" }));
  act(() => {
    vi.advanceTimersByTime(60_000);
  });
  fireEvent.click(screen.getByRole("button", { name: "정지" }));
  fireEvent.click(screen.getByRole("button", { name: "저장" }));

  expect(screen.getByText("저장 확인")).toBeInTheDocument();
  expect(screen.getByRole("button", { name: /26일/ })).toHaveTextContent("00:01:00");
});
