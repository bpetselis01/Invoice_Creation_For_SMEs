import React from "react";
import ReactDOM from "react-dom";
import { RouterProvider } from "react-router-dom";
import { router } from "./routing/router.ts";
import { ThemeProvider } from "@mui/material";
import { rapidReceiptTheme } from "./theming/theming.tsx";

ReactDOM.render(
  <React.StrictMode>
    <ThemeProvider theme={rapidReceiptTheme}>
      <RouterProvider router={router} />
    </ThemeProvider>
  </React.StrictMode>,
  document.getElementById("root")
);
