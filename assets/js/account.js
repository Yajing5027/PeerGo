(function(){
  const USER_STORAGE_KEY = 'mavsideUsers';
  const USER_EMAIL_STORAGE_KEY = 'mavsideUserEmail';
  const USER_ROLE_STORAGE_KEY = 'mavsideUserRole';
  const WALLET_STORAGE_KEY = 'mavsideWallet';
  const ADDRESSES_STORAGE_KEY = 'mavsideAddresses';
  const PAYMENT_METHODS_STORAGE_KEY = 'mavsidePaymentMethods';
  const MAV_ACCESS_STORAGE_KEY = 'mavsideMavAccess';
  const NOTIFICATION_STORAGE_KEY = 'mavsideAccountNotifications';
  const LOGIN_PAGE_PATH = 'index.html';

  function readJson(key, fallback) {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    try {
      const parsed = JSON.parse(raw);
      return parsed === null || parsed === undefined ? fallback : parsed;
    } catch (error) {
      return fallback;
    }
  }

  function writeJson(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  function getCurrentEmail() {
    return localStorage.getItem(USER_EMAIL_STORAGE_KEY) || '';
  }

  function readUsers() {
    const parsed = readJson(USER_STORAGE_KEY, {});
    return parsed && typeof parsed === 'object' ? parsed : {};
  }

  function writeUsers(users) {
    writeJson(USER_STORAGE_KEY, users || {});
  }

  function getCurrentUser() {
    const email = getCurrentEmail();
    if (!email) return null;
    const users = readUsers();
    const user = users[email];
    if (!user) return null;
    return Object.assign({ email: email }, user);
  }

  function isStrongPassword(password) {
    if (password.length < 8 || password.length > 20) return false;
    return /[A-Za-z]/.test(password) && /[0-9]/.test(password);
  }

  function readPerUserObject(key, defaultForUser) {
    const email = getCurrentEmail();
    if (!email) return defaultForUser;
    const raw = readJson(key, {});

    if (Array.isArray(raw)) {
      return raw;
    }

    if (!raw || typeof raw !== 'object') return defaultForUser;
    const value = raw[email];
    return value === undefined ? defaultForUser : value;
  }

  function writePerUserObject(key, value) {
    const email = getCurrentEmail();
    if (!email) return;

    const raw = readJson(key, {});
    if (Array.isArray(raw)) {
      writeJson(key, value);
      return;
    }

    const next = raw && typeof raw === 'object' ? raw : {};
    next[email] = value;
    writeJson(key, next);
  }

  function readWallet() {
    const value = readPerUserObject(WALLET_STORAGE_KEY, null);
    const base = value && typeof value === 'object' ? value : {};
    return {
      balance: Number(base.balance || 0),
      heartPoints: Number(base.heartPoints || 0),
      history: Array.isArray(base.history) ? base.history : []
    };
  }

  function writeWallet(wallet) {
    const safeWallet = wallet || {};
    writePerUserObject(WALLET_STORAGE_KEY, {
      balance: Number(safeWallet.balance || 0),
      heartPoints: Number(safeWallet.heartPoints || 0),
      history: Array.isArray(safeWallet.history) ? safeWallet.history : []
    });
  }

  function addWalletHistory(type, amount, note) {
    const wallet = readWallet();
    wallet.history.unshift({
      id: 'w-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
      type: type,
      amount: Number(amount || 0),
      note: String(note || ''),
      at: new Date().toISOString()
    });
    writeWallet(wallet);
    return wallet;
  }

  function topupWallet(amount) {
    const value = Number(amount || 0);
    if (!(value > 0)) return { ok: false, reason: 'invalid-amount' };
    const wallet = readWallet();
    wallet.balance += value;
    writeWallet(wallet);
    addWalletHistory('topup', value, 'Top up');
    return { ok: true, wallet: readWallet() };
  }

  function withdrawWallet(amount) {
    const value = Number(amount || 0);
    if (!(value > 0)) return { ok: false, reason: 'invalid-amount' };
    const wallet = readWallet();
    if (wallet.balance < value) return { ok: false, reason: 'insufficient-balance' };
    wallet.balance -= value;
    writeWallet(wallet);
    addWalletHistory('withdraw', value, 'Withdraw');
    return { ok: true, wallet: readWallet() };
  }

  function readAddresses() {
    const value = readPerUserObject(ADDRESSES_STORAGE_KEY, []);
    return Array.isArray(value) ? value : [];
  }

  function writeAddresses(addresses) {
    writePerUserObject(ADDRESSES_STORAGE_KEY, Array.isArray(addresses) ? addresses : []);
  }

  function genAddressId() {
    return 'addr-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
  }

  function addAddress(name, location) {
    const addresses = readAddresses();
    const next = {
      id: genAddressId(),
      name: String(name || '').trim() || 'Saved Address',
      location: String(location || '').trim(),
      isDefault: addresses.length === 0
    };
    addresses.push(next);
    writeAddresses(addresses);
    return next;
  }

  function updateAddress(id, name, location) {
    const addresses = readAddresses();
    const idx = addresses.findIndex(function(a){ return a.id === id; });
    if (idx < 0) return null;
    addresses[idx].name = String(name || '').trim() || addresses[idx].name;
    addresses[idx].location = String(location || '').trim() || addresses[idx].location;
    writeAddresses(addresses);
    return addresses[idx];
  }

  function deleteAddress(id) {
    const current = readAddresses();
    const next = current.filter(function(a){ return a.id !== id; });
    if (next.length > 0 && !next.some(function(a){ return a.isDefault; })) {
      next[0].isDefault = true;
    }
    writeAddresses(next);
  }

  function setDefaultAddress(id) {
    const next = readAddresses().map(function(a){
      return Object.assign({}, a, { isDefault: a.id === id });
    });
    writeAddresses(next);
  }

  function getSavedAddressOptions() {
    return readAddresses().map(function(a){
      return {
        id: a.id,
        name: a.name,
        location: a.location,
        isDefault: !!a.isDefault,
        label: a.name + (a.isDefault ? ' (Default)' : '') + ' - ' + a.location
      };
    });
  }

  function readPaymentMethods() {
    const value = readPerUserObject(PAYMENT_METHODS_STORAGE_KEY, null);
    if (Array.isArray(value)) return value;
    return [
      { id: 'pm-1', type: 'campus-card', last4: '5678', isDefault: true, display: 'Campus Card ** 5678' }
    ];
  }

  function writePaymentMethods(methods) {
    writePerUserObject(PAYMENT_METHODS_STORAGE_KEY, Array.isArray(methods) ? methods : []);
  }

  function readMavAccess() {
    const value = readPerUserObject(MAV_ACCESS_STORAGE_KEY, null);
    if (!value || typeof value !== 'object') {
      return { verified: false, verificationDate: null, nextGrantAt: null };
    }
    return {
      verified: !!value.verified,
      verificationDate: value.verificationDate || null,
      nextGrantAt: value.nextGrantAt || null
    };
  }

  function writeMavAccess(status) {
    const safe = status && typeof status === 'object' ? status : {};
    writePerUserObject(MAV_ACCESS_STORAGE_KEY, {
      verified: !!safe.verified,
      verificationDate: safe.verificationDate || null,
      nextGrantAt: safe.nextGrantAt || null
    });
  }

  function addMonthsFrom(baseDate, monthCount) {
    const next = new Date(baseDate.getTime());
    next.setMonth(next.getMonth() + monthCount);
    return next;
  }

  function ensureMavAccessMonthlyGrant() {
    const mav = readMavAccess();
    if (!mav.verified || !mav.verificationDate) {
      return { grantedPoints: 0, cycles: 0 };
    }

    const now = new Date();
    const verificationBase = new Date(mav.verificationDate);
    if (Number.isNaN(verificationBase.getTime())) {
      return { grantedPoints: 0, cycles: 0 };
    }

    const startAt = new Date(mav.nextGrantAt || mav.verificationDate);
    if (Number.isNaN(startAt.getTime())) {
      return { grantedPoints: 0, cycles: 0 };
    }

    let dueAt = startAt;
    let cycles = 0;
    while (dueAt.getTime() <= now.getTime() && cycles < 120) {
      cycles += 1;
      dueAt = addMonthsFrom(dueAt, 1);
    }

    if (cycles <= 0) {
      return { grantedPoints: 0, cycles: 0 };
    }

    const current = readPerUserObject(WALLET_STORAGE_KEY, null);
    const baseWallet = current && typeof current === 'object' ? current : {};
    const grantedPoints = 30 * cycles;
    const walletHistory = Array.isArray(baseWallet.history) ? baseWallet.history.slice() : [];

    walletHistory.unshift({
      id: 'w-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
      type: 'heart-reward',
      amount: grantedPoints,
      note: cycles === 1 ? 'MavAccess monthly grant' : ('MavAccess monthly grant x' + cycles),
      at: new Date().toISOString()
    });

    writePerUserObject(WALLET_STORAGE_KEY, {
      balance: Number(baseWallet.balance || 0),
      heartPoints: Number(baseWallet.heartPoints || 0) + grantedPoints,
      history: walletHistory
    });

    writeMavAccess({
      verified: true,
      verificationDate: mav.verificationDate,
      nextGrantAt: dueAt.toISOString()
    });

    return { grantedPoints: grantedPoints, cycles: cycles };
  }

  function readNotificationSettings() {
    const value = readPerUserObject(NOTIFICATION_STORAGE_KEY, null);
    if (!value || typeof value !== 'object') {
      return { emailEnabled: true };
    }
    return { emailEnabled: value.emailEnabled !== false };
  }

  function writeNotificationSettings(settings) {
    const safe = settings && typeof settings === 'object' ? settings : {};
    writePerUserObject(NOTIFICATION_STORAGE_KEY, {
      emailEnabled: safe.emailEnabled !== false
    });
  }

  function ensureAuthenticatedUser() {
    const currentEmail = getCurrentEmail();
    if (!currentEmail) {
      window.location.href = LOGIN_PAGE_PATH;
      return null;
    }
    const currentUser = getCurrentUser();
    if (!currentUser) {
      localStorage.removeItem(USER_EMAIL_STORAGE_KEY);
      localStorage.removeItem(USER_ROLE_STORAGE_KEY);
      window.location.href = LOGIN_PAGE_PATH;
      return null;
    }
    ensureMavAccessMonthlyGrant();
    return { email: currentEmail, user: currentUser };
  }

  function updateProfile(data) {
    const email = getCurrentEmail();
    if (!email) return { ok: false, reason: 'not-authenticated' };
    const users = readUsers();
    if (!users[email]) return { ok: false, reason: 'user-not-found' };

    const next = data && typeof data === 'object' ? data : { displayName: String(data || '') };
    if (next.displayName !== undefined) {
      users[email].displayName = String(next.displayName || '').trim();
    }
    if (next.avatarDataUrl !== undefined) {
      users[email].avatarDataUrl = String(next.avatarDataUrl || '');
    }
    writeUsers(users);
    return { ok: true, user: getCurrentUser() };
  }

  function changePassword(currentPassword, newPassword) {
    const email = getCurrentEmail();
    if (!email) return { ok: false, reason: 'not-authenticated' };
    const users = readUsers();
    const user = users[email];
    if (!user) return { ok: false, reason: 'user-not-found' };
    if (user.password !== currentPassword) return { ok: false, reason: 'wrong-current-password' };
    if (!isStrongPassword(newPassword)) return { ok: false, reason: 'weak-password' };
    if (newPassword === currentPassword) return { ok: false, reason: 'same-password' };
    user.password = newPassword;
    writeUsers(users);
    return { ok: true };
  }

  function logout() {
    localStorage.removeItem(USER_EMAIL_STORAGE_KEY);
    localStorage.removeItem(USER_ROLE_STORAGE_KEY);
    window.location.href = LOGIN_PAGE_PATH;
  }

  function getMyOrders() {
    const email = getCurrentEmail();
    if (!email) return [];
    const allOrders = readJson('mavsideOrders', []);
    if (!Array.isArray(allOrders)) return [];
    return allOrders.filter(function(o){ return o && o.owner === email; });
  }

  function getOrderStats() {
    const orders = getMyOrders();
    return {
      inProgress: orders.filter(function(o){
        return ['matching', 'assigned', 'pickup_in_progress', 'picked_up', 'delivery_in_progress'].indexOf(o.status) >= 0;
      }).length,
      completed: orders.filter(function(o){ return o.status === 'delivered'; }).length,
      cancelled: orders.filter(function(o){ return o.status === 'cancelled'; }).length
    };
  }

  window.AccountManager = {
    ensureAuthenticatedUser: ensureAuthenticatedUser,
    getCurrentEmail: getCurrentEmail,
    getCurrentUser: getCurrentUser,
    updateProfile: updateProfile,
    changePassword: changePassword,
    isStrongPassword: isStrongPassword,
    logout: logout,
    readWallet: readWallet,
    writeWallet: writeWallet,
    topupWallet: topupWallet,
    withdrawWallet: withdrawWallet,
    addWalletHistory: addWalletHistory,
    readAddresses: readAddresses,
    writeAddresses: writeAddresses,
    addAddress: addAddress,
    updateAddress: updateAddress,
    deleteAddress: deleteAddress,
    setDefaultAddress: setDefaultAddress,
    getSavedAddressOptions: getSavedAddressOptions,
    readPaymentMethods: readPaymentMethods,
    writePaymentMethods: writePaymentMethods,
    readMavAccess: readMavAccess,
    writeMavAccess: writeMavAccess,
    ensureMavAccessMonthlyGrant: ensureMavAccessMonthlyGrant,
    readNotificationSettings: readNotificationSettings,
    writeNotificationSettings: writeNotificationSettings,
    getMyOrders: getMyOrders,
    getOrderStats: getOrderStats
  };

  window.readUsers = readUsers;
  window.writeUsers = writeUsers;
})();
