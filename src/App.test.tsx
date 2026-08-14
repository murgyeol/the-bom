import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { CopyrightPage, HomePage, formatTime } from "./App";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("formatTime", () => {
  it("formats seconds as minutes and seconds", () => {
    expect(formatTime(225)).toBe("3:45");
    expect(formatTime(Number.NaN)).toBe("0:00");
  });
});

describe("music pages", () => {
  it("starts the playlist automatically and advances when a track ends", async () => {
    const playSpy = vi.spyOn(HTMLMediaElement.prototype, "play").mockResolvedValue();
    vi.spyOn(HTMLMediaElement.prototype, "load").mockImplementation(() => undefined);
    const { container } = render(<HomePage />);
    const audio = container.querySelector("audio");

    expect(audio).not.toBeNull();
    expect(audio).toHaveAttribute("autoplay");
    const title = screen.getByRole("heading", { name: "그대를 바라 봄" });
    expect(title).toBeInTheDocument();
    expect(title.previousElementSibling).toHaveTextContent("우리들의 사랑이 봄처럼 머무는 곳");
    expect(title.nextElementSibling).toBeNull();
    expect(screen.getByRole("heading", { name: "봄의 노래들" })).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: /재생$/ }).length).toBeGreaterThan(1);
    expect(container.querySelector(".track-copy small")).toHaveTextContent("Arch.wav");
    expect(screen.getAllByText("Arch.mp3").length).toBeGreaterThan(0);

    await waitFor(() => expect(playSpy).toHaveBeenCalled());
    const initialSource = audio?.getAttribute("src");
    fireEvent.ended(audio as HTMLAudioElement);

    await waitFor(() => expect(audio?.getAttribute("src")).not.toBe(initialSource));
    const secondSource = audio?.getAttribute("src");
    const trackButtons = screen.getAllByRole("button", { name: /재생$/ });
    fireEvent.click(trackButtons.at(-1) as HTMLButtonElement);

    await waitFor(() => expect(audio?.getAttribute("src")).not.toBe(secondSource));
    fireEvent.ended(audio as HTMLAudioElement);

    await waitFor(() => expect(audio?.getAttribute("src")).toBe(initialSource));
    expect(playSpy).toHaveBeenCalledTimes(4);
  });

  it("does not report an R2 error when switching tracks interrupts playback", async () => {
    const playSpy = vi.spyOn(HTMLMediaElement.prototype, "play")
      .mockResolvedValueOnce()
      .mockRejectedValueOnce(new DOMException("Playback was interrupted", "AbortError"));
    vi.spyOn(HTMLMediaElement.prototype, "load").mockImplementation(() => undefined);
    render(<HomePage />);

    await waitFor(() => expect(playSpy).toHaveBeenCalledTimes(1));
    fireEvent.click(screen.getAllByRole("button", { name: "나의 이름은 봄 (1) 재생" })[0]);
    await waitFor(() => expect(playSpy).toHaveBeenCalledTimes(2));
    await act(async () => Promise.resolve());

    expect(screen.queryByText("음원을 불러오지 못했습니다. R2 업로드 상태를 확인해 주세요.")).not.toBeInTheDocument();
  });

  it("renders the copyright notice", () => {
    render(<CopyrightPage />);
    expect(screen.getByRole("heading", { name: "저작권 및 음원 사용 안내" })).toBeInTheDocument();
    expect(screen.getByText("Korean Notice")).toBeInTheDocument();
    expect(screen.getByText("English Notice")).toBeInTheDocument();
  });
});
