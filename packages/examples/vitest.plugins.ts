import graphqlLoader from "vite-plugin-graphql-loader";
import commonjs from "vite-plugin-commonjs";
import react from "@vitejs/plugin-react-swc";
import type { Config } from "@swc/plugin-relay";

export const plugins = [
  react({
    plugins: [
      [
        "@swc/plugin-relay",
        {
          rootDir: "./src",
          language: "typescript",
          eagerEsModules: true,
        } satisfies Config,
      ],
    ],
  }),
  graphqlLoader(),
  commonjs(),
];
