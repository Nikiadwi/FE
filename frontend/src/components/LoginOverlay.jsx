import React, { useState, useEffect } from 'react';

export default function LoginOverlay({ onLoginSuccess, apiRequest, API_BASE, showToast }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('admin');
  const [showSeed, setShowSeed] = useState(false);
  const [loading, setLoading] = useState(false);

  // Check database stats on load to determine if seeding is required
  const checkDatabaseState = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/dashboard`);
      if (response.ok) {
        const stats = await response.json();
        if (stats.total_mahasiswa === 0 && stats.total_dosen === 0 && stats.total_nilai === 0) {
          setShowSeed(true);
        } else {
          setShowSeed(false);
        }
      }
    } catch (err) {
      console.warn('Backend server not responsive yet.');
    }
  };

  useEffect(() => {
    checkDatabaseState();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) return;

    setLoading(true);
    try {
      const data = await apiRequest('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username, password, role }),
      });
      showToast('Login Berhasil', `Selamat datang kembali, ${data.user.nama || data.user.username}.`, 'success');
      onLoginSuccess(data.access_token, data.user);
    } catch (err) {
      showToast('Login Gagal', err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSeed = async () => {
    try {
      const res = await apiRequest('/api/auth/seed', { method: 'POST' });
      showToast('Seeding Berhasil', `${res.message}. Username: admin, Password: admin123`, 'success');
      setShowSeed(false);
      setUsername('admin');
      setPassword('admin123');
    } catch (err) {
      showToast('Seeding Gagal', err.message, 'error');
    }
  };

  return (
    <div id="auth-overlay" className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo">
            <i className="fa-solid fa-graduation-cap"></i> SIMANTEP
          </div>
          <div className="auth-subtitle">Sistem Informasi Manajemen Terintegrasi</div>
        </div>

        {showSeed && (
          <div id="seed-notification" className="seed-alert">
            <span>Database tampaknya kosong. Ingin membuat akun admin default?</span>
            <button id="btn-seed-db" className="btn-seed" onClick={handleSeed}>
              Seed Admin
            </button>
          </div>
        )}

        <form id="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="login-username" className="form-label">
              Username
            </label>
            <input
              type="text"
              id="login-username"
              className="form-control"
              placeholder="Masukkan username"
              required
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label htmlFor="login-password" className="form-label">
              Password
            </label>
            <input
              type="password"
              id="login-password"
              className="form-control"
              placeholder="Masukkan password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label htmlFor="login-role" className="form-label">
              Role Akses
            </label>
            <select
              id="login-role"
              className="form-control"
              required
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="admin">Administrator (Admin)</option>
              <option value="dosen">Dosen Pengajar</option>
              <option value="mahasiswa">Mahasiswa</option>
            </select>
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '16px' }} disabled={loading}>
            <i className="fa-solid fa-right-to-bracket"></i> {loading ? 'Memproses...' : 'Masuk Sistem'}
          </button>
        </form>
      </div>
    </div>
  );
}
