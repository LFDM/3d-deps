import React, { useContext } from "react";
import { Config, THEME } from "../types/Config";

export const ConfigContext = React.createContext<Config>({
  theme: THEME,
});

export const useConfig = () => useContext(ConfigContext);
