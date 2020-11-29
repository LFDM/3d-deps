import "@emotion/react";
import { Theme as T } from "./types/Config";

declare module "@emotion/react" {
  export interface Theme extends T {}
}

// You are also able to use a 3rd party theme this way:
