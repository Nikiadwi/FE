/**
 * SIMANTEP - Sistem Informasi Manajemen Terintegrasi
 * Frontend Logic SPA
 */

const API_BASE = 'http://localhost:8000';

// State
let token = localStorage.getItem('simantep_token') || '';
let currentUser = null;
let currentDeleteTarget = null; // { type: 'mahasiswa'|'dosen'|'matakuliah'|'nilai', id: number }

// DOM Elements
const authOverlay = document.getElementById('auth-overlay');
const appWrapper = document.getElementById('app-wrapper');
const authForm = document.getElementById('auth-form');
const seedNotification = document.getElementById('seed-notification');
const btnSeedDb = document.getElementById('btn-seed-db');

const sidebar = document.getElementById('app-sidebar');
const sidebarToggle = document.getElementById('sidebar-toggle');
const themeToggle = document.getElementById('theme-toggle');
const btnLogout = document.getElementById('btn-logout');
const currentPageTitle = document.getElementById('current-page-title');

const userAvatar = document.getElementById('user-avatar');
const userDisplayName = document.getElementById('user-display-name');
const userDisplayRole = document.getElementById('user-display-role');

const toastContainer = document.getElementById('toast-container');

// Core API Request Helper
async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  
  // Set headers
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
  
  const config = {
    ...options,
    headers: {
      ...headers,
      ...options.headers
    }
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
      
      const errorMsg = data?.detail || data?.message || `Error ${response.status}: Terjadi kesalahan server.`;
      throw new Error(errorMsg);
    }
    
    return data;
  } catch (error) {
    console.error(`API Error [${endpoint}]:`, error);
    throw error;
  }
}

// Custom Toast Notifications
function showToast(title, message, type = 'info') {
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  
  let iconClass = 'fa-info-circle';
  if (type === 'success') iconClass = 'fa-check-circle';
  else if (type === 'error') iconClass = 'fa-exclamation-circle';
  else if (type === 'warning') iconClass = 'fa-exclamation-triangle';
  
  toast.innerHTML = `
    <i class="fa-solid ${iconClass} toast-icon"></i>
    <div class="toast-content">
      <div class="toast-title">${title}</div>
      <div class="toast-message">${message}</div>
    </div>
    <button class="toast-close"><i class="fa-solid fa-xmark"></i></button>
  `;
  
  toastContainer.appendChild(toast);
  
  // Bind close event
  toast.querySelector('.toast-close').addEventListener('click', () => {
    toast.style.animation = 'fadeOut 0.3s forwards';
    setTimeout(() => toast.remove(), 300);
  });
  
  // Auto dismiss after 5 seconds
  setTimeout(() => {
    if (toast.parentElement) {
      toast.style.animation = 'fadeOut 0.3s forwards';
      setTimeout(() => {
        if (toast.parentElement) toast.remove();
      }, 300);
    }
  }, 5000);
}

// Authentication Logic
async function initAuth() {
  if (token) {
    try {
      currentUser = await apiRequest('/api/auth/me');
      setupUIForUser();
      showToast('Selamat Datang', `Halo, ${currentUser.nama || currentUser.username}!`, 'success');
      loadView('dashboard');
    } catch (err) {
      console.log('Token invalid or backend down. Prompting login.');
      logout();
    }
  } else {
    checkDatabaseState();
  }
}

async function checkDatabaseState() {
  try {
    const stats = await fetch(`${API_BASE}/api/dashboard`).then(r => r.json());
    // If dashboard says 0 everything, show seed helper
    if (stats.total_mahasiswa === 0 && stats.total_dosen === 0 && stats.total_nilai === 0) {
      seedNotification.style.display = 'flex';
    } else {
      seedNotification.style.display = 'none';
    }
  } catch (err) {
    console.warn('Backend server not responsive yet.');
  }
}

async function handleLogin(e) {
  e.preventDefault();
  
  const username = document.getElementById('login-username').value.trim();
  const password = document.getElementById('login-password').value;
  const role = document.getElementById('login-role').value;
  
  try {
    const data = await apiRequest('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password, role })
    });
    
    token = data.access_token;
    currentUser = data.user;
    
    localStorage.setItem('simantep_token', token);
    localStorage.setItem('simantep_user', JSON.stringify(currentUser));
    
    setupUIForUser();
    showToast('Login Berhasil', `Selamat datang kembali, ${currentUser.nama || currentUser.username}.`, 'success');
    
    authOverlay.style.display = 'none';
    appWrapper.style.display = 'flex';
    
    loadView('dashboard');
  } catch (err) {
    showToast('Login Gagal', err.message, 'error');
  }
}

