// To-do list:
// - [ ] Missing: navigation page jump


// Declare sections
const loginSection = document.querySelector('#login-section');
const registerSection = document.querySelector('#register-section');
const resetSection = document.querySelector('#reset-section');

// Declare form elements
const loginForm = loginSection.querySelector('form');
const registerForm = registerSection.querySelector('form');
const resetForm = resetSection.querySelector('form');

// Declare switch links
const switchToRegister = document.querySelector('#switch-to-register');
const switchToReset = document.querySelector('#switch-to-reset');
const switchToLoginFromRegister = document.querySelector('#switch-to-login');
const returnToLoginFromReset = document.querySelector('#reset-section button[type="button"]');

// Declare form input elements
const loginUsername = document.querySelector('#login-username');
const loginPassword = document.querySelector('#login-password');
const registerEmail = document.querySelector('#register-email');
const registerUsername = document.querySelector('#register-username');
const registerPassword1 = document.querySelector('#register-password1');
const registerPassword2 = document.querySelector('#register-password2');
const resetEmail = document.querySelector('#reset-email');
const resetPassword1 = document.querySelector('#reset-password1');
const resetPassword2 = document.querySelector('#reset-password2');

// Function: show specified section, hide others
function showSection(sectionToShow) {
    loginSection.hidden = true;
    registerSection.hidden = true;
    resetSection.hidden = true;
    sectionToShow.hidden = false;
}
switchToRegister.addEventListener('click', function() {
    showSection(registerSection);
});
switchToReset.addEventListener('click', function() {
    showSection(resetSection);
});
switchToLoginFromRegister.addEventListener('click', function() {
    showSection(loginSection);
});
returnToLoginFromReset.addEventListener('click', function() {
    showSection(loginSection);
});


// Validation functions
function validateUsername(username) {
    if (username.length < 2 || username.length > 20) {
        alert('Username must be 2-20 characters');
        return false;
    }
    return true;
}
function validatePasswordLength(password) {
    if (password.length < 8 || password.length > 20) {
        alert('Password must be 8-20 characters');
        return false;
    }
    return true;
}
function validatePasswordContent(password) {
    const letters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';
    let hasLetter = false;
    let hasNumber = false;
    for (let char of password) {
        if (letters.includes(char)) {
            hasLetter = true;
        }
        if (numbers.includes(char)) {
            hasNumber = true;
        }
    }
    if (!hasLetter || !hasNumber) {
        alert('Password must include both letters and numbers');
        return false;
    }
    return true;
}
function validatePasswordMatch(pwd1, pwd2) {
    if (pwd1 !== pwd2) {
        alert('Passwords do not match');
        return false;
    }
    return true;
}
function validateEmail(email) {
    if (email.slice(-10) !== '@mnsu.edu') {
        alert('Email must end with @mnsu.edu');
        return false;
    }
    return true;
}

// Login form submit event
loginForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const username = loginUsername.value;
    const password = loginPassword.value;
    if (!validateUsername(username)) return;
    if (!validatePasswordLength(password)) return;
    if (!validatePasswordContent(password)) return;
    // Missing navigation page jump, temporarily use alert for login success
    alert('Login successful! (跳转功能暂时注释)');
});
// Register form submit event
registerForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const email = registerEmail.value;
    const username = registerUsername.value;
    const password1 = registerPassword1.value;
    const password2 = registerPassword2.value;
    if (!validateEmail(email)) return;
    if (!validateUsername(username)) return;
    if (!validatePasswordLength(password1)) return;
    if (!validatePasswordContent(password1)) return;
    if (!validatePasswordMatch(password1, password2)) return;
    alert('Registration successful!');
    showSection(loginSection);
});
// Reset form submit event
resetForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const email = resetEmail.value;
    const password1 = resetPassword1.value;
    const password2 = resetPassword2.value;
    if (!validateEmail(email)) return;
    if (!validatePasswordLength(password1)) return;
    if (!validatePasswordContent(password1)) return;
    if (!validatePasswordMatch(password1, password2)) return;
    alert('Password reset successful!');
    showSection(loginSection);
});
