import { memo } from "react";
import { ResponsiveAppBar } from "./ResponsiveAppBar";
import { Outlet } from "react-router-dom";

/**
 * Top-level component for the application.
 */
export const App = memo(function App() {
  return (
    <>
      <ResponsiveAppBar />
      <Outlet />
    </>
  );
});
