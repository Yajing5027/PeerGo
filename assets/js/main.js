const protectedPaths = [
    '/view/dashboard.html',
    '/view/delivery.html',
    '/view/add.html',
    '/view/account.html',
    '/dashboard.html',
    '/services/delivery.html',
    '/add.html',
    '/account.html'
];

const loginPagePath = '/view/index.html';

function isProtectedPage(pathname) {
    return protectedPaths.some(function(path) {
        return pathname.endsWith(path);
    });
}

function ensureLoginState() {
    const pathname = window.location.pathname;
    const userEmail = localStorage.getItem('peergoUserEmail');

    if (isProtectedPage(pathname) && !userEmail) {
        window.location.href = loginPagePath;
    }
}

function markActiveNavLink() {
    const pathname = window.location.pathname;
    const links = document.querySelectorAll('nav a[href]');

    links.forEach(function(link) {
        const href = link.getAttribute('href');
        if (!href) return;
        link.classList.remove('active-link');
        if (pathname === href || pathname.endsWith(href)) {
            link.classList.add('active-link');
        }
    });
}

function bindLogoutLink() {
    const logoutLink = document.getElementById('logout-link');
    if (!logoutLink) return;

    logoutLink.addEventListener('click', function(event) {
        event.preventDefault();
        localStorage.removeItem('peergoUserEmail');
        localStorage.removeItem('peergoUserRole');
        window.location.href = loginPagePath;
    });
}

async function loadIncludes() {
    const includeElements = document.querySelectorAll('[data-include]');

    for (let i = 0; i < includeElements.length; i++) {
        const element = includeElements[i];
        const includePath = element.getAttribute('data-include');
        if (!includePath) continue;

        try {
            const response = await fetch(includePath, { cache: 'no-store' });
            if (!response.ok) {
                throw new Error('Failed to load include: ' + includePath);
            }
            element.innerHTML = await response.text();
        } catch (error) {
            console.error(error);
            element.innerHTML = '';
        }
    }

    markActiveNavLink();
    bindLogoutLink();
}

document.addEventListener('DOMContentLoaded', function() {
    ensureLoginState();
    loadIncludes();
});


