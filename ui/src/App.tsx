import "./App.css";
import { createBrowserRouter, Navigate, Outlet, RouterProvider } from "react-router-dom";
import BillForm from "./form/bills/BillForm";
import LoginPage from "./LoginPage";
import Navbar from "./Navbar";
import { useAuth } from "./hooks/useAuth";
import ManagePage from "./ManagePage";

function PrivateLayout() {
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  if (!session) return <Navigate to="/login" replace />;

  return (
    <>
      <Navbar />
      <Outlet />
    </>
  );
}

function PublicOnlyLayout() {
  const { session, loading } = useAuth();

  if (loading) return null;
  if (session) return <Navigate to="/generate-bill" replace />;

  return <Outlet />;
}

const router = createBrowserRouter([
  {
    element: <PublicOnlyLayout />,
    children: [{ path: "/login", element: <LoginPage /> }],
  },
  {
    element: <PrivateLayout />,
    children: [
      { path: "/generate-bill", element: <BillForm /> },
      { path: "/manage", element: <ManagePage /> },
    ],
  },
  { path: "*", element: <Navigate to="/generate-bill" replace /> },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
