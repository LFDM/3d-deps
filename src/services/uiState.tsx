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
    unselectedNodeId: string | null;
    showDetails: boolean;
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
    unselectedNodeId: null,
    showDetails: true,
  },
};

export type UiStateActions = {
  setSidebarTab: (tab: TabName) => void;
  setSelectedNodeId: (nodeId: string | null) => void;
  toggleSelectedNodeId: () => void;
  setHotkeyInfoOpen: (nextState: boolean) => void;
  setSearchOpen: (nextState: boolean) => void;
  toggleDetails: (nextState?: boolean) => void;
};

const UiStateContext = React.createContext<readonly [UiState, UiStateActions]>([
  DEFAULT_STATE,
  {
    setSidebarTab: () => undefined,
    setSelectedNodeId: () => undefined,
    toggleSelectedNodeId: () => undefined,
    setHotkeyInfoOpen: () => undefined,
    setSearchOpen: () => undefined,
    toggleDetails: () => undefined,
  },
]);

export const useUiState = () => useContext(UiStateContext);

export const UiStateProvider: React.FC<{ data: GraphData }> = ({
  data,
  children,
}) => {
  const [tab, setTab] = useQueryParam("tab", "nodes");
  const [selectedNodeId, setSelectedNodeId] = useQueryParam("node");
  const [
    { hotkeyInfoOpen, searchOpen, showDetails, unselectedNodeId },
    setState,
  ] = useState<{
    hotkeyInfoOpen: boolean;
    searchOpen: boolean;
    showDetails: boolean;
    unselectedNodeId: string | null;
  }>({
    hotkeyInfoOpen: false,
    searchOpen: false,
    showDetails: false,
    unselectedNodeId: null,
  });

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
          unselectedNodeId: unselectedNodeId || null,
          showDetails,
        },
      },
      {
        setSidebarTab: setTab,
        setSelectedNodeId: (nextSelection) => {
          setState((s) => ({
            ...s,
            unselectedNodeId: nextSelection ? null : selectedNodeId,
          }));
          setSelectedNodeId(nextSelection);
        },
        toggleSelectedNodeId: () => {
          if (!selectedNodeId && unselectedNodeId) {
            setSelectedNodeId(unselectedNodeId);
          }
          if (selectedNodeId) {
            setState((s) => ({
              ...s,
              unselectedNodeId: selectedNodeId,
            }));
            setSelectedNodeId(null);
          }
        },
        setHotkeyInfoOpen: (next) =>
          setState((s) => ({
            ...s,
            hotkeyInfoOpen: next,
          })),
        setSearchOpen: (next) =>
          setState((s) => ({
            ...s,
            searchOpen: next,
          })),
        toggleDetails: (nextState = !showDetails) =>
          setState((s) => ({
            ...s,
            showDetails: nextState,
          })),
      },
    ],
    [
      data,
      tab,
      selectedNodeId,
      unselectedNodeId,
      hotkeyInfoOpen,
      searchOpen,
      showDetails,
    ]
  );
  return (
    <UiStateContext.Provider value={value}>{children}</UiStateContext.Provider>
  );
};
