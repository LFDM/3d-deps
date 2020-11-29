const CONFIG = {
  theme: {
    typography: {
      font: "400 14px Arial",
      backgroundColor: "#141414",
      color: "#f4f4f4",
    },
    hud: {
      color: "#f4f4f4",
      primaryColor: "#ea6161",
      backgroundColor: "#1e1e1e",
      secondaryColor: "#1c5cc2",
      opacity: 0.75,
    },
    spacing: (multiplier = 1) => multiplier * 8,
    graph: {
      nodes: {
        colors: {
          standard: "#fcf4b0",
          selected: "#A992EE",
          unselected: "#313131", //  "#050505" darker, basically black
          dependency: "#f47560", // #B5503D darker - darker is better. then the color dropoff for indirect nodes could be steeper too
          dependent: "#61cdbb", // #258374 darker
        },
      },
      links: {
        colors: {
          standard: "#d3d3d3",
          dependency: "#f47560",
          dependent: "#61cdbb",
          unselected: "#313131", //  "#050505" darker, basically black
        },
      },
    },
  },
  graph: {
    dependencies: {
      maxDepth: 1,
    },
    dependents: {
      maxDepth: 1,
    },
    includeByPath: null,
    excludeByPath: /(^helpers.ts|^domainTypes|^versions|^services\/firebase)/,
  },
  hud: {
    sidebar: {
      open: true,
    },
    search: {
      showExcludedNodes: true,
    },
  },
  hotkeys: {
    "hud.sidebar.toggle": ["alt+b"],
    "hud.sidebar.openNodesPanel": ["alt+n"],
    "hud.sidebar.openHistoryPanel": ["alt+h"],
    "hud.sidebar.openConfigPanel": ["alt+c"],
    "hud.search": ["/", "f"],
    "hud.hotkeyInfo": ["shift+/"], // ? doesn't seem to work
    "graph.dependencies.maxDepth.increase": ["alt+k", "alt+up"],
    "graph.dependencies.maxDepth.decrease": ["alt+j", "alt+down"],
    "graph.dependents.maxDepth.increase": ["alt+shift+k", "alt+shift+up"],
    "graph.dependents.maxDepth.decrease": ["alt+shift+j", "alt+shift+down"],
    "graph.selectedNode.exclude": ["del"],
    "graph.selectedNode.toggleDetails": ["d"],
    "graph.selectedNode.toggleSelection": ["s"],
    "graph.selectedNode.history.forward": ["j"],
    "graph.selectedNode.history.backward": ["k"],
  },
};

module.exports.version = 1;
module.exports.loadDatasets = async () => {
  return [
    {
      name: "3d-deps server",
      fetch: async () => ({
        config: CONFIG,
        data: [],
      }),
    },
    {
      name: "3d-deps client",
      fetch: async () => ({
        config: CONFIG,
        data: [],
      }),
    },
  ];
};
