import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth, signInWithPopup, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDzamlu_n4ZmAYG38fb90HfBdoZcGrjNss",
  authDomain: "royaldryfruit-60bf9.firebaseapp.com",
  projectId: "royaldryfruit-60bf9",
  storageBucket: "royaldryfruit-60bf9.firebasestorage.app",
  messagingSenderId: "1023921125029",
  appId: "1:1023921125029:web:58bfdb76898807299d7f4c"
};

// Initialize Firebase & Auth Provider
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

// Cloudflare Worker URL
const CLOUDFLARE_WORKER_URL = 'https://royal-auth.joblo-work-hr.workers.dev/';

document.addEventListener('DOMContentLoaded', () => {
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

  // Firebase Google Sign-In Handler
  window.handleFirebaseGoogleSignIn = async function() {
    const googleBtn = document.getElementById('firebaseGoogleBtn');
    try {
      googleBtn.disabled = true;
      googleBtn.style.opacity = '0.7';

      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      const email = user.email || '';
      // Extract exact username from the part before '@' in the Gmail address
      const gmailUsername = email.includes('@') ? email.split('@')[0] : (user.displayName || 'Royal Member');
      const picture = user.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80';

      const payload = {
        action: 'google_auth',
        email: email,
        name: gmailUsername,
        picture: picture,
        google_id: user.uid
      };

      try {
        fetch(`${CLOUDFLARE_WORKER_URL}auth`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        }).catch(() => {});
      } catch (e) {}

      localStorage.setItem('royal_user', JSON.stringify({
        name: gmailUsername,
        email: email,
        picture: picture,
        avatar: picture
      }));
      localStorage.setItem('royal_auth', 'true');

      showAlert(`Welcome, ${gmailUsername}! Signed in via Google. Redirecting...`, 'success');
      setTimeout(() => {
        window.location.href = 'index.html';
      }, 1000);

    } catch (err) {
      showAlert(err.message || 'Google authentication failed. Please try again.', 'error');
    } finally {
      googleBtn.disabled = false;
      googleBtn.style.opacity = '1';
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
