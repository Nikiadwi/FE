import React from 'react';

const PAGE_TITLES = {
  dashboard: 'Dashboard Utama',
  mahasiswa: 'Manajemen Data Mahasiswa',
  dosen: 'Manajemen Data Dosen',
  matakuliah: 'Daftar Mata Kuliah',
  nilai: 'Input & Kelola Nilai Akademik',
};

export default function Header({ currentView, isDarkMode, onThemeToggle, onLogout, onMobileSidebarToggle }) {
  const pageTitle = PAGE_TITLES[currentView] || 'Sistem Akademik';

  return (
    <header className="top-header">
      <div className="page-title-container">
        <button id="sidebar-toggle" className="menu-toggle" onClick={onMobileSidebarToggle}>
          <i className="fa-solid fa-bars"></i>
        </button>
        <h2 id="current-page-title">{pageTitle}</h2>
      </div>

      <div className="header-actions">
        <button
          id="theme-toggle"
          className="theme-toggle-btn"
          title="Ganti Tema"
          onClick={onThemeToggle}
        >
          <i className={`fa-solid ${isDarkMode ? 'fa-sun' : 'fa-moon'}`}></i>
        </button>
        <button id="btn-logout" className="btn-logout" onClick={onLogout}>
          <i className="fa-solid fa-power-off"></i> Keluar
        </button>
      </div>
    </header>
  );
}
