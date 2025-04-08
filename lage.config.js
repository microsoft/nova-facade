module.exports = {
  pipeline: {
    prepare: [],
    types: ["^types"],
    build: [],
    test: ["^build", "^types"],
    "test:ui": [],
    lint: [],
  },
  npmClient: "yarn",
};
