import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./components/auth/Login";
import AdminPage from "./pages/AdminPage";
import DosenPage from "./pages/DosenPage";
import MahasiswaPage from "./pages/MahasiswaPage";

const ProtectedRoute = ({ children }) => {
  const user = localStorage.getItem("user");
  if (!user) {
    return <Navigate to="/" />;
  }
  return children;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dosen"
          element={
            <ProtectedRoute>
              <DosenPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/mahasiswa"
          element={
            <ProtectedRoute>
              <MahasiswaPage /> // ← Pastikan ini ada
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
