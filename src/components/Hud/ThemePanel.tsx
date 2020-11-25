import { Theme, useTheme } from "@emotion/react";
import React from "react";
import { useConfig } from "../../hooks/useConfig";
import { ColorPicker } from "../ColorPicker";

export const ThemePanel = ({
  onChangeTheme,
}: {
  onChangeTheme: (nextTheme: Theme) => void;
}) => {
  const theme = useTheme();
  const originalTheme = useConfig().theme;
  return (
    <>
      <ColorPicker
        label="Color"
        value={theme.typography.color}
        defaultValue={originalTheme.typography.color}
        onChange={(nextColor) =>
          onChangeTheme({
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
          onChangeTheme({
            ...theme,
            typography: {
              ...theme.typography,
              backgroundColor: nextColor,
            },
          })
        }
      />

      <ColorPicker
        label="Dependency"
        value={theme.graph.nodes.colors.dependency}
        defaultValue={originalTheme.graph.nodes.colors.dependency}
        onChange={(nextColor) =>
          onChangeTheme({
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
    </>
  );
};
