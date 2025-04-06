"use client";

import React from "react";
import HeaderInner from "./HeaderInner";
import { MyInvitationAlert } from "./MyInvitationAlert";

function Header() {
  // console.log('Header')
  return (
    <>
    <header className="border-b">
      <div className="flex h-16 items-center justify-between px-3 md:px-6">
        <React.Suspense>
          <HeaderInner />
        </React.Suspense>
      </div>
    </header>
    <React.Suspense>
      <MyInvitationAlert />
    </React.Suspense>
    </>
  );
}

export default React.memo(Header);
