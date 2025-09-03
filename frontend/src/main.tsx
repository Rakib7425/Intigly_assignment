import "./index.css";
import App from "./App";

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import { LiveblocksProvider } from "@liveblocks/react";

// Be tolerant to type environments without Vite's ImportMeta typing
const BACKEND_URL =
  (import.meta as any).env?.VITE_APP_BACKEND_URL || "http://localhost:3001";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <LiveblocksProvider
      authEndpoint={`${BACKEND_URL}/api/liveblocks/authorize`}
    >
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </LiveblocksProvider>
  </StrictMode>
);
