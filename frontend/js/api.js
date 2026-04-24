/* ─────────────────────────────────────────────
   api.js — Central fetch wrapper for SRMS
   All calls go to http://localhost:5000/api
───────────────────────────────────────────── */

const API_BASE = 'http://localhost:5000/api';

/**
 * Generic fetch wrapper.
 * Automatically sends credentials (cookies) and handles JSON.
 */
async function apiFetch(endpoint, options = {}) {
  const config = {
    credentials: 'include',           // Send HTTP-only cookie
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  };

  // Don't set Content-Type for FormData (let browser handle boundary)
  if (options.body instanceof FormData) {
    delete config.headers['Content-Type'];
  }

  const res = await fetch(`${API_BASE}${endpoint}`, config);
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.message || `Request failed (${res.status})`);
  }
  return data;
}

// ── Auth ──────────────────────────────────────
const Auth = {
  register: (body) => apiFetch('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  login:    (body) => apiFetch('/auth/login',    { method: 'POST', body: JSON.stringify(body) }),
  logout:   ()     => apiFetch('/auth/logout',   { method: 'POST' }),
  me:       ()     => apiFetch('/auth/me'),
};

// ── Users ─────────────────────────────────────
const Users = {
  dashboard:     ()     => apiFetch('/users/dashboard'),
  profile:       ()     => apiFetch('/users/profile'),
  updateProfile: (body) => apiFetch('/users/profile', { method: 'PUT', body: JSON.stringify(body) }),
  myUploads:     ()     => apiFetch('/users/uploads'),
  notifications: ()     => apiFetch('/users/notifications'),
};

// ── Resources ─────────────────────────────────
const Resources = {
  list:     (params = {}) => apiFetch('/resources?' + new URLSearchParams(params)),
  get:      (id)          => apiFetch(`/resources/${id}`),
  upload:   (formData)    => apiFetch('/resources', { method: 'POST', body: formData }),
  update:   (id, body)    => apiFetch(`/resources/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  remove:   (id)          => apiFetch(`/resources/${id}`, { method: 'DELETE' }),
  download: (id)          => `${API_BASE}/resources/${id}/download`,
};

// ── Admin ─────────────────────────────────────
const Admin = {
  stats:            ()        => apiFetch('/admin/stats'),
  users:            ()        => apiFetch('/admin/users'),
  deleteUser:       (id)      => apiFetch(`/admin/users/${id}`, { method: 'DELETE' }),
  allResources:     ()        => apiFetch('/admin/resources'),
  toggleApproval:   (id)      => apiFetch(`/admin/resources/${id}/approve`, { method: 'PUT' }),
  broadcast:        (body)    => apiFetch('/admin/notifications', { method: 'POST', body: JSON.stringify(body) }),
};

// ── Helpers ───────────────────────────────────

/** Get logged-in user from localStorage (set after login) */
function getCurrentUser() {
  try { return JSON.parse(localStorage.getItem('srms_user')) || null; }
  catch { return null; }
}

/** Persist user to localStorage */
function setCurrentUser(user) {
  localStorage.setItem('srms_user', JSON.stringify(user));
}

/** Clear user and redirect to login */
function logout(redirect = true) {
  Auth.logout().catch(() => {});
  localStorage.removeItem('srms_user');
  if (redirect) window.location.href = 'index.html';
}

/** Guard: redirect to login if not authenticated */
function requireAuth() {
  const user = getCurrentUser();
  if (!user) { window.location.href = 'index.html'; return null; }
  return user;
}

/** Guard: redirect to dashboard if not admin */
function requireAdmin() {
  const user = requireAuth();
  if (user && user.role !== 'admin') { window.location.href = 'dashboard.html'; return null; }
  return user;
}

/** Format file size bytes → readable string */
function formatSize(bytes) {
  if (!bytes) return '-';
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

/** Format ISO date string → readable */
function formatDate(iso) {
  if (!iso) return '-';
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

/** Return badge class for file type */
function fileTypeBadge(type) {
  const map = { pdf: 'badge-pdf', video: 'badge-video', document: 'badge-doc' };
  return map[type] || 'badge-other';
}

/** Return emoji icon for file type */
function fileTypeIcon(type) {
  const map = { pdf: '📄', video: '🎬', image: '🖼️', document: '📝', other: '📁' };
  return map[type] || '📁';
}

/** Get initials from name */
function getInitials(name = '') {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

/** Show an alert element */
function showAlert(el, message, type = 'error') {
  el.textContent = message;
  el.className = `alert alert-${type} show`;
}
function hideAlert(el) { el.className = 'alert'; }
