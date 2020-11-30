const { CONFIG } = require("@3d-deps/config");

module.exports.version = 1;
module.exports.loadDatasets = async () => {
  return [
    {
      name: "3d-deps server",
      fetch: async () => {
        return {
          config: CONFIG,
          data: [],
        };
      },
    },
    {
      name: "3d-deps client",
      fetch: async () => {
        return {
          config: CONFIG,
          data: [],
        };
      },
    },
  ];
};
