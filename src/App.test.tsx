import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CopyrightPage, HomePage, formatTime } from "./App";

describe("formatTime", () => {
  it("formats seconds as minutes and seconds", () => {
    expect(formatTime(225)).toBe("3:45");
    expect(formatTime(Number.NaN)).toBe("0:00");
  });
});

describe("music pages", () => {
  it("renders the player and local collection", () => {
    render(<HomePage />);
    expect(screen.getByRole("heading", { name: "그대를 바라 봄" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "봄의 노래들" })).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: /재생$/ }).length).toBeGreaterThan(1);
  });

  it("renders the copyright notice", () => {
    render(<CopyrightPage />);
    expect(screen.getByRole("heading", { name: "저작권 및 음원 사용 안내" })).toBeInTheDocument();
    expect(screen.getByText("Korean Notice")).toBeInTheDocument();
    expect(screen.getByText("English Notice")).toBeInTheDocument();
  });
});

