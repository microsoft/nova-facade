import relayPlugin from "vite-plugin-relay";
import graphqlLoader from "vite-plugin-graphql-loader";
import commonjs from "vite-plugin-commonjs";

export const plugins = [relayPlugin, graphqlLoader(), commonjs()];
