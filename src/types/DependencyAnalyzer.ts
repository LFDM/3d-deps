import { GraphData } from "./GraphData";

export interface IDependencyAnalyzer {
  analyze: () => Promise<GraphData>;
}
