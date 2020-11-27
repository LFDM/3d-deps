import { useTheme } from "@emotion/react";
import styled from "@emotion/styled";
import React from "react";
import { useConfig } from "../../hooks/useConfig";
import { Config } from "../../types/Config";
import { ColorPicker } from "../ColorPicker";

const Section = styled("div")((p) => ({
  marginBottom: p.theme.spacing(2),
}));

export const ConfigPanel = ({
  onChangeConfig: onChangeConfig,
}: {
  onChangeConfig: (nextConfig: Config) => void;
}) => {
  const theme = useTheme();
  const originalTheme = useConfig().theme;
  return (
    <>
      <Section>
        <h4>General</h4>
        <ColorPicker
          label="Color"
          value={theme.typography.color}
          defaultValue={originalTheme.typography.color}
          onChange={(nextColor) =>
            onChangeConfig({
              ...theme,
              typography: {
                ...theme.typography,
                color: nextColor,
              },
            })
          }
        />
        <ColorPicker
          label="Bg Color"
          value={theme.typography.backgroundColor}
          defaultValue={originalTheme.typography.backgroundColor}
          onChange={(nextColor) =>
            onChangeConfig({
              ...theme,
              typography: {
                ...theme.typography,
                backgroundColor: nextColor,
              },
            })
          }
        />
      </Section>
      <Section>
        <h4>HUD</h4>
        <ColorPicker
          label="Color"
          value={theme.hud.color}
          defaultValue={originalTheme.hud.color}
          onChange={(nextColor) =>
            onChangeConfig({
              ...theme,
              hud: {
                ...theme.hud,
                color: nextColor,
              },
            })
          }
        />
        <ColorPicker
          label="Highlight Color"
          value={theme.hud.highlightColor}
          defaultValue={originalTheme.hud.highlightColor}
          onChange={(nextColor) =>
            onChangeConfig({
              ...theme,
              hud: {
                ...theme.hud,
                highlightColor: nextColor,
              },
            })
          }
        />
        <ColorPicker
          label="Bg Color"
          value={theme.hud.backgroundColor}
          defaultValue={originalTheme.hud.backgroundColor}
          onChange={(nextColor) =>
            onChangeConfig({
              ...theme,
              hud: {
                ...theme.hud,
                backgroundColor: nextColor,
              },
            })
          }
        />
      </Section>
      <Section>
        <h4>Graph Nodes</h4>
        <ColorPicker
          label="Standard"
          value={theme.graph.nodes.colors.standard}
          defaultValue={originalTheme.graph.nodes.colors.standard}
          onChange={(nextColor) =>
            onChangeConfig({
              ...theme,
              graph: {
                ...theme.graph,
                nodes: {
                  ...theme.graph.nodes,
                  colors: {
                    ...theme.graph.nodes.colors,
                    standard: nextColor,
                  },
                },
              },
            })
          }
        />
        <ColorPicker
          label="Selected"
          value={theme.graph.nodes.colors.selected}
          defaultValue={originalTheme.graph.nodes.colors.selected}
          onChange={(nextColor) =>
            onChangeConfig({
              ...theme,
              graph: {
                ...theme.graph,
                nodes: {
                  ...theme.graph.nodes,
                  colors: {
                    ...theme.graph.nodes.colors,
                    selected: nextColor,
                  },
                },
              },
            })
          }
        />
        <ColorPicker
          label="Unselected"
          value={theme.graph.nodes.colors.unselected}
          defaultValue={originalTheme.graph.nodes.colors.unselected}
          onChange={(nextColor) =>
            onChangeConfig({
              ...theme,
              graph: {
                ...theme.graph,
                nodes: {
                  ...theme.graph.nodes,
                  colors: {
                    ...theme.graph.nodes.colors,
                    unselected: nextColor,
                  },
                },
              },
            })
          }
        />
        <ColorPicker
          label="Dependency"
          value={theme.graph.nodes.colors.dependency}
          defaultValue={originalTheme.graph.nodes.colors.dependency}
          onChange={(nextColor) =>
            onChangeConfig({
              ...theme,
              graph: {
                ...theme.graph,
                nodes: {
                  ...theme.graph.nodes,
                  colors: {
                    ...theme.graph.nodes.colors,
                    dependency: nextColor,
                  },
                },
              },
            })
          }
        />
        <ColorPicker
          label="Dependent"
          value={theme.graph.nodes.colors.dependent}
          defaultValue={originalTheme.graph.nodes.colors.dependent}
          onChange={(nextColor) =>
            onChangeConfig({
              ...theme,
              graph: {
                ...theme.graph,
                nodes: {
                  ...theme.graph.nodes,
                  colors: {
                    ...theme.graph.nodes.colors,
                    dependent: nextColor,
                  },
                },
              },
            })
          }
        />
      </Section>
      <Section>
        <h4>Graph Links</h4>
        <ColorPicker
          label="Standard"
          value={theme.graph.links.colors.standard}
          defaultValue={originalTheme.graph.links.colors.standard}
          onChange={(nextColor) =>
            onChangeConfig({
              ...theme,
              graph: {
                ...theme.graph,
                links: {
                  ...theme.graph.links,
                  colors: {
                    ...theme.graph.links.colors,
                    standard: nextColor,
                  },
                },
              },
            })
          }
        />
        <ColorPicker
          label="Unselected"
          value={theme.graph.links.colors.unselected}
          defaultValue={originalTheme.graph.links.colors.unselected}
          onChange={(nextColor) =>
            onChangeConfig({
              ...theme,
              graph: {
                ...theme.graph,
                links: {
                  ...theme.graph.links,
                  colors: {
                    ...theme.graph.links.colors,
                    unselected: nextColor,
                  },
                },
              },
            })
          }
        />
        <ColorPicker
          label="Dependency"
          value={theme.graph.links.colors.dependency}
          defaultValue={originalTheme.graph.links.colors.dependency}
          onChange={(nextColor) =>
            onChangeConfig({
              ...theme,
              graph: {
                ...theme.graph,
                links: {
                  ...theme.graph.links,
                  colors: {
                    ...theme.graph.links.colors,
                    dependency: nextColor,
                  },
                },
              },
            })
          }
        />
        <ColorPicker
          label="Dependent"
          value={theme.graph.links.colors.dependent}
          defaultValue={originalTheme.graph.links.colors.dependent}
          onChange={(nextColor) =>
            onChangeConfig({
              ...theme,
              graph: {
                ...theme.graph,
                links: {
                  ...theme.graph.links,
                  colors: {
                    ...theme.graph.links.colors,
                    dependent: nextColor,
                  },
                },
              },
            })
          }
        />
      </Section>
    </>
  );
};
