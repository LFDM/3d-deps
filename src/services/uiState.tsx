import React, { useContext, useMemo, useState } from "react";
import { useQueryParam } from "../hooks/useQueryParam";
import { GraphData } from "../types/GraphData";

export type TabName = "config" | "nodes";

export type UiState = {
  hud: {
    sidebar: {
      tab: TabName;
    };
    hotkeyInfo: {
      open: boolean;
    };
    search: {
      open: boolean;
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
    hotkeyInfo: {
      open: false,
    },
    search: {
      open: false,
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
  setHotkeyInfoOpen: (nextState: boolean) => void;
  setSearchOpen: (nextState: boolean) => void;
};

const UiStateContext = React.createContext<readonly [UiState, UiStateActions]>([
  DEFAULT_STATE,
  {
    setSidebarTab: () => undefined,
    setSelectedNodeId: () => undefined,
    setHotkeyInfoOpen: () => undefined,
    setSearchOpen: () => undefined,
  },
]);

export const useUiState = () => useContext(UiStateContext);

export const UiStateProvider: React.FC<{ data: GraphData }> = ({
  data,
  children,
}) => {
  const [tab, setTab] = useQueryParam("tab", "nodes");
  const [selectedNodeId, setSelectedNodeId] = useQueryParam("node");
  const [hotkeyInfoOpen, setHotkeyInfoOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  // TODO optimize so that only what changes really changes. Right now we're
  // blasing the whole object with every change

  const value = useMemo<[UiState, UiStateActions]>(
    () => [
      {
        hud: {
          sidebar: {
            tab: tab as TabName,
          },
          hotkeyInfo: {
            open: hotkeyInfoOpen,
          },
          search: {
            open: searchOpen,
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
        setHotkeyInfoOpen,
        setSearchOpen,
      },
    ],
    [data, tab, selectedNodeId, hotkeyInfoOpen, searchOpen]
  );
  return (
    <UiStateContext.Provider value={value}>{children}</UiStateContext.Provider>
  );
};
