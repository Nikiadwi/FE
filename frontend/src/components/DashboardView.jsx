import React, { useState, useEffect } from 'react';

export default function DashboardView({ currentUser, apiRequest, showToast, onViewChange, triggerQuickAction }) {
  const [stats, setStats] = useState({
    total_mahasiswa: 0,
    total_dosen: 0,
    total_mata_kuliah: 0,
    total_nilai: 0,
  });
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      const data = await apiRequest('/api/dashboard');
      setStats({
        total_mahasiswa: data.total_mahasiswa,
        total_dosen: data.total_dosen,
        total_mata_kuliah: data.total_mata_kuliah,
        total_nilai: data.total_nilai,
      });
    } catch (err) {
      showToast('Gagal Memuat Dashboard', err.message, 'error');
    }
  };

  const fetchProfile = async () => {
    if (!currentUser || currentUser.role === 'admin') return;
    try {
      if (currentUser.role === 'mahasiswa') {
        const students = await apiRequest('/api/mahasiswa');
        const match = students.find(
          (s) =>
            s.username === currentUser.username ||
            s.nama.toLowerCase() === currentUser.nama?.toLowerCase()
        );
        if (match) setProfileData({ ...match, type: 'mahasiswa' });
      } else if (currentUser.role === 'dosen') {
        const lecturers = await apiRequest('/api/dosen');
        const match = lecturers.find(
          (d) =>
            d.username === currentUser.username ||
            d.nama.toLowerCase() === currentUser.nama?.toLowerCase()
        );
        if (match) setProfileData({ ...match, type: 'dosen' });
      }
    } catch (err) {
      console.warn('Failed to load profile details for dashboard', err);
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await Promise.all([fetchDashboardData(), fetchProfile()]);
      setLoading(false);
    };
    init();
  }, [currentUser]);

  const maxVal = Math.max(
    stats.total_mahasiswa,
    stats.total_dosen,
    stats.total_mata_kuliah,
    stats.total_nilai,
    1
  );

  const getPercentage = (val) => Math.max((val / maxVal) * 100, 5);

  const handleQuickAction = (action) => {
    if (currentUser && currentUser.role === 'mahasiswa') {
      showToast('Akses Ditolak', 'Mahasiswa tidak diizinkan menambah data.', 'warning');
      return;
    }
    triggerQuickAction(action);
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px 0' }}>
        <i className="fa-solid fa-spinner fa-spin fa-2x" style={{ color: 'var(--primary)' }}></i>
        <p style={{ marginTop: '10px', color: 'var(--text-secondary)' }}>Memuat data...</p>
      </div>
    );
  }

  // MAHASISWA PERSONALIZED VIEW
  if (currentUser.role === 'mahasiswa') {
    return (
      <section id="view-dashboard" className="view-section active">
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
          {/* Left Column: Personal Profile Card */}
          <div className="card">
            <div className="card-header">
              <h3>
                <i className="fa-solid fa-id-card" style={{ color: 'var(--primary)', marginRight: '8px' }}></i>{' '}
                Profil Pribadi Mahasiswa
              </h3>
            </div>
            <div className="card-body" style={{ padding: '24px' }}>
              {profileData ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
                    <span style={{ fontWeight: '600', color: 'var(--text-secondary)' }}>Nomor Induk Mahasiswa (NIM)</span>
                    <span style={{ fontWeight: '700', color: 'var(--primary)' }}>{profileData.nim}</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
                    <span style={{ fontWeight: '600', color: 'var(--text-secondary)' }}>Nama Lengkap</span>
                    <span style={{ fontWeight: '600' }}>{profileData.nama}</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
                    <span style={{ fontWeight: '600', color: 'var(--text-secondary)' }}>Program Studi</span>
                    <span>{profileData.program_studi}</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
                    <span style={{ fontWeight: '600', color: 'var(--text-secondary)' }}>Angkatan (Tahun)</span>
                    <span>{profileData.angkatan}</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', paddingBottom: '4px' }}>
                    <span style={{ fontWeight: '600', color: 'var(--text-secondary)' }}>Status Akademik</span>
                    <div>
                      <span className={`badge badge-status-${profileData.status.toLowerCase().replace(' ', '_')}`}>
                        <i className="fa-solid fa-circle" style={{ fontSize: '8px', marginRight: '6px' }}></i>{' '}
                        {profileData.status}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{ color: 'var(--text-secondary)' }}>
                  Data profil mahasiswa tidak ditemukan di database untuk username: <strong>{currentUser.username}</strong>.
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Status info */}
          <div className="card">
            <div className="card-header">
              <h3>
                <i className="fa-solid fa-info-circle" style={{ color: 'var(--info)', marginRight: '8px' }}></i>{' '}
                Hak Akses Anda
              </h3>
            </div>
            <div className="card-body" style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
              <p style={{ marginBottom: '12px' }}>
                Selamat datang di portal akademik <strong>SIMANTEP</strong>.
              </p>
              <p style={{ marginBottom: '12px' }}>
                Sebagai <strong>Mahasiswa</strong>, Anda memiliki hak akses terbatas untuk:
              </p>
              <ul style={{ paddingLeft: '20px', marginBottom: '12px' }}>
                <li>Melihat informasi profil pribadi Anda di halaman ini.</li>
                <li>Melihat rekaman nilai akademik Anda sendiri di menu <strong>Nilai Saya</strong>.</li>
              </ul>
              <p style={{ fontSize: '12px', fontStyle: 'italic', color: 'var(--text-muted)' }}>
                *Jika terdapat ketidaksesuaian data, silakan hubungi dosen pengampu atau administrator sistem.
              </p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // DOSEN & ADMIN VIEW
  return (
    <section id="view-dashboard" className="view-section active">
      {currentUser.role === 'admin' ? (
        <div className="dashboard-grid">
          {/* Total Mahasiswa */}
          <div
            className="stat-card"
            style={{
              '--accent-gradient': 'linear-gradient(135deg, #6366f1, #4f46e5)',
              '--accent-light': 'rgba(99, 102, 241, 0.1)',
              '--accent-color': '#6366f1',
            }}
          >
            <div className="stat-info">
              <span className="stat-label">Total Mahasiswa</span>
              <span id="stat-total-mahasiswa" className="stat-value">
                {stats.total_mahasiswa}
              </span>
            </div>
            <div className="stat-icon">
              <i className="fa-solid fa-user-graduate"></i>
            </div>
          </div>

          {/* Total Dosen */}
          <div
            className="stat-card"
            style={{
              '--accent-gradient': 'linear-gradient(135deg, #10b981, #059669)',
              '--accent-light': 'rgba(16, 185, 129, 0.1)',
              '--accent-color': '#10b981',
            }}
          >
            <div className="stat-info">
              <span className="stat-label">Total Dosen</span>
              <span id="stat-total-dosen" className="stat-value">
                {stats.total_dosen}
              </span>
            </div>
            <div className="stat-icon">
              <i className="fa-solid fa-user-tie"></i>
            </div>
          </div>

          {/* Total Mata Kuliah */}
          <div
            className="stat-card"
            style={{
              '--accent-gradient': 'linear-gradient(135deg, #06b6d4, #0891b2)',
              '--accent-light': 'rgba(6, 182, 212, 0.1)',
              '--accent-color': '#06b6d4',
            }}
          >
            <div className="stat-info">
              <span className="stat-label">Total Mata Kuliah</span>
              <span id="stat-total-matakuliah" className="stat-value">
                {stats.total_mata_kuliah}
              </span>
            </div>
            <div className="stat-icon">
              <i className="fa-solid fa-book"></i>
            </div>
          </div>

          {/* Total Record Nilai */}
          <div
            className="stat-card"
            style={{
              '--accent-gradient': 'linear-gradient(135deg, #f59e0b, #d97706)',
              '--accent-light': 'rgba(245, 158, 11, 0.1)',
              '--accent-color': '#f59e0b',
            }}
          >
            <div className="stat-info">
              <span className="stat-label">Total Record Nilai</span>
              <span id="stat-total-nilai" className="stat-value">
                {stats.total_nilai}
              </span>
            </div>
            <div className="stat-icon">
              <i className="fa-solid fa-file-signature"></i>
            </div>
          </div>
        </div>
      ) : (
        /* Dosen Profile Card */
        <div className="card" style={{ marginBottom: '24px' }}>
          <div className="card-header">
            <h3>
              <i className="fa-solid fa-id-card" style={{ color: 'var(--primary)', marginRight: '8px' }}></i>{' '}
              Profil Pribadi Dosen
            </h3>
          </div>
          <div className="card-body" style={{ padding: '24px' }}>
            {profileData ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '600' }}>NIDN</span>
                  <span style={{ fontWeight: '700', color: 'var(--primary)' }}>{profileData.nidn}</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '600' }}>Nama Dosen</span>
                  <span style={{ fontWeight: '600' }}>{profileData.nama}</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '600' }}>Status Dosen</span>
                  <div>
                    <span className="badge badge-dosen-dosen_tetap">{profileData.status_dosen}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '600' }}>Jabatan</span>
                  <span>{profileData.jabatan || '-'}</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '600' }}>Bidang Keahlian</span>
                  <span>{profileData.keahlian || '-'}</span>
                </div>
              </div>
            ) : (
              <div style={{ color: 'var(--text-secondary)' }}>
                Data profil dosen tidak ditemukan di database untuk username: <strong>{currentUser.username}</strong>.
              </div>
            )}
          </div>
        </div>
      )}

      <div className="dashboard-details">
        {/* Visual Chart */}
        <div className="card">
          <div className="card-header">
            <h3>
              <i className="fa-solid fa-chart-bar" style={{ color: 'var(--primary)', marginRight: '8px' }}></i>{' '}
              Visualisasi Statistik Data
            </h3>
          </div>
          <div className="card-body">
            <div className="chart-placeholder">
              <div className="chart-bar-container">
                <div
                  id="chart-bar-mhs"
                  className="chart-bar"
                  data-value={stats.total_mahasiswa}
                  style={{ height: `${getPercentage(stats.total_mahasiswa)}%` }}
                ></div>
                <span className="chart-bar-label">Mahasiswa</span>
              </div>
              <div className="chart-bar-container">
                <div
                  id="chart-bar-dosen"
                  className="chart-bar"
                  data-value={stats.total_dosen}
                  style={{
                    height: `${getPercentage(stats.total_dosen)}%`,
                    background: 'linear-gradient(to top, #10b981, #34d399)',
                  }}
                ></div>
                <span className="chart-bar-label">Dosen</span>
              </div>
              <div className="chart-bar-container">
                <div
                  id="chart-bar-mk"
                  className="chart-bar"
                  data-value={stats.total_mata_kuliah}
                  style={{
                    height: `${getPercentage(stats.total_mata_kuliah)}%`,
                    background: 'linear-gradient(to top, #06b6d4, #22d3ee)',
                  }}
                ></div>
                <span className="chart-bar-label">Mata Kuliah</span>
              </div>
              <div className="chart-bar-container">
                <div
                  id="chart-bar-nilai"
                  className="chart-bar"
                  data-value={stats.total_nilai}
                  style={{
                    height: `${getPercentage(stats.total_nilai)}%`,
                    background: 'linear-gradient(to top, #f59e0b, #fbbf24)',
                  }}
                ></div>
                <span className="chart-bar-label">Nilai</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card">
          <div className="card-header">
            <h3>
              <i className="fa-solid fa-bolt" style={{ color: 'var(--warning)', marginRight: '8px' }}></i> Akses Cepat
            </h3>
          </div>
          <div className="card-body">
            <div className="quick-actions-list">
              {currentUser.role === 'admin' ? (
                <>
                  <button className="quick-action-btn" onClick={() => handleQuickAction('add-mahasiswa')}>
                    <i className="fa-solid fa-plus"></i> Tambah Mahasiswa
                  </button>
                  <button className="quick-action-btn" onClick={() => handleQuickAction('add-dosen')}>
                    <i className="fa-solid fa-plus"></i> Tambah Dosen Baru
                  </button>
                  <button className="quick-action-btn" onClick={() => handleQuickAction('add-nilai')}>
                    <i className="fa-solid fa-plus"></i> Input Nilai Baru
                  </button>
                </>
              ) : (
                /* Dosen Quick Actions */
                <button className="quick-action-btn" onClick={() => handleQuickAction('add-nilai')}>
                  <i className="fa-solid fa-plus"></i> Input Nilai Mahasiswa
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
