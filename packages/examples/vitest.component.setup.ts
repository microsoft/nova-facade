import { configure } from "vitest-browser-react/pure";

configure({
  reactStrictMode: true,
});

window.global = globalThis;
