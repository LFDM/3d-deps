import { useTheme } from "@emotion/react";
import { keyBy } from "lodash";
import React, {
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";
import { useQueryParam } from "../hooks/useQueryParam";
import { GraphData, TreeNode } from "../types/GraphData";
import { UndoHistory } from "./undoHistory";

export type TabName = "nodes" | "history" | "config";

export type NodeLabel = {
  key: string;
  color: string;
  active: boolean;
};

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
    history: UndoHistory<string>;
    selectedNodeId: string | null;
    showDetails: boolean;

    labels: { [key: string]: NodeLabel };
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
    history: new UndoHistory(0),
    selectedNodeId: null,
    showDetails: true,
    labels: {},
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
  toggleLabel: (key: string, active: boolean) => void;
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
    toggleLabel: () => undefined,
  },
]);

export const useUiState = () => useContext(UiStateContext);

const useGeneratedLabels = (
  list: TreeNode[],
  labelPalette: string[]
): [
  labels: { [key: string]: NodeLabel },
  toggleLabel: (key: string, active: boolean) => void
] => {
  // approach negatively, as we want everything turned on by default
  const labelKeys = useMemo(() => {
    const set: Set<string> = new Set();
    list.forEach((t) => t.labels.forEach((l) => set.add(l)));
    return [...set];
  }, [list]);
  const [disabled, setDisabled] = useState<{ [key: string]: boolean }>({});
  const toggle = useCallback(
    (key: string, active: boolean) =>
      setDisabled((s) => ({ ...s, [key]: active })),
    []
  );
  const labels = useMemo(() => {
    const ls = labelKeys.map<NodeLabel>((key, i) => ({
      key,
      color: labelPalette[i % labelPalette.length],
      active: !disabled[key],
    }));
    return keyBy(ls, (l) => l.key);
  }, [labelKeys, labelPalette, disabled]);
  return [labels, toggle];
};

export const UiStateProvider: React.FC<{ data: GraphData }> = ({
  data,
  children,
}) => {
  const [tab, setTab] = useQueryParam("tab", "nodes");
  const [selectedNodeId, setSelectedNodeId] = useQueryParam("node");
  const history = useRef(
    new UndoHistory<string>(25, { present: selectedNodeId || undefined })
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

  const theme = useTheme();
  const labelPalette = theme.graph.labels.palette;

  const [labels, toggleLabel] = useGeneratedLabels(data.list, labelPalette);

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
          history: history.current,
          selectedNodeId: selectedNodeId || null,
          showDetails,

          labels,
        },
      },
      {
        setSidebarTab: setTab,
        setSelectedNodeId: (nextSelection) => {
          if (nextSelection) {
            history.current.push(nextSelection);
          }
          setSelectedNodeId(nextSelection);
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
        toggleLabel,
      },
    ],
    [
      data,
      tab,
      selectedNodeId,
      hotkeyInfoOpen,
      searchOpen,
      showDetails,
      labels,
      toggleLabel,
      setSelectedNodeId,
      setTab,
    ]
  );
  return (
    <UiStateContext.Provider value={value}>{children}</UiStateContext.Provider>
  );
};
