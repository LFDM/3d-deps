import { Theme as T } from "@3d-deps/config";
import "@emotion/react";

declare module "@emotion/react" {
  export interface Theme extends T {}
}

// You are also able to use a 3rd party theme this way:
