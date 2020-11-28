import React, { useContext, useMemo } from "react";
import { useQueryParam } from "../hooks/useQueryParam";
import { GraphData } from "../types/GraphData";

export type TabName = "config" | "nodes";

export type UiState = {
  hud: {
    sidebar: {
      tab: TabName;
    };
  };
  graph: {
    data: GraphData;
    selectedNodeId: string | null;
  };
};

const DEFAULT_STATE: UiState = {
  hud: {
    sidebar: {
      tab: "nodes",
    },
  },
  graph: {
    data: { list: [], byId: {} },
    selectedNodeId: null,
  },
};

export type UiStateActions = {
  setSidebarTab: (tab: TabName) => void;
  setSelectedNodeId: (nodeId: string | null) => void;
};

const UiStateContext = React.createContext<readonly [UiState, UiStateActions]>([
  DEFAULT_STATE,
  {
    setSidebarTab: () => undefined,
    setSelectedNodeId: () => undefined,
  },
]);

export const useUiState = () => useContext(UiStateContext);

export const UiStateProvider: React.FC<{ data: GraphData }> = ({
  data,
  children,
}) => {
  const [tab, setTab] = useQueryParam("tab", "nodes");
  const [selectedNodeId, setSelectedNodeId] = useQueryParam("node");

  // TODO optimize so that only what changes really changes. Right now we're
  // blasing the whole object with every change

  const value = useMemo<[UiState, UiStateActions]>(
    () => [
      {
        hud: {
          sidebar: {
            tab: tab as TabName,
          },
        },
        graph: {
          data,
          selectedNodeId: selectedNodeId || null,
        },
      },
      {
        setSidebarTab: setTab,
        setSelectedNodeId,
      },
    ],
    [data, tab, selectedNodeId]
  );
  return (
    <UiStateContext.Provider value={value}>{children}</UiStateContext.Provider>
  );
};
