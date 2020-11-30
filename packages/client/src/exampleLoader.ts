import { CONFIG } from "@3d-deps/config";
import { JsonFileAnalyzer } from "./analyzers/jsonFile";
import { Dataset } from "./services/dataset";

const toDataset = (key: string): Dataset => ({
  name: key,
  fetch: async () => ({
    config: CONFIG,
    data: await new JsonFileAnalyzer({ key }).analyze(),
  }),
});

export const loadDatasets: () => Promise<Dataset[]> = async () => [
  toDataset("Affilimate CFs"),
  toDataset("Affilimate CLI"),
  toDataset("Affilimate App"),
  toDataset("Syndexioi App"),
  toDataset("Syndexioi CFs"),
  toDataset("Self"),
  toDataset("Material UI"),
];
