import { ThemeProvider } from "@emotion/react";
import styled from "@emotion/styled";
import React, { useState } from "react";
import { Graph } from "./components/Graph";
import { Hud } from "./components/Hud";
import { Config } from "./types/Config";
import { DependencyNode } from "./types/DependencyAnalyzer";

const Main = styled("main")((p) => ({
  backgroundColor: p.theme.graph.background.color,
  width: "100vw",
  height: "100vh",
  overflow: "hidden",
}));

function App({ config, ds }: { config: Config; ds: DependencyNode[] }) {
  const [theme, setTheme] = useState(config.theme);
  return (
    <ThemeProvider theme={theme}>
      <Main>
        <Hud onChangeTheme={setTheme} />
        <Graph ds={ds} />
      </Main>
    </ThemeProvider>
  );
}

export default App;
