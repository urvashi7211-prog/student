/* auth.js — Login / Signup logic */

// If already logged in, redirect away from auth page
(function () {
  const user = getCurrentUser();
  if (user) {
    window.location.href = user.role === 'admin' ? 'admin.html' : 'dashboard.html';
  }
})();

function switchTab(tab) {
  const loginForm  = document.getElementById('login-form');
  const signupForm = document.getElementById('signup-form');
  const tabLogin   = document.getElementById('tab-login');
  const tabSignup  = document.getElementById('tab-signup');
  const alert      = document.getElementById('auth-alert');

  hideAlert(alert);

  if (tab === 'login') {
    loginForm.classList.remove('hidden');
    signupForm.classList.add('hidden');
    tabLogin.classList.add('active');
    tabSignup.classList.remove('active');
  } else {
    signupForm.classList.remove('hidden');
    loginForm.classList.add('hidden');
    tabSignup.classList.add('active');
    tabLogin.classList.remove('active');
  }
}

async function handleLogin(e) {
  e.preventDefault();
  const alert = document.getElementById('auth-alert');
  const btn   = document.getElementById('login-btn');

  const email    = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value;

  hideAlert(alert);
  btn.disabled = true;
  btn.textContent = 'Logging in…';

  try {
    const data = await Auth.login({ email, password });
    setCurrentUser(data.user);
    window.location.href = data.user.role === 'admin' ? 'admin.html' : 'dashboard.html';
  } catch (err) {
    showAlert(alert, err.message, 'error');
  } finally {
    btn.disabled = false;
    btn.textContent = 'Login';
  }
}

async function handleSignup(e) {
  e.preventDefault();
  const alert = document.getElementById('auth-alert');
  const btn   = document.getElementById('signup-btn');

  const name     = document.getElementById('signup-name').value.trim();
  const email    = document.getElementById('signup-email').value.trim();
  const course   = document.getElementById('signup-course').value.trim();
  const semester = parseInt(document.getElementById('signup-semester').value);
  const password = document.getElementById('signup-password').value;

  hideAlert(alert);
  btn.disabled = true;
  btn.textContent = 'Creating account…';

  try {
    const data = await Auth.register({ name, email, password, course, semester });
    setCurrentUser(data.user);
    showAlert(alert, 'Account created! Redirecting…', 'success');
    setTimeout(() => { window.location.href = 'dashboard.html'; }, 1000);
  } catch (err) {
    showAlert(alert, err.message, 'error');
  } finally {
    btn.disabled = false;
    btn.textContent = 'Create Account';
  }
}
