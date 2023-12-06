module.exports = {
  pipeline: {
    prepare: [],
    types: ["^types"],
    build: [],
    test: ["build"],
    lint: [],
  },
  npmClient: "yarn",
};
