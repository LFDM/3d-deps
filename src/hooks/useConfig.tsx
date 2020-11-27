import React, { useContext } from "react";
import { CONFIG, Config } from "../types/Config";

export const ConfigContext = React.createContext<{
  current: Config;
  original: Config;
  onChange: (nextConfig: Config) => void;
}>({
  current: CONFIG,
  original: CONFIG,
  onChange: () => undefined,
});

export const useConfig = () => useContext(ConfigContext);
