import { _madgeTreeToNodes, _toNodeModule } from ".";

describe("analyzer-madge", () => {
  describe("_madgeTreeToNodes", () => {
    const tree = {
      "App.tsx": [
        "../node_modules/@emotion/react/types/index.d.ts",
        "../node_modules/@emotion/styled/types/index.d.ts",
        "../node_modules/@types/react-router-dom/index.d.ts",
        "../node_modules/@types/react/index.d.ts",
        "../node_modules/assert-never/index.d.ts",
        "../node_modules/react-feather/dist/index.d.ts",
        "CssBaseline.tsx",
        "components/Graph/index.tsx",
      ],
      "CssBaseline.tsx": ["../node_modules/@emotion/styled/types/index.d.ts"],
      "components/Graph/index.tsx": ["hooks/useWindowSize.ts"],
      "hooks/useWindowSize.ts": [],
    };

    it("", () => {
      const actual = _madgeTreeToNodes(tree);
      console.log(actual);
    });
  });

  describe("_toNodeModule", () => {
    it("handles scoped modules", () => {
      const actual = _toNodeModule(
        "../node_modules/@emotion/react/types/index.d.ts"
      );
      expect(actual).toEqual("node_modules/@emotion/react");
    });

    it("returns null when not a node module", () => {
      const actual = _toNodeModule("hooks/useWindowSize.ts");
      expect(actual).toBe(null);
    });
  });
});
