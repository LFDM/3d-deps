import { CONFIG, Dataset } from "@3d-deps/core";
import { ThemeProvider } from "@emotion/react";
import React from "react";
import { BrowserRouter as Router, Route } from "react-router-dom";
import { InitCanvas } from "./components/InitCanvas";
import { usePromise } from "./hooks/usePromise";
import { PageBrowser } from "./pages/Browser";
import { PageMain } from "./pages/Main";
import { DatasetsProvider } from "./services/dataset";

const PAGES: { path: string; render: () => React.ReactNode }[] = [
  {
    path: "/browser",
    render: () => <PageBrowser />,
  },
  {
    path: "/",
    render: () => <PageMain />,
  },
];

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
          <DatasetsProvider datasets={datasets}>
            {PAGES.map((p) => (
              <Route key={p.path} path={p.path} exact render={p.render} />
            ))}
          </DatasetsProvider>
        )}
      </Router>
    </ThemeProvider>
  );
}

export default App;
