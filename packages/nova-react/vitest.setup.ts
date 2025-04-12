import { configure } from "vitest-browser-react/pure";

window.global = globalThis;

configure({
  reactStrictMode: true,
});
