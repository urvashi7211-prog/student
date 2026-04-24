/* admin.js */

const user = requireAdmin(); // redirects if not admin
if (!user) throw new Error('Not admin');

document.getElementById('sidebar-name').textContent   = user.name;
document.getElementById('sidebar-avatar').textContent = getInitials(user.name);

// ── Section switcher ──────────────────────────
const sections = ['dash', 'users', 'resources', 'notifs'];
const navIds   = { dash: 'nav-dash', users: 'nav-users', resources: 'nav-resources', notifs: 'nav-notifs' };

function showSection(name) {
  sections.forEach(s => {
    const secEl = document.getElementById(s === 'dash' ? 'dash-section' : `${s}-section`);
    const navEl = document.getElementById(navIds[s]);
    if (secEl) secEl.style.display = s === name ? '' : 'none';
    if (navEl) navEl.classList.toggle('active', s === name);
  });
  if (name === 'users')     loadUsers();
  if (name === 'resources') loadAdminResources();
}

// ── Load Stats + Recent ───────────────────────
async function loadStats() {
  try {
    const { stats } = await Admin.stats();
    document.getElementById('stat-users').textContent     = stats.totalUsers;
    document.getElementById('stat-resources').textContent = stats.totalResources;
    document.getElementById('stat-notifs').textContent    = stats.totalNotifications;
    renderRecentTable(stats.recentResources);
  } catch (err) {
    console.error(err);
  }
}

function renderRecentTable(resources) {
  const el = document.getElementById('recent-resources-table');
  if (!resources.length) {
    el.innerHTML = `<div class="empty-state"><div class="empty-icon">📭</div><h3>No resources yet</h3></div>`;
    return;
  }
  el.innerHTML = `
    <table>
      <thead><tr><th>Title</th><th>Subject</th><th>Sem</th><th>By</th><th>Date</th></tr></thead>
      <tbody>
        ${resources.map(r => `
          <tr>
            <td><strong>${r.title}</strong></td>
            <td>${r.subject}</td>
            <td>${r.semester}</td>
            <td>${r.uploadedBy?.name || '—'}</td>
            <td>${formatDate(r.createdAt)}</td>
          </tr>`).join('')}
      </tbody>
    </table>`;
}

// ── Users Table ───────────────────────────────
async function loadUsers() {
  const el = document.getElementById('users-table');
  el.innerHTML = `<div class="loading-row"><div class="spinner"></div></div>`;
  try {
    const { users } = await Admin.users();
    if (!users.length) {
      el.innerHTML = `<div class="empty-state"><div class="empty-icon">👥</div><h3>No users found</h3></div>`;
      return;
    }
    el.innerHTML = `
      <table>
        <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Course</th><th>Sem</th><th>Joined</th><th>Action</th></tr></thead>
        <tbody>
          ${users.map(u => `
            <tr>
              <td><strong>${u.name}</strong></td>
              <td>${u.email}</td>
              <td><span class="badge ${u.role === 'admin' ? 'badge-warning' : 'badge-info'}">${u.role}</span></td>
              <td>${u.course || '—'}</td>
              <td>${u.semester || '—'}</td>
              <td>${formatDate(u.createdAt)}</td>
              <td>
                ${u.role !== 'admin' ? `<button class="btn btn-danger btn-sm" onclick="deleteUser('${u._id}','${u.name}')">Delete</button>` : '<span style="color:var(--text-muted);font-size:.8rem;">—</span>'}
              </td>
            </tr>`).join('')}
        </tbody>
      </table>`;
  } catch (err) {
    el.innerHTML = `<p style="color:var(--danger);">${err.message}</p>`;
  }
}

async function deleteUser(id, name) {
  if (!confirm(`Delete user "${name}"? All their data will be removed.`)) return;
  try {
    await Admin.deleteUser(id);
    loadUsers();
  } catch (err) { alert(err.message); }
}

// ── Resources Table ───────────────────────────
async function loadAdminResources() {
  const el = document.getElementById('resources-table');
  el.innerHTML = `<div class="loading-row"><div class="spinner"></div></div>`;
  try {
    const { resources } = await Admin.allResources();
    if (!resources.length) {
      el.innerHTML = `<div class="empty-state"><div class="empty-icon">📭</div><h3>No resources</h3></div>`;
      return;
    }
    el.innerHTML = `
      <table>
        <thead><tr><th>Title</th><th>Subject</th><th>Type</th><th>Uploader</th><th>Status</th><th>Actions</th></tr></thead>
        <tbody>
          ${resources.map(r => `
            <tr id="row-${r._id}">
              <td><strong>${r.title}</strong><div style="font-size:.75rem;color:var(--text-muted);">Sem ${r.semester} · ${formatSize(r.fileSize)}</div></td>
              <td>${r.subject}</td>
              <td><span class="resource-type-badge ${fileTypeBadge(r.fileType)}">${fileTypeIcon(r.fileType)} ${r.fileType}</span></td>
              <td>${r.uploadedBy?.name || '—'}</td>
              <td id="status-${r._id}">
                <span class="badge ${r.isApproved ? 'badge-success' : 'badge-danger'}">${r.isApproved ? 'Approved' : 'Pending'}</span>
              </td>
              <td style="display:flex;gap:.4rem;flex-wrap:wrap;">
                <button class="btn btn-secondary btn-sm" onclick="toggleApproval('${r._id}','${r.isApproved}')">
                  ${r.isApproved ? 'Reject' : 'Approve'}
                </button>
                <button class="btn btn-danger btn-sm" onclick="deleteResource('${r._id}')">Delete</button>
              </td>
            </tr>`).join('')}
        </tbody>
      </table>`;
  } catch (err) {
    el.innerHTML = `<p style="color:var(--danger);">${err.message}</p>`;
  }
}

async function toggleApproval(id) {
  try {
    await Admin.toggleApproval(id);
    loadAdminResources();
  } catch (err) { alert(err.message); }
}

async function deleteResource(id) {
  if (!confirm('Delete this resource permanently?')) return;
  try {
    await Resources.remove(id);
    loadAdminResources();
  } catch (err) { alert(err.message); }
}

// ── Broadcast Notification ────────────────────
async function sendNotification(e) {
  e.preventDefault();
  const alertEl = document.getElementById('notif-alert');
  const btn     = document.getElementById('notif-btn');
  hideAlert(alertEl);

  const body = {
    title:   document.getElementById('notif-title').value.trim(),
    message: document.getElementById('notif-message').value.trim(),
    type:    document.getElementById('notif-type').value,
  };

  btn.disabled    = true;
  btn.textContent = 'Sending…';

  try {
    await Admin.broadcast(body);
    showAlert(alertEl, 'Notification broadcasted to all students!', 'success');
    document.getElementById('notif-form').reset();
  } catch (err) {
    showAlert(alertEl, err.message, 'error');
  } finally {
    btn.disabled    = false;
    btn.textContent = '📣 Broadcast';
  }
}

// Init
loadStats();
