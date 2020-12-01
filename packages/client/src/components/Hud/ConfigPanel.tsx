import { GraphConfig, MAX_GRAPH_HIGHLIGHT_DEPTH, Theme } from "@3d-deps/config";
import { useTheme } from "@emotion/react";
import styled from "@emotion/styled";
import copy from "copy-to-clipboard";
import React, { useState } from "react";
import { Check, CheckCircle, Edit } from "react-feather";
import { useConfig } from "../../services/config";
import { Button } from "../Button";
import { ColorPicker } from "../ColorPicker";
import { ConfigRow } from "../ConfigRow";
import {
  Dialog,
  DialogActions,
  DialogActionsLeftSection,
  DialogActionsRightSection,
} from "../Dialog";
import { Input, InputSliderWithValue } from "../Input";

const Container = styled("div")`
  display: grid;
  grid-template-rows: 1fr min-content;
  grid-row-gap: ${(p) => p.theme.spacing()}px;
  height: 100%;
  grid-template-areas:
    "body"
    "footer";
`;

const SubSection = styled("div")((p) => ({
  marginBottom: p.theme.spacing(2),
}));

const ConfigInput = styled(Input)((p) => ({
  textAlign: "right",
  border: "none",
  color: p.theme.hud.color,
  backgroundColor: p.theme.hud.backgroundColor,
  fontFamily: "monospace",
}));

