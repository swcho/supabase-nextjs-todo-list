"use client";

import { useTeams } from "@/hooks/database";
import { Team } from "@/lib/types";
import { useParams, useRouter } from "next/navigation";
import React from "react";
import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useState,
} from "react";

type PathParameters = {
  teamUrlKey?: string;
};

function useAppContextValue() {
  const { push } = useRouter();
  const { teamUrlKey } = useParams<PathParameters>() || {};

  const { data: teams = [], isLoading: isTeamsLoading } = useTeams();
  const activeTeam = teams.find((team) => team.url_key === teamUrlKey) || null;
  const setActiveTeam = useCallback(
    (team: Team | null) => {
      const teamUrlKey = team ? team.url_key : teams[0]?.url_key;
      push(`/teams/${teamUrlKey}`);
    },
    [push, teams]
  );

  // React.useEffect(() => {
  //   console.log("teams changed");
  // }, [teams]);
  // React.useEffect(() => {
  //   console.log("activeTeam changed");
  // }, [activeTeam]);

  // const [activeTeam, setActiveTeam] = useState<Team | null>(null);
  return {
    isReady: !isTeamsLoading,
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
  return (
    <AppContext.Provider value={value}>
      {value.isReady && children}
    </AppContext.Provider>
  );
};

export function useAppContext() {
  return useContext(AppContext);
}
