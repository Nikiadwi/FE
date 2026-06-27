import React from 'react';

export default function Sidebar({ currentUser, currentView, onViewChange, mobileOpen, setMobileOpen }) {
  if (!currentUser) return null;

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: 'fa-chart-pie' },
    ...(currentUser.role === 'admin' ? [
      { id: 'mahasiswa', label: 'Data Mahasiswa', icon: 'fa-user-graduate' },
      { id: 'dosen', label: 'Data Dosen', icon: 'fa-user-tie' },
      { id: 'matakuliah', label: 'Mata Kuliah', icon: 'fa-book' },
    ] : []),
    { 
      id: 'nilai', 
      label: currentUser.role === 'mahasiswa' ? 'Nilai Saya' : 'Input & Kelola Nilai', 
      icon: 'fa-file-signature' 
    },
  ];

  // Calculate user initials
  const initials = (currentUser.nama || currentUser.username || 'User')
    .split(' ')
    .map((word) => word[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const handleItemClick = (e, viewId) => {
    e.preventDefault();
    onViewChange(viewId);
    setMobileOpen(false); // Close sidebar on mobile once clicked
  };

  return (
    <aside className={`sidebar ${mobileOpen ? 'mobile-open' : ''}`} id="app-sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <i className="fa-solid fa-graduation-cap"></i> SIMANTEP
        </div>
      </div>

      <ul className="sidebar-menu">
        {menuItems.map((item) => (
          <li
            key={item.id}
            className={`sidebar-item ${currentView === item.id ? 'active' : ''}`}
            data-view={item.id}
          >
            <a href={`#${item.id}`} onClick={(e) => handleItemClick(e, item.id)}>
              <i className={`fa-solid ${item.icon}`}></i>
              <span>{item.label}</span>
            </a>
          </li>
        ))}
      </ul>

      <div className="sidebar-footer">
        <div className="user-profile">
          <div id="user-avatar" className="avatar">
            {initials}
          </div>
          <div className="user-info">
            <span id="user-display-name" className="user-name" title={currentUser.nama || currentUser.username}>
              {currentUser.nama || currentUser.username}
            </span>
            <span id="user-display-role" className="user-role">
              {currentUser.role}
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
}
