"use client";

import React from "react";
import HeaderInner from "./HeaderInner";

function Header() {
  // console.log('Header')
  return (
    <header className="border-b">
      <div className="flex h-16 items-center justify-between px-3 md:px-6">
        <React.Suspense>
          <HeaderInner />
        </React.Suspense>
      </div>
    </header>
  );
}

export default React.memo(Header);
