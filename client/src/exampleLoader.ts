import { JsonFileAnalyzer } from "./analyzers/jsonFile";
import { Dataset } from "./services/dataset";
import { CONFIG } from "./types/Config";

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
