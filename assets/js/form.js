const loginSection = document.getElementById('login-section');
const registerSection = document.getElementById('register-section');

const loginUsername = document.getElementById('login-username');
const loginPassword = document.getElementById('login-password');

const registerEmail = document.getElementById('register-email');
const registerUsername = document.getElementById('register-username');
const registerPassword1 = document.getElementById('register-password1');
const registerPassword2 = document.getElementById('register-password2');

document.addEventListener('DOMContentLoaded', function() {
  const loginToRegisterLink = document.getElementById('switch-to-register');
  
  if (loginToRegisterLink) {
    loginToRegisterLink.addEventListener('click', function() {
      loginSection.hidden = true;
      registerSection.hidden = false;
    });
  }
  
  const registerToLoginLink = document.getElementById('switch-to-login');
  
  if (registerToLoginLink) {
    registerToLoginLink.addEventListener('click', function() {
      loginSection.hidden = false;
      registerSection.hidden = true;
    });
  }
  
  const loginToResetLink = document.getElementById('switch-to-reset');
  
  if (loginToResetLink) {
    loginToResetLink.addEventListener('click', function() {
      loginSection.hidden = true;
      registerSection.hidden = true;
      const resetSection = document.getElementById('reset-section');
      if (resetSection) {
        resetSection.hidden = false;
      }
    });
  }
  
  const returnToLoginButton = document.querySelector('#reset-section button[type="button"]');
  
  if (returnToLoginButton) {
    returnToLoginButton.addEventListener('click', function() {
      loginSection.hidden = false;
      registerSection.hidden = true;
      const resetSection = document.getElementById('reset-section');
      if (resetSection) {
        resetSection.hidden = true;
      }
    });
  }
  
  const loginForm = loginSection.querySelector('form');
  loginForm.addEventListener('submit', function(event) {
    event.preventDefault();
    
    const username = loginUsername.value;
    const password = loginPassword.value;
    
    if (username.length === 0) {
      alert('Username cannot be empty');
      return;
    }
    
    if (password.length < 8 || password.length > 20) {
      alert('Password must be 8-20 characters');
      return;
    }
    
    window.location.href = 'dashboard.html';
  });
  
  const registerForm = registerSection.querySelector('form');
  registerForm.addEventListener('submit', function(event) {
    event.preventDefault();
    
    const email = registerEmail.value;
    const username = registerUsername.value;
    const password1 = registerPassword1.value;
    const password2 = registerPassword2.value;
    
    if (email.slice(-10) !== '@mnsu.edu') {
      alert('Email must end with @mnsu.edu');
      return;
    }
    
    if (username.length < 2 || username.length > 20) {
      alert('Username must be 2-20 characters');
      return;
    }
    
    if (password1.length < 8 || password1.length > 20) {
      alert('Password must be 8-20 characters');
      return;
    }
    
    if (password1 !== password2) {
      alert('Passwords do not match');
      return;
    }
    
    alert('Registration successful!');
    

  });
});