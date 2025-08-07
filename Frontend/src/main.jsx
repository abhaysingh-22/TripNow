import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";
import { UserContextProvider } from "./context/UserContext.jsx";
import { CaptainProvider } from "./context/CaptainContext.jsx";
import { SocketProvider } from "./context/SocketContext.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <SocketProvider>
      <CaptainProvider>
        <UserContextProvider>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </UserContextProvider>
      </CaptainProvider>
    </SocketProvider>
  </StrictMode>
);

// StrictMode is a wrapper component that activates additional checks and warnings for its descendants only in development mode (not in production).
