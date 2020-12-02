import { DependencyNode } from "@3d-deps/shared";
import * as path from "path";
import { JsAnalyzer } from ".";
import { TRANSFORMERS } from "./transformers";

const SPEC_DIR = path.join(__dirname, "..", "..", "..", "..", "spec-pkgs");

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

    it("handles monorepos through yarn workspace", async () => {
      const a = new JsAnalyzer({
        rootDir: path.join(SPEC_DIR, "monorepo-yarn-workspaces"),
      });
      const expected: DependencyNode[] = [
        {
          id: "pkgs/a/src/index.js",
          path: "pkgs/a/src/index.js",
          label: "pkgs/a/src/index.js",
          dependsOn: ["pkgs/b/bb/src/index.js", "pkgs/a/src/a.js"],
          groups: ["workspace_entries"],
        },
        {
          id: "pkgs/a/src/a.js",
          path: "pkgs/a/src/a.js",
          label: "pkgs/a/src/a.js",
          dependsOn: [],
        },
        {
          id: "pkgs/b/ba/src/index.js",
          path: "pkgs/b/ba/src/index.js",
          label: "pkgs/b/ba/src/index.js",
          dependsOn: ["pkgs/b/bb/src/index.js", "pkgs/b/ba/src/a.js"],
          groups: ["workspace_entries"],
        },
        {
          id: "pkgs/b/ba/src/a.js",
          path: "pkgs/b/ba/src/a.js",
          label: "pkgs/b/ba/src/a.js",
          dependsOn: [],
        },
        {
          id: "pkgs/b/bb/src/index.js",
          path: "pkgs/b/bb/src/index.js",
          label: "pkgs/b/bb/src/index.js",
          dependsOn: ["node_modules/glob", "pkgs/b/bb/src/a.js"],
          groups: ["workspace_entries"],
        },
        {
          id: "node_modules/glob",
          path: "node_modules/glob",
          label: "node_modules/glob",
          dependsOn: [],
          groups: ["node_modules"],
        },
        {
          id: "pkgs/b/bb/src/a.js",
          path: "pkgs/b/bb/src/a.js",
          label: "pkgs/b/bb/src/a.js",
          dependsOn: [],
        },
        {
          id: "pkg/src/index.js",
          path: "pkg/src/index.js",
          label: "pkg/src/index.js",
          dependsOn: ["pkg/src/a.js"],
          groups: ["workspace_entries"],
        },
        {
          id: "pkg/src/a.js",
          path: "pkg/src/a.js",
          label: "pkg/src/a.js",
          dependsOn: [],
        },
      ];
      const deps = await a.analyze();

      expect(deps).toEqual(expected);
    });
  });
});
