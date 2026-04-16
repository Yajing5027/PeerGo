const ROOT_FOLDER_NAMES = ['view', 'assets', 'style', 'components', 'services'];

function detectBasePath() {
    if (typeof window === 'undefined' || !window.location) return '';

    const configured = typeof window.MAVSIDE_BASE_PATH === 'string' ? window.MAVSIDE_BASE_PATH.trim() : '';
    if (configured) {
        return configured === '/' ? '' : configured.replace(/\/+$/, '');
    }

    const hostname = String(window.location.hostname || '');
    const pathname = String(window.location.pathname || '/');
    const parts = pathname.split('/').filter(Boolean);
    const first = parts[0] || '';

    if (!first || ROOT_FOLDER_NAMES.indexOf(first) >= 0) {
        return '';
    }

    if (hostname === 'github.io' || hostname.endsWith('.github.io')) {
        return '/' + first;
    }

    return '';
}

function isExternalPath(path) {
    return /^[a-z][a-z0-9+.-]*:/i.test(path) || path.startsWith('//') || path.startsWith('#');
}

const mavsideBasePath = detectBasePath();

function resolveMavsidePath(path) {
    const raw = String(path || '').trim();
    if (!raw || isExternalPath(raw)) return raw;
    if (raw.startsWith('/')) {
        return (mavsideBasePath + raw).replace(/\/{2,}/g, '/');
    }
    return raw;
}

function normalizeDomPaths(root) {
    const host = root || document;
    if (!host || !host.querySelectorAll) return;

    host.querySelectorAll('[href],[src],[data-include]').forEach(function(node) {
        ['href', 'src', 'data-include'].forEach(function(attr) {
            const current = node.getAttribute(attr);
            if (!current || !current.startsWith('/')) return;
            node.setAttribute(attr, resolveMavsidePath(current));
        });
    });
}

window.mavsideBasePath = mavsideBasePath;
window.mavsideResolvePath = resolveMavsidePath;

const protectedPaths = [
    '/view/dashboard.html',
    '/view/delivery.html',
    '/view/shops.html',
    '/view/shop.html',
    '/view/order-confirm.html',
    '/view/order-tracking.html',
    '/view/add.html',
    '/view/manage.html',
    '/view/account.html',
    '/dashboard.html',
    '/services/delivery.html',
    '/add.html',
    '/account.html'
];

const loginPagePath = resolveMavsidePath('/view/index.html');

function migrateLocalStorageKeys() {
    const mapping = [
        { oldKey: 'peergoUsers', newKey: 'mavsideUsers' },
        { oldKey: 'peergoUserEmail', newKey: 'mavsideUserEmail' },
        { oldKey: 'peergoUserRole', newKey: 'mavsideUserRole' },
        { oldKey: 'peergoDeliveryPosts', newKey: 'mavsideDeliveryPosts' }
    ];

    mapping.forEach(({ oldKey, newKey }) => {
        try {
            const oldVal = localStorage.getItem(oldKey);
            const newVal = localStorage.getItem(newKey);
            if (oldVal !== null && (newVal === null || newVal === undefined || newVal === '')) {
                localStorage.setItem(newKey, oldVal);
                localStorage.removeItem(oldKey);
                console.info('migrateLocalStorageKeys: migrated', oldKey, '->', newKey);
            }
        } catch (err) {
            console.warn('migrateLocalStorageKeys error for', oldKey, err);
        }
    });
}

function isProtectedPage(pathname) {
    return protectedPaths.some(function(path) {
        return pathname.endsWith(path);
    });
}

function ensureLoginState() {
    const pathname = window.location.pathname;
    const userEmail = localStorage.getItem('mavsideUserEmail');

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
        localStorage.removeItem('mavsideUserEmail');
        localStorage.removeItem('mavsideUserRole');
        window.location.href = loginPagePath;
    });
}

function formatUSDateTime(value) {
    if (value === null || value === undefined || value === '') return '-';
    try {
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return String(value);
        return date.toLocaleString('en-US', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    } catch (e) {
        return String(value);
    }
}

function formatUSDate(value) {
    if (value === null || value === undefined || value === '') return '-';
    try {
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return String(value);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });
    } catch (e) {
        return String(value);
    }
}

