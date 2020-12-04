import { CONFIG, Dataset } from "@3d-deps/core";
import { ThemeProvider } from "@emotion/react";
import React from "react";
import { BrowserRouter as Router, Route } from "react-router-dom";
import { InitCanvas } from "./components/InitCanvas";
import { usePromise } from "./hooks/usePromise";
import { PageMain } from "./pages/Main";
import { DatasetProvider } from "./services/dataset";

function App({ loadDatasets }: { loadDatasets: () => Promise<Dataset[]> }) {
  // leave router outside so that we can switch datasets through urls later
  const [datasets, loading, error] = usePromise(loadDatasets);
  if (error) {
    console.error(error);
  }
  return (
    <ThemeProvider theme={CONFIG.theme}>
      <Router>
        {loading && <InitCanvas>Loading datasets...</InitCanvas>}
        {error ||
          (!datasets && <InitCanvas>Failed to load datasets.</InitCanvas>)}
        {datasets && !datasets.length && (
          <InitCanvas>No datasets provided.</InitCanvas>
        )}
        {datasets && datasets.length && (
          <DatasetProvider datasets={datasets}>
            <Route path="/browser" exact>
              <InitCanvas>
                <div> Browser!</div>
              </InitCanvas>
            </Route>
            <Route path="/" exact>
              <PageMain />
            </Route>
          </DatasetProvider>
        )}
      </Router>
    </ThemeProvider>
  );
}

export default App;
