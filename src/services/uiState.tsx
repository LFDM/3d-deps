import React, { useContext, useMemo, useRef, useState } from "react";
import { useQueryParam } from "../hooks/useQueryParam";
import { GraphData } from "../types/GraphData";
import { UndoHistory } from "./undoHistory";

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
  selectionHistoryMove: (steps: number) => void;
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
    selectionHistoryMove: () => undefined,
  },
]);

export const useUiState = () => useContext(UiStateContext);

export const UiStateProvider: React.FC<{ data: GraphData }> = ({
  data,
  children,
}) => {
  const [tab, setTab] = useQueryParam("tab", "nodes");
  const [selectedNodeId, setSelectedNodeId] = useQueryParam("node");
  const history = useRef(
    new UndoHistory<string>(15, { present: selectedNodeId || undefined })
  );
  const [{ hotkeyInfoOpen, searchOpen, showDetails }, setState] = useState<{
    hotkeyInfoOpen: boolean;
    searchOpen: boolean;
    showDetails: boolean;
  }>({
    hotkeyInfoOpen: false,
    searchOpen: false,
    showDetails: false,
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
          if (nextSelection) {
            history.current.push(nextSelection);
          }
        },
        toggleSelectedNodeId: () => {
          const { present } = history.current.getHistory();
          if (!selectedNodeId && present) {
            setSelectedNodeId(present);
          }
          if (selectedNodeId) {
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
        selectionHistoryMove: (steps: number) => {
          const nextSel = history.current.move(steps);
          if (nextSel) {
            setSelectedNodeId(nextSel);
          }
        },
      },
    ],
    [data, tab, selectedNodeId, hotkeyInfoOpen, searchOpen, showDetails]
  );
  return (
    <UiStateContext.Provider value={value}>{children}</UiStateContext.Provider>
  );
};
