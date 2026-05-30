import React from "react";
import { createRoot } from "react-dom/client";
import JlptN5Srs from "../JlptN5Srs.jsx";

/* --------------------------------------------------------------------------
   Host-provided storage.
   The flashcard component NEVER touches localStorage/sessionStorage directly —
   it only calls window.storage.get/set. In the original sandbox that API was
   supplied by the host. On this deployment we supply the same API, backed by
   localStorage, so a learner's progress persists across sessions in their
   browser. (Swap this for a fetch-based backend later if you want cross-device
   sync — the component doesn't change.)
   -------------------------------------------------------------------------- */
if (typeof window !== "undefined" && !window.storage) {
  window.storage = {
    get: async (key) => {
      try {
        const v = window.localStorage.getItem(key);
        return v == null ? null : JSON.parse(v);
      } catch (e) {
        return null;
      }
    },
    set: async (key, value /*, opts */) => {
      try {
        window.localStorage.setItem(key, JSON.stringify(value));
      } catch (e) {
        /* storage full / blocked — component keeps an in-memory copy */
      }
    },
  };
}

createRoot(document.getElementById("root")).render(<JlptN5Srs />);

// Register the service worker (installable PWA + offline). Scoped to the app root.
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js").catch(() => {});
  });
}
