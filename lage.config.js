module.exports = {
  pipeline: {
    prepare: [],
    types: ["^types"],
    build: [],
    test: ["^build", "^types"],
    lint: [],
  },
  npmClient: "yarn",
};
