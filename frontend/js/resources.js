/* resources.js */

const user = requireAuth();
document.getElementById('sidebar-name').textContent   = user.name;
document.getElementById('sidebar-role').textContent   = user.role === 'admin' ? 'Admin' : 'Student';
document.getElementById('sidebar-avatar').textContent = getInitials(user.name);

let currentPage = 1;
let debounceTimer;

function debouncedSearch() {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => { currentPage = 1; loadResources(); }, 400);
}

function applyFilters() {
  currentPage = 1;
  loadResources();
}

function clearFilters() {
  document.getElementById('search-input').value    = '';
  document.getElementById('filter-subject').value  = '';
  document.getElementById('filter-semester').value = '';
  document.getElementById('filter-category').value = '';
  document.getElementById('filter-type').value     = '';
  currentPage = 1;
  loadResources();
}

async function loadResources() {
  const grid = document.getElementById('resource-grid');
  grid.innerHTML = `<div class="loading-row" style="grid-column:1/-1;"><div class="spinner"></div></div>`;

  const params = {
    page:     currentPage,
    limit:    9,
    search:   document.getElementById('search-input').value.trim(),
    subject:  document.getElementById('filter-subject').value,
    semester: document.getElementById('filter-semester').value,
    category: document.getElementById('filter-category').value,
    fileType: document.getElementById('filter-type').value,
  };
  // Remove empty params
  Object.keys(params).forEach(k => { if (!params[k]) delete params[k]; });

  try {
    const data = await Resources.list(params);
    renderGrid(data.resources);
    renderPagination(data.page, data.pages);
  } catch (err) {
    grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1;"><p style="color:var(--danger);">${err.message}</p></div>`;
  }
}

function renderGrid(resources) {
  const grid = document.getElementById('resource-grid');
  if (!resources.length) {
    grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1;">
      <div class="empty-icon">📭</div>
      <h3>No resources found</h3>
      <p>Try different filters or <a href="upload.html">upload one</a>.</p>
    </div>`;
    return;
  }

  grid.innerHTML = resources.map(r => `
    <div class="resource-card">
      <div>
        <span class="resource-type-badge ${fileTypeBadge(r.fileType)}">${fileTypeIcon(r.fileType)} ${r.fileType?.toUpperCase() || 'FILE'}</span>
      </div>
      <div class="resource-title">${r.title}</div>
      <div class="resource-meta">📖 ${r.subject} &nbsp;|&nbsp; Sem ${r.semester}</div>
      <div class="resource-meta" style="text-transform:capitalize;">🗂 ${r.category?.replace('_', ' ') || '—'} &nbsp;|&nbsp; ${formatSize(r.fileSize)}</div>
      ${r.topic ? `<div class="resource-meta">🏷 ${r.topic}</div>` : ''}
      <div class="resource-footer">
        <span style="font-size:.75rem;color:var(--text-muted);">⬇ ${r.downloadCount || 0}</span>
        <div style="display:flex;gap:.4rem;">
          <button class="btn btn-secondary btn-sm" onclick="openDetail('${r._id}')">Detail</button>
          <a class="btn btn-primary btn-sm" href="${Resources.download(r._id)}" target="_blank">Download</a>
        </div>
      </div>
    </div>`).join('');
}

function renderPagination(page, pages) {
  const el = document.getElementById('pagination');
  if (pages <= 1) { el.innerHTML = ''; return; }

  let html = `<button class="page-btn" onclick="goPage(${page - 1})" ${page === 1 ? 'disabled' : ''}>‹</button>`;
  for (let i = 1; i <= pages; i++) {
    html += `<button class="page-btn ${i === page ? 'active' : ''}" onclick="goPage(${i})">${i}</button>`;
  }
  html += `<button class="page-btn" onclick="goPage(${page + 1})" ${page === pages ? 'disabled' : ''}>›</button>`;
  el.innerHTML = html;
}

function goPage(p) {
  currentPage = p;
  loadResources();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ── Detail Modal ──────────────────────────────
async function openDetail(id) {
  document.getElementById('detail-modal').classList.add('open');
  document.getElementById('modal-body').innerHTML = `<div class="loading-row"><div class="spinner"></div></div>`;

  try {
    const { resource: r } = await Resources.get(id);
    document.getElementById('modal-title').textContent = r.title;
    document.getElementById('modal-download-btn').href = Resources.download(id);

    document.getElementById('modal-body').innerHTML = `
      <div style="display:flex;flex-direction:column;gap:.7rem;">
        <div style="display:flex;gap:1rem;flex-wrap:wrap;">
          <span class="resource-type-badge ${fileTypeBadge(r.fileType)}">${fileTypeIcon(r.fileType)} ${r.fileType?.toUpperCase()}</span>
          <span class="badge badge-info" style="text-transform:capitalize;">${r.category?.replace('_', ' ')}</span>
        </div>
        ${r.description ? `<p style="color:var(--text);font-size:.88rem;">${r.description}</p>` : ''}
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:.5rem;font-size:.83rem;">
          <div><span style="color:var(--text-muted);">Subject</span><br><strong>${r.subject}</strong></div>
          <div><span style="color:var(--text-muted);">Semester</span><br><strong>${r.semester}</strong></div>
          <div><span style="color:var(--text-muted);">Topic</span><br><strong>${r.topic || '—'}</strong></div>
          <div><span style="color:var(--text-muted);">File Size</span><br><strong>${formatSize(r.fileSize)}</strong></div>
          <div><span style="color:var(--text-muted);">Uploaded by</span><br><strong>${r.uploadedBy?.name || '—'}</strong></div>
          <div><span style="color:var(--text-muted);">Downloads</span><br><strong>${r.downloadCount}</strong></div>
          <div><span style="color:var(--text-muted);">Date</span><br><strong>${formatDate(r.createdAt)}</strong></div>
        </div>
        ${r.tags?.length ? `<div class="tag-list">${r.tags.map(t => `<span class="tag">${t}</span>`).join('')}</div>` : ''}
      </div>`;
  } catch (err) {
    document.getElementById('modal-body').innerHTML = `<p style="color:var(--danger);">${err.message}</p>`;
  }
}

function closeModal() {
  document.getElementById('detail-modal').classList.remove('open');
}

// Close modal on overlay click
document.getElementById('detail-modal').addEventListener('click', function (e) {
  if (e.target === this) closeModal();
});

loadResources();
