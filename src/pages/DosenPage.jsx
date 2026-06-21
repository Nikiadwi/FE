import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/common/Sidebar";
import DashboardDosen from "../components/dosen/DashboardDosen";
import InputNilai from "../components/dosen/InputNilai";

function DosenPage() {
  const [activeMenu, setActiveMenu] = useState("dashboard");
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/");
  };

  const handleNavigate = (menu) => {
    setActiveMenu(menu);
  };

  // Listen untuk navigasi dari komponen anak
  useEffect(() => {
    const handleMenuChange = (e) => {
      setActiveMenu(e.detail);
    };
    document.addEventListener("menuChange", handleMenuChange);
    return () => document.removeEventListener("menuChange", handleMenuChange);
  }, []);

  return (
    <div style={{ display: "flex" }}>
      <Sidebar
        role="dosen"
        onNavigate={handleNavigate}
        onLogout={handleLogout}
      />

      <div
        style={{
          marginLeft: "250px",
          flex: 1,
          minHeight: "100vh",
          background: "#f8f9fa",
        }}
      >
        <div style={{ padding: "20px" }}>
          {/* Menu Navigasi (opsional, bisa pake sidebar aja) */}
          <div className="d-flex gap-2 mb-4">
            <button
              className={`btn ${activeMenu === "dashboard" ? "btn-primary" : "btn-light"} rounded-3 px-4 shadow-sm`}
              onClick={() => setActiveMenu("dashboard")}
            >
              <i className="bi bi-grid me-2"></i>Dashboard
            </button>
            <button
              className={`btn ${activeMenu === "inputnilai" ? "btn-primary" : "btn-light"} rounded-3 px-4 shadow-sm`}
              onClick={() => setActiveMenu("inputnilai")}
            >
              <i className="bi bi-pencil-square me-2"></i>Input Nilai
            </button>
          </div>

          {/* Konten */}
          {activeMenu === "dashboard" && <DashboardDosen />}
          {activeMenu === "inputnilai" && <InputNilai />}
        </div>
      </div>
    </div>
  );
}

export default DosenPage;
