import { describe, expect, it } from "vitest";
import { findTrack, publicTrack } from "./worker";

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

