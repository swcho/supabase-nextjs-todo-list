"use client";

import React from "react";
import "@/app/globals.css";
import { Inter } from "next/font/google";
import { SessionContextProvider } from "@supabase/auth-helpers-react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { supabase } from "@/lib/initSupabase";
import { cn } from "@/lib/utils";

const inter = Inter({ subsets: ["latin"] });

const queryClient = new QueryClient();

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // console.log('RootLayout')
  return (
    <html lang="en">
      <head>
        <title>YAT</title>
      </head>
      <SessionContextProvider supabaseClient={supabase}>
        <QueryClientProvider client={queryClient}>
          <body
            className={cn(
              inter.className,
              "min-h-screen bg-gray-100 text-gray-900 antialiased"
            )}
            // style={{
            //   marginRight: '0 !important',
            // }}
          >
            <div vaul-drawer-wrapper="" className="bg-background">
              <React.Suspense>{children}</React.Suspense>
            </div>
          </body>
        </QueryClientProvider>
      </SessionContextProvider>
    </html>
  );
}
