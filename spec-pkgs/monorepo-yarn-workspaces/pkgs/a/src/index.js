import { pkg } from "@spec-monorepo-yarn-workspaces/pkgs";
import { bb } from "@spec-monorepo-yarn-workspaces/pkgs-bb";
import { a } from "./a";

a();
bb();
pkg();

export { a };
