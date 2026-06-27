import React, { useState, useEffect, useRef } from 'react';

export default function DosenView({ currentUser, apiRequest, showToast, onDeleteTrigger, modalOpenTrigger, setModalOpenTrigger }) {
  const [lecturers, setLecturers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState(null);

  // Form states
  const [nidn, setNidn] = useState('');
  const [nama, setNama] = useState('');
  const [statusDosen, setStatusDosen] = useState('Dosen Tetap');
  const [jabatan, setJabatan] = useState('');
  const [keahlian, setKeahlian] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const searchTimeoutRef = useRef(null);

  const fetchLecturers = async (searchVal = '') => {
    setLoading(true);
    try {
      const query = searchVal ? `/api/dosen?search=${encodeURIComponent(searchVal)}` : '/api/dosen';
      const data = await apiRequest(query);
      setLecturers(data);
    } catch (err) {
      showToast('Gagal Memuat Data', err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLecturers();
  }, []);

  // Handle outside trigger to open add modal
  useEffect(() => {
    if (modalOpenTrigger === 'add-dosen') {
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
      fetchLecturers(value.trim());
    }, 300);
  };

  const handleOpenAddModal = () => {
    setEditId(null);
    setNidn('');
    setNama('');
    setStatusDosen('Dosen Tetap');
    setJabatan('');
    setKeahlian('');
    setUsername('');
    setPassword('');
    setModalOpen(true);
  };

  const handleOpenEditModal = async (id) => {
    try {
      const d = await apiRequest(`/api/dosen/${id}`);
      setEditId(d.id);
      setNidn(d.nidn);
      setNama(d.nama);
      setStatusDosen(d.status_dosen);
      setJabatan(d.jabatan || '');
      setKeahlian(d.keahlian || '');
      setUsername(d.username || '');
      setPassword(''); // Keep blank unless updating
      setModalOpen(true);
    } catch (err) {
      showToast('Error', 'Gagal memuat data detail dosen.', 'error');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!nidn || !nama) return;

    const payload = {
      nidn,
      nama,
      status_dosen: statusDosen,
      jabatan: jabatan.trim() || null,
      keahlian: keahlian.trim() || null,
      username: username.trim() || null,
    };

    if (password) {
      payload.password = password;
    }

    try {
      if (editId) {
        await apiRequest(`/api/dosen/${editId}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        });
        showToast('Data Diperbarui', 'Data dosen berhasil di-update.', 'success');
      } else {
        await apiRequest('/api/dosen', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
        showToast('Data Ditambahkan', 'Dosen baru berhasil disimpan.', 'success');
      }
      setModalOpen(false);
      fetchLecturers(search);
    } catch (err) {
      showToast('Gagal Menyimpan', err.message, 'error');
    }
  };

  const handleDelete = (id) => {
    onDeleteTrigger('dosen', id, () => fetchLecturers(search));
  };

  const isStudent = currentUser?.role === 'mahasiswa';

  return (
    <section id="view-dosen" className="view-section active">
      <div className="table-header-bar">
        <div className="search-box">
          <i className="fa-solid fa-magnifying-glass"></i>
          <input
            type="text"
            id="search-dosen"
            className="search-input"
            placeholder="Cari berdasarkan NIDN atau Nama..."
            value={search}
            onChange={handleSearchChange}
          />
        </div>
        {!isStudent && (
          <button id="btn-add-dosen" className="btn btn-primary" onClick={handleOpenAddModal}>
            <i className="fa-solid fa-plus"></i> Tambah Dosen Baru
          </button>
        )}
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>NIDN</th>
              <th>Nama Lengkap</th>
              <th>Status Dosen</th>
              <th>Jabatan Akademik</th>
              <th>Bidang Keahlian</th>
              {!isStudent && <th style={{ width: '100px', textAlign: 'center' }}>Aksi</th>}
            </tr>
          </thead>
          <tbody id="table-body-dosen">
            {loading ? (
              <tr>
                <td colSpan={isStudent ? 5 : 6} style={{ textAlign: 'center' }}>
                  <i className="fa-solid fa-spinner fa-spin"></i> Memuat data...
                </td>
              </tr>
            ) : lecturers.length === 0 ? (
              <tr>
                <td colSpan={isStudent ? 5 : 6} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                  Tidak ada data dosen ditemukan.
                </td>
              </tr>
            ) : (
              lecturers.map((d) => {
                const statusClass = d.status_dosen.toLowerCase().replace(/ /g, '_');
                return (
                  <tr key={d.id}>
                    <td style={{ fontWeight: 700 }}>{d.nidn}</td>
                    <td style={{ fontWeight: 600 }}>{d.nama}</td>
                    <td>
                      <span className={`badge badge-dosen-${statusClass}`}>
                        {d.status_dosen}
                      </span>
                    </td>
                    <td>{d.jabatan || <span className="text-muted">-</span>}</td>
                    <td>{d.keahlian || <span className="text-muted">-</span>}</td>
                    {!isStudent && (
                      <td style={{ textAlign: 'center' }}>
                        <div className="action-buttons">
                          <button
                            className="btn-icon btn-icon-edit"
                            onClick={() => handleOpenEditModal(d.id)}
                            title="Edit Dosen"
                          >
                            <i className="fa-solid fa-pen-to-square"></i>
                          </button>
                          <button
                            className="btn-icon btn-icon-delete"
                            onClick={() => handleDelete(d.id)}
                            title="Hapus Dosen"
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
        <div className="modal-backdrop active" onClick={(e) => e.target.className.includes('modal-backdrop') && setModalOpen(false)}>
          <div className="modal-card">
            <div className="modal-header">
              <h3 id="modal-dosen-title">{editId ? 'Edit Data Dosen' : 'Tambah Dosen Baru'}</h3>
              <button className="modal-close-btn" onClick={() => setModalOpen(false)}>
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
            <form id="form-dosen" onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label htmlFor="dosen-nidn" className="form-label">
                    Nomor Induk Dosen Nasional (NIDN)
                  </label>
                  <input
                    type="text"
                    id="dosen-nidn"
                    className="form-control"
                    required
                    placeholder="Contoh: 0012345678"
                    value={nidn}
                    onChange={(e) => setNidn(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="dosen-nama" className="form-label">
                    Nama Lengkap beserta Gelar
                  </label>
                  <input
                    type="text"
                    id="dosen-nama"
                    className="form-control"
                    required
                    placeholder="Contoh: Dr. Jonas Schmedtmann"
                    value={nama}
                    onChange={(e) => setNama(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="dosen-status" className="form-label">
                    Status Kepegawaian
                  </label>
                  <select
                    id="dosen-status"
                    className="form-control"
                    value={statusDosen}
                    onChange={(e) => setStatusDosen(e.target.value)}
                  >
                    <option value="Dosen Tetap">Dosen Tetap</option>
                    <option value="Dosen Tidak Tetap">Dosen Tidak Tetap</option>
                    <option value="Dosen Luar Biasa">Dosen Luar Biasa</option>
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="dosen-jabatan" className="form-label">
                    Jabatan Fungsional
                  </label>
                  <input
                    type="text"
                    id="dosen-jabatan"
                    className="form-control"
                    placeholder="Contoh: Lektor Kepala"
                    value={jabatan}
                    onChange={(e) => setJabatan(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="dosen-keahlian" className="form-label">
                    Bidang Keahlian
                  </label>
                  <input
                    type="text"
                    id="dosen-keahlian"
                    className="form-control"
                    placeholder="Contoh: Web Architecture, Machine Learning"
                    value={keahlian}
                    onChange={(e) => setKeahlian(e.target.value)}
                  />
                </div>

                {/* USER LOGIN ACCOUNTS INTEGRATION */}
                <div style={{ borderTop: '1px solid var(--border-color)', marginTop: '20px', paddingTop: '15px' }}>
                  <h4 style={{ fontSize: '14px', marginBottom: '10px', color: 'var(--primary)' }}>
                    Akun Login Dosen (Opsional)
                  </h4>
                  <div className="form-group">
                    <label htmlFor="dosen-username" className="form-label">
                      Username Login
                    </label>
                    <input
                      type="text"
                      id="dosen-username"
                      className="form-control"
                      placeholder="Username untuk login dosen"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="dosen-password" className="form-label">
                      Password Login
                    </label>
                    <input
                      type="password"
                      id="dosen-password"
                      className="form-control"
                      placeholder={editId ? "Kosongkan jika tidak diubah" : "Password untuk login dosen"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setModalOpen(false)}>
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
