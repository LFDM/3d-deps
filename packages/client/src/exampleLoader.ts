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
        excludeByPath: /(^node_modules)/,
      },
    },
    data: await new JsonFileAnalyzer({ key }).analyze(),
  }),
});

export const loadDatasets: () => Promise<Dataset[]> = async () =>
  Object.keys(FILES).map(toDataset);
