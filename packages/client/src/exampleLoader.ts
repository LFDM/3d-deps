import { CONFIG } from "@3d-deps/config";
import { FILES, JsonFileAnalyzer } from "./analyzers/jsonFile";
import { Dataset } from "./services/dataset";

const toDataset = (key: string): Dataset => ({
  name: key,
  fetch: async () => ({
    config: {
      ...CONFIG,
      graph: {
        ...CONFIG.graph,
        excludeByPath: /((^|\/)node_modules\/)/,
      },
    },
    data: await new JsonFileAnalyzer({ key }).analyze(),
  }),
});

export const loadDatasets: () => Promise<Dataset[]> = async () => [
  ...Object.keys(FILES).map(toDataset),
  {
    name: "Self (Workspace)",
    fetch: async () => ({
      config: {
        ...CONFIG,
        graph: {
          ...CONFIG.graph,
          excludeByPath: /((^|\/)node_modules\/)/,
        },
      },
      data: {
        nodes: await import(
          "./analyzers/dependencies-self-workspace.json"
        ).then((x) => x.default),
      },
    }),
  },
  {
    name: "React (Workspace)",
    fetch: async () => ({
      config: {
        ...CONFIG,
        graph: {
          ...CONFIG.graph,
          excludeByPath: /((^|\/)node_modules\/)/,
        },
      },
      data: await import("./analyzers/dependencies-react-workspace.json").then(
        (x) => x.default
      ),
    }),
  },
];
