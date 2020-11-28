import { Config } from "../types/Config";

export const toggleSidebar = (
  current: Config,
  onChange: (nextConfig: Config) => void
) => {
  onChange({
    ...current,
    hud: {
      ...current.hud,
      sidebar: {
        ...current.hud.sidebar,
        open: !current.hud.sidebar.open,
      },
    },
  });
};