function getCampusLocationOptions() {
    if (window.FormComponents && Array.isArray(window.FormComponents.LOCATION_OPTIONS)) {
        return window.FormComponents.LOCATION_OPTIONS;
    }
    return [
        'Alumni Foundation Center',
        'Andreas Observatory',
        'Armstrong Hall',
        'Centennial Student Union',
        'Clinical Sciences Building',
        'Crawford Residence Community',
        'Earley Center for Performing Arts',
        'Ford Hall',
        'Highland Center',
        'Highland North',
        'Julia A. Sears Residence Community',
        'Maverick All-Sports Dome',
        'McElroy Residence Community',
        'Memorial Library',
        'Morris Hall',
        'Myers Field House',
        'Nelson Hall',
        'Otto Recreation Center',
        'Penington Hall',
        'Preska Residence Community',
        'Stadium Heights Residence Community',
        'Taylor Center',
        'Trafton East',
        'Trafton North',
        'Trafton South',
        'Trafton Science Center',
        'University Advancement Center',
        'Wiecking Center',
        'Wigley Administration Center',
        'Wissink Hall',
        'Lot 1',
        'Lot 2',
        'Lot 4',
        'Lot 5',
        'Lot 6',
        'Lot 7',
        'Lot 8',
        'Lot 9',
        'Lot 10',
        'Lot 11',
        'Lot 12',
        'Lot 13',
        'Lot 14',
        'Lot 15',
        'Lot 16',
        'Lot 17',
        'Lot 20',
        'Lot 21',
        'Lot 22',
        'Lot 23',
        'Other'
    ];
}

function fillSelect(select, options, selectedValue) {
    if (!select) return;
    const html = ['<option value="">-</option>'].concat(options.map(function(opt) {
        return '<option value="' + opt.replace(/"/g, '&quot;') + '">' + opt + '</option>';
    })).join('');
    select.innerHTML = html;
    if (selectedValue && options.indexOf(selectedValue) >= 0) {
        select.value = selectedValue;
    }
}

function readJsonSafe(key, fallback) {
    try {
        const raw = localStorage.getItem(key);
        if (!raw) return fallback;
        const parsed = JSON.parse(raw);
        return parsed === null || parsed === undefined ? fallback : parsed;
    } catch (e) {
        return fallback;
    }
}

function getCurrentEmail() {
    return localStorage.getItem('mavsideUserEmail') || '';
}

function getMyNotifications() {
    const email = getCurrentEmail();
    if (!email) return [];

    if (window.NotificationCenter && window.NotificationCenter.readMine) {
        const mine = window.NotificationCenter.readMine();
        return Array.isArray(mine) ? mine : [];
    }

    const all = readJsonSafe('mavsideNotifications', {});
    const list = all && typeof all === 'object' ? all[email] : [];
    return Array.isArray(list) ? list : [];
}

function markMyNotificationsRead() {
    const email = getCurrentEmail();
    if (!email) return;

    if (window.NotificationCenter && window.NotificationCenter.markAllRead) {
        window.NotificationCenter.markAllRead();
        return;
    }

    const all = readJsonSafe('mavsideNotifications', {});
    const list = Array.isArray(all[email]) ? all[email] : [];
    all[email] = list.map(function(item) {
        return Object.assign({}, item, { read: true });
    });
    localStorage.setItem('mavsideNotifications', JSON.stringify(all));
}

function markNotificationRead(notificationId) {
    if (!notificationId) return;

    if (window.NotificationCenter && window.NotificationCenter.markRead) {
        window.NotificationCenter.markRead(notificationId);
        return;
    }

    const email = getCurrentEmail();
    if (!email) return;
    const all = readJsonSafe('mavsideNotifications', {});
    const list = Array.isArray(all[email]) ? all[email] : [];
    all[email] = list.map(function(item) {
        if (item && item.id === notificationId) {
            return Object.assign({}, item, { read: true });
        }
        return item;
    });
    localStorage.setItem('mavsideNotifications', JSON.stringify(all));
}

function escapeHtml(text) {
    return String(text || '').replace(/[&<>"']/g, function(ch) {
        return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[ch];
    });
}

function renderNavNotifications() {
    const listRoot = document.getElementById('nav-notification-list');
    const dot = document.getElementById('nav-notification-dot');
    if (!listRoot) return;

    const list = getMyNotifications().slice(0, 12);
    const unreadCount = list.filter(function(item) { return !item.read; }).length;

    if (dot) dot.classList.toggle('show', unreadCount > 0);

    if (!list.length) {
        listRoot.innerHTML = '<p class="account-muted">No notifications</p>';
        return;
    }

    const itemsHtml = list.map(function(item) {
        const timeText = window.formatUSDateTime ? window.formatUSDateTime(item.at) : new Date(item.at || Date.now()).toLocaleString('en-US');
        return '<div class="nav-notification-item' + (item.read ? '' : ' unread') + '" data-id="' + escapeHtml(item.id || '') + '">' +
            '<p class="nav-notification-item-title">' + escapeHtml(item.title || 'Notification') + (item.read ? '' : ' (New)') + '</p>' +
            '<p class="nav-notification-item-meta">' + escapeHtml(timeText) + '</p>' +
        '</div>';
    }).join('');

    listRoot.innerHTML = '<div class="nav-notification-list">' + itemsHtml + '</div>';

    listRoot.querySelectorAll('.nav-notification-item').forEach(function(itemEl) {
        itemEl.addEventListener('click', function(e) {
            e.stopPropagation();
            const id = itemEl.getAttribute('data-id') || '';
            if (id) {
                markNotificationRead(id);
                renderNavNotifications();
            }
        });
    });
}

function openNavNotificationModal() {
    const modal = document.getElementById('nav-notification-modal');
    if (!modal) return;
    renderNavNotifications();
    modal.classList.add('show');
    modal.setAttribute('aria-hidden', 'false');
}

function closeNavNotificationModal() {
    const modal = document.getElementById('nav-notification-modal');
    if (!modal) return;
    modal.classList.remove('show');
    modal.setAttribute('aria-hidden', 'true');
}

function initNavbarWidgets() {
    const pickupSelect = document.getElementById('nav-pickup-select');
    const deliverySelect = document.getElementById('nav-delivery-select');
    const options = getCampusLocationOptions();
    const savedPickup = localStorage.getItem('mavsideNavPickup') || '';
    const savedDelivery = localStorage.getItem('mavsideNavDelivery') || '';

    fillSelect(pickupSelect, options, savedPickup);
    fillSelect(deliverySelect, options, savedDelivery);

    if (pickupSelect) {
        pickupSelect.addEventListener('change', function() {
            localStorage.setItem('mavsideNavPickup', pickupSelect.value || '');
        });
    }

    if (deliverySelect) {
        deliverySelect.addEventListener('change', function() {
            localStorage.setItem('mavsideNavDelivery', deliverySelect.value || '');
        });
    }

    renderNavNotifications();

    var notificationButton = document.getElementById('nav-notification-button');
    if (notificationButton) {
        notificationButton.addEventListener('click', openNavNotificationModal);
    }

    var notificationClose = document.getElementById('nav-notification-close');
    if (notificationClose) {
        notificationClose.addEventListener('click', closeNavNotificationModal);
    }

    var notificationModal = document.getElementById('nav-notification-modal');
    if (notificationModal) {
        notificationModal.addEventListener('click', function(e) {
            if (e.target === notificationModal) closeNavNotificationModal();
        });
    }

    var markAllReadBtn = document.getElementById('nav-mark-all-read');
    if (markAllReadBtn) {
        markAllReadBtn.addEventListener('click', function() {
            markMyNotificationsRead();
            renderNavNotifications();
        });
    }

    document.addEventListener('mavside:notificationsUpdated', renderNavNotifications);
    window.addEventListener('storage', function(e) {
        if (e.key === 'mavsideNotifications') {
            renderNavNotifications();
        }
    });

    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') closeNavNotificationModal();
    });
}

