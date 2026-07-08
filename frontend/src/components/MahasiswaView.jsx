import React, { useState, useEffect, useRef } from "react";

export default function MahasiswaView({
  currentUser,
  apiRequest,
  showToast,
  onDeleteTrigger,
  modalOpenTrigger,
  setModalOpenTrigger,
}) {
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState(null);

  // Form states
  const [nim, setNim] = useState("");
  const [nama, setNama] = useState("");
  const [prodi, setProdi] = useState("");
  const [angkatan, setAngkatan] = useState("");
  const [status, setStatus] = useState("Aktif");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const searchTimeoutRef = useRef(null);

  const fetchStudents = async (searchVal = "") => {
    setLoading(true);
    try {
      const query = searchVal
        ? `/api/mahasiswa?search=${encodeURIComponent(searchVal)}`
        : "/api/mahasiswa";
      const data = await apiRequest(query);
      setStudents(data);
    } catch (err) {
      showToast("Gagal Memuat Data", err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  // Handle outside trigger to open add modal
  useEffect(() => {
    if (modalOpenTrigger === "add-mahasiswa") {
      handleOpenAddModal();
      setModalOpenTrigger(null); // Reset trigger
    }
  }, [modalOpenTrigger]);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearch(value);

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      fetchStudents(value.trim());
    }, 300);
  };

  const handleOpenAddModal = () => {
    setEditId(null);
    setNim("");
    setNama("");
    setProdi("");
    setAngkatan(new Date().getFullYear());
    setStatus("Aktif");
    setUsername("");
    setPassword("");
    setModalOpen(true);
  };

  const handleOpenEditModal = async (id) => {
    try {
      const m = await apiRequest(`/api/mahasiswa/${id}`);
      setEditId(m.id);
      setNim(m.nim);
      setNama(m.nama);
      setProdi(m.program_studi);
      setAngkatan(m.angkatan);
      setStatus(m.status);
      setUsername(m.username || "");
      setPassword(""); // Keep blank unless updating
      setModalOpen(true);
    } catch (err) {
      showToast("Error", "Gagal memuat data detail mahasiswa.", "error");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!nim || !nama || !prodi || !angkatan) return;

    const payload = {
      nim,
      nama,
      program_studi: prodi,
      angkatan: parseInt(angkatan),
      status,
      username: username.trim() || null,
    };

    if (password) {
      payload.password = password;
    }

    try {
      if (editId) {
        await apiRequest(`/api/mahasiswa/${editId}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
        showToast(
          "Data Diperbarui",
          "Data mahasiswa berhasil di-update.",
          "success",
        );
      } else {
        await apiRequest("/api/mahasiswa", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        showToast(
          "Data Ditambahkan",
          "Mahasiswa baru berhasil disimpan.",
          "success",
        );
      }
      setModalOpen(false);
      fetchStudents(search);
    } catch (err) {
      showToast("Gagal Menyimpan", err.message, "error");
    }
  };

  const handleDelete = (id) => {
    onDeleteTrigger("mahasiswa", id, () => fetchStudents(search));
  };

  const isStudent = currentUser?.role === "mahasiswa";

  return (
    <section id="view-mahasiswa" className="view-section active">
      <div className="table-header-bar">
        <div className="search-box">
          <i className="fa-solid fa-magnifying-glass"></i>
          <input
            type="text"
            id="search-mahasiswa"
            className="search-input"
            placeholder="Cari berdasarkan NIM atau Nama..."
            value={search}
            onChange={handleSearchChange}
          />
        </div>
        {!isStudent && (
          <button
            id="btn-add-mahasiswa"
            className="btn btn-primary"
            onClick={handleOpenAddModal}
          >
            <i className="fa-solid fa-plus"></i> Tambah Mahasiswa
          </button>
        )}
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>NIM</th>
              <th>Nama Mahasiswa</th>
              <th>Program Studi</th>
              <th>Angkatan</th>
              <th>Status Akademik</th>
              {!isStudent && (
                <th style={{ width: "100px", textAlign: "center" }}>Aksi</th>
              )}
            </tr>
          </thead>
          <tbody id="table-body-mahasiswa">
            {loading ? (
              <tr>
                <td colSpan={isStudent ? 5 : 6} style={{ textAlign: "center" }}>
                  <i className="fa-solid fa-spinner fa-spin"></i> Memuat data...
                </td>
              </tr>
            ) : students.length === 0 ? (
              <tr>
                <td
                  colSpan={isStudent ? 5 : 6}
                  style={{ textAlign: "center", color: "var(--text-muted)" }}
                >
                  Tidak ada data mahasiswa ditemukan.
                </td>
              </tr>
            ) : (
              students.map((m) => {
                const statusClass = m.status.toLowerCase().replace(" ", "_");
                return (
                  <tr key={m.id}>
                    <td style={{ fontWeight: 700 }}>{m.nim}</td>
                    <td style={{ fontWeight: 600 }}>{m.nama}</td>
                    <td>{m.program_studi}</td>
                    <td>{m.angkatan}</td>
                    <td>
                      <span className={`badge badge-status-${statusClass}`}>
                        <i
                          className="fa-solid fa-circle"
                          style={{ fontSize: "8px", marginRight: "6px" }}
                        ></i>{" "}
                        {m.status}
                      </span>
                    </td>
                    {!isStudent && (
                      <td style={{ textAlign: "center" }}>
                        <div className="action-buttons">
                          <button
                            className="btn-icon btn-icon-edit"
                            onClick={() => handleOpenEditModal(m.id)}
                            title="Edit Mahasiswa"
                          >
                            <i className="fa-solid fa-pen-to-square"></i>
                          </button>
                          <button
                            className="btn-icon btn-icon-delete"
                            onClick={() => handleDelete(m.id)}
                            title="Hapus Mahasiswa"
                          >
                            <i className="fa-solid fa-trash-can"></i>
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL FORM */}
      {modalOpen && (
        <div
          className="modal-backdrop active"
          onClick={(e) =>
            e.target.className.includes("modal-backdrop") && setModalOpen(false)
          }
        >
          <div className="modal-card">
            <div className="modal-header">
              <h3 id="modal-mahasiswa-title">
                {editId ? "Edit Data Mahasiswa" : "Tambah Mahasiswa Baru"}
              </h3>
              <button
                className="modal-close-btn"
                onClick={() => setModalOpen(false)}
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
            <form id="form-mahasiswa" onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label htmlFor="mhs-nim" className="form-label">
                    Nomor Induk Mahasiswa (NIM)
                  </label>
                  <input
                    type="text"
                    id="mhs-nim"
                    className="form-control"
                    required
                    placeholder="Contoh: 2026040101"
                    value={nim}
                    onChange={(e) => setNim(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="mhs-nama" className="form-label">
                    Nama Lengkap
                  </label>
                  <input
                    type="text"
                    id="mhs-nama"
                    className="form-control"
                    required
                    placeholder="Contoh: Ahmad Syarif"
                    value={nama}
                    onChange={(e) => setNama(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="mhs-prodi" className="form-label">
                    Program Studi
                  </label>
                  <input
                    type="text"
                    id="mhs-prodi"
                    className="form-control"
                    required
                    placeholder="Contoh: Teknik Informatika"
                    value={prodi}
                    onChange={(e) => setProdi(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="mhs-angkatan" className="form-label">
                    Angkatan (Tahun)
                  </label>
                  <input
                    type="number"
                    id="mhs-angkatan"
                    className="form-control"
                    required
                    min="2000"
                    max="2100"
                    placeholder="Contoh: 2026"
                    value={angkatan}
                    onChange={(e) => setAngkatan(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="mhs-status" className="form-label">
                    Status Akademik
                  </label>
                  <select
                    id="mhs-status"
                    className="form-control"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                  >
                    <option value="Aktif">Aktif</option>
                    <option value="Tidak Aktif">Tidak Aktif</option>
                    <option value="Cuti">Cuti</option>
                    <option value="Lulus">Lulus</option>
                  </select>
                </div>

                {/* USER LOGIN ACCOUNTS INTEGRATION */}
                <div
                  style={{
                    borderTop: "1px solid var(--border-color)",
                    marginTop: "20px",
                    paddingTop: "15px",
                  }}
                >
                  <h4
                    style={{
                      fontSize: "14px",
                      marginBottom: "10px",
                      color: "var(--primary)",
                    }}
                  >
                    Akun Login Mahasiswa (Opsional)
                  </h4>
                  <div className="form-group">
                    <label htmlFor="mhs-username" className="form-label">
                      Username Login
                    </label>
                    <input
                      type="text"
                      id="mhs-username"
                      className="form-control"
                      placeholder="Username untuk login mahasiswa"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="mhs-password" className="form-label">
                      Password Login
                    </label>
                    <input
                      type="password"
                      id="mhs-password"
                      className="form-control"
                      placeholder={
                        editId
                          ? "Kosongkan jika tidak diubah"
                          : "Password untuk login mahasiswa"
                      }
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setModalOpen(false)}
                >
                  Batal
                </button>
                <button type="submit" className="btn btn-primary">
                  Simpan Data
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
