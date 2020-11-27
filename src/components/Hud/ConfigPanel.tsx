import styled from "@emotion/styled";
import React from "react";
import { useConfig } from "../../hooks/useConfig";
import { GraphConfig, Theme } from "../../types/Config";
import { ColorPicker } from "../ColorPicker";
import { ConfigRow } from "../ConfigRow";
import { InputSliderWithValue } from "../Input";

const SubSection = styled("div")((p) => ({
  marginBottom: p.theme.spacing(2),
}));

const ThemeSection = ({
  value,
  originalValue,
  onChange,
}: {
  value: Theme;
  originalValue: Theme;
  onChange: (nextValue: Theme) => void;
}) => {
  return (
    <>
      <h3>Theme</h3>
      <SubSection>
        <h4>General</h4>
        <ColorPicker
          label="Color"
          value={value.typography.color}
          defaultValue={originalValue.typography.color}
          onChange={(nextColor) =>
            onChange({
              ...value,
              typography: {
                ...value.typography,
                color: nextColor,
              },
            })
          }
        />
        <ColorPicker
          label="Bg Color"
          value={value.typography.backgroundColor}
          defaultValue={originalValue.typography.backgroundColor}
          onChange={(nextColor) =>
            onChange({
              ...value,
              typography: {
                ...value.typography,
                backgroundColor: nextColor,
              },
            })
          }
        />
      </SubSection>
      <SubSection>
        <h4>HUD</h4>
        <ColorPicker
          label="Color"
          value={value.hud.color}
          defaultValue={originalValue.hud.color}
          onChange={(nextColor) =>
            onChange({
              ...value,
              hud: {
                ...value.hud,
                color: nextColor,
              },
            })
          }
        />
        <ColorPicker
          label="Highlight Color"
          value={value.hud.highlightColor}
          defaultValue={originalValue.hud.highlightColor}
          onChange={(nextColor) =>
            onChange({
              ...value,
              hud: {
                ...value.hud,
                highlightColor: nextColor,
              },
            })
          }
        />
        <ColorPicker
          label="Bg Color"
          value={value.hud.backgroundColor}
          defaultValue={originalValue.hud.backgroundColor}
          onChange={(nextColor) =>
            onChange({
              ...value,
              hud: {
                ...value.hud,
                backgroundColor: nextColor,
              },
            })
          }
        />
      </SubSection>
      <SubSection>
        <h4>Graph Nodes</h4>
        <ColorPicker
          label="Standard"
          value={value.graph.nodes.colors.standard}
          defaultValue={originalValue.graph.nodes.colors.standard}
          onChange={(nextColor) =>
            onChange({
              ...value,
              graph: {
                ...value.graph,
                nodes: {
                  ...value.graph.nodes,
                  colors: {
                    ...value.graph.nodes.colors,
                    standard: nextColor,
                  },
                },
              },
            })
          }
        />
        <ColorPicker
          label="Selected"
          value={value.graph.nodes.colors.selected}
          defaultValue={originalValue.graph.nodes.colors.selected}
          onChange={(nextColor) =>
            onChange({
              ...value,
              graph: {
                ...value.graph,
                nodes: {
                  ...value.graph.nodes,
                  colors: {
                    ...value.graph.nodes.colors,
                    selected: nextColor,
                  },
                },
              },
            })
          }
        />
        <ColorPicker
          label="Unselected"
          value={value.graph.nodes.colors.unselected}
          defaultValue={originalValue.graph.nodes.colors.unselected}
          onChange={(nextColor) =>
            onChange({
              ...value,
              graph: {
                ...value.graph,
                nodes: {
                  ...value.graph.nodes,
                  colors: {
                    ...value.graph.nodes.colors,
                    unselected: nextColor,
                  },
                },
              },
            })
          }
        />
        <ColorPicker
          label="Dependency"
          value={value.graph.nodes.colors.dependency}
          defaultValue={originalValue.graph.nodes.colors.dependency}
          onChange={(nextColor) =>
            onChange({
              ...value,
              graph: {
                ...value.graph,
                nodes: {
                  ...value.graph.nodes,
                  colors: {
                    ...value.graph.nodes.colors,
                    dependency: nextColor,
                  },
                },
              },
            })
          }
        />
        <ColorPicker
          label="Dependent"
          value={value.graph.nodes.colors.dependent}
          defaultValue={originalValue.graph.nodes.colors.dependent}
          onChange={(nextColor) =>
            onChange({
              ...value,
              graph: {
                ...value.graph,
                nodes: {
                  ...value.graph.nodes,
                  colors: {
                    ...value.graph.nodes.colors,
                    dependent: nextColor,
                  },
                },
              },
            })
          }
        />
      </SubSection>
      <SubSection>
        <h4>Graph Links</h4>
        <ColorPicker
          label="Standard"
          value={value.graph.links.colors.standard}
          defaultValue={originalValue.graph.links.colors.standard}
          onChange={(nextColor) =>
            onChange({
              ...value,
              graph: {
                ...value.graph,
                links: {
                  ...value.graph.links,
                  colors: {
                    ...value.graph.links.colors,
                    standard: nextColor,
                  },
                },
              },
            })
          }
        />
        <ColorPicker
          label="Unselected"
          value={value.graph.links.colors.unselected}
          defaultValue={originalValue.graph.links.colors.unselected}
          onChange={(nextColor) =>
            onChange({
              ...value,
              graph: {
                ...value.graph,
                links: {
                  ...value.graph.links,
                  colors: {
                    ...value.graph.links.colors,
                    unselected: nextColor,
                  },
                },
              },
            })
          }
        />
        <ColorPicker
          label="Dependency"
          value={value.graph.links.colors.dependency}
          defaultValue={originalValue.graph.links.colors.dependency}
          onChange={(nextColor) =>
            onChange({
              ...value,
              graph: {
                ...value.graph,
                links: {
                  ...value.graph.links,
                  colors: {
                    ...value.graph.links.colors,
                    dependency: nextColor,
                  },
                },
              },
            })
          }
        />
        <ColorPicker
          label="Dependent"
          value={value.graph.links.colors.dependent}
          defaultValue={originalValue.graph.links.colors.dependent}
          onChange={(nextColor) =>
            onChange({
              ...value,
              graph: {
                ...value.graph,
                links: {
                  ...value.graph.links,
                  colors: {
                    ...value.graph.links.colors,
                    dependent: nextColor,
                  },
                },
              },
            })
          }
        />
      </SubSection>
    </>
  );
};

