#!/usr/bin/env node

const path = require("path");
const yargs = require("yargs");

const { relayCompiler } = require("relay-compiler");
const graphitationPluginInitializer = require("relay-compiler-language-graphitation");

function main() {
  const argv = yargs
    .scriptName("nova-graphql-compiler")
    .options({
      schema: {
        demandOption: true,
        type: "string",
      },
      src: {
        demandOption: false,
        default: ".",
        type: "string",
      },
      validate: {
        demandOption: false,
        default: false,
        type: "boolean",
      },
      verbose: {
        demandOption: false,
        default: false,
        type: "boolean",
      },
      watch: {
        demandOption: false,
        default: false,
        type: "boolean",
      },
      watchman: {
        demandOption: false,
        default: true,
        type: "boolean",
      },
      quiet: {
        demandOption: false,
        default: false,
        type: "boolean",
      },
      include: {
        array: true,
        demandOption: false,
        default: ["**"],
        type: "string",
      },
      exclude: {
        array: true,
        demandOption: false,
        default: [
          "**/node_modules/**",
          "**/__mocks__/**",
          "**/__generated__/**",
        ],
        type: "string",
      },
    })
    .help().argv;
  return relayCompiler({
    ...argv,
    extensions: ["ts", "tsx"], // FIXME: Why is this not taken from the language plugin?
    noFutureProofEnums: true,
    language: graphitationPluginInitializer,
  });
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
