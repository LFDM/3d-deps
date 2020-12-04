import { InitCanvas } from "../../components/InitCanvas";
import { useDatasets } from "../../services/dataset";

export const PageBrowser = () => {
  const { datasets } = useDatasets();

  return <InitCanvas>{datasets.length}</InitCanvas>;
};
