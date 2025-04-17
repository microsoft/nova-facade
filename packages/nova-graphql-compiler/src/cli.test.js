import { spawn } from "cross-spawn";
import { readFile, rm } from "fs/promises";
import { join } from "path/posix";
import { describe, it, expect } from "vitest";


describe("cli", () => {
  it("generates files", async () => {
    // Remove old generated files if they exist
    await rm(join(__dirname, "__fixtures__/src/__generated__"), {
      recursive: true,
      force: true,
    });

    // Run the compiler
    spawn.sync(
      "./src/cli.js",
      [
        "--schema",
        "./src/__fixtures__/schema.graphql",
        "--src",
        "./src/__fixtures__/src",
        "--watchman",
        "false",
      ],
      {
        stdio: "inherit",
      },
    );

    // Read the generated files
    const generatedFiles = await readFile(
      join(
        __dirname,
        "__fixtures__/src/__generated__/Example_feedbackFragment.graphql.ts",
      ),
      "utf8",
    );

    expect(generatedFiles).toMatchSnapshot();
  }, 50000);
});
