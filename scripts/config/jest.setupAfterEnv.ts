import { cleanup } from "@testing-library/react";

afterEach(() => {
  // For some reason needed with strict mode enabled to cleanup DOM after each test
  cleanup();
});
