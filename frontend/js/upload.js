/* upload.js */

const user = requireAuth();
document.getElementById('sidebar-name').textContent   = user.name;
document.getElementById('sidebar-role').textContent   = user.role === 'admin' ? 'Admin' : 'Student';
document.getElementById('sidebar-avatar').textContent = getInitials(user.name);

// ── Drag & Drop ───────────────────────────────
const dropZone = document.getElementById('drop-zone');
const fileInput = document.getElementById('file-input');

dropZone.addEventListener('dragover', (e) => { e.preventDefault(); dropZone.classList.add('dragover'); });
dropZone.addEventListener('dragleave', () => dropZone.classList.remove('dragover'));
dropZone.addEventListener('drop', (e) => {
  e.preventDefault();
  dropZone.classList.remove('dragover');
  const file = e.dataTransfer.files[0];
  if (file) {
    fileInput.files = e.dataTransfer.files;
    showFileLabel(file);
  }
});

function onFileSelected(input) {
  if (input.files[0]) showFileLabel(input.files[0]);
}

function showFileLabel(file) {
  document.getElementById('file-label').textContent = `✅ ${file.name} (${formatSize(file.size)})`;
}

// ── Upload Form Submit ────────────────────────
async function handleUpload(e) {
  e.preventDefault();
  const alertEl = document.getElementById('upload-alert');
  const btn     = document.getElementById('upload-btn');

  hideAlert(alertEl);

  if (!fileInput.files[0]) {
    return showAlert(alertEl, 'Please select a file to upload.', 'error');
  }

  const formData = new FormData();
  formData.append('file',        fileInput.files[0]);
  formData.append('title',       document.getElementById('res-title').value.trim());
  formData.append('subject',     document.getElementById('res-subject').value.trim());
  formData.append('semester',    document.getElementById('res-semester').value);
  formData.append('category',    document.getElementById('res-category').value);
  formData.append('topic',       document.getElementById('res-topic').value.trim());
  formData.append('description', document.getElementById('res-description').value.trim());
  formData.append('tags',        document.getElementById('res-tags').value.trim());

  btn.disabled    = true;
  btn.textContent = 'Uploading…';

  try {
    await Resources.upload(formData);
    showAlert(alertEl, 'Resource uploaded successfully! Redirecting…', 'success');
    setTimeout(() => { window.location.href = 'resources.html'; }, 1500);
  } catch (err) {
    showAlert(alertEl, err.message, 'error');
  } finally {
    btn.disabled    = false;
    btn.textContent = 'Upload Resource';
  }
}
