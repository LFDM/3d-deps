import React, { useContext, useMemo } from "react";
import { useQueryParam } from "../hooks/useQueryParam";

export type TabName = "config" | "nodes";

export type UiState = {
  hud: {
    sidebar: {
      tab: TabName;
    };
  };
  graph: {
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
    selectedNodeId: null,
  },
};

type Actions = {
  setSidebarTab: (tab: TabName) => void;
  setSelectedNode: (nodeId: string | null) => void;
};

export const UiStateContext = React.createContext<readonly [UiState, Actions]>([
  DEFAULT_STATE,
  {
    setSidebarTab: () => undefined,
    setSelectedNode: () => undefined,
  },
]);

export const useUiState = () => useContext(UiStateContext);

export const UiStateProvider: React.FC = ({ children }) => {
  const [tab, setTab] = useQueryParam("tab", "nodes");
  const [selectedNodeId, setSelectedNodeId] = useQueryParam("node");

  // TODO optimize so that only what changes really changes. Right now we're
  // blasing the whole object with every change

  const value = useMemo<[UiState, Actions]>(
    () => [
      {
        hud: {
          sidebar: {
            tab: tab as TabName,
          },
        },
        graph: {
          selectedNodeId: selectedNodeId || null,
        },
      },
      {
        setSidebarTab: setTab,
        setSelectedNode: setSelectedNodeId,
      },
    ],
    [tab, selectedNodeId]
  );
  return (
    <UiStateContext.Provider value={value}>{children}</UiStateContext.Provider>
  );
};
