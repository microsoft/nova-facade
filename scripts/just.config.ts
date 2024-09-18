import type { EsbuildBuildOptions } from "just-scripts";
import {
  tscTask,
  esbuildTask,
  jestTask,
  eslintTask,
  argv,
  parallel,
} from "just-scripts";
import * as path from "path";
import * as fs from "fs";
import * as glob from "fast-glob";

export const types = tscTask({ emitDeclarationOnly: true });

export const build = () => {
  const baseEsbuildOptions: EsbuildBuildOptions = {
    entryPoints: glob.sync(["src/**/*.{ts,tsx}", "!src/**/__tests__/**"]),
    outdir: "lib",
    target: "es6",
  };
  return parallel(
    esbuildTask({
      ...baseEsbuildOptions,
      format: "esm",
      bundle: true,
      outExtension: { ".js": ".mjs" },
      plugins: [
        {
          name: "add-mjs",
          setup(build) {
            build.onResolve({ filter: /.*/ }, (args) => {
              if (args.importer) {
                let extPath = args.path;
                if (extPath.startsWith(".")) {
                  const absolutePath = path.resolve(
                    args.importer,
                    "..",
                    extPath,
                  );
                  if (
                    fs.existsSync(absolutePath) &&
                    fs.lstatSync(absolutePath).isDirectory()
                  ) {
                    extPath = extPath + "/index.mjs";
                  } else {
                    extPath = extPath + ".mjs";
                  }
                }
                return {
                  path: extPath,
                  namespace: "magic",
                  external: true,
                };
              }
            });
          },
        },
      ],
    }),
    esbuildTask({
      ...baseEsbuildOptions,
      format: "cjs",
    }),
  );
};

export const test = () => {
  const config = fs.existsSync(path.join(process.cwd(), "jest.config.ts"))
    ? path.join(process.cwd(), "jest.config.ts") // if it exists prioritize using package local config
    : path.join(__dirname, "config", "jest.config.ts");
  return jestTask({
    config,
    watch: argv().watch,
    _: argv()._,
  });
};

export const lint = eslintTask({
  files: [path.join(process.cwd(), "src")],
  extensions: ".ts,.tsx",
  cache: true,
  fix: process.argv.includes("--fix"),
  timing: process.argv.includes("--timing"),
});
