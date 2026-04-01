const USER_STORAGE_KEY = 'peergoUsers';
const USER_EMAIL_STORAGE_KEY = 'peergoUserEmail';
const USER_ROLE_STORAGE_KEY = 'peergoUserRole';
const LOGIN_PAGE_PATH = '/view/index.html';

function readUsers() {
    const raw = localStorage.getItem(USER_STORAGE_KEY);
    if (!raw) {
        return {};
    }

    try {
        const parsed = JSON.parse(raw);
        return parsed && typeof parsed === 'object' ? parsed : {};
    } catch (error) {
        console.error('Failed to parse users:', error);
        return {};
    }
}

function writeUsers(users) {
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(users));
}

function setMessage(target, text, isError) {
    if (!target) {
        return;
    }

    target.textContent = text;
    target.classList.remove('msg-success', 'msg-error');

    if (text) {
        target.classList.add(isError ? 'msg-error' : 'msg-success');
    }
}

function isStrongPassword(password) {
    if (password.length < 8 || password.length > 20) {
        return false;
    }

    const hasLetter = /[A-Za-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    return hasLetter && hasNumber;
}

function formatDate(dateText) {
    if (!dateText) {
        return '-';
    }

    const date = new Date(dateText);
    if (Number.isNaN(date.getTime())) {
        return dateText;
    }

    return date.toLocaleString();
}

function applyProfileToView(currentEmail, currentUser) {
    const emailElement = document.getElementById('account-email');
    const roleElement = document.getElementById('account-role');
    const displayNameElement = document.getElementById('account-display-name');
    const createdAtElement = document.getElementById('account-created-at');
    const displayNameInput = document.getElementById('display-name');

    if (emailElement) {
        emailElement.textContent = currentEmail || '-';
    }

    if (roleElement) {
        roleElement.textContent = currentUser.role || localStorage.getItem(USER_ROLE_STORAGE_KEY) || 'user';
    }

    if (displayNameElement) {
        displayNameElement.textContent = currentUser.displayName || '-';
    }

    if (createdAtElement) {
        createdAtElement.textContent = formatDate(currentUser.createdAt || '');
    }

    if (displayNameInput) {
        displayNameInput.value = currentUser.displayName || '';
    }
}

function ensureAuthenticatedUser() {
    const currentEmail = localStorage.getItem(USER_EMAIL_STORAGE_KEY);

    if (!currentEmail) {
        window.location.href = LOGIN_PAGE_PATH;
        return null;
    }

    const users = readUsers();
    const currentUser = users[currentEmail];

    if (!currentUser) {
        localStorage.removeItem(USER_EMAIL_STORAGE_KEY);
        localStorage.removeItem(USER_ROLE_STORAGE_KEY);
        window.location.href = LOGIN_PAGE_PATH;
        return null;
    }

    return {
        currentEmail: currentEmail,
        users: users,
        currentUser: currentUser
    };
}

function bindProfileForm(state) {
    const form = document.getElementById('profile-form');
    const message = document.getElementById('profile-message');

    if (!form) {
        return;
    }

    form.addEventListener('submit', function(event) {
        event.preventDefault();

        const input = document.getElementById('display-name');
        const nextDisplayName = String(input ? input.value : '').trim();

        if (nextDisplayName.length > 40) {
            setMessage(message, 'Display name must be 40 characters or fewer.', true);
            return;
        }

        state.users[state.currentEmail].displayName = nextDisplayName;
        writeUsers(state.users);
        applyProfileToView(state.currentEmail, state.users[state.currentEmail]);
        setMessage(message, 'Profile updated successfully.', false);
    });
}

function bindPasswordForm(state) {
    const form = document.getElementById('password-form');
    const message = document.getElementById('password-message');

    if (!form) {
        return;
    }

    form.addEventListener('submit', function(event) {
        event.preventDefault();

        const currentPasswordInput = document.getElementById('current-password');
        const newPasswordInput = document.getElementById('new-password');
        const confirmPasswordInput = document.getElementById('confirm-password');

        const currentPassword = String(currentPasswordInput ? currentPasswordInput.value : '');
        const newPassword = String(newPasswordInput ? newPasswordInput.value : '');
        const confirmPassword = String(confirmPasswordInput ? confirmPasswordInput.value : '');

        const savedUser = state.users[state.currentEmail];

        if (!savedUser || savedUser.password !== currentPassword) {
            setMessage(message, 'Current password is incorrect.', true);
            return;
        }

        if (!isStrongPassword(newPassword)) {
            setMessage(message, 'New password must be 8-20 chars and include letters and numbers.', true);
            return;
        }

        if (newPassword === currentPassword) {
            setMessage(message, 'New password must be different from the current password.', true);
            return;
        }

        if (newPassword !== confirmPassword) {
            setMessage(message, 'New passwords do not match.', true);
            return;
        }

        state.users[state.currentEmail].password = newPassword;
        writeUsers(state.users);
        form.reset();
        setMessage(message, 'Password updated successfully.', false);
    });
}

function initializeAccountPage() {
    const state = ensureAuthenticatedUser();
    if (!state) {
        return;
    }

    applyProfileToView(state.currentEmail, state.currentUser);
    bindProfileForm(state);
    bindPasswordForm(state);
}

document.addEventListener('DOMContentLoaded', initializeAccountPage);
