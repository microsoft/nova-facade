/**
 * @vitest-environment node
 */

import { describe, it, expect, vi } from "vitest";
import { graphql } from "./taggedNode";
import { graphql as mockedImplementation } from "@graphitation/graphql-js-tag";

vi.mock("@graphitation/graphql-js-tag", () => ({
  graphql: vi.fn(),
}));

describe(graphql, () => {
  it("uses the @graphitation/graphql-js-tag implementation", () => {
    const anotherFragment = {} as any;
    void graphql`some-sdl${anotherFragment}`;
    expect(mockedImplementation).toHaveBeenCalledWith(
      ["some-sdl", ""],
      anotherFragment,
    );
  });
});
