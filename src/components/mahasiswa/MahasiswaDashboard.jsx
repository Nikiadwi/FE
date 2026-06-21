import { useState, useEffect } from "react";

function MahasiswaDashboard() {
  const [nilaiData, setNilaiData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Data dummy (sama dengan kode lama)
  useEffect(() => {
    setTimeout(() => {
      setNilaiData([
        {
          kode: "MK001",
          matkul: "Pemrograman Web Dasar",
          sks: 3,
          nilai: 88,
          grade: "A",
        },
        {
          kode: "MK002",
          matkul: "Struktur Data & Algoritma",
          sks: 3,
          nilai: 75,
          grade: "B+",
        },
        {
          kode: "MK003",
          matkul: "Basis Data Terdistribusi",
          sks: 4,
          nilai: 92,
          grade: "A",
        },
        {
          kode: "MK004",
          matkul: "Bahasa Inggris Teknik",
          sks: 2,
          nilai: 80,
          grade: "A-",
        },
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  // Hitung IPK (dummy)
  const totalNilai = nilaiData.reduce((acc, item) => acc + item.nilai, 0);
  const ipk =
    nilaiData.length > 0 ? (totalNilai / nilaiData.length / 25).toFixed(2) : 0;
  const totalSks = nilaiData.reduce((acc, item) => acc + item.sks, 0);

  // Tampilkan spinner
  if (loading) {
    return (
      <div
        className="vh-100 w-100 d-flex justify-content-center align-items-center bg-white"
        style={{ position: "fixed", top: 0, left: 0, zIndex: 9999 }}
      >
        <div className="text-center">
          <div
            className="spinner-border text-primary"
            style={{ width: "3.5rem", height: "3.5rem", borderWidth: "0.25em" }}
            role="status"
          ></div>
          <p className="mt-3 fw-bold text-secondary">
            Menyiapkan Data Nilai...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="mahasiswa-container bg-light"
      style={{ minHeight: "100vh" }}
    >
      {/* Navbar */}
      <nav className="navbar navbar-expand-lg navbar-dark bg-primary shadow-sm py-3 mb-4">
        <div className="container">
          <a
            className="navbar-brand d-flex align-items-center gap-2 fw-bold"
            href="#"
          >
            <i className="bi bi-mortarboard-fill fs-3"></i>
            <span>
              SIAKAD <span className="fw-light text-white-50">MAHASISWA</span>
            </span>
          </a>
          <button
            className="btn btn-light rounded-pill px-4 fw-bold text-primary shadow-sm btn-sm"
            onClick={() => window.location.reload()}
          >
            <i className="bi bi-box-arrow-right me-1"></i> Logout
          </button>
        </div>
      </nav>

      <div className="container pb-5">
        {/* Welcome Card */}
        <div className="row mb-4">
          <div className="col-12">
            <div className="bg-white p-4 rounded-4 shadow-sm border-0 d-flex align-items-center justify-content-between">
              <div>
                <h4 className="fw-bold text-dark mb-1">
                  Selamat Datang, Riki👋
                </h4>
                <p className="text-muted mb-0 small">
                  NIM: 2303010144 | Program Studi Teknik Informatika
                </p>
              </div>
              <div className="d-none d-md-block">
                <span className="badge bg-primary bg-opacity-10 text-primary rounded-pill px-3 py-2">
                  Semester 5 - Ganjil
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Statistik Cards */}
        <div className="row g-3 mb-4">
          <div className="col-md-4">
            <div
              className="card border-0 shadow-sm rounded-4 p-3 text-white"
              style={{ background: "linear-gradient(45deg, #0d6efd, #0dcaf0)" }}
            >
              <small className="opacity-75">IPK Kumulatif</small>
              <h2 className="fw-bold mb-0">{ipk}</h2>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card border-0 shadow-sm rounded-4 p-3 bg-white">
              <small className="text-muted">Total SKS Tempuh</small>
              <h2 className="fw-bold mb-0 text-dark">
                {totalSks} <span className="fs-6 fw-light text-muted">SKS</span>
              </h2>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card border-0 shadow-sm rounded-4 p-3 bg-white">
              <small className="text-muted">Status Akademik</small>
              <h2 className="fw-bold mb-0 text-success">AKTIF</h2>
            </div>
          </div>
        </div>

        {/* Tabel KHS */}
        <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
          <div className="card-header bg-white border-0 py-3 px-4 d-flex justify-content-between align-items-center">
            <h5 className="fw-bold mb-0 text-dark">Kartu Hasil Studi (KHS)</h5>
            <button className="btn btn-outline-primary btn-sm rounded-pill">
              <i className="bi bi-printer me-1"></i> Cetak KHS
            </button>
          </div>
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="bg-light">
                <tr className="text-muted small text-uppercase">
                  <th className="ps-4 py-3">Kode MK</th>
                  <th>Mata Kuliah</th>
                  <th className="text-center">SKS</th>
                  <th className="text-center">Nilai Angka</th>
                  <th className="text-center pe-4">Grade</th>
                </tr>
              </thead>
              <tbody>
                {nilaiData.map((item, index) => (
                  <tr key={index}>
                    <td className="ps-4 fw-semibold text-secondary">
                      {item.kode}
                    </td>
                    <td className="fw-bold text-dark">{item.matkul}</td>
                    <td className="text-center">{item.sks}</td>
                    <td className="text-center">
                      <span className="badge bg-light text-dark border px-3">
                        {item.nilai}
                      </span>
                    </td>
                    <td className="text-center pe-4">
                      <span
                        className={`badge ${item.grade.startsWith("A") ? "bg-success" : "bg-warning"} px-3 py-2 rounded-pill`}
                      >
                        {item.grade}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MahasiswaDashboard;