const GraphSection = ({
  value,
  originalValue,
  onChange,
}: {
  value: GraphConfig;
  originalValue: GraphConfig;
  onChange: (nextValue: GraphConfig) => void;
}) => {
  return (
    <>
      <h3>Graph</h3>
      <SubSection>
        <h4>Dependencies</h4>
        <ConfigRow>
          <div>Active</div>
          <input
            type="checkbox"
            checked={value.dependencies.active}
            onChange={(ev) =>
              onChange({
                ...value,
                dependencies: {
                  ...value.dependencies,
                  active: ev.target.checked,
                },
              })
            }
          />
        </ConfigRow>
        <ConfigRow>
          <div>Max Depth</div>
          <InputSliderWithValue
            min={1}
            max={10}
            value={value.dependencies.maxDepth}
            onChange={(ev) =>
              onChange({
                ...value,
                dependencies: {
                  ...value.dependencies,
                  maxDepth: parseInt(ev.target.value, 10),
                },
              })
            }
          />
        </ConfigRow>
      </SubSection>
      <SubSection>
        <h4>Dependents</h4>
        <ConfigRow>
          <div>Active</div>
          <input
            type="checkbox"
            checked={value.dependents.active}
            onChange={(ev) =>
              onChange({
                ...value,
                dependents: {
                  ...value.dependents,
                  active: ev.target.checked,
                },
              })
            }
          />
        </ConfigRow>
        <ConfigRow>
          <div>Max Depth</div>
          <InputSliderWithValue
            min={1}
            max={10}
            value={value.dependents.maxDepth}
            onChange={(ev) =>
              onChange({
                ...value,
                dependents: {
                  ...value.dependents,
                  maxDepth: parseInt(ev.target.value, 10),
                },
              })
            }
          />
        </ConfigRow>
      </SubSection>
    </>
  );
};

export const ConfigPanel = () => {
  const cfg = useConfig();
  return (
    <>
      <GraphSection
        value={cfg.current.graph}
        originalValue={cfg.original.graph}
        onChange={(nextGraph) =>
          cfg.onChange({
            ...cfg.current,
            graph: nextGraph,
          })
        }
      />
      <ThemeSection
        value={cfg.current.theme}
        originalValue={cfg.original.theme}
        onChange={(nextTheme) =>
          cfg.onChange({
            ...cfg.current,
            theme: nextTheme,
          })
        }
      />
    </>
  );
};
