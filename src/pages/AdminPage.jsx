import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/common/Sidebar";
import AdminDosen from "../components/admin/AdminDosen";
import AdminMhs from "../components/admin/AdminMhs";

function AdminPage() {
  const [activeMenu, setActiveMenu] = useState("dosen");
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const navigate = useNavigate();

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/");
  };

  const handleNavigate = (menu) => {
    setActiveMenu(menu);
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar
        role="admin"
        onNavigate={handleNavigate}
        onLogout={handleLogout}
      />

      <div
        style={{
          marginLeft: isMobile ? "0" : "250px",
          flex: 1,
          minHeight: "100vh",
          background: "#f8f9fa",
          padding: isMobile ? "70px 10px 10px 10px" : "20px",
          width: "100%",
          transition: "margin-left 0.3s ease",
        }}
      >
        {activeMenu === "dosen" && <AdminDosen />}
        {activeMenu === "mahasiswa" && <AdminMhs />}
      </div>
    </div>
  );
}

export default AdminPage;
