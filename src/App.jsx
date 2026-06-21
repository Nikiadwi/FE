import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./components/auth/Login";
import AdminPage from "./pages/AdminPage";
import DosenPage from "./pages/DosenPage";
import MahasiswaPage from "./pages/MahasiswaPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/dosen" element={<DosenPage />} />
        <Route path="/mahasiswa" element={<MahasiswaPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
