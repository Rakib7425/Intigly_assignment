import "./index.css";
import App from "./App";

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import { LiveblocksProvider } from "@liveblocks/react";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <LiveblocksProvider
      publicApiKey={import.meta.env.VITE_LIVEBLOCKS_PUBLIC_KEY! || ""}
    >
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </LiveblocksProvider>
  </StrictMode>
);
