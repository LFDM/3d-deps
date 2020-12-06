#!/usr/bin/env node

import { getTsCompilerOptions, JsAnalyzer } from "@3d-deps/analyzer-js";
import * as path from "path";
import { getRootDir, readJsonFile, writeJsonFile } from "../util";

const generate = async () => {
  const rootDir = getRootDir(process.argv);
  const topLevelPackages = ["tfjs", "tfjs-node", "tfjs-react-native"];
  const virtualWorkspaces = await Promise.all(
    topLevelPackages.map(async (name) => {
      const packageJson = await readJsonFile(
        path.join(rootDir, name, "package.json")
      );
      const tfPackages = Object.entries<string>(packageJson.dependencies)
        .filter(([k]) => k.startsWith("@tensorflow"))
        .map(([k, v]) => ({
          packageName: k,
          location: v.replace("link:../", ""),
          mountPoint: v.replace("link:../", ""), // path.join("packages", v.replace("link:..", "")),
        }));
      return [
        {
          packageName: packageJson.name,
          location: name,
          mountPoint: name,
        },
        ...tfPackages,
      ];
    })
  ).then((wss) => {
    const byName: {
      [key: string]: {
        packageName: string;
        location: string;
        mountPoint: string;
      };
    } = {};
    wss.forEach((ws) => ws.forEach((w) => (byName[w.packageName] = w)));
    return Object.values(byName);
  });

  const analyzer = new JsAnalyzer({
    rootDir,
    configTransformer: ({ packageJson }) => {
      if (!packageJson.name) {
        return {
          entries: [],
        };
      }
      return {
        entries: [
          {
            type: "main",
            path: "./src/index.ts",
          },
        ],
        configs: {
          ts: {
            compilerOptions: getTsCompilerOptions("tsconfig.json"),
          },
        },
        cleanupPath: (p) =>
          p.startsWith("dist")
            ? p.replace("dist", "src").replace(".d.ts", ".ts")
            : p,
      };
    },
    workspaces: {
      virtual: virtualWorkspaces,
    },
  });

  analyzer
    .analyze()
    .then((res) => writeJsonFile(path.join(__dirname, "data.json"), res));
};

generate();
