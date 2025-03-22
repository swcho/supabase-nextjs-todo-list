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
            vaul-drawer-wrapper=""
            className={cn(
              inter.className,
              "min-h-screen bg-gray-100 text-gray-900 antialiased bg-background"
            )}
            style={{
              marginRight: '0 !important',
            }}
          >
            <React.Suspense>{children}</React.Suspense>
          </body>
        </QueryClientProvider>
      </SessionContextProvider>
    </html>
  );
}
