import { useState, useEffect } from "react";

function Sidebar({ role, onNavigate, onLogout }) {
  const [activeMenu, setActiveMenu] = useState("dosen");
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  // Deteksi perubahan ukuran layar
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
      if (window.innerWidth > 768) {
        setIsOpen(true);
      } else {
        setIsOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);

    if (window.innerWidth > 768) {
      setIsOpen(true);
    }

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Menu berdasarkan role (SESUAI DENGAN DATA-PAGE DI KODE LAMA)
  const menus = {
    admin: [
      { id: "dosen", label: "Data Dosen", icon: "bi-person-badge" },
      { id: "mahasiswa", label: "Data Mahasiswa", icon: "bi-people" },
    ],
    dosen: [
      { id: "dashboard", label: "Dashboard", icon: "bi-grid" },
      { id: "jadwal", label: "Jadwal", icon: "bi-calendar" },
      { id: "nilai", label: "Input Nilai", icon: "bi-pencil-square" },
    ],
    mahasiswa: [
      { id: "dashboard", label: "Dashboard", icon: "bi-grid" },
      { id: "nilai", label: "Lihat Nilai", icon: "bi-book" },
    ],
  };

  const handleMenuClick = (menuId) => {
    setActiveMenu(menuId);
    if (onNavigate) {
      onNavigate(menuId);
    }
    if (isMobile) {
      setIsOpen(false);
    }
  };

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    }
    if (isMobile) {
      setIsOpen(false);
    }
  };

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  // CSS untuk sidebar (mirip dengan kode lama)
  const sidebarStyle = {
    width: isMobile ? "280px" : "250px",
    height: "100vh",
    background: "#0f172a",
    color: "white",
    position: "fixed",
    left: isMobile ? (isOpen ? "0" : "-280px") : "0",
    top: 0,
    display: "flex",
    flexDirection: "column",
    padding: "20px 0",
    zIndex: 1000,
    transition: "left 0.3s ease",
    boxShadow: isMobile && isOpen ? "0 0 20px rgba(0,0,0,0.5)" : "none",
    overflowY: "auto",
  };

  return (
    <>
      {/* Overlay untuk mobile */}
      {isMobile && isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "rgba(0,0,0,0.5)",
            zIndex: 999,
          }}
        />
      )}

      {/* Tombol Hamburger (mobile) */}
      {isMobile && (
        <button
          onClick={toggleSidebar}
          style={{
            position: "fixed",
            top: "15px",
            left: isOpen ? "290px" : "15px",
            zIndex: 1001,
            background: isOpen ? "#0f172a" : "#0d6efd",
            color: "white",
            border: "none",
            borderRadius: "8px",
            padding: "10px 12px",
            fontSize: "20px",
            cursor: "pointer",
            boxShadow: "0 2px 10px rgba(0,0,0,0.2)",
            transition: "left 0.3s ease",
          }}
        >
          <i className={`bi ${isOpen ? "bi-x-lg" : "bi-list"}`}></i>
        </button>
      )}

      {/* SIDEBAR - dengan class seperti kode lama */}
      <div id="sidebar-wrapper" style={sidebarStyle}>
        {/* Header Sidebar */}
        <div
          style={{
            padding: "0 20px 20px 20px",
            borderBottom: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          <h4 style={{ margin: 0, fontWeight: "bold", color: "white" }}>
            SIMANTAP
          </h4>
          <p
            style={{ fontSize: "11px", color: "#8892b0", margin: "5px 0 0 0" }}
          >
            {role === "admin" && "Admin Panel"}
            {role === "dosen" && "Dosen Panel"}
            {role === "mahasiswa" && "Mahasiswa Panel"}
          </p>
        </div>

        {/* Menu Navigation - PAKE CLASS .sidebar__link seperti kode lama */}
        <nav style={{ flex: 1, padding: "20px 0" }}>
          {menus[role]?.map((menu) => (
            <button
              key={menu.id}
              data-page={menu.id}
              className={`sidebar__link ${activeMenu === menu.id ? "sidebar__link--active" : ""}`}
              onClick={() => handleMenuClick(menu.id)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                width: "100%",
                padding: "12px 24px",
                background:
                  activeMenu === menu.id
                    ? "rgba(255,255,255,0.08)"
                    : "transparent",
                color: activeMenu === menu.id ? "white" : "#8892b0",
                border: "none",
                borderLeft:
                  activeMenu === menu.id
                    ? "3px solid #0d6efd"
                    : "3px solid transparent",
                cursor: "pointer",
                fontSize: "14px",
                transition: "all 0.2s",
                textAlign: "left",
              }}
              onMouseEnter={(e) => {
                if (activeMenu !== menu.id) {
                  e.target.style.background = "rgba(255,255,255,0.05)";
                  e.target.style.color = "white";
                }
              }}
              onMouseLeave={(e) => {
                if (activeMenu !== menu.id) {
                  e.target.style.background = "transparent";
                  e.target.style.color = "#8892b0";
                }
              }}
            >
              <i
                className={`bi ${menu.icon}`}
                style={{ fontSize: "18px", minWidth: "20px" }}
              ></i>
              <span>{menu.label}</span>
            </button>
          ))}
        </nav>

        {/* Logout Button - PAKE CLASS .btn-logout-sidebar seperti kode lama */}
        <div
          style={{
            padding: "0 20px",
            borderTop: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          <button
            className="btn-logout-sidebar"
            onClick={handleLogout}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              width: "100%",
              padding: "12px 16px",
              background: "rgba(255,0,0,0.1)",
              color: "#ff6b6b",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "14px",
              marginTop: "16px",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              e.target.style.background = "rgba(255,0,0,0.2)";
            }}
            onMouseLeave={(e) => {
              e.target.style.background = "rgba(255,0,0,0.1)";
            }}
          >
            <i
              className="bi bi-box-arrow-right"
              style={{ fontSize: "18px" }}
            ></i>
            Logout
          </button>
        </div>
      </div>
    </>
  );
}

export default Sidebar;
