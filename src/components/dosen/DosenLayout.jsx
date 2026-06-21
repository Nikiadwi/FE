import { useNavigate } from "react-router-dom";

function DosenLayout({ children }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/");
  };

  return (
    <div
      className="dashboard-wrapper animate-fade-in p-4"
      style={{ minHeight: "100vh", background: "#f8f9fa" }}
    >
      {/* Navbar */}
      <nav className="d-flex justify-content-between align-items-center mb-4 bg-white p-3 rounded-4 shadow-sm">
        <h5 className="fw-bold mb-0">
          SIAKAD <span className="text-primary">PRO</span>
        </h5>
        <button className="btn btn-light btn-logout" onClick={handleLogout}>
          <i className="bi bi-power text-danger"></i>
        </button>
      </nav>

      {/* Content */}
      <div id="dosen-content">{children}</div>
    </div>
  );
}

export default DosenLayout;
