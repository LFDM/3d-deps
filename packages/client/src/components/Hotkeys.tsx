import { Hotkey, HotkeyConfig } from "@3d-deps/config";
import { useMemo } from "react";
import { ExtendedKeyMapOptions, GlobalHotKeys } from "react-hotkeys";
import {
  incrementGraphDependenciesMaxDepth,
  incrementGraphDependentsMaxDepth,
  toggleSidebar,
  useConfig,
} from "../services/config";
import { TabName, useUiState } from "../services/uiState";

type KeyMap = {
  [K in Hotkey]: Omit<ExtendedKeyMapOptions, "sequence">; // erroneous type definition
};

type KeyHandlers = {
  [K in Hotkey]: (ev?: KeyboardEvent) => void;
};

const toSequence = (
  hotkeys: HotkeyConfig,
  key: Hotkey
): Omit<ExtendedKeyMapOptions, "sequence"> => {
  return {
    name: key,
    sequences: hotkeys[key],
    action: "keydown",
  };
};

// eslint-disable-next-line
const ALL_HOTKEYS: Hotkey[] = [
  "hud.sidebar.toggle",
  "hud.sidebar.openNodesPanel",
  "hud.sidebar.openHistoryPanel",
  "hud.sidebar.openConfigPanel",
  "hud.search",
  "hud.hotkeyInfo",
  "graph.dependencies.maxDepth.increase",
  "graph.dependencies.maxDepth.decrease",
  "graph.dependents.maxDepth.increase",
  "graph.dependents.maxDepth.decrease",
  "graph.selectedNode.exclude",
  "graph.selectedNode.toggleDetails",
  "graph.selectedNode.toggleSelection",
];

const toKeyMap = (hs: HotkeyConfig): KeyMap => {
  return {
    "hud.sidebar.toggle": toSequence(hs, "hud.sidebar.toggle"),
    "hud.sidebar.openNodesPanel": toSequence(hs, "hud.sidebar.openNodesPanel"),
    "hud.sidebar.openHistoryPanel": toSequence(
      hs,
      "hud.sidebar.openHistoryPanel"
    ),
    "hud.sidebar.openConfigPanel": toSequence(
      hs,
      "hud.sidebar.openConfigPanel"
    ),
    "hud.search": toSequence(hs, "hud.search"),
    "hud.hotkeyInfo": toSequence(hs, "hud.hotkeyInfo"),
    "graph.dependencies.maxDepth.increase": toSequence(
      hs,
      "graph.dependencies.maxDepth.increase"
    ),
    "graph.dependencies.maxDepth.decrease": toSequence(
      hs,
      "graph.dependencies.maxDepth.decrease"
    ),
    "graph.dependents.maxDepth.increase": toSequence(
      hs,
      "graph.dependents.maxDepth.increase"
    ),
    "graph.dependents.maxDepth.decrease": toSequence(
      hs,
      "graph.dependents.maxDepth.decrease"
    ),
    "graph.selectedNode.exclude": toSequence(hs, "graph.selectedNode.exclude"),
    "graph.selectedNode.toggleDetails": toSequence(
      hs,
      "graph.selectedNode.toggleDetails"
    ),
    "graph.selectedNode.toggleSelection": toSequence(
      hs,
      "graph.selectedNode.toggleSelection"
    ),
    "graph.selectedNode.history.backward": toSequence(
      hs,
      "graph.selectedNode.history.backward"
    ),
    "graph.selectedNode.history.forward": toSequence(
      hs,
      "graph.selectedNode.history.forward"
    ),
  };
};

const NOOP = (ev?: KeyboardEvent) => console.log(ev?.key);

export const Hotkeys = () => {
  const as = useUiState()[1];
  const cfg = useConfig();
  const {
    current: { hotkeys },
  } = cfg;
  const keyMap = useMemo<KeyMap>(() => toKeyMap(hotkeys), [hotkeys]);
  const handlers = useMemo<KeyHandlers>(() => {
    const { current, onChange } = cfg;
    const openSideBarTab = (t: TabName) => {
      toggleSidebar(current, onChange, true);
      as.setSidebarTab(t);
    };
    return {
      "hud.sidebar.toggle": () => toggleSidebar(current, onChange),
      "hud.sidebar.openNodesPanel": () => openSideBarTab("nodes"),
      "hud.sidebar.openHistoryPanel": () => openSideBarTab("history"),
      "hud.sidebar.openConfigPanel": () => openSideBarTab("config"),
      "hud.search": () => as.setSearchOpen(true),
      "hud.hotkeyInfo": () => as.setHotkeyInfoOpen(true),
      "graph.dependencies.maxDepth.increase": () =>
        incrementGraphDependenciesMaxDepth(current, onChange, 1),
      "graph.dependencies.maxDepth.decrease": () =>
        incrementGraphDependenciesMaxDepth(current, onChange, -1),
      "graph.dependents.maxDepth.increase": () =>
        incrementGraphDependentsMaxDepth(current, onChange, 1),
      "graph.dependents.maxDepth.decrease": () =>
        incrementGraphDependentsMaxDepth(current, onChange, -1),
      "graph.selectedNode.exclude": NOOP,
      "graph.selectedNode.toggleDetails": () => as.toggleDetails(),
      "graph.selectedNode.toggleSelection": () => as.toggleSelectedNodeId(),
      "graph.selectedNode.history.backward": () => as.selectionHistoryMove(-1),
      "graph.selectedNode.history.forward": () => as.selectionHistoryMove(1),
    };
  }, [cfg, as]);

  return (
    <GlobalHotKeys
      keyMap={keyMap as any}
      handlers={handlers}
      allowChanges={true}
    />
  );
};
