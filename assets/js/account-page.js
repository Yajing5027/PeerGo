(function(){
  var editingAddressId = null;
  var walletMode = 'topup';

  function byId(id){ return document.getElementById(id); }

  function escapeHtml(text){
    return String(text || '').replace(/[&<>"']/g, function(ch){
      return ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' })[ch];
    });
  }

  function openModal(id){
    var el = byId(id);
    if (!el) return;
    el.classList.add('show');
    el.setAttribute('aria-hidden', 'false');
  }

  function closeModal(id){
    var el = byId(id);
    if (!el) return;
    el.classList.remove('show');
    el.setAttribute('aria-hidden', 'true');
  }

  function setMsg(id, text, type){
    var el = byId(id);
    if (!el) return;
    if (!text) {
      el.textContent = '';
      el.className = 'account-msg';
      return;
    }
    el.textContent = text;
    el.className = 'account-msg ' + (type === 'error' ? 'error' : 'success');
  }

  function formatMoney(num){ return '$' + Number(num || 0).toFixed(2); }

  function getTaskRows(){
    if (window.TaskListComponent && window.TaskListComponent.getUser && window.TaskListComponent.getRowsForUser) {
      return window.TaskListComponent.getRowsForUser(window.TaskListComponent.getUser());
    }
    return [];
  }

  function renderAvatar(){
    var btn = byId('account-avatar-button');
    if (!btn) return;
    var user = window.AccountManager.getCurrentUser();
    var avatar = String(user && user.avatarDataUrl || '');
    var fallbackChar = (user && (user.displayName || user.email || 'U').charAt(0).toUpperCase()) || 'U';
    btn.innerHTML = avatar
      ? '<img src="' + avatar + '" alt="User avatar">'
      : '<span class="account-avatar-fallback">' + escapeHtml(fallbackChar) + '</span>';
  }

  function renderHeader(){
    var user = window.AccountManager.getCurrentUser();
    var mav = window.AccountManager.readMavAccess();
    if (!user) return;

    if (byId('account-name')) byId('account-name').textContent = user.displayName || user.email;
    if (byId('account-email')) byId('account-email').textContent = user.email || '-';
    if (byId('account-role')) byId('account-role').textContent = 'Role: ' + (user.role || localStorage.getItem('mavsideUserRole') || 'user');

    var heart = byId('account-heart');
    if (heart) heart.style.display = mav.verified ? 'inline' : 'none';

    var mavStatus = byId('account-mav-status');
    if (mavStatus) {
      mavStatus.textContent = mav.verified ? '● Verified' : '● Not Verified';
      mavStatus.style.color = mav.verified ? '#1a7a4a' : 'var(--color-text-secondary)';
    }

    renderAvatar();
  }

  function renderWallet(){
    var wallet = window.AccountManager.readWallet();
    if (byId('account-balance')) byId('account-balance').textContent = formatMoney(wallet.balance);
    if (byId('account-hearts')) byId('account-hearts').textContent = '❤ ' + String(wallet.heartPoints);
  }

  function renderOrderSummary(){
    var rows = getTaskRows();
    var counts;
    if (rows.length && window.TaskListComponent && window.TaskListComponent.getStatusCounts) {
      counts = window.TaskListComponent.getStatusCounts(rows);
    } else {
      var stats = window.AccountManager.getOrderStats();
      counts = {
        inProgress: Number(stats.inProgress || 0),
        completed: Number(stats.completed || 0),
        cancelled: Number(stats.cancelled || 0)
      };
    }

    var host = byId('account-status-summary');
    if (host && window.StatusSummaryComponent && window.StatusSummaryComponent.render) {
      window.StatusSummaryComponent.render(host, {
        mode: 'link',
        counts: counts,
        activeStatus: 'in-progress',
        baseHref: '/view/manage.html?status='
      });
    }
  }

  function renderAddresses(){
    var root = byId('addresses-list');
    if (!root) return;
    var addresses = window.AccountManager.readAddresses();

    if (!addresses.length) {
      root.innerHTML = '<p class="account-muted">No saved addresses.</p>';
      return;
    }

    root.innerHTML = addresses.map(function(addr){
      return '<div class="account-row">' +
        '<div>' +
          '<div class="account-row-title">' + escapeHtml(addr.name) + (addr.isDefault ? ' (Default)' : '') + '</div>' +
          '<div class="account-row-sub">' + escapeHtml(addr.location) + '</div>' +
        '</div>' +
        '<div class="account-actions">' +
          '<button type="button" class="edit-address-btn" data-address-id="' + escapeHtml(addr.id) + '">Edit</button>' +
          '<button type="button" class="default-address-btn" data-address-id="' + escapeHtml(addr.id) + '">Default</button>' +
          '<button type="button" class="delete-address-btn" data-address-id="' + escapeHtml(addr.id) + '">Delete</button>' +
        '</div>' +
      '</div>';
    }).join('');

    root.querySelectorAll('.edit-address-btn').forEach(function(btn){
      btn.addEventListener('click', function(){ openAddressModal(btn.getAttribute('data-address-id')); });
    });
    root.querySelectorAll('.default-address-btn').forEach(function(btn){
      btn.addEventListener('click', function(){
        window.AccountManager.setDefaultAddress(btn.getAttribute('data-address-id'));
        renderAddresses();
      });
    });
    root.querySelectorAll('.delete-address-btn').forEach(function(btn){
      btn.addEventListener('click', function(){
        window.AccountManager.deleteAddress(btn.getAttribute('data-address-id'));
        renderAddresses();
      });
    });
  }

  function renderPayments(){
    var root = byId('payments-list');
    if (!root) return;
    var methods = window.AccountManager.readPaymentMethods();

    if (!methods.length) {
      root.innerHTML = '<p class="account-muted">No payment methods.</p>';
      return;
    }

    root.innerHTML = methods.map(function(m){
      var label = m.display || ((m.type || 'Card') + ' ** ' + (m.last4 || '0000'));
      return '<div class="account-row">' +
        '<div>' +
          '<div class="account-row-title">' + escapeHtml(label) + (m.isDefault ? ' (Default)' : '') + '</div>' +
          '<div class="account-row-sub">' + escapeHtml(m.type || '-') + '</div>' +
        '</div>' +
        '<div class="account-actions">' +
          '<button type="button" class="default-payment-btn" data-payment-id="' + escapeHtml(m.id) + '">Default</button>' +
          '<button type="button" class="delete-payment-btn" data-payment-id="' + escapeHtml(m.id) + '">Delete</button>' +
        '</div>' +
      '</div>';
    }).join('');

    root.querySelectorAll('.default-payment-btn').forEach(function(btn){
      btn.addEventListener('click', function(){
        var targetId = btn.getAttribute('data-payment-id');
        var next = methods.map(function(m){
          return Object.assign({}, m, { isDefault: m.id === targetId });
        });
        window.AccountManager.writePaymentMethods(next);
        renderPayments();
      });
    });
    root.querySelectorAll('.delete-payment-btn').forEach(function(btn){
      btn.addEventListener('click', function(){
        var id = btn.getAttribute('data-payment-id');
        var current = window.AccountManager.readPaymentMethods();
        window.AccountManager.writePaymentMethods(current.filter(function(m){ return m.id !== id; }));
        renderPayments();
      });
    });
  }

  function renderWalletHistoryModal(){
    var root = byId('wallet-history-list');
    if (!root) return;
    var wallet = window.AccountManager.readWallet();
    var history = Array.isArray(wallet.history) ? wallet.history : [];

    if (!history.length) {
      root.innerHTML = '<p class="account-muted">No wallet history.</p>';
      return;
    }

    root.innerHTML = history.map(function(h){
      var amountPrefix = h.type === 'withdraw' ? '-' : '+';
      var displayTime = window.formatUSDateTime
        ? window.formatUSDateTime(h.at || Date.now())
        : new Date(h.at || Date.now()).toLocaleString('en-US');
      return '<div class="account-row">' +
        '<div>' +
          '<div class="account-row-title">' + escapeHtml(String(h.type || '').toUpperCase()) + '</div>' +
          '<div class="account-row-sub">' + escapeHtml(displayTime) + '</div>' +
        '</div>' +
        '<strong>' + amountPrefix + formatMoney(h.amount) + '</strong>' +
      '</div>';
    }).join('');
  }

  function renderHeartHistoryModal(){
    var root = byId('heart-history-list');
    if (!root) return;
    var wallet = window.AccountManager.readWallet();
    var history = Array.isArray(wallet.history) ? wallet.history : [];
    var heartHistory = history.filter(function(h){
      return h.type === 'heart-reward' || h.type === 'support' || (h.note && h.note.indexOf('MavPoint') >= 0);
    });

    if (!heartHistory.length) {
      root.innerHTML = '<p class="account-muted">No MavPoints history.</p>';
      return;
    }

    root.innerHTML = heartHistory.map(function(h){
      var amountPrefix = h.amount > 0 ? '+' : '';
      var displayTime = window.formatUSDateTime
        ? window.formatUSDateTime(h.at || Date.now())
        : new Date(h.at || Date.now()).toLocaleString('en-US');
      var typeDisplay = h.type === 'heart-reward' ? 'REWARD' : (h.type === 'support' ? 'USED' : h.type.toUpperCase());
      return '<div class="account-row">' +
        '<div>' +
          '<div class="account-row-title">' + escapeHtml(typeDisplay) + '</div>' +
          '<div class="account-row-sub">' + escapeHtml(h.note || '-') + '</div>' +
          '<div class="account-row-sub">' + escapeHtml(displayTime) + '</div>' +
        '</div>' +
        '<strong>' + amountPrefix + h.amount + ' ❤</strong>' +
      '</div>';
    }).join('');
  }

  function openAddressModal(addressId){
    editingAddressId = addressId || null;
    setMsg('address-msg', '', 'success');
    if (byId('address-form')) byId('address-form').reset();
    if (byId('address-modal-title')) byId('address-modal-title').textContent = editingAddressId ? 'Edit Address' : 'Add Address';

    if (window.FormComponents && byId('address-location-component')) {
      byId('address-location-component').innerHTML = window.FormComponents.renderLocationField({
        title: 'Location',
        key: 'account-address',
        required: true,
        enableSavedAddressSelect: false,
        placeholder: 'Building / room / details'
      });
      if (window.FormComponents.initLocationAutocomplete) {
        window.FormComponents.initLocationAutocomplete('account-address');
      }
    }

    if (editingAddressId) {
      var addr = window.AccountManager.readAddresses().find(function(a){ return a.id === editingAddressId; });
      if (addr) {
        if (byId('address-name')) byId('address-name').value = addr.name || '';
        var select = byId('account-address-select');
        var detail = byId('account-address-detail');
        if (select && detail) {
          select.value = 'Other';
          detail.value = addr.location || '';
        }
      }
    }

    openModal('address-modal');
  }

  function renderNotificationForm(){
    var container = byId('notification-settings-fields');
    if (!container) return;

    var prefs = window.NotificationCenter
      ? window.NotificationCenter.readPrefs()
      : window.AccountManager.readNotificationSettings();

    var definitions = window.NotificationCenter ? window.NotificationCenter.definitions : [];
    var eventFields = definitions.map(function(def){
      var checked = !prefs.events || prefs.events[def.key] !== false;
      return '<label><input type="checkbox" class="notification-event-toggle" data-event="' + escapeHtml(def.key) + '"' + (checked ? ' checked' : '') + '> ' + escapeHtml(def.label) + '</label>';
    }).join('');

    container.innerHTML =
      '<label><input type="checkbox" id="notification-inapp-toggle"' + (prefs.inAppEnabled !== false ? ' checked' : '') + '> In-app toast</label>' +
      '<label><input type="checkbox" id="notification-email-toggle"' + (prefs.emailEnabled !== false ? ' checked' : '') + '> Email notification enabled</label>' +
      '<div class="account-list">' + (eventFields || '<p class="account-muted">No event templates.</p>') + '</div>';
  }

  function bindModalClose(){
    document.querySelectorAll('[data-close-modal]').forEach(function(btn){
      btn.addEventListener('click', function(){ closeModal(btn.getAttribute('data-close-modal')); });
    });
    document.querySelectorAll('.account-modal').forEach(function(modal){
      modal.addEventListener('click', function(e){ if (e.target === modal) closeModal(modal.id); });
    });
  }

  function bindButtons(){
    var avatarButton = byId('account-avatar-button');
    if (avatarButton) avatarButton.addEventListener('click', function(){ openModal('profile-modal'); });

    var profileButton = byId('open-profile-modal-btn');
    if (profileButton) {
      profileButton.addEventListener('click', function(){
        var user = window.AccountManager.getCurrentUser();
        if (byId('profile-display-name')) byId('profile-display-name').value = user && user.displayName || '';
        if (byId('profile-avatar-file')) byId('profile-avatar-file').value = '';
        setMsg('profile-msg', '', 'success');
        openModal('profile-modal');
      });
    }

    var pwdButton = byId('open-password-modal-btn');
    if (pwdButton) pwdButton.addEventListener('click', function(){ byId('password-form').reset(); setMsg('password-msg', '', 'success'); openModal('password-modal'); });

    var notiButton = byId('open-notification-modal-btn');
    if (notiButton) {
      notiButton.addEventListener('click', function(){
        setMsg('notification-msg', '', 'success');
        renderNotificationForm();
        openModal('notification-modal');
      });
    }

    var mavButton = byId('mav-access-btn');
    if (mavButton) mavButton.addEventListener('click', function(){ byId('mav-access-form').reset(); setMsg('mav-access-msg', '', 'success'); openModal('mav-access-modal'); });

    var supportButton = byId('support-btn');
    if (supportButton) {
      supportButton.addEventListener('click', function(){
        var user = window.AccountManager.getCurrentUser();
        byId('support-form').reset();
        byId('support-email').value = user && user.email || '';
        setMsg('support-msg', '', 'success');
        openModal('support-modal');
      });
    }

    var resetButton = byId('account-reset-btn');
    if (resetButton) {
      resetButton.addEventListener('click', function(){
        if (!window.confirm('Reset your account? This will clear all wallet data, MavAccess status, and orders. Continue?')) {
          return;
        }
        
        var currentEmail = localStorage.getItem('mavsideUserEmail');
        if (!currentEmail) return;
        // Clear wallet data
        if (window.AccountManager && window.AccountManager.writeWallet) {
          window.AccountManager.writeWallet({
            balance: 0,
              heartPoints: 0,
            history: []
          });
        }
        
        // Clear MavAccess status
        if (window.AccountManager && window.AccountManager.writeMavAccess) {
          window.AccountManager.writeMavAccess({
            verified: false,
            verificationDate: null
          });
        }
        
        // Clear all orders
        localStorage.removeItem('mavsideDeliveryPosts');
        localStorage.removeItem('mavsideOrders');
        localStorage.removeItem('mavsidePendingOrderDraft');
        
        // Clear navigation state
        localStorage.removeItem('mavsideNavPickup');
        localStorage.removeItem('mavsideNavDelivery');
        
        alert('Account has been reset successfully. Your wallet has been reset to 0 MavPoints.');
        location.reload();
      });
    }

    var logoutButton = byId('account-logout-btn');
    if (logoutButton) {
      logoutButton.addEventListener('click', function(){
        localStorage.removeItem('mavsideUserEmail');
        localStorage.removeItem('mavsideUserRole');
        window.location.href = '/view/index.html';
      });
    }

    var addAddressButton = byId('add-address-btn');
    if (addAddressButton) addAddressButton.addEventListener('click', function(){ openAddressModal(); });

    var addPaymentButton = byId('add-payment-btn');
    if (addPaymentButton) addPaymentButton.addEventListener('click', function(){ byId('payment-form').reset(); setMsg('payment-msg', '', 'success'); openModal('payment-modal'); });

    var topupButton = byId('wallet-topup-btn');
    if (topupButton) topupButton.addEventListener('click', function(){ walletMode = 'topup'; byId('wallet-amount-title').textContent = 'Top Up Wallet'; byId('wallet-amount-submit').textContent = 'Top Up'; byId('wallet-amount-form').reset(); setMsg('wallet-amount-msg', '', 'success'); openModal('wallet-amount-modal'); });

    var withdrawButton = byId('wallet-withdraw-btn');
    if (withdrawButton) withdrawButton.addEventListener('click', function(){ walletMode = 'withdraw'; byId('wallet-amount-title').textContent = 'Withdraw Wallet'; byId('wallet-amount-submit').textContent = 'Withdraw'; byId('wallet-amount-form').reset(); setMsg('wallet-amount-msg', '', 'success'); openModal('wallet-amount-modal'); });

    var historyButton = byId('wallet-history-btn');
    if (historyButton) historyButton.addEventListener('click', function(){ renderWalletHistoryModal(); openModal('wallet-history-modal'); });

    var heartHistoryButton = byId('heart-history-btn');
    if (heartHistoryButton) heartHistoryButton.addEventListener('click', function(){ renderHeartHistoryModal(); openModal('heart-history-modal'); });

    var redeemButton = byId('heart-redeem-btn');
    if (redeemButton) redeemButton.addEventListener('click', function(){ byId('heart-redeem-form').reset(); setMsg('heart-redeem-msg', '', 'success'); openModal('heart-redeem-modal'); });

    var certButton = byId('heart-certificate-btn');
    if (certButton) certButton.addEventListener('click', function(){ byId('heart-certificate-form').reset(); setMsg('heart-certificate-msg', '', 'success'); openModal('heart-certificate-modal'); });

  }

  function readAvatarFileAsDataUrl(file){
    return new Promise(function(resolve, reject){
      var reader = new FileReader();
      reader.onload = function(){ resolve(String(reader.result || '')); };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  function bindForms(){
    byId('profile-form').addEventListener('submit', async function(e){
      e.preventDefault();
      var name = String(byId('profile-display-name').value || '').trim();
      if (name.length > 40) return setMsg('profile-msg', 'Display name must be 40 characters or fewer.', 'error');

      var avatarFile = byId('profile-avatar-file').files && byId('profile-avatar-file').files[0];
      var avatarDataUrl;
      if (avatarFile) {
        try { avatarDataUrl = await readAvatarFileAsDataUrl(avatarFile); }
        catch (e1) { return setMsg('profile-msg', 'Failed to read avatar file.', 'error'); }
      }

      var payload = { displayName: name };
      if (avatarDataUrl !== undefined) payload.avatarDataUrl = avatarDataUrl;
      var result = window.AccountManager.updateProfile(payload);
      if (!result.ok) return setMsg('profile-msg', 'Failed to save profile.', 'error');

      setMsg('profile-msg', 'Profile updated.', 'success');
      renderHeader();
      setTimeout(function(){ closeModal('profile-modal'); }, 300);
    });

    byId('password-form').addEventListener('submit', function(e){
      e.preventDefault();
      var currentPassword = byId('current-password').value;
      var newPassword = byId('new-password').value;
      var confirmPassword = byId('confirm-password').value;
      if (newPassword !== confirmPassword) return setMsg('password-msg', 'New password and confirmation do not match.', 'error');
      var result = window.AccountManager.changePassword(currentPassword, newPassword);
      if (!result.ok) return setMsg('password-msg', 'Password update failed.', 'error');
      setMsg('password-msg', 'Password updated.', 'success');
      setTimeout(function(){ closeModal('password-modal'); }, 300);
    });

    byId('notification-form').addEventListener('submit', function(e){
      e.preventDefault();
      if (window.NotificationCenter) {
        var next = {
          inAppEnabled: !!byId('notification-inapp-toggle').checked,
          emailEnabled: !!byId('notification-email-toggle').checked,
          events: {}
        };
        document.querySelectorAll('.notification-event-toggle').forEach(function(item){
          next.events[item.getAttribute('data-event')] = !!item.checked;
        });
        window.NotificationCenter.writePrefs(next);
      } else {
        window.AccountManager.writeNotificationSettings({ emailEnabled: !!byId('notification-email-toggle').checked });
      }
      setMsg('notification-msg', 'Notification settings saved.', 'success');
    });

    byId('address-form').addEventListener('submit', function(e){
      e.preventDefault();
      var name = String(byId('address-name').value || '').trim();
      var location = window.FormComponents ? window.FormComponents.readLocationValue('account-address') : '';
      if (!name || !location) return setMsg('address-msg', 'Address name and location are required.', 'error');
      if (editingAddressId) window.AccountManager.updateAddress(editingAddressId, name, location);
      else window.AccountManager.addAddress(name, location);
      setMsg('address-msg', 'Address saved.', 'success');
      renderAddresses();
      setTimeout(function(){ closeModal('address-modal'); }, 280);
    });

    byId('payment-form').addEventListener('submit', function(e){
      e.preventDefault();
      var type = String(byId('payment-type').value || '').trim();
      var last4 = String(byId('payment-last4').value || '').replace(/\D/g, '').slice(0, 4);
      if (last4.length !== 4) return setMsg('payment-msg', 'Please input a valid 4-digit number.', 'error');
      var methods = window.AccountManager.readPaymentMethods();
      methods.unshift({
        id: 'pm-' + Date.now(),
        type: type,
        last4: last4,
        isDefault: methods.length === 0,
        display: (type === 'campus-card' ? 'Campus Card' : (type === 'wallet' ? 'Digital Wallet' : 'Bank Card')) + ' ** ' + last4
      });
      window.AccountManager.writePaymentMethods(methods);
      setMsg('payment-msg', 'Payment method added.', 'success');
      renderPayments();
      setTimeout(function(){ closeModal('payment-modal'); }, 280);
    });

    byId('wallet-amount-form').addEventListener('submit', function(e){
      e.preventDefault();
      var amount = Number(byId('wallet-amount-input').value || 0);
      var result = walletMode === 'withdraw' ? window.AccountManager.withdrawWallet(amount) : window.AccountManager.topupWallet(amount);
      if (!result.ok) return setMsg('wallet-amount-msg', 'Invalid amount or insufficient balance.', 'error');
      setMsg('wallet-amount-msg', 'Wallet updated.', 'success');
      renderWallet();
      renderWalletHistoryModal();
      setTimeout(function(){ closeModal('wallet-amount-modal'); }, 260);
    });

    byId('mav-access-form').addEventListener('submit', function(e){
      e.preventDefault();
      var id = String(byId('mav-id').value || '').trim();
      var code = String(byId('mav-code').value || '').trim();
      var canVerify = id === '123' && code === '123';
      if (!canVerify) {
        setMsg('mav-access-msg', 'Verification failed.', 'error');
        return;
      }
      var nowIso = new Date().toISOString();
      window.AccountManager.writeMavAccess({ verified: true, verificationDate: nowIso, nextGrantAt: nowIso });
      if (window.AccountManager.ensureMavAccessMonthlyGrant) {
        window.AccountManager.ensureMavAccessMonthlyGrant();
      }
      setMsg('mav-access-msg', 'MavAccess verified.', 'success');
      renderHeader();
      renderWallet();
      setTimeout(function(){ closeModal('mav-access-modal'); }, 280);
    });

    byId('support-form').addEventListener('submit', function(e){
      e.preventDefault();
      var subject = String(byId('support-subject').value || '').trim();
      var message = String(byId('support-message').value || '').trim();
      if (!subject || !message) return setMsg('support-msg', 'Please fill all fields.', 'error');
      var requests = JSON.parse(localStorage.getItem('mavsideSupportRequests') || '[]');
      requests.unshift({ id: 'support-' + Date.now(), email: byId('support-email').value || '', subject: subject, message: message, at: new Date().toISOString(), status: 'open' });
      localStorage.setItem('mavsideSupportRequests', JSON.stringify(requests));
      setMsg('support-msg', 'Support request submitted.', 'success');
      setTimeout(function(){ closeModal('support-modal'); }, 280);
    });

    byId('heart-redeem-form').addEventListener('submit', function(e){
      e.preventDefault();
      var points = Number(byId('heart-redeem-points').value || 0);
      var note = String(byId('heart-redeem-note').value || '').trim();
      if (points < 1 || points % 1 !== 0) return setMsg('heart-redeem-msg', 'Points must be a positive integer.', 'error');
      if (!note) return setMsg('heart-redeem-msg', 'Please add a reward request note.', 'error');
      var wallet = window.AccountManager.readWallet();
      if (wallet.heartPoints < points) return setMsg('heart-redeem-msg', 'Insufficient MavPoints.', 'error');

      wallet.heartPoints -= points;
      window.AccountManager.writeWallet(wallet);

      var requests = JSON.parse(localStorage.getItem('mavsideHeartRewardRequests') || '[]');
      requests.unshift({
        id: 'heart-reward-' + Date.now(),
        email: (window.AccountManager.getCurrentUser() || {}).email || '',
        rewardType: 'incentive-reward',
        points: points,
        note: note,
        status: 'pending',
        at: new Date().toISOString()
      });
      localStorage.setItem('mavsideHeartRewardRequests', JSON.stringify(requests));

      setMsg('heart-redeem-msg', 'Reward request submitted.', 'success');
      renderWallet();
      setTimeout(function(){ closeModal('heart-redeem-modal'); }, 260);
    });

    byId('heart-certificate-form').addEventListener('submit', function(e){
      e.preventDefault();
      var hours = Number(byId('certificate-hours').value || 0);
      var purpose = String(byId('certificate-purpose').value || '').trim();
      if (!hours || !purpose) return setMsg('heart-certificate-msg', 'Please complete all fields.', 'error');
      var list = JSON.parse(localStorage.getItem('mavsideCertificateRequests') || '[]');
      list.unshift({ id: 'cert-' + Date.now(), hours: hours, purpose: purpose, email: (window.AccountManager.getCurrentUser() || {}).email || '', at: new Date().toISOString(), status: 'pending' });
      localStorage.setItem('mavsideCertificateRequests', JSON.stringify(list));
      setMsg('heart-certificate-msg', 'Application submitted.', 'success');
      setTimeout(function(){ closeModal('heart-certificate-modal'); }, 260);
    });
  }

  function renderAll(){
    renderHeader();
    renderWallet();
    renderOrderSummary();
    renderAddresses();
    renderPayments();
  }

  function init(){
    var auth = window.AccountManager.ensureAuthenticatedUser();
    if (!auth) return;
    bindModalClose();
    bindButtons();
    bindForms();
    renderAll();
    document.addEventListener('mavside:ordersUpdated', renderOrderSummary);
  }

  document.addEventListener('DOMContentLoaded', init);
})();
