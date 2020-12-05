import { DependencyNode } from "@3d-deps/core";
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
        configTransformer: TRANSFORMERS.MAP_ENTRY((entry) => {
          entry.path = entry.path.replace("dist/index.js", "src/index.ts");
          return entry;
        }),
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
          name: "pkgs/a/src/index.js",
          dependsOn: ["pkgs/b/bb/src/index.js", "pkgs/a/src/a.js"],
          labels: ["workspace_entries"],
        },
        {
          id: "pkgs/a/src/a.js",
          path: "pkgs/a/src/a.js",
          name: "pkgs/a/src/a.js",
          dependsOn: [],
          labels: [],
        },
        {
          id: "pkgs/b/ba/src/index.js",
          path: "pkgs/b/ba/src/index.js",
          name: "pkgs/b/ba/src/index.js",
          dependsOn: ["pkgs/b/bb/src/index.js", "pkgs/b/ba/src/a.js"],
          labels: ["workspace_entries"],
        },
        {
          id: "pkgs/b/ba/src/a.js",
          path: "pkgs/b/ba/src/a.js",
          name: "pkgs/b/ba/src/a.js",
          dependsOn: [],
          labels: [],
        },
        {
          id: "pkgs/b/bb/src/index.js",
          path: "pkgs/b/bb/src/index.js",
          name: "pkgs/b/bb/src/index.js",
          dependsOn: ["node_modules/glob", "pkgs/b/bb/src/a.js"],
          labels: ["workspace_entries"],
        },
        {
          id: "node_modules/glob",
          path: "node_modules/glob",
          name: "node_modules/glob",
          dependsOn: [],
          labels: ["node_modules"],
        },
        {
          id: "pkgs/b/bb/src/a.js",
          path: "pkgs/b/bb/src/a.js",
          name: "pkgs/b/bb/src/a.js",
          dependsOn: [],
          labels: [],
        },
        {
          id: "pkg/src/index.js",
          path: "pkg/src/index.js",
          name: "pkg/src/index.js",
          dependsOn: ["pkg/src/a.js"],
          labels: ["workspace_entries"],
        },
        {
          id: "pkg/src/a.js",
          path: "pkg/src/a.js",
          name: "pkg/src/a.js",
          dependsOn: [],
          labels: [],
        },
      ];
      const deps = await a.analyze();

      expect(deps.nodes).toEqual(expected);
    });
  });
});
