import React, { useCallback, useContext, useEffect, useState } from "react";

export const OverlayContext = React.createContext<{
  active: boolean;
  setActive: (nextActive: boolean) => void;
}>({
  active: false,
  setActive: () => undefined,
});

export const OverlayContextProvider: React.FC = ({ children }) => {
  const [active, setActive] = useState(false);
  return (
    <OverlayContext.Provider value={{ active, setActive }}>
      {children}
    </OverlayContext.Provider>
  );
};

export const useOverlayContext = () => {
  const { active, setActive } = useContext(OverlayContext);
  return [active, setActive] as const;
};

export const usePopupState = (initialState: boolean = false) => {
  const [open, _setOpen] = useState(initialState);
  const { setActive } = useContext(OverlayContext);
  useEffect(() => {
    if (initialState) {
      setActive(true);
    }
  }, []);
  const setOpen = useCallback((nextOpen: boolean) => {
    setActive(nextOpen);
    _setOpen(nextOpen);
  }, []);

  return [open, setOpen] as const;
};
