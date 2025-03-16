"use client";

import * as React from "react";
import { useSupabaseClient } from "@/lib/initSupabase";
import { useSessionContext } from "@supabase/auth-helpers-react";
import Header from "./components/Header/Header";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import Head from "next/head";
import { AppContextProvider } from "./components/AppContext";

export type Props = {};

function RootPage(props: Props) {
  const {} = props;
  const { isLoading, session } = useSessionContext();
  const supabase = useSupabaseClient();

  if (isLoading) {
    return <></>;
  }
  return (
    <>
      <Head>
        <title>Create Next App</title>
        <meta name="description" content="Generated by create next app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="w-full h-full bg-200">
        {!session ? (
          <div className="min-w-full min-h-screen flex items-center justify-center">
            <div className="w-full h-full flex justify-center items-center p-4">
              <div className="w-full h-full sm:h-auto sm:w-2/5 max-w-sm p-5 bg-white shadow flex flex-col text-base">
                <span className="font-sans text-4xl text-center pb-2 mb-1 border-b mx-4 align-center">
                  Login
                </span>
                <Auth
                  supabaseClient={supabase}
                  appearance={{ theme: ThemeSupa }}
                />
              </div>
            </div>
          </div>
        ) : (
          <AppContextProvider>
            <Header />
          </AppContextProvider>
        )}
      </div>
    </>
  );
}

export default React.memo(RootPage);
