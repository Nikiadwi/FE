import React, { useState, useEffect, useRef } from 'react';

export default function MataKuliahView({ currentUser, apiRequest, showToast, onDeleteTrigger, modalOpenTrigger, setModalOpenTrigger }) {
  const [courses, setCourses] = useState([]);
  const [lecturers, setLecturers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState(null);

  // Form states
  const [kodeMk, setKodeMk] = useState('');
  const [namaMk, setNamaMk] = useState('');
  const [sks, setSks] = useState('');
  const [dosenId, setDosenId] = useState('');

  const searchTimeoutRef = useRef(null);

  const fetchCourses = async (searchVal = '') => {
    setLoading(true);
    try {
      const query = searchVal ? `/api/matakuliah?search=${encodeURIComponent(searchVal)}` : '/api/matakuliah';
      const data = await apiRequest(query);
      setCourses(data);
    } catch (err) {
      showToast('Gagal Memuat Data', err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchLecturers = async () => {
    try {
      const data = await apiRequest('/api/dosen');
      setLecturers(data);
    } catch (err) {
      console.error('Failed to load lecturers for select dropdown', err);
    }
  };

  useEffect(() => {
    fetchCourses();
    fetchLecturers();
  }, []);

  // Handle outside trigger to open add modal
  useEffect(() => {
    if (modalOpenTrigger === 'add-matakuliah') {
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
      fetchCourses(value.trim());
    }, 300);
  };

  const handleOpenAddModal = async () => {
    setEditId(null);
    setKodeMk('');
    setNamaMk('');
    setSks('3');
    setDosenId('');
    await fetchLecturers();
    setModalOpen(true);
  };

  const handleOpenEditModal = async (id) => {
    try {
      await fetchLecturers();
      const mk = await apiRequest(`/api/matakuliah/${id}`);
      setEditId(mk.id);
      setKodeMk(mk.kode_mk);
      setNamaMk(mk.nama_mk);
      setSks(mk.sks);
      setDosenId(mk.dosen_id || '');
      setModalOpen(true);
    } catch (err) {
      showToast('Error', 'Gagal memuat data detail mata kuliah.', 'error');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!kodeMk || !namaMk || !sks) return;

    const payload = {
      kode_mk: kodeMk,
      nama_mk: namaMk,
      sks: parseInt(sks),
      dosen_id: dosenId ? parseInt(dosenId) : null,
    };

    try {
      if (editId) {
        await apiRequest(`/api/matakuliah/${editId}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        });
        showToast('Data Diperbarui', 'Data mata kuliah berhasil di-update.', 'success');
      } else {
        await apiRequest('/api/matakuliah', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
        showToast('Data Ditambahkan', 'Mata kuliah baru berhasil disimpan.', 'success');
      }
      setModalOpen(false);
      fetchCourses(search);
    } catch (err) {
      showToast('Gagal Menyimpan', err.message, 'error');
    }
  };

  const handleDelete = (id) => {
    onDeleteTrigger('matakuliah', id, () => fetchCourses(search));
  };

  const isStudent = currentUser?.role === 'mahasiswa';

  return (
    <section id="view-matakuliah" className="view-section active">
      <div className="table-header-bar">
        <div className="search-box">
          <i className="fa-solid fa-magnifying-glass"></i>
          <input
            type="text"
            id="search-matakuliah"
            className="search-input"
            placeholder="Cari berdasarkan Kode atau Nama MK..."
            value={search}
            onChange={handleSearchChange}
          />
        </div>
        {!isStudent && (
          <button id="btn-add-matakuliah" className="btn btn-primary" onClick={handleOpenAddModal}>
            <i className="fa-solid fa-plus"></i> Tambah Mata Kuliah
          </button>
        )}
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Kode MK</th>
              <th>Nama Mata Kuliah</th>
              <th>SKS</th>
              <th>Dosen Pengampu</th>
              {!isStudent && <th style={{ width: '100px', textAlign: 'center' }}>Aksi</th>}
            </tr>
          </thead>
          <tbody id="table-body-matakuliah">
            {loading ? (
              <tr>
                <td colSpan={isStudent ? 4 : 5} style={{ textAlign: 'center' }}>
                  <i className="fa-solid fa-spinner fa-spin"></i> Memuat data...
                </td>
              </tr>
            ) : courses.length === 0 ? (
              <tr>
                <td colSpan={isStudent ? 4 : 5} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                  Tidak ada mata kuliah ditemukan.
                </td>
              </tr>
            ) : (
              courses.map((mk) => (
                <tr key={mk.id}>
                  <td style={{ fontWeight: 700 }}>{mk.kode_mk}</td>
                  <td style={{ fontWeight: 600 }}>{mk.nama_mk}</td>
                  <td>
                    <strong style={{ color: 'var(--primary)' }}>{mk.sks}</strong> SKS
                  </td>
                  <td>
                    {mk.dosen_pengampu || (
                      <span className="text-muted" style={{ fontStyle: 'italic' }}>
                        Belum ditentukan
                      </span>
                    )}
                  </td>
                  {!isStudent && (
                    <td style={{ textAlign: 'center' }}>
                      <div className="action-buttons">
                        <button
                          className="btn-icon btn-icon-edit"
                          onClick={() => handleOpenEditModal(mk.id)}
                          title="Edit Mata Kuliah"
                        >
                          <i className="fa-solid fa-pen-to-square"></i>
                        </button>
                        <button
                          className="btn-icon btn-icon-delete"
                          onClick={() => handleDelete(mk.id)}
                          title="Hapus Mata Kuliah"
                        >
                          <i className="fa-solid fa-trash-can"></i>
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL FORM */}
      {modalOpen && (
        <div className="modal-backdrop active" onClick={(e) => e.target.className.includes('modal-backdrop') && setModalOpen(false)}>
          <div className="modal-card">
            <div className="modal-header">
              <h3 id="modal-matakuliah-title">{editId ? 'Edit Mata Kuliah' : 'Tambah Mata Kuliah'}</h3>
              <button className="modal-close-btn" onClick={() => setModalOpen(false)}>
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
            <form id="form-matakuliah" onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label htmlFor="mk-kode" className="form-label">
                    Kode Mata Kuliah
                  </label>
                  <input
                    type="text"
                    id="mk-kode"
                    className="form-control"
                    required
                    placeholder="Contoh: IF101"
                    value={kodeMk}
                    onChange={(e) => setKodeMk(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="mk-nama" className="form-label">
                    Nama Mata Kuliah
                  </label>
                  <input
                    type="text"
                    id="mk-nama"
                    className="form-control"
                    required
                    placeholder="Contoh: Pemrograman Web"
                    value={namaMk}
                    onChange={(e) => setNamaMk(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="mk-sks" className="form-label">
                    Jumlah SKS
                  </label>
                  <input
                    type="number"
                    id="mk-sks"
                    className="form-control"
                    required
                    min="1"
                    max="6"
                    placeholder="Contoh: 3"
                    value={sks}
                    onChange={(e) => setSks(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="mk-dosen" className="form-label">
                    Dosen Pengampu
                  </label>
                  <select
                    id="mk-dosen"
                    className="form-control"
                    value={dosenId}
                    onChange={(e) => setDosenId(e.target.value)}
                  >
                    <option value="">-- Pilih Dosen Pengampu --</option>
                    {lecturers.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.nama}
                      </option>
                    ))}
                  </select>
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
