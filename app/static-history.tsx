"use client";

import { useEffect } from "react";

// GitHub Pages serves each exported document directly. Same-document history
// must remain local: an RSC request to the /juna/ deployment prefix has no server.
export function StaticHistory() {
  useEffect(() => {
    const pathname = location.pathname;
    const restore = (event: PopStateEvent) => {
      if (location.pathname !== pathname) return;
      event.stopImmediatePropagation();
      window.dispatchEvent(new Event("juna:history"));
    };
    window.addEventListener("popstate", restore, true);
    return () => window.removeEventListener("popstate", restore, true);
  }, []);
  return null;
}
