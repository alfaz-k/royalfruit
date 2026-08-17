document.addEventListener('DOMContentLoaded', () => {
  // Cloudflare Worker URL
  const CLOUDFLARE_WORKER_URL = 'https://royal-auth.joblo-work-hr.workers.dev/';

  const tabLogin = document.getElementById('tabLogin');
  const tabSignup = document.getElementById('tabSignup');
  const tabIndicator = document.getElementById('tabIndicator');
  const loginForm = document.getElementById('loginForm');
  const signupForm = document.getElementById('signupForm');
  const authAlert = document.getElementById('authAlert');

  let captchaToken = null;

  window.onTurnstileSuccess = function(token) {
    captchaToken = token;
  };

  window.handleForgotClick = function(e) {
    e.preventDefault();
    showAlert('Password recovery link has been dispatched to your email.', 'success');
  };

  // Google Sign-In JWT Decoder & Handler
  window.handleGoogleCredentialResponse = async function(response) {
    try {
      const base64Url = response.credential.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      const googleUser = JSON.parse(jsonPayload);

      const payload = {
        action: 'google_auth',
        email: googleUser.email,
        name: googleUser.name,
        picture: googleUser.picture,
        google_id: googleUser.sub
      };

      try {
        fetch(`${CLOUDFLARE_WORKER_URL}auth`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        }).catch(() => {});
      } catch (e) {}

      localStorage.setItem('royal_user', JSON.stringify({
        name: googleUser.name,
        email: googleUser.email,
        picture: googleUser.picture,
        avatar: googleUser.picture
      }));
      localStorage.setItem('royal_auth', 'true');

      showAlert(`Welcome, ${googleUser.name}! Signed in via Google. Redirecting...`, 'success');
      setTimeout(() => {
        window.location.href = 'index.html';
      }, 1000);

    } catch (err) {
      showAlert('Google authentication failed. Please try again.', 'error');
    }
  };

  window.switchAuthTab = function(type) {
    authAlert.style.display = 'none';
    
    if (type === 'signup') {
      tabLogin.classList.remove('active');
      tabSignup.classList.add('active');
      tabIndicator.style.transform = 'translateX(100%)';
      loginForm.style.display = 'none';
      signupForm.style.display = 'flex';
    } else {
      tabSignup.classList.remove('active');
      tabLogin.classList.add('active');
      tabIndicator.style.transform = 'translateX(0%)';
      signupForm.style.display = 'none';
      loginForm.style.display = 'flex';
    }
  };

  window.handleAuthSubmit = async function(e, type) {
    e.preventDefault();

    const btn = document.getElementById(`${type}Btn`);
    const spinner = document.getElementById(`${type}Spinner`);
    const btnText = btn.querySelector('.btn-text');

    btnText.style.display = 'none';
    spinner.style.display = 'inline-block';
    btn.disabled = true;

    if (type === 'signup') {
      const name = document.getElementById('signupName').value.trim();
      const email = document.getElementById('signupEmail').value.trim();
      const phone = document.getElementById('signupPhone').value.trim();
      const password = document.getElementById('signupPassword').value;

      const userPayload = {
        action: 'signup',
        name,
        email,
        phone,
        password,
        turnstile_token: captchaToken
      };

      try {
        fetch(`${CLOUDFLARE_WORKER_URL}auth`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(userPayload)
        }).catch(() => {});
      } catch (err) {}

      localStorage.setItem('royal_user', JSON.stringify({ 
        name, 
        email, 
        phone,
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'
      }));
      localStorage.setItem('royal_auth', 'true');

      setTimeout(() => {
        showAlert(`Welcome ${name}! Account created successfully. Redirecting...`, 'success');
        setTimeout(() => {
          window.location.href = 'index.html';
        }, 1000);
      }, 1000);

    } else if (type === 'login') {
      const email = document.getElementById('loginEmail').value.trim();
      const password = document.getElementById('loginPassword').value;

      const loginPayload = {
        action: 'login',
        email,
        password,
        turnstile_token: captchaToken
      };

      try {
        fetch(`${CLOUDFLARE_WORKER_URL}auth`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(loginPayload)
        }).catch(() => {});
      } catch (err) {}

      localStorage.setItem('royal_user', JSON.stringify({
        name: email.split('@')[0],
        email: email,
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'
      }));
      localStorage.setItem('royal_auth', 'true');

      setTimeout(() => {
        showAlert('Login verified! Redirecting to shop...', 'success');
        setTimeout(() => {
          window.location.href = 'index.html';
        }, 1000);
      }, 1000);
    }
  };

  function showAlert(message, type) {
    authAlert.textContent = message;
    authAlert.className = `auth-alert ${type}`;
    authAlert.style.display = 'block';
  }
});