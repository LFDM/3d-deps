import styled from "@emotion/styled";
import tinycolor from "tinycolor2";
import { useUiState } from "../../services/uiState";
import { NodeStats } from "../NodeStats";

const Row = styled("div")<{ selected?: boolean; excluded?: boolean }>((p) => ({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",

  opacity: p.excluded ? 0.5 : 1,

  cursor: p.excluded ? "default" : "pointer",

  "div:first-of-type": {
    textDecoration: p.excluded ? "line-through" : "none",
  },

  backgroundColor: p.selected ? p.theme.hud.highlightColor : "none",

  ":hover": {
    backgroundColor:
      p.excluded || p.selected
        ? "none"
        : tinycolor(p.theme.hud.highlightColor).lighten(10).toRgbString(),
  },

  "> :not(:first-child)": {
    marginLeft: p.theme.spacing(),
  },
}));

const List = styled("div")((p) => ({
  "> :not(:first-child)": {
    marginTop: p.theme.spacing(),
  },
}));

export const HistoryPanel = ({}: {}) => {
  const [
    {
      graph: { data, history },
    },
  ] = useUiState();
  const { future, present, past } = history.getHistory();
  console.log(history.getHistory());
  const presentT = present && data.byId[present];
  return (
    <List>
      {[...future].reverse().map((id, i) => {
        const t = data.byId[id];
        return (
          t && (
            <Row key={`${id}-${i}`} excluded={t.exclude}>
              <div>{t.label}</div>
              <NodeStats d={t} />
            </Row>
          )
        );
      })}
      {presentT && (
        <Row selected={true} excluded={presentT.exclude}>
          <div>{presentT.label}</div>
          <NodeStats d={presentT} />
        </Row>
      )}

      {[...past].reverse().map((id, i) => {
        const t = data.byId[id];
        return (
          t && (
            <Row key={`${id}-${i}`} excluded={t.exclude}>
              <div>{t.label}</div>
              <NodeStats d={t} />
            </Row>
          )
        );
      })}
      <></>
    </List>
  );
};