function logout() {
  token = '';
  currentUser = null;
  localStorage.removeItem('simantep_token');
  localStorage.removeItem('simantep_user');
  
  // Show auth layout
  appWrapper.style.display = 'none';
  authOverlay.style.display = 'flex';
  
  // Clear forms and fields
  document.getElementById('login-password').value = '';
  checkDatabaseState();
}

function setupUIForUser() {
  if (!currentUser) return;
  
  // Show user details in sidebar
  const initials = (currentUser.nama || currentUser.username)
    .split(' ')
    .map(w => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
  
  userAvatar.textContent = initials;
  userDisplayName.textContent = currentUser.nama || currentUser.username;
  userDisplayRole.textContent = currentUser.role;
  
  // Role based authorization
  // Hide action buttons if the user is a student
  const restrictedElements = document.querySelectorAll('.btn-action-restricted');
  if (currentUser.role === 'mahasiswa') {
    restrictedElements.forEach(el => el.style.display = 'none');
  } else {
    restrictedElements.forEach(el => el.style.display = 'flex');
  }

  authOverlay.style.display = 'none';
  appWrapper.style.display = 'flex';
}

// Router & View Loader
const PAGE_TITLES = {
  dashboard: 'Dashboard Utama',
  mahasiswa: 'Manajemen Data Mahasiswa',
  dosen: 'Manajemen Data Dosen',
  matakuliah: 'Daftar Mata Kuliah',
  nilai: 'Input & Kelola Nilai Akademik'
};

function loadView(viewName) {
  // Update sidebar active state
  document.querySelectorAll('.sidebar-item').forEach(item => {
    if (item.dataset.view === viewName) {
      item.classList.add('active');
    } else {
      item.classList.remove('active');
    }
  });
  
  // Update page title
  currentPageTitle.textContent = PAGE_TITLES[viewName] || 'Sistem Akademik';
  
  // Toggle active views
  document.querySelectorAll('.view-section').forEach(section => {
    if (section.id === `view-${viewName}`) {
      section.classList.add('active');
    } else {
      section.classList.remove('active');
    }
  });
  
  // Trigger data loader
  switch (viewName) {
    case 'dashboard':
      loadDashboardData();
      break;
    case 'mahasiswa':
      loadMahasiswaList();
      break;
    case 'dosen':
      loadDosenList();
      break;
    case 'matakuliah':
      loadMataKuliahList();
      break;
    case 'nilai':
      loadNilaiList();
      break;
  }
}

// ==================== DASHBOARD CONTROLLER ====================
async function loadDashboardData() {
  try {
    const stats = await apiRequest('/api/dashboard');
    
    // Update labels
    document.getElementById('stat-total-mahasiswa').textContent = stats.total_mahasiswa;
    document.getElementById('stat-total-dosen').textContent = stats.total_dosen;
    document.getElementById('stat-total-matakuliah').textContent = stats.total_mata_kuliah;
    document.getElementById('stat-total-nilai').textContent = stats.total_nilai;
    
    // Update chart
    const maxVal = Math.max(stats.total_mahasiswa, stats.total_dosen, stats.total_mata_kuliah, stats.total_nilai, 1);
    
    updateChartBar('chart-bar-mhs', stats.total_mahasiswa, maxVal);
    updateChartBar('chart-bar-dosen', stats.total_dosen, maxVal);
    updateChartBar('chart-bar-mk', stats.total_mata_kuliah, maxVal);
    updateChartBar('chart-bar-nilai', stats.total_nilai, maxVal);
    
  } catch (err) {
    showToast('Gagal Memuat Dashboard', err.message, 'error');
  }
}

function updateChartBar(elementId, value, max) {
  const el = document.getElementById(elementId);
  const percentage = Math.max((value / max) * 100, 5); // min 5% height for visibility
  el.style.height = `${percentage}%`;
  el.setAttribute('data-value', value);
}

// ==================== MAHASISWA CRUD ====================
async function loadMahasiswaList(search = '') {
  const tbody = document.getElementById('table-body-mahasiswa');
  tbody.innerHTML = '<tr><td colspan="6" style="text-align: center;"><i class="fa-solid fa-spinner fa-spin"></i> Memuat data...</td></tr>';
  
  try {
    const query = search ? `/api/mahasiswa?search=${encodeURIComponent(search)}` : '/api/mahasiswa';
    const students = await apiRequest(query);
    
    if (students.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: var(--text-muted);">Tidak ada data mahasiswa ditemukan.</td></tr>';
      return;
    }
    
    tbody.innerHTML = students.map(m => `
      <tr>
        <td style="font-weight: 700;">${m.nim}</td>
        <td style="font-weight: 600;">${m.nama}</td>
        <td>${m.program_studi}</td>
        <td>${m.angkatan}</td>
        <td>
          <span class="badge badge-status-${m.status.toLowerCase().replace(' ', '_')}">
            <i class="fa-solid fa-circle" style="font-size: 8px; margin-right: 6px;"></i> ${m.status}
          </span>
        </td>
        <td style="text-align: center;">
          <div class="action-buttons">
            <button class="btn-icon btn-icon-edit" onclick="editMahasiswa(${m.id})" title="Edit Mahasiswa">
              <i class="fa-solid fa-pen-to-square"></i>
            </button>
            <button class="btn-icon btn-icon-delete" onclick="triggerDelete('mahasiswa', ${m.id})" title="Hapus Mahasiswa">
              <i class="fa-solid fa-trash-can"></i>
            </button>
          </div>
        </td>
      </tr>
    `).join('');
    
    // Hide controls if student role
    if (currentUser && currentUser.role === 'mahasiswa') {
      document.querySelectorAll('.action-buttons').forEach(el => el.style.display = 'none');
    }
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--danger); font-weight: 600;">Gagal memuat data: ${err.message}</td></tr>`;
  }
}

