const fs = require("node:fs");
const path = require("node:path");
const { spawnSync } = require("node:child_process");

const repositoryRoot = path.resolve(__dirname, "../..");
const packagesDirectory = path.join(repositoryRoot, "packages");

function collectDeclarationPaths(value, key, declarationPaths) {
  if (key === "types" && typeof value === "string") {
    declarationPaths.add(value.replace(/^\.\//, ""));
    return;
  }

  if (value && typeof value === "object") {
    for (const [childKey, childValue] of Object.entries(value)) {
      collectDeclarationPaths(childValue, childKey, declarationPaths);
    }
  }
}

function getPackedFiles(packageDirectory) {
  if (!process.env.npm_execpath) {
    throw new Error("Run this validation through Yarn.");
  }

  const result = spawnSync(
    process.env.npm_execpath,
    ["pack", "--dry-run", "--json"],
    {
      cwd: packageDirectory,
      encoding: "utf8",
      shell: process.platform === "win32",
    },
  );

  if (result.status !== 0) {
    throw new Error(result.stderr || result.stdout);
  }

  return new Set(
    result.stdout
      .trim()
      .split("\n")
      .map((line) => JSON.parse(line))
      .filter(({ location }) => location)
      .map(({ location }) => location),
  );
}

const failures = [];
const packageDirectories = fs
  .readdirSync(packagesDirectory, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => path.join(packagesDirectory, entry.name));

for (const packageDirectory of packageDirectories) {
  const packageJsonPath = path.join(packageDirectory, "package.json");
  if (!fs.existsSync(packageJsonPath)) {
    continue;
  }

  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
  if (packageJson.private || !packageJson.publishConfig) {
    continue;
  }

  const declarationPaths = new Set();
  collectDeclarationPaths(
    packageJson.publishConfig,
    undefined,
    declarationPaths,
  );

  if (declarationPaths.size === 0) {
    continue;
  }

  const packedFiles = getPackedFiles(packageDirectory);
  const missingDeclarations = [...declarationPaths].filter(
    (declarationPath) => !packedFiles.has(declarationPath),
  );

  if (missingDeclarations.length > 0) {
    failures.push(
      `${packageJson.name}: missing ${missingDeclarations.join(", ")}`,
    );
  } else {
    console.log(
      `${packageJson.name}: verified ${declarationPaths.size} declaration file(s)`,
    );
  }
}

if (failures.length > 0) {
  console.error(
    `Publishable package declaration validation failed:\n${failures
      .map((failure) => `- ${failure}`)
      .join("\n")}`,
  );
  process.exitCode = 1;
}
