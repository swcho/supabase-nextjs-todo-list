"use client";

import { Team } from "@/lib/types";
import { createContext, PropsWithChildren, useContext, useState } from "react";

function useAppContextValue() {
  const [activeTeam, setActiveTeam] = useState<Team | null>(null);
  return {
    activeTeam,
    setActiveTeam,
  };
}

export type AppContext = ReturnType<typeof useAppContextValue>;

const AppContext = createContext<AppContext>({} as any);

export type AppContextProviderProps = PropsWithChildren;

export const AppContextProvider: React.FC<AppContextProviderProps> = ({
  children,
}) => {
  const value = useAppContextValue();
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export function useAppContext() {
  return useContext(AppContext);
}
