import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import DashboardView from './components/DashboardView';
import MahasiswaView from './components/MahasiswaView';
import DosenView from './components/DosenView';
import MataKuliahView from './components/MataKuliahView';
import NilaiView from './components/NilaiView';
import LoginOverlay from './components/LoginOverlay';
import ConfirmDeleteModal from './components/ConfirmDeleteModal';
import ToastContainer from './components/Toast';

const API_BASE = 'http://localhost:8000';

function App() {
  const [token, setToken] = useState(localStorage.getItem('simantep_token') || '');
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('simantep_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });
  const [currentView, setCurrentView] = useState('dashboard');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [modalOpenTrigger, setModalOpenTrigger] = useState(null);

  // Theme state
  const [isDarkMode, setIsDarkMode] = useState(localStorage.getItem('simantep_theme') === 'dark');

  // Toasts state
  const [toasts, setToasts] = useState([]);

  // Delete modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null); // { type, id, onDeleted }

  // 1. Toast Helpers
  const showToast = useCallback((title, message, type = 'info') => {
    const id = Date.now() + Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, title, message, type }]);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // 2. Logout Action
  const logout = useCallback(() => {
    setToken('');
    setCurrentUser(null);
    localStorage.removeItem('simantep_token');
    localStorage.removeItem('simantep_user');
    setCurrentView('dashboard');
    showToast('Logged Out', 'Anda berhasil keluar dari sistem.', 'success');
  }, [showToast]);

  // 3. API Request Helper
  const apiRequest = useCallback(
    async (endpoint, options = {}) => {
      const url = `${API_BASE}${endpoint}`;

      // Set headers
      const headers = {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      };

      const config = {
        ...options,
        headers: {
          ...headers,
          ...options.headers,
        },
      };

      try {
        const response = await fetch(url, config);

        // Parse json response
        let data = null;
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          data = await response.json();
        }

        if (!response.ok) {
          // Handle unauthorized automatically
          if (response.status === 401 && token) {
            showToast('Sesi Berakhir', 'Silakan login kembali.', 'warning');
            logout();
            throw new Error('Sesi kedaluwarsa. Silakan login kembali.');
          }

          const errorMsg =
            data?.detail || data?.message || `Error ${response.status}: Terjadi kesalahan server.`;
          throw new Error(errorMsg);
        }

        return data;
      } catch (error) {
        console.error(`API Error [${endpoint}]:`, error);
        throw error;
      }
    },
    [token, logout, showToast]
  );

  // 4. Initial Auth Sync
  useEffect(() => {
    const syncUser = async () => {
      if (token) {
        try {
          const user = await apiRequest('/api/auth/me');
          setCurrentUser(user);
          localStorage.setItem('simantep_user', JSON.stringify(user));
        } catch (err) {
          console.warn('Auth token sync failed:', err);
          logout();
        }
      }
    };
    syncUser();
  }, [token]);

  // 5. Theme Toggle handler
  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }, [isDarkMode]);

  const handleThemeToggle = () => {
    setIsDarkMode((prev) => {
      const newTheme = !prev;
      localStorage.setItem('simantep_theme', newTheme ? 'dark' : 'light');
      return newTheme;
    });
  };

  const handleLoginSuccess = (newToken, user) => {
    setToken(newToken);
    setCurrentUser(user);
    localStorage.setItem('simantep_token', newToken);
    localStorage.setItem('simantep_user', JSON.stringify(user));
    setCurrentView('dashboard');
  };

  // 6. Delete Action
  const handleDeleteTrigger = (type, id, onDeleted) => {
    setDeleteTarget({ type, id, onDeleted });
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    const { type, id, onDeleted } = deleteTarget;

    try {
      const res = await apiRequest(`/api/${type}/${id}`, { method: 'DELETE' });
      showToast('Berhasil Dihapus', res.message || 'Data telah dihapus secara permanen.', 'success');
      setDeleteModalOpen(false);
      setDeleteTarget(null);
      if (onDeleted) onDeleted();
    } catch (err) {
      showToast('Hapus Gagal', err.message, 'error');
    }
  };

  // 7. Quick action triggering from Dashboard
  const handleQuickAction = (action) => {
    if (action === 'add-mahasiswa') {
      setCurrentView('mahasiswa');
      setModalOpenTrigger('add-mahasiswa');
    } else if (action === 'add-dosen') {
      setCurrentView('dosen');
      setModalOpenTrigger('add-dosen');
    } else if (action === 'add-nilai') {
      setCurrentView('nilai');
      setModalOpenTrigger('add-nilai');
    }
  };

  // 8. Render correct view
  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return (
          <DashboardView
            currentUser={currentUser}
            apiRequest={apiRequest}
            showToast={showToast}
            onViewChange={setCurrentView}
            triggerQuickAction={handleQuickAction}
          />
        );
      case 'mahasiswa':
        return (
          <MahasiswaView
            currentUser={currentUser}
            apiRequest={apiRequest}
            showToast={showToast}
            onDeleteTrigger={handleDeleteTrigger}
            modalOpenTrigger={modalOpenTrigger}
            setModalOpenTrigger={setModalOpenTrigger}
          />
        );
      case 'dosen':
        return (
          <DosenView
            currentUser={currentUser}
            apiRequest={apiRequest}
            showToast={showToast}
            onDeleteTrigger={handleDeleteTrigger}
            modalOpenTrigger={modalOpenTrigger}
            setModalOpenTrigger={setModalOpenTrigger}
          />
        );
      case 'matakuliah':
        return (
          <MataKuliahView
            currentUser={currentUser}
            apiRequest={apiRequest}
            showToast={showToast}
            onDeleteTrigger={handleDeleteTrigger}
            modalOpenTrigger={modalOpenTrigger}
            setModalOpenTrigger={setModalOpenTrigger}
          />
        );
      case 'nilai':
        return (
          <NilaiView
            currentUser={currentUser}
            apiRequest={apiRequest}
            showToast={showToast}
            onDeleteTrigger={handleDeleteTrigger}
            modalOpenTrigger={modalOpenTrigger}
            setModalOpenTrigger={setModalOpenTrigger}
          />
        );
      default:
        return <div>View not found.</div>;
    }
  };

  // If no token or user not loaded, render login page
  if (!token || !currentUser) {
    return (
      <>
        <LoginOverlay
          onLoginSuccess={handleLoginSuccess}
          apiRequest={apiRequest}
          API_BASE={API_BASE}
          showToast={showToast}
        />
        <ToastContainer toasts={toasts} removeToast={removeToast} />
      </>
    );
  }

  return (
    <div className="app-container" id="app-wrapper">
      <Sidebar
        currentUser={currentUser}
        currentView={currentView}
        onViewChange={setCurrentView}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      <main className="main-content">
        <Header
          currentView={currentView}
          isDarkMode={isDarkMode}
          onThemeToggle={handleThemeToggle}
          onLogout={logout}
          onMobileSidebarToggle={() => setMobileOpen((prev) => !prev)}
        />

        <div className="view-container">{renderView()}</div>
      </main>

      <ConfirmDeleteModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
      />

      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
}

export default App;