async function loadIncludes() {
    const includeElements = document.querySelectorAll('[data-include]');

    for (let i = 0; i < includeElements.length; i++) {
        const element = includeElements[i];
        const includePath = element.getAttribute('data-include');
        if (!includePath) continue;

        try {
            const response = await fetch(resolveMavsidePath(includePath), { cache: 'no-store' });
            if (!response.ok) {
                throw new Error('Failed to load include: ' + includePath);
            }
            element.innerHTML = await response.text();
            normalizeDomPaths(element);
        } catch (error) {
            console.error(error);
            element.innerHTML = '';
        }
    }

    normalizeDomPaths(document);
    markActiveNavLink();
    bindLogoutLink();
    initNavbarWidgets();
}

document.addEventListener('DOMContentLoaded', function() {
    try {
        migrateLocalStorageKeys();
    } catch (e) {
        console.warn('Migration check failed', e);
    }

    // Force document language to English to ensure browser validation messages are in English.
    try { document.documentElement.lang = 'en'; } catch (e) {}

    normalizeDomPaths(document);
    ensureLoginState();
    if (window.AccountManager && window.AccountManager.ensureMavAccessMonthlyGrant) {
        window.AccountManager.ensureMavAccessMonthlyGrant();
    }
    window.formatUSDateTime = formatUSDateTime;
    window.formatUSDate = formatUSDate;
    loadIncludes();
});
