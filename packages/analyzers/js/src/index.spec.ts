import { DependencyNode } from "@3d-deps/analyzer-base";
import * as path from "path";
import { JsAnalyzer, _toNodeModule } from ".";
import { TRANSFORMERS } from "./transformers";

const SPEC_DIR = path.join(__dirname, "..", "spec-pkgs");

describe("analyzer-js", () => {
  describe("JsAnalyzer", () => {
    it("fails when pointing to a directory which does not exists", () => {});

    it("fails when pointing to a dir without a pkg json or an index.ts/js", () => {});

    it("warns when pointing to a dir without pkg.json but a index.js/ts", () => {});

    it("can transform main prop", async () => {
      const a = new JsAnalyzer({
        rootDir: path.join(SPEC_DIR, "pkg-main-transform"), // has dist/index.js as it's main
        configTransformer: TRANSFORMERS.MAP_ENTRY((entry) =>
          entry.replace("dist/index.js", "src/index.ts")
        ),
      });
      const expected = [
        {
          id: "src/index.ts",
          path: "src/index.ts",
          label: "src/index.ts",
          dependsOn: ["src/a.ts", "src/aa.ts"],
        },
        {
          id: "src/a.ts",
          path: "src/a.ts",
          label: "src/a.ts",
          dependsOn: ["src/b.ts"],
        },
        {
          id: "src/b.ts",
          path: "src/b.ts",
          label: "src/b.ts",
          dependsOn: ["src/c.ts"],
        },
        { id: "src/c.ts", path: "src/c.ts", label: "src/c.ts", dependsOn: [] },
        {
          id: "src/aa.ts",
          path: "src/aa.ts",
          label: "src/aa.ts",
          dependsOn: ["src/b.ts"],
        },
      ];
      const deps = await a.analyze();

      expect(deps).toEqual(expected);
    });

    it("can handle bins", async () => {
      const a = new JsAnalyzer({
        rootDir: path.join(SPEC_DIR, "pkg-with-bins"),
      });
      const expected = [
        {
          id: "src/index.js",
          path: "src/index.js",
          label: "src/index.js",
          dependsOn: ["src/stop.js", "src/start.js"],
        },
        {
          id: "src/stop.js",
          path: "src/stop.js",
          label: "src/stop.js",
          dependsOn: [],
        },
        {
          id: "src/start.js",
          path: "src/start.js",
          label: "src/start.js",
          dependsOn: [],
        },
        {
          id: "bin/start.js",
          path: "bin/start.js",
          label: "bin/start.js",
          dependsOn: ["src/start.js"],
        },
        {
          id: "bin/stop.js",
          path: "bin/stop.js",
          label: "bin/stop.js",
          dependsOn: ["src/stop.js"],
        },
      ];
      const deps = await a.analyze();

      expect(deps).toEqual(expected);
    });

    it.only("handles monorepos through yarn workspace", async () => {
      const a = new JsAnalyzer({
        rootDir: path.join(SPEC_DIR, "monorepo-yarn-workspaces"),
      });
      const expected: DependencyNode[] = [];
      const deps = await a.analyze();

      expect(deps).toEqual(expected);
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
