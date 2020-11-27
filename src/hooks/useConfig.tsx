import React, { useContext } from "react";
import { Config, THEME } from "../types/Config";

export const ConfigContext = React.createContext<{
  current: Config;
  original: Config;
  onChange: (nextConfig: Config) => void;
}>({
  current: {
    theme: THEME,
  },
  original: {
    theme: THEME,
  },
  onChange: () => undefined,
});

export const useConfig = () => useContext(ConfigContext);
