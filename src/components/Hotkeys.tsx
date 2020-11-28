import { useMemo } from "react";
import { ExtendedKeyMapOptions, GlobalHotKeys } from "react-hotkeys";
import {
  incrementGraphDependenciesMaxDepth,
  incrementGraphDependentsMaxDepth,
  toggleSidebar,
  useConfig,
} from "../services/config";
import { useUiState } from "../services/uiState";
import { Hotkey, HotkeyConfig } from "../types/Config";

type KeyMap = {
  [K in Hotkey]: Omit<ExtendedKeyMapOptions, "sequence">; // erroneous type definition
};

type KeyHandlers = {
  [K in Hotkey]: (ev?: KeyboardEvent) => void;
};

const toKeyMap = (hotkeys: HotkeyConfig): KeyMap => {
  return {
    "hud.sidebar.toggle": {
      name: "hud.sidebar.toggle",
      sequences: hotkeys["hud.sidebar.toggle"],
      action: "keydown",
    },
    "hud.sidebar.openNodesPanel": {
      name: "hud.sidebar.openNodesPanel",
      sequences: hotkeys["hud.sidebar.openNodesPanel"],
      action: "keydown",
    },
    "hud.sidebar.openConfigPanel": {
      name: "hud.sidebar.openConfigPanel",
      sequences: hotkeys["hud.sidebar.openConfigPanel"],
      action: "keydown",
    },
    "hud.search": {
      name: "hud.search",
      sequences: hotkeys["hud.search"],
      action: "keydown",
    },
    "hud.toggleHotkeyInfo": {
      name: "hud.toggleHotkeyInfo",
      sequences: hotkeys["hud.toggleHotkeyInfo"],
      action: "keydown",
    },
    "graph.dependencies.maxDepth.increase": {
      name: "graph.dependencies.maxDepth.increase",
      sequences: hotkeys["graph.dependencies.maxDepth.increase"],
      action: "keydown",
    },
    "graph.dependencies.maxDepth.decrease": {
      name: "graph.dependencies.maxDepth.decrease",
      sequences: hotkeys["graph.dependencies.maxDepth.decrease"],
      action: "keydown",
    },
    "graph.dependents.maxDepth.increase": {
      name: "graph.dependents.maxDepth.increase",
      sequences: hotkeys["graph.dependents.maxDepth.increase"],
      action: "keydown",
    },
    "graph.dependents.maxDepth.decrease": {
      name: "graph.dependents.maxDepth.decrease",
      sequences: hotkeys["graph.dependents.maxDepth.decrease"],
      action: "keydown",
    },
    "graph.selectedNode.exclude": {
      name: "graph.selectedNode.exclude",
      sequences: hotkeys["graph.selectedNode.exclude"],
      action: "keydown",
    },
    "graph.selectedNode.toggleDetails": {
      name: "graph.selectedNode.toggleDetails",
      sequences: hotkeys["graph.selectedNode.toggleDetails"],
      action: "keydown",
    },
  };
};

const NOOP = (ev?: KeyboardEvent) => console.log(ev?.key);

export const Hotkeys = () => {
  const [state, { setSidebarTab, setSearchOpen }] = useUiState();
  const cfg = useConfig();
  const {
    current: { hotkeys },
  } = cfg;
  const keyMap = useMemo<KeyMap>(() => toKeyMap(hotkeys), [hotkeys]);
  const handlers = useMemo<KeyHandlers>(() => {
    const { current, onChange } = cfg;
    return {
      "hud.sidebar.toggle": () => toggleSidebar(current, onChange),
      "hud.sidebar.openNodesPanel": () => {
        toggleSidebar(current, onChange, true);
        setSidebarTab("nodes");
      },
      "hud.sidebar.openConfigPanel": () => {
        toggleSidebar(current, onChange, true);
        setSidebarTab("config");
      },
      "hud.search": () => setSearchOpen(true),
      "hud.toggleHotkeyInfo": NOOP,
      "graph.dependencies.maxDepth.increase": () =>
        incrementGraphDependenciesMaxDepth(current, onChange, 1),
      "graph.dependencies.maxDepth.decrease": () =>
        incrementGraphDependenciesMaxDepth(current, onChange, -1),
      "graph.dependents.maxDepth.increase": () =>
        incrementGraphDependentsMaxDepth(current, onChange, 1),
      "graph.dependents.maxDepth.decrease": () =>
        incrementGraphDependentsMaxDepth(current, onChange, -1),
      "graph.selectedNode.exclude": NOOP,
      "graph.selectedNode.toggleDetails": NOOP,
    };
  }, [cfg]);

  return (
    <GlobalHotKeys
      keyMap={keyMap as any}
      handlers={handlers}
      allowChanges={true}
    />
  );
};
