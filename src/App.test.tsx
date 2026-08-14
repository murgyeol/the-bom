import { fireEvent, render, screen, waitFor } from "@testing-library/react";
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
    expect(screen.getByRole("heading", { name: "그대를 바라 봄" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "봄의 노래들" })).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: /재생$/ }).length).toBeGreaterThan(1);

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

  it("renders the copyright notice", () => {
    render(<CopyrightPage />);
    expect(screen.getByRole("heading", { name: "저작권 및 음원 사용 안내" })).toBeInTheDocument();
    expect(screen.getByText("Korean Notice")).toBeInTheDocument();
    expect(screen.getByText("English Notice")).toBeInTheDocument();
  });
});
