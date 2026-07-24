import { LoginPage } from "../components/auth/LoginPage";
import {
  createBrowserRouter,
} from "react-router-dom";
import { App } from "../App";
import { Dashboard } from "../components/dashboard/Dashboard";
import { InvoiceCreator } from "../components/invoiceCreation/InvoiceCreator";
import { ViewInvoices } from "../components/view/VIewInvoices";

export const router = createBrowserRouter([
  {
    path: "/login",
    Component: LoginPage,
  },
  {
    path: "/app",
    Component: App,
    children: [
      {
        path: "/app/dashboard",
        Component: Dashboard,
      },
      {
        path: "/app/create",
        Component: InvoiceCreator,
      },
      {
        path: "/app/view",
        Component: ViewInvoices,
      }
    ]
  },
]);