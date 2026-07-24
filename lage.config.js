module.exports = {
  pipeline: {
    prepare: [],
    types: ["prepare", "^types"],
    build: ["prepare"],
    test: ["prepare"],
    lint: ["prepare"],
  },
  npmClient: "yarn",
};
