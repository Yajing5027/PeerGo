const loginSection = document.getElementById('login-section');
const registerSection = document.getElementById('register-section');

const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');

const switchToRegister = document.getElementById('switch-to-register');
const switchToLogin = document.getElementById('switch-to-login');

const loginMessage = document.getElementById('auth-message');
const registerMessage = document.getElementById('register-message');

const USER_STORAGE_KEY = 'mavsideUsers';
const USER_ROLE_STORAGE_KEY = 'mavsideUserRole';
const ADMIN_USER_EMAIL = 'admin@mnsu.edu';
const ADMIN_USER_PASSWORD = 'Admin1234';
const MAVACCESS_USER_EMAIL = 'mavaccess@mnsu.edu';
const MAVACCESS_USER_PASSWORD = 'Access123';
const dashboardPagePath = 'dashboard.html';

function showSection(sectionToShow) {
    loginSection.hidden = true;
    registerSection.hidden = true;
    sectionToShow.hidden = false;
}

function isSchoolEmail(email) {
    return /^[A-Za-z0-9._%+-]+@mnsu\.edu$/i.test(email);
}

function isStrongPassword(password) {
    if (password.length < 8 || password.length > 20) {
        return false;
    }
    const hasLetter = /[A-Za-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    return hasLetter && hasNumber;
}

function ensureAdminUser(users) {
    const nextUsers = users && typeof users === 'object' ? users : {};
    let changed = false;
    const existingAdmin = nextUsers[ADMIN_USER_EMAIL];

    if (!existingAdmin || typeof existingAdmin !== 'object') {
        nextUsers[ADMIN_USER_EMAIL] = {
            password: ADMIN_USER_PASSWORD,
            role: 'admin',
            createdAt: new Date().toISOString(),
            isSeededAdmin: true
        };
        changed = true;
    } else {
        if (existingAdmin.password !== ADMIN_USER_PASSWORD) {
            existingAdmin.password = ADMIN_USER_PASSWORD;
            changed = true;
        }

        if (existingAdmin.role !== 'admin') {
            existingAdmin.role = 'admin';
            changed = true;
        }

        if (!existingAdmin.createdAt) {
            existingAdmin.createdAt = new Date().toISOString();
            changed = true;
        }

        if (existingAdmin.isSeededAdmin !== true) {
            existingAdmin.isSeededAdmin = true;
            changed = true;
        }
    }

    return {
        users: nextUsers,
        changed: changed
    };
}

function ensureMavAccessUser(users) {
    const nextUsers = users && typeof users === 'object' ? users : {};
    let changed = false;
    const existingMav = nextUsers[MAVACCESS_USER_EMAIL];

    if (!existingMav || typeof existingMav !== 'object') {
        nextUsers[MAVACCESS_USER_EMAIL] = {
            password: MAVACCESS_USER_PASSWORD,
            role: 'user',
            createdAt: new Date().toISOString(),
            isMavAccessTest: true
        };
        changed = true;
    } else {
        if (existingMav.password !== MAVACCESS_USER_PASSWORD) {
            existingMav.password = MAVACCESS_USER_PASSWORD;
            changed = true;
        }

        if (!existingMav.createdAt) {
            existingMav.createdAt = new Date().toISOString();
            changed = true;
        }

        if (existingMav.isMavAccessTest !== true) {
            existingMav.isMavAccessTest = true;
            changed = true;
        }
    }

    return {
        users: nextUsers,
        changed: changed
    };
}

function readUsers() {
    const raw = localStorage.getItem(USER_STORAGE_KEY);
    if (!raw) {
        let initState = ensureAdminUser({});
        initState = ensureMavAccessUser(initState.users);
        writeUsers(initState.users);
        return initState.users;
    }

    try {
        const users = JSON.parse(raw);
        const safeUsers = users && typeof users === 'object' ? users : {};
        let withAdmin = ensureAdminUser(safeUsers);
        let withMav = ensureMavAccessUser(withAdmin.users);

        if (withAdmin.changed || withMav.changed) {
            writeUsers(withMav.users);
        }

        return withMav.users;
    } catch (error) {
        console.error('Failed to parse local users:', error);
        let fallbackState = ensureAdminUser({});
        fallbackState = ensureMavAccessUser(fallbackState.users);
        writeUsers(fallbackState.users);
        return fallbackState.users;
    }
}

function writeUsers(users) {
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(users));
}

function setMessage(target, message, isError) {
    if (!target) return;
    target.textContent = message;
    target.classList.remove('msg-error', 'msg-success');

    if (message) {
        target.classList.add(isError ? 'msg-error' : 'msg-success');
    }
}

switchToRegister.addEventListener('click', function() {
    showSection(registerSection);
    setMessage(loginMessage, '', false);
});

switchToLogin.addEventListener('click', function() {
    showSection(loginSection);
    setMessage(registerMessage, '', false);
});

registerForm.addEventListener('submit', function(event) {
    event.preventDefault();

    const email = document.getElementById('register-email').value.trim();
    const password1 = document.getElementById('register-password1').value;
    const password2 = document.getElementById('register-password2').value;

    if (!isSchoolEmail(email)) {
        setMessage(registerMessage, 'Only @mnsu.edu email can register.', true);
        return;
    }

    if (!isStrongPassword(password1)) {
        setMessage(registerMessage, 'Password must be 8-20 chars and contain letters and numbers.', true);
        return;
    }

    if (password1 !== password2) {
        setMessage(registerMessage, 'Passwords do not match.', true);
        return;
    }

    const users = readUsers();
    if (users[email]) {
        setMessage(registerMessage, 'This email is already registered. Please login.', true);
        return;
    }

    users[email] = {
        password: password1,
        createdAt: new Date().toISOString()
    };
    writeUsers(users);

    setMessage(registerMessage, 'Registration successful. Please login.', false);
    registerForm.reset();
    setTimeout(function() {
        showSection(loginSection);
    }, 500);
});

loginForm.addEventListener('submit', function(event) {
    event.preventDefault();

    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;

    if (!isSchoolEmail(email)) {
        setMessage(loginMessage, 'Please use your @mnsu.edu school email.', true);
        return;
    }

    if (!isStrongPassword(password)) {
        setMessage(loginMessage, 'Password format is invalid.', true);
        return;
    }

    const users = readUsers();
    const currentUser = users[email];

    if (!currentUser || currentUser.password !== password) {
        setMessage(loginMessage, 'Invalid email or password.', true);
        return;
    }

    localStorage.setItem('mavsideUserEmail', email);
    localStorage.setItem(USER_ROLE_STORAGE_KEY, currentUser.role || 'user');

    setMessage(loginMessage, 'Login successful. Redirecting...', false);
    setTimeout(function() {
        window.location.href = dashboardPagePath;
    }, 400);
});
