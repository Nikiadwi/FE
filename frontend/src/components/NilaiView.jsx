import React, { useState, useEffect } from "react";
import * as XLSX from "xlsx"; // <-- TAMBAHKAN INI

export default function NilaiView({
  currentUser,
  apiRequest,
  showToast,
  onDeleteTrigger,
  modalOpenTrigger,
  setModalOpenTrigger,
}) {
  const [grades, setGrades] = useState([]);
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [lecturers, setLecturers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState(null);

  // Logged-in profile matches
  const [matchingDosen, setMatchingDosen] = useState(null);
  const [matchingStudent, setMatchingStudent] = useState(null);

  // Filters
  const [filterMhs, setFilterMhs] = useState("");
  const [filterMk, setFilterMk] = useState("");

  // Form states
  const [mahasiswaId, setMahasiswaId] = useState("");
  const [mataKuliahId, setMataKuliahId] = useState("");
  const [nilaiAngka, setNilaiAngka] = useState("");
  const [nilaiHuruf, setNilaiHuruf] = useState("");

  const fetchGrades = async (mId = filterMhs, mkId = filterMk) => {
    setLoading(true);
    try {
      let endpoint = "/api/nilai";
      const params = [];
      if (mId) params.push(`mahasiswa_id=${mId}`);
      if (mkId) params.push(`mata_kuliah_id=${mkId}`);
      if (params.length > 0) endpoint += `?${params.join("&")}`;

      const data = await apiRequest(endpoint);
      setGrades(data);
    } catch (err) {
      showToast("Gagal Memuat Data Nilai", err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchDropdowns = async () => {
    try {
      const studs = await apiRequest("/api/mahasiswa");
      const crss = await apiRequest("/api/matakuliah");
      const lcts = await apiRequest("/api/dosen");
      setStudents(studs);
      setCourses(crss);
      setLecturers(lcts);
    } catch (err) {
      console.error("Failed to load dropdowns", err);
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await Promise.all([fetchGrades(), fetchDropdowns()]);
      setLoading(false);
    };
    init();
  }, []);

  // Sync profile match for Mahasiswa
  useEffect(() => {
    if (students.length > 0 && currentUser.role === "mahasiswa") {
      const match = students.find(
        (s) =>
          s.username === currentUser.username ||
          s.nama.toLowerCase() === currentUser.nama?.toLowerCase(),
      );
      setMatchingStudent(match || null);
    }
  }, [students, currentUser]);

  // Sync profile match for Dosen
  useEffect(() => {
    if (lecturers.length > 0 && currentUser.role === "dosen") {
      const match = lecturers.find(
        (d) =>
          d.username === currentUser.username ||
          d.nama.toLowerCase() === currentUser.nama?.toLowerCase(),
      );
      setMatchingDosen(match || null);
    }
  }, [lecturers, currentUser]);

  // Handle outside trigger to open add modal
  useEffect(() => {
    if (modalOpenTrigger === "add-nilai") {
      handleOpenAddModal();
      setModalOpenTrigger(null); // Reset trigger
    }
  }, [modalOpenTrigger]);

  // Filter courses taught by matching Dosen
  const getFilteredCourses = () => {
    if (currentUser.role === "dosen" && matchingDosen) {
      return courses.filter((c) => c.dosen_id === matchingDosen.id);
    }
    return courses;
  };

  const filteredCourses = getFilteredCourses();

  // Filter grades displayed in the table
  const getFilteredGrades = () => {
    let result = grades;

    if (currentUser.role === "dosen" && matchingDosen) {
      // Dosen only sees grades for courses they teach
      result = result.filter((n) =>
        filteredCourses.some((c) => c.id === n.mata_kuliah_id),
      );
    } else if (currentUser.role === "mahasiswa" && matchingStudent) {
      // Mahasiswa only sees their own grades
      result = result.filter((n) => n.mahasiswa_id === matchingStudent.id);
    }

    return result;
  };

  const displayedGrades = getFilteredGrades();

  const handleFilterChange = (type, value) => {
    if (type === "mahasiswa") {
      setFilterMhs(value);
      fetchGrades(value, filterMk);
    } else {
      setFilterMk(value);
      fetchGrades(filterMhs, value);
    }
  };

  const handleResetFilter = () => {
    setFilterMhs("");
    setFilterMk("");
    fetchGrades("", "");
  };

  const handleOpenAddModal = async () => {
    setEditId(null);
    setMahasiswaId("");
    setMataKuliahId("");
    setNilaiAngka("");
    setNilaiHuruf("");
    await fetchDropdowns();
    setModalOpen(true);
  };

  const handleOpenEditModal = async (id) => {
    try {
      await fetchDropdowns();
      const n = await apiRequest(`/api/nilai/${id}`);
      setEditId(n.id);
      setMahasiswaId(n.mahasiswa_id);
      setMataKuliahId(n.mata_kuliah_id);
      setNilaiAngka(n.nilai_angka);
      setNilaiHuruf(n.nilai_huruf);
      setModalOpen(true);
    } catch (err) {
      showToast("Error", "Gagal memuat data detail nilai.", "error");
    }
  };

  const calculateGradeLetter = (valStr) => {
    const val = parseFloat(valStr);
    if (isNaN(val) || val < 0 || val > 100) return "";
    if (val >= 85) return "A";
    if (val >= 80) return "A-";
    if (val >= 75) return "B+";
    if (val >= 70) return "B";
    if (val >= 65) return "B-";
    if (val >= 60) return "C+";
    if (val >= 55) return "C";
    if (val >= 40) return "D";
    return "E";
  };

  const handleNilaiAngkaChange = (e) => {
    const val = e.target.value;
    setNilaiAngka(val);
    setNilaiHuruf(calculateGradeLetter(val));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!mahasiswaId || !mataKuliahId || !nilaiAngka || !nilaiHuruf) return;

    const payload = {
      mahasiswa_id: parseInt(mahasiswaId),
      mata_kuliah_id: parseInt(mataKuliahId),
      nilai_angka: parseFloat(nilaiAngka),
      nilai_huruf: nilaiHuruf,
    };

    try {
      if (editId) {
        await apiRequest(`/api/nilai/${editId}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
        showToast(
          "Data Diperbarui",
          "Data nilai mahasiswa berhasil di-update.",
          "success",
        );
      } else {
        await apiRequest("/api/nilai", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        showToast(
          "Data Ditambahkan",
          "Nilai mahasiswa berhasil diinput.",
          "success",
        );
      }
      setModalOpen(false);
      fetchGrades();
    } catch (err) {
      showToast("Gagal Menyimpan", err.message, "error");
    }
  };

  const handleDelete = (id) => {
    onDeleteTrigger("nilai", id, () => fetchGrades());
  };

  // ========== FUNGSI EXPORT EXCEL ==========
  const handleExportExcel = () => {
    if (displayedGrades.length === 0) {
      showToast(
        "Tidak Ada Data",
        "Data nilai kosong, tidak bisa export.",
        "error",
      );
      return;
    }

    const dataExcel = displayedGrades.map((n, index) => {
      const { predikat } = getBadgeAndPredicate(n.nilai_huruf);
      return {
        No: index + 1,
        "NIM - Mahasiswa": n.nama_mahasiswa || "-",
        "Kode - Mata Kuliah": n.nama_mata_kuliah || "-",
        "Nilai Angka": n.nilai_angka,
        "Nilai Huruf": n.nilai_huruf,
        "Predikat Evaluasi": predikat,
      };
    });

    const ws = XLSX.utils.json_to_sheet(dataExcel);
    ws["!cols"] = [
      { wch: 5 }, // No
      { wch: 30 }, // NIM - Mahasiswa
      { wch: 30 }, // Kode - Mata Kuliah
      { wch: 15 }, // Nilai Angka
      { wch: 15 }, // Nilai Huruf
      { wch: 25 }, // Predikat Evaluasi
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Data Nilai");
    XLSX.writeFile(
      wb,
      `data_nilai_${new Date().toISOString().slice(0, 10)}.xlsx`,
    );

    showToast(
      "Export Berhasil",
      `Data ${displayedGrades.length} nilai berhasil diexport ke Excel.`,
      "success",
    );
  };
  // ========== END FUNGSI EXPORT ==========

  const getBadgeAndPredicate = (letter) => {
    let badgeClass = "badge-status-tidak_aktif"; // E or F
    let predikat = "Sangat Kurang";

    if (["A", "A-"].includes(letter)) {
      badgeClass = "badge-status-aktif";
      predikat = "Istimewa / Sangat Baik";
    } else if (["B+", "B"].includes(letter)) {
      badgeClass = "badge-status-aktif";
      predikat = "Baik";
    } else if (["B-", "C+", "C"].includes(letter)) {
      badgeClass = "badge-status-lulus";
      predikat = "Cukup";
    } else if (["D"].includes(letter)) {
      badgeClass = "badge-status-cuti";
      predikat = "Kurang";
    } else if (["E", "F"].includes(letter)) {
      badgeClass = "badge-status-tidak_aktif";
      predikat = "Gagal";
    }

    return { badgeClass, predikat };
  };

  const isStudent = currentUser?.role === "mahasiswa";
  const isDosen = currentUser?.role === "dosen";

  return (
    <section id="view-nilai" className="view-section active">
      <div className="table-header-bar">
        <div
          className="search-box"
          style={{
            display: "flex",
            gap: "8px",
            flexWrap: "wrap",
            width: "auto",
            flexGrow: 1,
          }}
        >
          {/* Hide student filter for students */}
          {!isStudent && (
            <select
              id="filter-nilai-mahasiswa"
              className="form-control"
              style={{
                maxWidth: "250px",
                backgroundColor: "var(--bg-secondary)",
                borderColor: "var(--border-color)",
              }}
              value={filterMhs}
              onChange={(e) => handleFilterChange("mahasiswa", e.target.value)}
            >
              <option value="">-- Filter Mahasiswa (Semua) --</option>
              {students.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.nim} - {m.nama}
                </option>
              ))}
            </select>
          )}

          {/* Filter course dropdown */}
          <select
            id="filter-nilai-matakuliah"
            className="form-control"
            style={{
              maxWidth: "250px",
              backgroundColor: "var(--bg-secondary)",
              borderColor: "var(--border-color)",
            }}
            value={filterMk}
            onChange={(e) => handleFilterChange("matakuliah", e.target.value)}
          >
            <option value="">
              {isDosen
                ? "-- Filter MK yang Diajar (Semua) --"
                : "-- Filter Mata Kuliah (Semua) --"}
            </option>
            {filteredCourses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.kode_mk} - {c.nama_mk}
              </option>
            ))}
          </select>

          <button
            id="btn-reset-filter-nilai"
            className="btn btn-secondary"
            onClick={handleResetFilter}
          >
            <i className="fa-solid fa-rotate-left"></i> Reset Filter
          </button>
        </div>

        {/* TOMBOL EXPORT EXCEL */}
        <button className="btn btn-success" onClick={handleExportExcel}>
          <i className="fa-solid fa-file-excel"></i> Export Excel
        </button>

        {/* Hide add button for students */}
        {!isStudent && (
          <button
            id="btn-add-nilai"
            className="btn btn-primary"
            onClick={handleOpenAddModal}
          >
            <i className="fa-solid fa-plus"></i> Input Nilai Baru
          </button>
        )}
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>NIM - Mahasiswa</th>
              <th>Kode - Mata Kuliah</th>
              <th>Nilai Angka</th>
              <th>Nilai Huruf</th>
              <th>Predikat Evaluasi</th>
              {!isStudent && (
                <th style={{ width: "100px", textAlign: "center" }}>Aksi</th>
              )}
            </tr>
          </thead>
          <tbody id="table-body-nilai">
            {loading ? (
              <tr>
                <td colSpan={isStudent ? 5 : 6} style={{ textAlign: "center" }}>
                  <i className="fa-solid fa-spinner fa-spin"></i> Memuat data...
                </td>
              </tr>
            ) : displayedGrades.length === 0 ? (
              <tr>
                <td
                  colSpan={isStudent ? 5 : 6}
                  style={{ textAlign: "center", color: "var(--text-muted)" }}
                >
                  Tidak ada data nilai ditemukan.
                </td>
              </tr>
            ) : (
              displayedGrades.map((n) => {
                const { badgeClass, predikat } = getBadgeAndPredicate(
                  n.nilai_huruf,
                );
                return (
                  <tr key={n.id}>
                    <td style={{ fontWeight: 600 }}>
                      {n.nama_mahasiswa || (
                        <span className="text-muted">-</span>
                      )}
                    </td>
                    <td>
                      {n.nama_mata_kuliah || (
                        <span className="text-muted">-</span>
                      )}
                    </td>
                    <td
                      style={{
                        fontWeight: 700,
                        fontSize: "15px",
                        color: "var(--primary)",
                      }}
                    >
                      {n.nilai_angka}
                    </td>
                    <td
                      style={{
                        fontWeight: 800,
                        fontSize: "16px",
                        textAlign: "center",
                      }}
                    >
                      <span
                        style={{
                          display: "inline-block",
                          width: "32px",
                          height: "32px",
                          lineHeight: "28px",
                          borderRadius: "50%",
                          border: "2px solid var(--border-color)",
                        }}
                      >
                        {n.nilai_huruf}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${badgeClass}`}>{predikat}</span>
                    </td>
                    {!isStudent && (
                      <td style={{ textAlign: "center" }}>
                        <div className="action-buttons">
                          <button
                            className="btn-icon btn-icon-edit"
                            onClick={() => handleOpenEditModal(n.id)}
                            title="Edit Nilai"
                          >
                            <i className="fa-solid fa-pen-to-square"></i>
                          </button>
                          <button
                            className="btn-icon btn-icon-delete"
                            onClick={() => handleDelete(n.id)}
                            title="Hapus Nilai"
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
              <h3 id="modal-nilai-title">
                {editId ? "Edit Nilai Mahasiswa" : "Input Nilai Mahasiswa"}
              </h3>
              <button
                className="modal-close-btn"
                onClick={() => setModalOpen(false)}
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
            <form id="form-nilai" onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label htmlFor="nilai-mahasiswa" className="form-label">
                    Nama Mahasiswa
                  </label>
                  <select
                    id="nilai-mahasiswa"
                    className="form-control"
                    required
                    value={mahasiswaId}
                    onChange={(e) => setMahasiswaId(e.target.value)}
                  >
                    <option value="" disabled>
                      -- Pilih Mahasiswa --
                    </option>
                    {students.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.nim} - {m.nama}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="nilai-matakuliah" className="form-label">
                    Mata Kuliah
                  </label>
                  <select
                    id="nilai-matakuliah"
                    className="form-control"
                    required
                    value={mataKuliahId}
                    onChange={(e) => setMataKuliahId(e.target.value)}
                  >
                    <option value="" disabled>
                      -- Pilih Mata Kuliah --
                    </option>
                    {filteredCourses.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.kode_mk} - {c.nama_mk}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="nilai-angka" className="form-label">
                    Nilai Angka (0 - 100)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    id="nilai-angka"
                    className="form-control"
                    required
                    min="0"
                    max="100"
                    placeholder="Contoh: 85.5"
                    value={nilaiAngka}
                    onChange={handleNilaiAngkaChange}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="nilai-huruf" className="form-label">
                    Nilai Huruf
                  </label>
                  <input
                    type="text"
                    id="nilai-huruf"
                    className="form-control"
                    required
                    readOnly
                    placeholder="Akan dihitung otomatis..."
                    style={{
                      backgroundColor: "var(--bg-primary)",
                      cursor: "not-allowed",
                      fontWeight: "bold",
                      textAlign: "center",
                      fontSize: "16px",
                    }}
                    value={nilaiHuruf}
                  />
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
