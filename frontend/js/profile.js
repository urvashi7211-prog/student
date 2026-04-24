/* profile.js */

const user = requireAuth();
document.getElementById('sidebar-name').textContent   = user.name;
document.getElementById('sidebar-role').textContent   = user.role === 'admin' ? 'Admin' : 'Student';
document.getElementById('sidebar-avatar').textContent = getInitials(user.name);

async function loadProfile() {
  try {
    const { user: u } = await Users.profile();
    populateForm(u);
    loadMyUploads();
  } catch (err) {
    console.error(err);
  }
}

function populateForm(u) {
  document.getElementById('profile-avatar').textContent = getInitials(u.name);
  document.getElementById('profile-name').textContent   = u.name;
  document.getElementById('profile-email').textContent  = u.email;
  document.getElementById('profile-course').textContent = u.course ? `${u.course} — Semester ${u.semester}` : '';

  document.getElementById('edit-name').value      = u.name;
  document.getElementById('edit-course').value    = u.course || '';
  document.getElementById('edit-semester').value  = u.semester || 1;
  document.getElementById('edit-interests').value = (u.interests || []).join(', ');
}

async function handleProfileUpdate(e) {
  e.preventDefault();
  const alertEl = document.getElementById('profile-alert');
  const btn     = document.getElementById('profile-save-btn');
  hideAlert(alertEl);

  const body = {
    name:      document.getElementById('edit-name').value.trim(),
    course:    document.getElementById('edit-course').value.trim(),
    semester:  document.getElementById('edit-semester').value,
    interests: document.getElementById('edit-interests').value,
  };
  const pw = document.getElementById('edit-password').value;
  if (pw) body.password = pw;

  btn.disabled    = true;
  btn.textContent = 'Saving…';

  try {
    const { user: updated } = await Users.updateProfile(body);
    setCurrentUser(updated);
    showAlert(alertEl, 'Profile updated successfully!', 'success');
    populateForm(updated);
    document.getElementById('edit-password').value = '';
    document.getElementById('sidebar-name').textContent   = updated.name;
    document.getElementById('sidebar-avatar').textContent = getInitials(updated.name);
  } catch (err) {
    showAlert(alertEl, err.message, 'error');
  } finally {
    btn.disabled    = false;
    btn.textContent = 'Save Changes';
  }
}

async function loadMyUploads() {
  const el = document.getElementById('my-uploads');
  try {
    const { resources } = await Users.myUploads();
    if (!resources.length) {
      el.innerHTML = `<div class="empty-state"><div class="empty-icon">📭</div><h3>No uploads yet</h3><p><a href="upload.html">Upload your first resource</a></p></div>`;
      return;
    }
    el.innerHTML = resources.map(r => `
      <div style="display:flex;align-items:center;gap:.8rem;padding:.65rem 0;border-bottom:1px solid var(--border);">
        <span style="font-size:1.3rem;">${fileTypeIcon(r.fileType)}</span>
        <div style="flex:1;min-width:0;">
          <div style="font-size:.88rem;font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${r.title}</div>
          <div style="font-size:.75rem;color:var(--text-muted);">${r.subject} · Sem ${r.semester} · ${formatDate(r.createdAt)}</div>
        </div>
        <button class="btn btn-danger btn-sm" onclick="deleteUpload('${r._id}')">Delete</button>
      </div>`).join('');
  } catch (err) {
    el.innerHTML = `<p style="color:var(--danger);">${err.message}</p>`;
  }
}

async function deleteUpload(id) {
  if (!confirm('Delete this resource? This cannot be undone.')) return;
  try {
    await Resources.remove(id);
    loadMyUploads();
  } catch (err) {
    alert(err.message);
  }
}

loadProfile();
