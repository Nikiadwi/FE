import { useState, useEffect } from "react";

function AdminDosen() {
  const [dosens, setDosens] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    nama: "",
    username: "",
    nidn: "",
    password: "",
    keahlian: "",
  });

  useEffect(() => {
    setDosens([
      {
        nidn: "0012345678",
        nama: "Dr. Jonas Schmedtmann",
        jabatan: "Dosen Tetap • Lektor Kepala",
        keahlian: "Web Architecture",
      },
    ]);
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newDosen = {
      nidn: formData.nidn,
      nama: formData.nama,
      jabatan: "Dosen Tetap",
      keahlian: formData.keahlian,
    };
    setDosens([...dosens, newDosen]);
    setFormData({
      nama: "",
      username: "",
      nidn: "",
      password: "",
      keahlian: "",
    });
    setShowModal(false);
    alert("Dosen berhasil ditambahkan!");
  };

  return (
    <>
      <div className="admin-wrapper min-vh-100 p-4 p-md-5">
        <div className="d-flex justify-content-between align-items-center mb-5 animate-fade-in">
          <div>
            <h2 className="fw-bold text-dark-blue mb-1">
              <span className="accent-pill"></span>Data Dosen
            </h2>
            <p className="text-secondary small mb-0 ms-3">
              Sistem Informasi Manajemen Terintegrasi (SIMANTAP)
            </p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="btn btn-primary rounded-3 px-4 py-2 fw-bold border-0 shadow"
            style={{ background: "#0d6efd" }}
          >
            <i className="bi bi-person-plus-fill me-2"></i>Tambah Dosen
          </button>
        </div>

        <div className="card shadow-sm rounded-4 overflow-hidden">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th className="ps-4 py-3">NIDN</th>
                  <th className="py-3">Nama Dosen</th>
                  <th className="py-3">Keahlian</th>
                  <th className="text-end pe-4 py-3">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {dosens.map((dosen, index) => (
                  <tr key={index}>
                    <td className="ps-4 fw-bold text-primary">{dosen.nidn}</td>
                    <td>
                      <div className="d-flex align-items-center">
                        <div className="avatar-icon me-3">
                          <i className="bi bi-person-badge-fill fs-4 text-secondary"></i>
                        </div>
                        <div>
                          <div className="fw-bold">{dosen.nama}</div>
                          <div className="text-muted small">
                            {dosen.jabatan}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="badge bg-primary bg-opacity-10 text-primary">
                        {dosen.keahlian}
                      </span>
                    </td>
                    <td className="text-end pe-4">
                      <button className="btn btn-sm btn-outline-primary me-2">
                        <i className="bi bi-pencil-fill"></i>
                      </button>
                      <button className="btn btn-sm btn-outline-danger">
                        <i className="bi bi-trash3-fill"></i>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal Tambah Dosen - PAKE BOOTSTRAP CLASS */}
      {showModal && (
        <div
          className="modal fade show"
          style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg rounded-4">
              <div className="modal-header border-0 pb-0 pt-4 px-4">
                <h5 className="fw-bold">Tambah Dosen Baru</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowModal(false)}
                ></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body p-4">
                  <div className="mb-3">
                    <label className="form-label small fw-bold">
                      Nama Lengkap Dosen
                    </label>
                    <input
                      type="text"
                      name="nama"
                      className="form-control"
                      placeholder="Nama Lengkap..."
                      value={formData.nama}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label small fw-bold">
                        Username
                      </label>
                      <input
                        type="text"
                        name="username"
                        className="form-control"
                        placeholder="username_dosen"
                        value={formData.username}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label small fw-bold">NIDN</label>
                      <input
                        type="text"
                        name="nidn"
                        className="form-control"
                        placeholder="Input NIDN..."
                        value={formData.nidn}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label small fw-bold">
                        Password Akun
                      </label>
                      <input
                        type="password"
                        name="password"
                        className="form-control"
                        placeholder="******"
                        value={formData.password}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label small fw-bold">
                        Keahlian
                      </label>
                      <select
                        name="keahlian"
                        className="form-select"
                        value={formData.keahlian}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="" disabled>
                          Pilih Keahlian
                        </option>
                        <option value="Web Architecture">
                          Web Architecture
                        </option>
                        <option value="Data Science">Data Science</option>
                        <option value="Layanan Web">Layanan Web</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div className="modal-footer border-0 p-4 pt-0">
                  <button
                    type="button"
                    className="btn btn-light"
                    onClick={() => setShowModal(false)}
                  >
                    Batal
                  </button>
                  <button type="submit" className="btn btn-primary px-4">
                    Simpan Data Dosen
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default AdminDosen;
