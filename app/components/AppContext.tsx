"use client";

import { useTeams } from "@/hooks/database";
import { Team } from "@/lib/types";
import { useParams, useRouter  } from "next/navigation";
import { createContext, PropsWithChildren, useCallback, useContext, useState } from "react";

type PathParameters = {
  teamUrlKey?: string;
}

function useAppContextValue() {
  const { push } = useRouter();
  const { teamUrlKey } = useParams<PathParameters>() || {}
  
  const qTeams = useTeams();
  const activeTeam = qTeams.data?.find((team) => team.url_key === teamUrlKey) || null;
  const setActiveTeam = useCallback((team: Team | null) => {
    const teamUrlKey = team ? team.url_key : qTeams.data?.[0]?.url_key;
    push(`/teams/${teamUrlKey}`);
  }, [push, qTeams.data]);
  
  // const [activeTeam, setActiveTeam] = useState<Team | null>(null);
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
