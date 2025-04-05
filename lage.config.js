module.exports = {
  pipeline: {
    prepare: [],
    types: ["^types"],
    build: [],
    test: ["^build", "^types"],
    "@nova/examples#test": [],
    lint: [],
  },
  npmClient: "yarn",
};
