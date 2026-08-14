import { describe, expect, it } from "vitest";
import { canonicalUrl, findTrack, publicTrack } from "./worker";

describe("track API helpers", () => {
  it("finds a generated track by its stable id", () => {
    expect(findTrack("001")?.title).toBe("너의 이름은 봄");
  });

  it("does not expose the private R2 object key", () => {
    const track = findTrack("001");
    expect(track).toBeDefined();

    const result = publicTrack(track!);
    expect(result.streamUrl).toBe("/media/001");
    expect(result).not.toHaveProperty("objectKey");
  });
});

describe("canonical domain", () => {
  it("redirects www URLs to the apex while preserving path and query", () => {
    expect(canonicalUrl("http://www.the-bom.com/media/001?download=0")).toBe(
      "https://the-bom.com/media/001?download=0"
    );
  });

  it("leaves the apex domain unchanged", () => {
    expect(canonicalUrl("https://the-bom.com/")).toBeNull();
  });
});
