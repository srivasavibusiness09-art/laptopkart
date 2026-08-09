"use client";

import type { ReactNode } from "react";

interface PageTransitionProps {
  children: (displayPage: string) => ReactNode;
  pageKey: string;
}

export default function PageTransition({ children, pageKey }: PageTransitionProps) {
  return (
    <div key={pageKey} className="page-transition-enter">
      {children(pageKey)}
    </div>
  );
}