async function saveMahasiswa(e) {
  e.preventDefault();
  const id = document.getElementById('mhs-id').value;
  const nim = document.getElementById('mhs-nim').value.trim();
  const nama = document.getElementById('mhs-nama').value.trim();
  const program_studi = document.getElementById('mhs-prodi').value.trim();
  const angkatan = parseInt(document.getElementById('mhs-angkatan').value);
  const status = document.getElementById('mhs-status').value;
  
  const payload = { nim, nama, program_studi, angkatan, status };
  
  try {
    if (id) {
      await apiRequest(`/api/mahasiswa/${id}`, {
        method: 'PUT',
        body: JSON.stringify(payload)
      });
      showToast('Data Diperbarui', 'Data mahasiswa berhasil di-update.', 'success');
    } else {
      await apiRequest('/api/mahasiswa', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      showToast('Data Ditambahkan', 'Mahasiswa baru berhasil disimpan.', 'success');
    }
    
    closeModal('modal-mahasiswa');
    loadMahasiswaList();
  } catch (err) {
    showToast('Gagal Menyimpan', err.message, 'error');
  }
}

async function editMahasiswa(id) {
  try {
    const m = await apiRequest(`/api/mahasiswa/${id}`);
    document.getElementById('mhs-id').value = m.id;
    document.getElementById('mhs-nim').value = m.nim;
    document.getElementById('mhs-nama').value = m.nama;
    document.getElementById('mhs-prodi').value = m.program_studi;
    document.getElementById('mhs-angkatan').value = m.angkatan;
    document.getElementById('mhs-status').value = m.status;
    
    document.getElementById('modal-mahasiswa-title').textContent = 'Edit Data Mahasiswa';
    openModal('modal-mahasiswa');
  } catch (err) {
    showToast('Error', 'Gagal memuat data detail mahasiswa.', 'error');
  }
}

// ==================== DOSEN CRUD ====================
async function loadDosenList(search = '') {
  const tbody = document.getElementById('table-body-dosen');
  tbody.innerHTML = '<tr><td colspan="6" style="text-align: center;"><i class="fa-solid fa-spinner fa-spin"></i> Memuat data...</td></tr>';
  
  try {
    const query = search ? `/api/dosen?search=${encodeURIComponent(search)}` : '/api/dosen';
    const lecturers = await apiRequest(query);
    
    if (lecturers.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: var(--text-muted);">Tidak ada data dosen ditemukan.</td></tr>';
      return;
    }
    
    tbody.innerHTML = lecturers.map(d => `
      <tr>
        <td style="font-weight: 700;">${d.nidn}</td>
        <td style="font-weight: 600;">${d.nama}</td>
        <td>
          <span class="badge badge-dosen-${d.status_dosen.toLowerCase().replace(/ /g, '_')}">
            ${d.status_dosen}
          </span>
        </td>
        <td>${d.jabatan || '<span class="text-muted">-</span>'}</td>
        <td>${d.keahlian || '<span class="text-muted">-</span>'}</td>
        <td style="text-align: center;">
          <div class="action-buttons">
            <button class="btn-icon btn-icon-edit" onclick="editDosen(${d.id})" title="Edit Dosen">
              <i class="fa-solid fa-pen-to-square"></i>
            </button>
            <button class="btn-icon btn-icon-delete" onclick="triggerDelete('dosen', ${d.id})" title="Hapus Dosen">
              <i class="fa-solid fa-trash-can"></i>
            </button>
          </div>
        </td>
      </tr>
    `).join('');
    
    if (currentUser && currentUser.role === 'mahasiswa') {
      document.querySelectorAll('.action-buttons').forEach(el => el.style.display = 'none');
    }
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--danger); font-weight: 600;">Gagal memuat data: ${err.message}</td></tr>`;
  }
}

