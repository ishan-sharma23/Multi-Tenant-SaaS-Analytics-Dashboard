import { lazy, Suspense } from "react";
import { Navigate, RouterProvider, createBrowserRouter } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import AppShell from "./components/AppShell";

const LoginPage = lazy(() => import("./pages/LoginPage"));
const RegisterPage = lazy(() => import("./pages/RegisterPage"));
const DashboardPage = lazy(() => import("./pages/DashboardPage"));
const AdminPage = lazy(() => import("./pages/AdminPage"));
const NotFoundPage = lazy(() => import("./pages/NotFoundPage"));

const suspenseWrap = (element: JSX.Element): JSX.Element => (
  <Suspense
    fallback={<div className="flex min-h-screen items-center justify-center text-slate-500">Loading...</div>}
  >
    {element}
  </Suspense>
);

const router = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/dashboard" replace />,
  },
  {
    path: "/login",
    element: suspenseWrap(<LoginPage />),
  },
  {
    path: "/register",
    element: suspenseWrap(<RegisterPage />),
  },
  {
    element: (
      <ProtectedRoute>
        <AppShell />
      </ProtectedRoute>
    ),
    children: [
      {
        path: "/dashboard",
        element: suspenseWrap(<DashboardPage />),
      },
      {
        path: "/admin",
        element: suspenseWrap(
          <ProtectedRoute requireAdmin>
            <AdminPage />
          </ProtectedRoute>
        ),
      },
    ],
  },
  {
    path: "*",
    element: suspenseWrap(<NotFoundPage />),
  },
]);

export default function App(): JSX.Element {
  return <RouterProvider router={router} />;
}
