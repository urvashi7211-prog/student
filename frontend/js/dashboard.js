/* dashboard.js */

const user = requireAuth();

// Populate sidebar
document.getElementById('sidebar-name').textContent  = user.name;
document.getElementById('sidebar-role').textContent  = user.role === 'admin' ? 'Admin' : 'Student';
document.getElementById('sidebar-avatar').textContent = getInitials(user.name);
document.getElementById('welcome-msg').textContent   = `Welcome back, ${user.name.split(' ')[0]}!`;

async function loadDashboard() {
  try {
    const [dash, notifs] = await Promise.all([
      Users.dashboard(),
      Users.notifications(),
    ]);

    const d = dash.dashboard;

    // Stats
    document.getElementById('stat-resources').textContent = d.recentResources.length;
    document.getElementById('stat-uploads').textContent   = d.myUploadsCount;
    document.getElementById('stat-notifs').textContent    = d.unreadNotifications;

    // Recent Resources
    const rEl = document.getElementById('recent-resources');
    if (!d.recentResources.length) {
      rEl.innerHTML = `<div class="empty-state"><div class="empty-icon">📭</div><h3>No resources yet</h3><p>Be the first to upload!</p></div>`;
    } else {
      rEl.innerHTML = d.recentResources.map(r => `
        <div style="display:flex;align-items:center;gap:.8rem;padding:.6rem 0;border-bottom:1px solid var(--border);">
          <span style="font-size:1.4rem;">${fileTypeIcon(r.fileType)}</span>
          <div style="flex:1;min-width:0;">
            <div style="font-size:.88rem;font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${r.title}</div>
            <div style="font-size:.75rem;color:var(--text-muted);">${r.subject} · Sem ${r.semester}</div>
          </div>
          <a href="${Resources.download(r._id)}" class="btn btn-secondary btn-sm" style="flex-shrink:0;">↓</a>
        </div>`).join('') + `<div style="text-align:center;margin-top:.6rem;"><a href="resources.html" style="font-size:.8rem;">Browse all resources →</a></div>`;
    }

    // Notifications
    const nEl = document.getElementById('notif-list');
    if (!notifs.notifications.length) {
      nEl.innerHTML = `<div class="empty-state"><div class="empty-icon">🔔</div><h3>No notifications</h3></div>`;
    } else {
      nEl.innerHTML = `<div class="notif-list">${
        notifs.notifications.map(n => {
          const isRead = n.readBy && n.readBy.includes(user._id);
          return `
          <div class="notif-item ${isRead ? '' : 'unread'}">
            <div class="notif-dot ${isRead ? 'read' : ''}"></div>
            <div>
              <div class="notif-text">${n.title}</div>
              <div class="notif-time">${n.message}</div>
              <div class="notif-time" style="margin-top:.2rem;">${formatDate(n.createdAt)}</div>
            </div>
          </div>`;
        }).join('')
      }</div>`;
    }

  } catch (err) {
    console.error(err);
    document.getElementById('recent-resources').innerHTML = `<p style="color:var(--danger);">${err.message}</p>`;
  }
}

loadDashboard();
