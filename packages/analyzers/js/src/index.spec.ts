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

    it("every link has a node", () => {
      const actual = _madgeTreeToNodes(tree);
      const links = actual
        .map((x) => x.dependsOn)
        .reduce<string[]>((m, s) => m.concat(s), []);
      const nodes = actual.map((a) => a.id);
      for (const link of links) {
        expect(nodes).toContain(link);
      }
    });
  });

  describe("_toNodeModule", () => {
    it("handles scoped modules", () => {
      const actual = _toNodeModule(
        "../node_modules/@emotion/react/types/index.d.ts"
      );
      expect(actual).toEqual("../node_modules/@emotion/react");
    });

    it("handles unscoped modules, leading directly to an index file", () => {
      const actual = _toNodeModule("../node_modules/assert-never/index.d.ts");
      expect(actual).toEqual("../node_modules/assert-never");
    });

    it("handles unscoped modules, leading to a file within", () => {
      const actual = _toNodeModule(
        "../node_modules/react-feather/dist/index.d.ts"
      );
      expect(actual).toEqual("../node_modules/react-feather");
    });

    it("handles @types", () => {
      const actual = _toNodeModule("../node_modules/@types/react/index.d.ts");
      expect(actual).toEqual("../node_modules/react");
    });

    it("returns null for a random file called node_modules", () => {
      const actual = _toNodeModule("xxx/node_modules.ts");
      expect(actual).toEqual(null);
    });

    it("returns null when not a node module", () => {
      const actual = _toNodeModule("hooks/useWindowSize.ts");
      expect(actual).toBe(null);
    });
  });
});
