import { useState } from "react";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const validUsers = {
        admin: { username: "admin", role: "admin" },
        dosen: { username: "dosen", role: "dosen" },
        mahasiswa: { username: "mahasiswa", role: "mahasiswa" },
      };

      if (validUsers[username] && password === username) {
        localStorage.setItem("user", JSON.stringify(validUsers[username]));

        if (validUsers[username].role === "admin") {
          window.location.href = "/admin";
        } else if (validUsers[username].role === "dosen") {
          window.location.href = "/dosen";
        } else {
          window.location.href = "/mahasiswa";
        }
      } else {
        setError("Username atau password salah!");
      }
    } catch (err) {
      setError("Login gagal. Periksa username dan password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        background: "#0f172a",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          width: "300px",
          height: "300px",
          background: "#0d6efd",
          borderRadius: "50%",
          filter: "blur(80px)",
          opacity: 0.4,
          top: "-100px",
          right: "-50px",
        }}
      ></div>
      <div
        style={{
          position: "absolute",
          width: "250px",
          height: "250px",
          background: "#6610f2",
          borderRadius: "50%",
          filter: "blur(80px)",
          opacity: 0.4,
          bottom: "-80px",
          left: "-50px",
        }}
      ></div>

      <div
        style={{
          background: "white",
          padding: "40px",
          borderRadius: "16px",
          width: "100%",
          maxWidth: "380px",
          zIndex: 10,
          boxShadow: "0 10px 40px rgba(0,0,0,0.2)",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "24px" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              background: "rgba(13, 110, 253, 0.1)",
              borderRadius: "50%",
              width: "60px",
              height: "60px",
              marginBottom: "12px",
            }}
          >
            <span style={{ fontSize: "30px" }}>🎓</span>
          </div>
          <h4 style={{ fontWeight: "bold", margin: 0, color: "#212529" }}>
            SIMANTAP
          </h4>
          <p style={{ color: "#6c757d", fontSize: "14px", marginTop: "4px" }}>
            Masuk untuk akses sistem
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "16px" }}>
            <label
              style={{
                fontSize: "10px",
                fontWeight: "bold",
                color: "#6c757d",
                textTransform: "uppercase",
                letterSpacing: "1px",
                display: "block",
                marginBottom: "5px",
              }}
            >
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={{
                width: "100%",
                padding: "10px",
                border: "none",
                borderRadius: "4px",
                fontSize: "16px",
                background: "#f8f9fa",
              }}
              placeholder="NIM / NIDN"
              required
              autoFocus
            />
          </div>

          <div style={{ marginBottom: "20px" }}>
            <label
              style={{
                fontSize: "10px",
                fontWeight: "bold",
                color: "#6c757d",
                textTransform: "uppercase",
                letterSpacing: "1px",
                display: "block",
                marginBottom: "5px",
              }}
            >
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: "100%",
                padding: "10px",
                border: "none",
                borderRadius: "4px",
                fontSize: "16px",
                background: "#f8f9fa",
              }}
              placeholder="••••••••"
              required
            />
          </div>

          {error && (
            <div
              style={{
                background: "#f8d7da",
                color: "#721c24",
                padding: "8px 12px",
                borderRadius: "4px",
                marginBottom: "16px",
                fontSize: "14px",
              }}
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "12px",
              background: loading ? "#6c757d" : "#0d6efd",
              color: "white",
              border: "none",
              borderRadius: "8px",
              fontSize: "16px",
              fontWeight: "bold",
              cursor: loading ? "not-allowed" : "pointer",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.target.style.background = "#0b5ed7";
                e.target.style.transform = "translateY(-1px)";
                e.target.style.boxShadow = "0 4px 12px rgba(13,110,253,0.3)";
              }
            }}
            onMouseLeave={(e) => {
              if (!loading) {
                e.target.style.background = "#0d6efd";
                e.target.style.transform = "translateY(0)";
                e.target.style.boxShadow = "none";
              }
            }}
          >
            {loading ? "Loading..." : "Masuk"}
          </button>
        </form>

        <div style={{ marginTop: "20px", textAlign: "center" }}>
          <span style={{ color: "#6c757d", fontSize: "10px" }}>
            Versi 3.0.4 • IT Development
          </span>
        </div>
      </div>
    </div>
  );
};

export default Login;
