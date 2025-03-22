"use client";

import { AppContextProvider } from "@/app/components/AppContext";
import Header from "@/app/components/Header/Header";
import { useSession } from "@supabase/auth-helpers-react";
import * as React from "react";

export type Props = React.PropsWithChildren;

function TeamLayout(props: Props) {
  const { children } = props;

  const session = useSession();
  if (!session) {
    return null;
  }
  // console.log("TeamLayout");
  return (
    <React.Suspense>
      <AppContextProvider>
        <Header />
        {children}
      </AppContextProvider>
    </React.Suspense>
  );
}

export default React.memo(TeamLayout);
