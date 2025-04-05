module.exports = {
  pipeline: {
    prepare: [],
    types: ["^types"],
    build: [],
    test: ["^build", "^types"],
    "examples#test": [],
    lint: [],
  },
  npmClient: "yarn",
};