async function saveDosen(e) {
  e.preventDefault();
  const id = document.getElementById('dosen-id').value;
  const nidn = document.getElementById('dosen-nidn').value.trim();
  const nama = document.getElementById('dosen-nama').value.trim();
  const status_dosen = document.getElementById('dosen-status').value;
  const jabatan = document.getElementById('dosen-jabatan').value.trim() || null;
  const keahlian = document.getElementById('dosen-keahlian').value.trim() || null;
  
  const payload = { nidn, nama, status_dosen, jabatan, keahlian };
  
  try {
    if (id) {
      await apiRequest(`/api/dosen/${id}`, {
        method: 'PUT',
        body: JSON.stringify(payload)
      });
      showToast('Data Diperbarui', 'Data dosen berhasil di-update.', 'success');
    } else {
      await apiRequest('/api/dosen', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      showToast('Data Ditambahkan', 'Dosen baru berhasil disimpan.', 'success');
    }
    
    closeModal('modal-dosen');
    loadDosenList();
  } catch (err) {
    showToast('Gagal Menyimpan', err.message, 'error');
  }
}

async function editDosen(id) {
  try {
    const d = await apiRequest(`/api/dosen/${id}`);
    document.getElementById('dosen-id').value = d.id;
    document.getElementById('dosen-nidn').value = d.nidn;
    document.getElementById('dosen-nama').value = d.nama;
    document.getElementById('dosen-status').value = d.status_dosen;
    document.getElementById('dosen-jabatan').value = d.jabatan || '';
    document.getElementById('dosen-keahlian').value = d.keahlian || '';
    
    document.getElementById('modal-dosen-title').textContent = 'Edit Data Dosen';
    openModal('modal-dosen');
  } catch (err) {
    showToast('Error', 'Gagal memuat data detail dosen.', 'error');
  }
}

// ==================== MATA KULIAH CRUD ====================
async function loadMataKuliahList(search = '') {
  const tbody = document.getElementById('table-body-matakuliah');
  tbody.innerHTML = '<tr><td colspan="5" style="text-align: center;"><i class="fa-solid fa-spinner fa-spin"></i> Memuat data...</td></tr>';
  
  try {
    const query = search ? `/api/matakuliah?search=${encodeURIComponent(search)}` : '/api/matakuliah';
    const courses = await apiRequest(query);
    
    if (courses.length === 0) {
      tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: var(--text-muted);">Tidak ada mata kuliah ditemukan.</td></tr>';
      return;
    }
    
    tbody.innerHTML = courses.map(mk => `
      <tr>
        <td style="font-weight: 700;">${mk.kode_mk}</td>
        <td style="font-weight: 600;">${mk.nama_mk}</td>
        <td><strong style="color: var(--primary);">${mk.sks}</strong> SKS</td>
        <td>${mk.dosen_pengampu || '<span class="text-muted" style="font-style: italic;">Belum ditentukan</span>'}</td>
        <td style="text-align: center;">
          <div class="action-buttons">
            <button class="btn-icon btn-icon-edit" onclick="editMataKuliah(${mk.id})" title="Edit Mata Kuliah">
              <i class="fa-solid fa-pen-to-square"></i>
            </button>
            <button class="btn-icon btn-icon-delete" onclick="triggerDelete('matakuliah', ${mk.id})" title="Hapus Mata Kuliah">
              <i class="fa-solid fa-trash-can"></i>
            </button>
          </div>
        </td>
      </tr>
    `).join('');
    
    if (currentUser && currentUser.role === 'mahasiswa') {
      document.querySelectorAll('.action-buttons').forEach(el => el.style.display = 'none');
    }
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: var(--danger); font-weight: 600;">Gagal memuat data: ${err.message}</td></tr>`;
  }
}

async function loadDosenDropdown(selectId, selectedId = null) {
  const select = document.getElementById(selectId);
  select.innerHTML = '<option value="">-- Pilih Dosen Pengampu --</option>';
  
  try {
    const lecturers = await apiRequest('/api/dosen');
    lecturers.forEach(d => {
      const option = document.createElement('option');
      option.value = d.id;
      option.textContent = d.nama;
      if (selectedId && parseInt(selectedId) === d.id) {
        option.selected = true;
      }
      select.appendChild(option);
    });
  } catch (err) {
    console.error('Failed to load lecturers dropdown', err);
  }
}

async function saveMataKuliah(e) {
  e.preventDefault();
  const id = document.getElementById('mk-id').value;
  const kode_mk = document.getElementById('mk-kode').value.trim();
  const nama_mk = document.getElementById('mk-nama').value.trim();
  const sks = parseInt(document.getElementById('mk-sks').value);
  const dosen_id_val = document.getElementById('mk-dosen').value;
  const dosen_id = dosen_id_val ? parseInt(dosen_id_val) : null;
  
  const payload = { kode_mk, nama_mk, sks, dosen_id };
  
  try {
    if (id) {
      await apiRequest(`/api/matakuliah/${id}`, {
        method: 'PUT',
        body: JSON.stringify(payload)
      });
      showToast('Data Diperbarui', 'Data mata kuliah berhasil di-update.', 'success');
    } else {
      await apiRequest('/api/matakuliah', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      showToast('Data Ditambahkan', 'Mata kuliah baru berhasil disimpan.', 'success');
    }
    
    closeModal('modal-matakuliah');
    loadMataKuliahList();
  } catch (err) {
    showToast('Gagal Menyimpan', err.message, 'error');
  }
}

async function editMataKuliah(id) {
  try {
    const mk = await apiRequest(`/api/matakuliah/${id}`);
    document.getElementById('mk-id').value = mk.id;
    document.getElementById('mk-kode').value = mk.kode_mk;
    document.getElementById('mk-nama').value = mk.nama_mk;
    document.getElementById('mk-sks').value = mk.sks;
    
    await loadDosenDropdown('mk-dosen', mk.dosen_id);
    
    document.getElementById('modal-matakuliah-title').textContent = 'Edit Mata Kuliah';
    openModal('modal-matakuliah');
  } catch (err) {
    showToast('Error', 'Gagal memuat data detail mata kuliah.', 'error');
  }
}

// ==================== NILAI CRUD ====================
async function loadNilaiList() {
  const tbody = document.getElementById('table-body-nilai');
  tbody.innerHTML = '<tr><td colspan="6" style="text-align: center;"><i class="fa-solid fa-spinner fa-spin"></i> Memuat data...</td></tr>';
  
  const mId = document.getElementById('filter-nilai-mahasiswa').value;
  const mkId = document.getElementById('filter-nilai-matakuliah').value;
  
  let endpoint = '/api/nilai';
  const params = [];
  if (mId) params.push(`mahasiswa_id=${mId}`);
  if (mkId) params.push(`mata_kuliah_id=${mkId}`);
  if (params.length > 0) endpoint += `?${params.join('&')}`;
  
  try {
    const grades = await apiRequest(endpoint);
    
    if (grades.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: var(--text-muted);">Tidak ada data nilai ditemukan.</td></tr>';
      return;
    }
    
    tbody.innerHTML = grades.map(n => {
      // Determine a predicate color / tag
      let badgeClass = 'badge-status-tidak_aktif'; // E or F
      if (['A', 'AB', 'B'].includes(n.nilai_huruf)) badgeClass = 'badge-status-aktif';
      else if (['BC', 'C'].includes(n.nilai_huruf)) badgeClass = 'badge-status-lulus';
      else if (['D'].includes(n.nilai_huruf)) badgeClass = 'badge-status-cuti';
      
      let predikat = 'Sangat Kurang';
      if (n.nilai_huruf === 'A') predikat = 'Istimewa / Sangat Baik';
      else if (n.nilai_huruf === 'B') predikat = 'Baik';
      else if (n.nilai_huruf === 'C') predikat = 'Cukup';
      else if (n.nilai_huruf === 'D') predikat = 'Kurang';
      else if (n.nilai_huruf === 'E' || n.nilai_huruf === 'F') predikat = 'Gagal';
      
      return `
        <tr>
          <td style="font-weight: 600;">${n.nama_mahasiswa || '<span class="text-muted">-</span>'}</td>
          <td>${n.nama_mata_kuliah || '<span class="text-muted">-</span>'}</td>
          <td style="font-weight: 700; font-size: 15px; color: var(--primary);">${n.nilai_angka}</td>
          <td style="font-weight: 800; font-size: 16px; text-align: center;"><span style="display: inline-block; width: 32px; height: 32px; line-height: 32px; border-radius: 50%; border: 2px solid var(--border-color);">${n.nilai_huruf}</span></td>
          <td>
            <span class="badge ${badgeClass}">${predikat}</span>
          </td>
          <td style="text-align: center;">
            <div class="action-buttons">
              <button class="btn-icon btn-icon-edit" onclick="editNilai(${n.id})" title="Edit Nilai">
                <i class="fa-solid fa-pen-to-square"></i>
              </button>
              <button class="btn-icon btn-icon-delete" onclick="triggerDelete('nilai', ${n.id})" title="Hapus Nilai">
                <i class="fa-solid fa-trash-can"></i>
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
    
    if (currentUser && currentUser.role === 'mahasiswa') {
      document.querySelectorAll('.action-buttons').forEach(el => el.style.display = 'none');
    }
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--danger); font-weight: 600;">Gagal memuat data: ${err.message}</td></tr>`;
  }
}

// Automatically calculate letter grades based on standard scale
function handleGradeCalculation() {
  const val = parseFloat(document.getElementById('nilai-angka').value);
  const letterInput = document.getElementById('nilai-huruf');
  
  if (isNaN(val) || val < 0 || val > 100) {
    letterInput.value = '';
    return;
  }
  
  if (val >= 85) letterInput.value = 'A';
  else if (val >= 80) letterInput.value = 'A-'; // Or matching backend validation (schemas.py allows max_length=2)
  else if (val >= 75) letterInput.value = 'B+';
  else if (val >= 70) letterInput.value = 'B';
  else if (val >= 65) letterInput.value = 'B-';
  else if (val >= 60) letterInput.value = 'C+';
  else if (val >= 55) letterInput.value = 'C';
  else if (val >= 40) letterInput.value = 'D';
  else letterInput.value = 'E';
}

async function loadFilterDropdowns() {
  const mFilter = document.getElementById('filter-nilai-mahasiswa');
  const mkFilter = document.getElementById('filter-nilai-matakuliah');
  
  mFilter.innerHTML = '<option value="">-- Filter Mahasiswa (Semua) --</option>';
  mkFilter.innerHTML = '<option value="">-- Filter Mata Kuliah (Semua) --</option>';
  
  try {
    const students = await apiRequest('/api/mahasiswa');
    const courses = await apiRequest('/api/matakuliah');
    
    students.forEach(m => {
      const opt = document.createElement('option');
      opt.value = m.id;
      opt.textContent = `${m.nim} - ${m.nama}`;
      mFilter.appendChild(opt);
    });
    
    courses.forEach(c => {
      const opt = document.createElement('option');
      opt.value = c.id;
      opt.textContent = `${c.kode_mk} - ${c.nama_mk}`;
      mkFilter.appendChild(opt);
    });
  } catch (err) {
    console.error('Failed to load filter dropdowns', err);
  }
}

async function loadNilaiDropdowns(selectedStudentId = null, selectedMkId = null) {
  const mSelect = document.getElementById('nilai-mahasiswa');
  const mkSelect = document.getElementById('nilai-matakuliah');
  
  mSelect.innerHTML = '<option value="" disabled selected>-- Pilih Mahasiswa --</option>';
  mkSelect.innerHTML = '<option value="" disabled selected>-- Pilih Mata Kuliah --</option>';
  
  try {
    const students = await apiRequest('/api/mahasiswa');
    const courses = await apiRequest('/api/matakuliah');
    
    students.forEach(m => {
      const opt = document.createElement('option');
      opt.value = m.id;
      opt.textContent = `${m.nim} - ${m.nama}`;
      if (selectedStudentId && parseInt(selectedStudentId) === m.id) opt.selected = true;
      mSelect.appendChild(opt);
    });
    
    courses.forEach(c => {
      const opt = document.createElement('option');
      opt.value = c.id;
      opt.textContent = `${c.kode_mk} - ${c.nama_mk}`;
      if (selectedMkId && parseInt(selectedMkId) === c.id) opt.selected = true;
      mkSelect.appendChild(opt);
    });
  } catch (err) {
    console.error('Failed to load form dropdowns', err);
  }
}

async function saveNilai(e) {
  e.preventDefault();
  const id = document.getElementById('nilai-id').value;
  const mahasiswa_id = parseInt(document.getElementById('nilai-mahasiswa').value);
  const mata_kuliah_id = parseInt(document.getElementById('nilai-matakuliah').value);
  const nilai_angka = parseFloat(document.getElementById('nilai-angka').value);
  const nilai_huruf = document.getElementById('nilai-huruf').value;
  
  const payload = { mahasiswa_id, mata_kuliah_id, nilai_angka, nilai_huruf };
  
  try {
    if (id) {
      await apiRequest(`/api/nilai/${id}`, {
        method: 'PUT',
        body: JSON.stringify(payload)
      });
      showToast('Data Diperbarui', 'Data nilai mahasiswa berhasil di-update.', 'success');
    } else {
      await apiRequest('/api/nilai', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      showToast('Data Ditambahkan', 'Nilai mahasiswa berhasil diinput.', 'success');
    }
    
    closeModal('modal-nilai');
    loadNilaiList();
  } catch (err) {
    showToast('Gagal Menyimpan', err.message, 'error');
  }
}

async function editNilai(id) {
  try {
    const n = await apiRequest(`/api/nilai/${id}`);
    document.getElementById('nilai-id').value = n.id;
    document.getElementById('nilai-angka').value = n.nilai_angka;
    document.getElementById('nilai-huruf').value = n.nilai_huruf;
    
    await loadNilaiDropdowns(n.mahasiswa_id, n.mata_kuliah_id);
    
    document.getElementById('modal-nilai-title').textContent = 'Edit Nilai Mahasiswa';
    openModal('modal-nilai');
  } catch (err) {
    showToast('Error', 'Gagal memuat data detail nilai.', 'error');
  }
}

// ==================== DELETE DIALOG CONTROLLER ====================
function triggerDelete(type, id) {
  currentDeleteTarget = { type, id };
  openModal('modal-confirm-delete');
}

async function executeDelete() {
  if (!currentDeleteTarget) return;
  const { type, id } = currentDeleteTarget;
  
  try {
    const res = await apiRequest(`/api/${type}/${id}`, { method: 'DELETE' });
    showToast('Berhasil Dihapus', res.message || 'Data telah dihapus secara permanen.', 'success');
    
    closeModal('modal-confirm-delete');
    currentDeleteTarget = null;
    
    // Refresh corresponding list
    if (type === 'mahasiswa') loadMahasiswaList();
    else if (type === 'dosen') loadDosenList();
    else if (type === 'matakuliah') loadMataKuliahList();
    else if (type === 'nilai') loadNilaiList();
  } catch (err) {
    showToast('Hapus Gagal', err.message, 'error');
  }
}

// ==================== MODAL HELPERS ====================
function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.add('active');
  }
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.remove('active');
  }
}

// ==================== SYSTEM INITIALIZATION ====================
document.addEventListener('DOMContentLoaded', () => {
  initAuth();
  
  // Theme Toggle
  const savedTheme = localStorage.getItem('simantep_theme') || 'light';
  if (savedTheme === 'dark') {
    document.body.classList.add('dark-mode');
    themeToggle.querySelector('i').className = 'fa-solid fa-sun';
  }
  
  themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    const isDark = document.body.classList.contains('dark-mode');
    localStorage.setItem('simantep_theme', isDark ? 'dark' : 'light');
    themeToggle.querySelector('i').className = isDark ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
  });
  
  // Sidebar Mobile Toggle
  sidebarToggle.addEventListener('click', () => {
    sidebar.classList.toggle('mobile-open');
  });
  
  // Close sidebar on menu click on mobile
  document.querySelectorAll('.sidebar-item a').forEach(link => {
    link.addEventListener('click', () => {
      sidebar.classList.remove('mobile-open');
    });
  });
  
  // SPA Sidebar Routing Handler
  document.querySelectorAll('.sidebar-item').forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const view = item.dataset.view;
      if (view) loadView(view);
    });
  });
  
  // Auth Form submission
  authForm.addEventListener('submit', handleLogin);
  btnLogout.addEventListener('click', logout);
  
  // Seeding trigger
  btnSeedDb.addEventListener('click', async () => {
    try {
      const res = await apiRequest('/api/auth/seed', { method: 'POST' });
      showToast('Seeding Berhasil', `${res.message}. Username: admin, Password: admin123`, 'success');
      seedNotification.style.display = 'none';
      document.getElementById('login-username').value = 'admin';
      document.getElementById('login-password').value = 'admin123';
    } catch (err) {
      showToast('Seeding Gagal', err.message, 'error');
    }
  });
  
  // Modal close binders
  document.querySelectorAll('[data-close]').forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.dataset.close;
      closeModal(target);
    });
  });
  
  // Close modals on clicking backdrop
  document.querySelectorAll('.modal-backdrop').forEach(backdrop => {
    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) {
        backdrop.classList.remove('active');
      }
    });
  });
  
  // Forms submit bindings
  document.getElementById('form-mahasiswa').addEventListener('submit', saveMahasiswa);
  document.getElementById('form-dosen').addEventListener('submit', saveDosen);
  document.getElementById('form-matakuliah').addEventListener('submit', saveMataKuliah);
  document.getElementById('form-nilai').addEventListener('submit', saveNilai);
  
  // Grade calculation trigger
  document.getElementById('nilai-angka').addEventListener('input', handleGradeCalculation);
  
  // Delete confirm action
  document.getElementById('btn-confirm-delete-action').addEventListener('click', executeDelete);
  
  // RESTRICTION & TRIGGER BUTTONS
  // Add Mahasiswa
  document.getElementById('btn-add-mahasiswa').addEventListener('click', () => {
    document.getElementById('form-mahasiswa').reset();
    document.getElementById('mhs-id').value = '';
    document.getElementById('modal-mahasiswa-title').textContent = 'Tambah Mahasiswa Baru';
    openModal('modal-mahasiswa');
  });
  
  // Add Dosen
  document.getElementById('btn-add-dosen').addEventListener('click', () => {
    document.getElementById('form-dosen').reset();
    document.getElementById('dosen-id').value = '';
    document.getElementById('modal-dosen-title').textContent = 'Tambah Dosen Baru';
    openModal('modal-dosen');
  });
  
  // Add Mata Kuliah
  document.getElementById('btn-add-matakuliah').addEventListener('click', async () => {
    document.getElementById('form-matakuliah').reset();
    document.getElementById('mk-id').value = '';
    await loadDosenDropdown('mk-dosen');
    document.getElementById('modal-matakuliah-title').textContent = 'Tambah Mata Kuliah';
    openModal('modal-matakuliah');
  });
  
  // Add Nilai
  document.getElementById('btn-add-nilai').addEventListener('click', async () => {
    document.getElementById('form-nilai').reset();
    document.getElementById('nilai-id').value = '';
    await loadNilaiDropdowns();
    document.getElementById('modal-nilai-title').textContent = 'Input Nilai Mahasiswa';
    openModal('modal-nilai');
  });
  
  // Quick Dashboard Actions
  document.querySelectorAll('.quick-action-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const action = btn.dataset.action;
      if (currentUser && currentUser.role === 'mahasiswa') {
        showToast('Akses Ditolak', 'Mahasiswa tidak diizinkan menambah data.', 'warning');
        return;
      }
      
      if (action === 'add-mahasiswa') {
        loadView('mahasiswa');
        document.getElementById('btn-add-mahasiswa').click();
      } else if (action === 'add-dosen') {
        loadView('dosen');
        document.getElementById('btn-add-dosen').click();
      } else if (action === 'add-nilai') {
        loadView('nilai');
        document.getElementById('btn-add-nilai').click();
      }
    });
  });
  
  // Search keyup filters (with simple debounce)
  let searchTimeout = null;
  const bindSearch = (inputId, loadFn) => {
    document.getElementById(inputId).addEventListener('input', (e) => {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => {
        loadFn(e.target.value.trim());
      }, 300);
    });
  };
  
  bindSearch('search-mahasiswa', loadMahasiswaList);
  bindSearch('search-dosen', loadDosenList);
  bindSearch('search-matakuliah', loadMataKuliahList);
  
  // Nilai Filters
  const nFilterMhs = document.getElementById('filter-nilai-mahasiswa');
  const nFilterMk = document.getElementById('filter-nilai-matakuliah');
  
  nFilterMhs.addEventListener('change', loadNilaiList);
  nFilterMk.addEventListener('change', loadNilaiList);
  
  document.getElementById('btn-reset-filter-nilai').addEventListener('click', () => {
    nFilterMhs.value = '';
    nFilterMk.value = '';
    loadNilaiList();
  });
  
  // Pre-load filters dropdowns when Nilai tab is opened
  document.querySelector('.sidebar-item[data-view="nilai"]').addEventListener('click', loadFilterDropdowns);
});
