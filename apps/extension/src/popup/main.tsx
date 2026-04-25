import "@pomotimer/tokens/fonts.css";
import "@pomotimer/tokens/tokens.css";
import "@pomotimer/tokens/reset.css";
import "./popup.css";

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { Popup } from "./Popup";

const container = document.getElementById("root");
if (!container) throw new Error("popup root element missing");

createRoot(container).render(
  <StrictMode>
    <Popup />
  </StrictMode>,
);
