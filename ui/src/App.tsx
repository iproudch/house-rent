import "./App.css";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import BillForm from "./form/bills/BillForm";
import LoginPage from "./LoginPage";
import Navbar from "./Navbar";
import { useAuth } from "./hooks/useAuth";

function App() {
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-950">
        <div className="w-6 h-6 border-2 border-zinc-600 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={session ? <Navigate to="/generate-bill" replace /> : <LoginPage />}
        />
        <Route
          path="/generate-bill"
          element={
            session ? (
              <>
                <Navbar />
                <BillForm />
              </>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route path="*" element={<Navigate to={session ? "/generate-bill" : "/login"} replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