const InputWithConfirm = ({
  id,
  value,
  onConfirm,
}: {
  id: string;
  value: string;
  onConfirm: (nextValue: string) => void;
}) => {
  const originalValue = value;
  const [v, setV] = useState(originalValue);
  const theme = useTheme();
  return (
    <ConfigRow
      dense
      as="form"
      onSubmit={(ev) => {
        ev.stopPropagation();
        ev.preventDefault();
        onConfirm(v);
      }}
    >
      <ConfigInput
        value={v}
        onChange={(ev) => setV(ev.target.value)}
        blurOnEscape
        id={id}
      />
      <Button variant="icon" disabled={v === originalValue} type="submit">
        {v === originalValue ? (
          <Check size={14} />
        ) : (
          <CheckCircle size={14} color={theme.hud.primaryColor} />
        )}
      </Button>
    </ConfigRow>
  );
};

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
    <section>
      <h3>Theme</h3>
      <SubSection>
        <h4>General</h4>
        <ConfigRow padding>
          <label htmlFor="theme-typography-font">Font</label>
          <InputWithConfirm
            id="theme-typography-font"
            value={value.typography.font}
            onConfirm={(nextFont) =>
              onChange({
                ...value,
                typography: {
                  ...value.typography,
                  font: nextFont,
                },
              })
            }
          />
        </ConfigRow>
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
          label="Primary Color"
          value={value.hud.primaryColor}
          defaultValue={originalValue.hud.primaryColor}
          onChange={(nextColor) =>
            onChange({
              ...value,
              hud: {
                ...value.hud,
                primaryColor: nextColor,
              },
            })
          }
        />
        <ColorPicker
          label="Secondary Color"
          value={value.hud.secondaryColor}
          defaultValue={originalValue.hud.secondaryColor}
          onChange={(nextColor) =>
            onChange({
              ...value,
              hud: {
                ...value.hud,
                secondaryColor: nextColor,
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

        <ConfigRow padding>
          <label htmlFor="theme-hud-opacity">Opacity</label>
          <InputSliderWithValue
            id="theme-hud-opacity"
            min={20}
            max={100}
            value={value.hud.opacity * 100}
            displayValue={value.hud.opacity}
            blurOnEscape
            onChange={(ev) =>
              onChange({
                ...value,
                hud: {
                  ...value.hud,
                  opacity: parseInt(ev.target.value, 10) / 100,
                },
              })
            }
          />
        </ConfigRow>
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
    </section>
  );
};

const CustomInput = styled(Input)((p) => {
  return {
    fontSize: "1.33em",
    color: p.theme.hud.color,
    backgroundColor: p.theme.hud.backgroundColor,
    padding: `${p.theme.spacing(2)}px 0`,
    border: "none",
    outline: "none",

    ":focus": {
      border: "none",
      outline: "none",
    },
  };
});

const RegexpValue = styled("code")`
  text-overflow: ellipsis;
  overflow: hidden;
  font-size: smaller;
`;

const RegExpRow = ({
  value,
  onConfirm,
}: {
  value: RegExp | null;
  onConfirm: (nextValue: RegExp | null) => void;
}) => {
  const originalValue = value ? value.toString().slice(1, -1) : "";
  const [dialogOpen, setDialogOpen] = useState(false);
  const [v, setV] = useState(originalValue);
  return (
    <>
      <ConfigRow padding>
        <RegexpValue>{`${value?.toString()}`}</RegexpValue>
        <Button variant="icon" onClick={() => setDialogOpen(true)}>
          <Edit size={14} />
        </Button>
      </ConfigRow>
      <Dialog
        key={originalValue}
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        width={900}
      >
        <form
          onSubmit={(ev) => {
            ev.stopPropagation();
            ev.preventDefault();
            if (v === originalValue) {
              return;
            }
            onConfirm(v ? new RegExp(v) : null);
            setDialogOpen(false);
          }}
        >
          <CustomInput
            fullWidth
            value={v}
            onChange={(ev) => setV(ev.target.value)}
            autoFocus
          />
          <DialogActions>
            <DialogActionsLeftSection>
              <Button variant="standard" onClick={() => setV(originalValue)}>
                Reset
              </Button>
            </DialogActionsLeftSection>
            <DialogActionsRightSection>
              <Button
                variant="standard"
                onClick={() => {
                  setDialogOpen(false);
                }}
              >
                Cancel
              </Button>
              <Button variant="outlined" type="submit">
                Update
              </Button>
            </DialogActionsRightSection>
          </DialogActions>
        </form>
      </Dialog>
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
    <section>
      <h3>Graph</h3>
      <SubSection>
        <h4>Include by path</h4>
        <RegExpRow
          value={value.includeByPath || null}
          onConfirm={(includeByPath) =>
            onChange({
              ...value,
              includeByPath,
            })
          }
        />
        <h4>Exclude by path</h4>
        <RegExpRow
          value={value.excludeByPath || null}
          onConfirm={(excludeByPath) =>
            onChange({
              ...value,
              excludeByPath,
            })
          }
        />
      </SubSection>
      <SubSection>
        <h4>Dependencies</h4>
        <ConfigRow padding>
          <label htmlFor="graph-dependencies-max-depth">Max Depth</label>
          <InputSliderWithValue
            id="graph-dependencies-max-depth"
            min={0}
            max={MAX_GRAPH_HIGHLIGHT_DEPTH}
            value={value.dependencies.maxDepth}
            blurOnEscape
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
        <ConfigRow padding>
          <label htmlFor="graph-dependents-max-depth">Max Depth</label>
          <InputSliderWithValue
            id="graph-dependents-max-depth"
            min={0}
            max={MAX_GRAPH_HIGHLIGHT_DEPTH}
            value={value.dependents.maxDepth}
            blurOnEscape
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
    </section>
  );
};

const ControlsGrid = styled("div")((p) => ({
  display: "grid",
  gridTemplateColumns: "repeat(2, 1fr)",
  gridColumnGap: p.theme.spacing(3),
}));

const FooterContainer = styled("footer")`
  grid-area: footer;
  padding: ${(p) => p.theme.spacing(2)}px;
  border-top: 1px dashed currentcolor;
`;

const Footer = () => {
  const cfg = useConfig();
  return (
    <FooterContainer>
      <ControlsGrid>
        <Button
          fullWidth
          variant="outlined"
          onClick={() => cfg.onChange(cfg.original)}
        >
          Reset all
        </Button>
        <Button
          fullWidth
          variant="outlined"
          onClick={() => {
            const json = JSON.stringify(cfg.current, null, 2);
            console.log(json);
            copy(json, {
              format: "text/plain",
            });
          }}
        >
          Copy to Clipboard
        </Button>
      </ControlsGrid>
    </FooterContainer>
  );
};

const Body = styled("div")`
  overflow: auto;
  padding: 0 ${(p) => p.theme.spacing(2)}px;
  grid-area: "body";

  > :not(:first-child) {
    margin-top: ${(p) => p.theme.spacing(4)}px;
  }
`;

export const ConfigPanel = () => {
  const cfg = useConfig();
  return (
    <Container>
      <Body>
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
      </Body>
      <Footer />
    </Container>
  );
};
