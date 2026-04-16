(function(){
  var ERRAND_KEY = 'mavsideDeliveryPosts';

  function getRequestKind(){
    var params = new URLSearchParams(window.location.search);
    var kind = String(params.get('kind') || 'order').toLowerCase();
    return kind === 'errand' ? 'errand' : 'order';
  }

  function getRequestId(){
    var params = new URLSearchParams(window.location.search);
    return getRequestKind() === 'order' ? params.get('orderId') : params.get('id');
  }

  function getRoleFromQuery(){
    var params = new URLSearchParams(window.location.search);
    var role = String(params.get('role') || '').toLowerCase();
    if (role === 'poster' || role === 'bringer') return role;
    return '';
  }

  function escapeHtml(text){
    return String(text || '').replace(/[&<>"']/g, function(ch){
      return ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' })[ch];
    });
  }

  function formatTime(ts){
    if(!ts) return '-';
    try {
      if (window.formatUSDateTime) return window.formatUSDateTime(ts);
      return new Date(ts).toLocaleString('en-US');
    }
    catch(e){ return String(ts); }
  }

  function formatRewardValue(value){
    var raw = String(value || '').trim().toLowerCase();
    if (raw === 'heart' || raw === '❤' || raw === '💜') return '💜';
    return '$' + Number(value || 0).toFixed(2);
  }

  function isHeartRewardValue(value){
    var raw = String(value || '').trim().toLowerCase();
    return raw === 'heart' || raw === '❤' || raw === '💜';
  }

  function roundCurrency(value){
    return Math.round(Number(value || 0) * 100) / 100;
  }

  function grantCompletionReward(request){
    if (!request || !window.AccountManager || !window.AccountManager.readWallet || !window.AccountManager.writeWallet) return;

    var wallet = window.AccountManager.readWallet() || { balance: 0, heartPoints: 0 };
    if (isHeartRewardValue(request.reward)) {
      wallet.heartPoints = Number(wallet.heartPoints || 0) + 1;
      window.AccountManager.writeWallet(wallet);
      if (window.AccountManager.addWalletHistory) {
        window.AccountManager.addWalletHistory('heart-reward', 0, 'Completed supported task: +1 MavPoint');
      }
      return;
    }

    var amount = Number(String(request.reward || '').replace(/[^0-9.]/g, '')) || 0;
    amount = roundCurrency(amount);
    if (amount <= 0) return;

    wallet.balance = roundCurrency(Number(wallet.balance || 0) + amount);
    window.AccountManager.writeWallet(wallet);
    if (window.AccountManager.addWalletHistory) {
      window.AccountManager.addWalletHistory('task-reward', amount, 'Completed task reward: +' + '$' + amount.toFixed(2));
    }
  }

  function readErrands(){
    try {
      var raw = JSON.parse(localStorage.getItem(ERRAND_KEY) || '[]');
      return Array.isArray(raw) ? raw : [];
    } catch (e) {
      return [];
    }
  }

  function writeErrands(list){
    localStorage.setItem(ERRAND_KEY, JSON.stringify(Array.isArray(list) ? list : []));
    document.dispatchEvent(new CustomEvent('mavside:ordersUpdated'));
  }

  function genCode(){
    return String(Math.floor(1000 + Math.random() * 9000));
  }

  function findErrandById(id){
    var list = readErrands();
    for (var i = 0; i < list.length; i++) {
      if (list[i] && list[i].id === id) return { item: list[i], index: i, list: list };
    }
    return null;
  }

  function ensureErrandDeliveryCode(id){
    var found = findErrandById(id);
    if (!found) return null;
    if (!found.item.customerDeliveryCode) {
      found.item.customerDeliveryCode = genCode();
      writeErrands(found.list);
    }
    return found.item;
  }

  function toUnifiedRequest(kind, raw){
    if (!raw) return null;
    if (kind === 'order') {
      return {
        kind: 'order',
        isOrder: true,
        id: raw.orderId || '-',
        taskType: 'order',
        pickup: raw.pickupLocation || '-',
        delivery: raw.deliveryAddress || '-',
        statusRaw: raw.status || 'matching',
        statusLabel: window.orderStatusLabel ? window.orderStatusLabel(raw.status) : String(raw.status || '-'),
        reward: formatRewardValue(raw.reward),
        owner: raw.owner || '-',
        bringer: raw.assignedTo || 'Matching...',
        merchantNote: raw.merchantNote || '-',
        bringerNote: raw.courierNote || '-',
        customerDeliveryCode: raw.customerDeliveryCode || '',
        merchantPickupCode: raw.merchantPickupCode || '',
        history: Array.isArray(raw.history) ? raw.history : []
      };
    }

    var model = window.ErrandsModel && window.ErrandsModel.toErrandModel ? window.ErrandsModel.toErrandModel(raw) : raw;
    var normalizedTaskType = String(model.taskType || '').toLowerCase();
    var isOrderTask = normalizedTaskType === 'order' || !!model.sourceOrderId;
    return {
      kind: 'errand',
      isOrder: isOrderTask,
      id: model.id || '-',
      taskType: isOrderTask ? 'order' : 'general',
      pickup: model.pickupLocation || '-',
      delivery: model.deliveryLocation || '-',
      statusRaw: model.state || model.status || 'open',
      statusLabel: model.state || model.status || '-',
      reward: formatRewardValue(model.reward),
      owner: model.owner || '-',
      bringer: model.acceptedBy || 'Matching...',
      merchantNote: '-',
      bringerNote: model.note || '-',
      customerDeliveryCode: model.customerDeliveryCode || '',
      merchantPickupCode: '',
      history: Array.isArray(model.history) ? model.history : []
    };
  }

  function getViewerRole(request){
    var roleFromQuery = getRoleFromQuery();
    if (roleFromQuery) return roleFromQuery;
    var email = localStorage.getItem('mavsideUserEmail') || '';
    if (!request || !email) return 'guest';
    if (request.owner === email) return 'poster';
    if (request.bringer === email) return 'bringer';
    return 'guest';
  }

  function renderRoleHighlight(roleName){
    var style = '';
    if (roleName === 'poster') {
      style = 'font-weight: 700; color: #0066cc;';
      return '<span style="' + style + '"><strong>Poster</strong></span>';
    } else if (roleName === 'bringer') {
      style = 'font-weight: 700; color: #cc0099;';
      return '<span style="' + style + '"><strong>Bringer</strong></span>';
    }
    return escapeHtml(roleName);
  }

  function renderOverview(request){
    var root = document.getElementById('tracking-overview');
    if(!root) return;

    var progress = window.TaskProgress ? window.TaskProgress.renderAxis(request.statusRaw) : '';
    var taskTypeDisplay = request.taskType === 'order' ? 'Order' : 'General';
    var fields = [
      { label: 'ID', value: request.id },
      { label: 'Pickup', value: request.pickup },
      { label: 'Delivery', value: request.delivery },
      { label: 'Status', value: request.statusLabel, roleField: null },
      { label: 'Reward', value: request.reward },
      { label: 'Poster', value: request.owner, roleField: 'poster' },
      { label: 'Bringer', value: request.bringer, roleField: 'bringer' },
      { label: 'Merchant Note', value: request.merchantNote },
      { label: 'Bringer Note', value: request.bringerNote },
      { label: 'Task Type', value: taskTypeDisplay }
    ];

    root.innerHTML = progress +
      '<div class="detail-overview-grid">' +
      fields.map(function(field){
        var valueHtml = '';
        if (field.roleField === 'poster') {
          valueHtml = renderRoleHighlight('poster') + ' - ' + escapeHtml(field.value);
        } else if (field.roleField === 'bringer') {
          valueHtml = renderRoleHighlight('bringer') + ' - ' + escapeHtml(field.value);
        } else {
          valueHtml = escapeHtml(field.value);
        }
        return '<div class="detail-overview-item">' +
          '<div class="detail-overview-label">' + escapeHtml(field.label) + '</div>' +
          '<div class="detail-overview-value">' + valueHtml + '</div>' +
        '</div>';
      }).join('') +
      '</div>';
  }

  function renderHistory(request){
    var root = document.getElementById('tracking-history');
    if(!root) return;
    var list = (request.history || []).slice();
    if (!list.length) {
      list.push({ when: request.createdAt || Date.now(), who: request.owner || '-', action: 'created' });
      if (String(request.statusRaw || '').toLowerCase() === 'accepted' || String(request.statusRaw || '').toLowerCase() === 'assigned') {
        list.push({ when: Date.now(), who: request.bringer || '-', action: 'accepted' });
      }
      if (String(request.statusRaw || '').toLowerCase() === 'picked_up') {
        list.push({ when: Date.now(), who: request.bringer || '-', action: 'accepted' });
        list.push({ when: Date.now(), who: request.bringer || '-', action: 'picked_up' });
      }
      if (String(request.statusRaw || '').toLowerCase() === 'delivered' || String(request.statusRaw || '').toLowerCase() === 'completed') {
        list.push({ when: Date.now(), who: request.bringer || '-', action: 'accepted' });
        list.push({ when: Date.now(), who: request.owner || '-', action: 'delivered' });
      }
    }
    list = list.slice().reverse();
    if(!list.length){
      root.innerHTML = '<p>No timeline data.</p>';
      return;
    }
    root.innerHTML = list.map(function(h){
      var roleInference = h.who === request.owner ? 'poster' : (h.who === request.bringer ? 'bringer' : '');
      var whoDisplay = roleInference ? renderRoleHighlight(roleInference) + ' - ' + escapeHtml(h.who) : escapeHtml(h.who || '-');
      return '<div class="tracking-row"><strong>' + escapeHtml(h.action || '-') + '</strong><span>' + escapeHtml(formatTime(h.when)) + ' · ' + whoDisplay + '</span></div>';
    }).join('');
  }

  function renderCodeCells(group, readonly, code){
    var value = String(code || '').replace(/\D/g, '').slice(0, 4);
    var digits = [0, 1, 2, 3].map(function(idx){ return value[idx] || ''; });
    return '<div class="tracking-code-inputs">' + digits.map(function(d){
      return '<input type="text" maxlength="1" inputmode="numeric" class="code-cell" data-group="' + group + '" value="' + d + '"' + (readonly ? ' readonly' : '') + '>';
    }).join('') + '</div>';
  }

  function renderPosterVerifyBlock(request){
    return '<div class="tracking-code-block" data-code-group="poster-readonly">' +
      '<h3>Your Delivery Code</h3>' +
      '<p>Share this 4-digit code with your bringer after you receive the request.</p>' +
      renderCodeCells('poster-readonly', true, request.customerDeliveryCode || '') +
    '</div>';
  }

  function markTaskPickedUp(taskId){
    if (!taskId) return { ok: false };
    var email = localStorage.getItem('mavsideUserEmail') || 'unknown';
    if (window.setOrderStatus) {
      var updated = window.setOrderStatus(taskId, 'picked_up', email);
      return updated ? { ok: true } : { ok: false, reason: 'order-not-found' };
    }
    return { ok: false, reason: 'set-status-unavailable' };
  }

  function renderBringerPickupBlock(request){
    if (request.isOrder) return '';
    var isPicked = request.statusRaw === 'picked_up' || request.statusRaw === 'delivered';
    return '<div class="tracking-code-block" style="margin-bottom: 32px;">' +
      '<h3>Status Update</h3>' +
      '<p>' + (isPicked ? 'You have marked this task as picked up.' : 'Mark this task as picked up to proceed with delivery.') + '</p>' +
      '<button type="button" class="pickup-action-btn" id="pickup-btn"' + (isPicked ? ' disabled' : '') + '>Mark as Picked Up</button>' +
    '</div>';
  }

  function renderBringerVerifyBlock(request){
    var merchantHint = request.merchantPickupCode
      ? 'Enter the 4-digit merchant pickup code to verify pickup.'
      : 'Merchant pickup code is not generated yet.';
    var deliveryHint = request.customerDeliveryCode
      ? 'Enter the 4-digit poster delivery code to verify delivery.'
      : 'Poster delivery code is not ready yet.';

    var missingHints = [];
    if (request.isOrder && !request.merchantPickupCode) missingHints.push('Merchant pickup code is still missing.');
    if (!request.customerDeliveryCode) missingHints.push('Poster delivery code is still missing.');
    var missingText = missingHints.length ? '<p class="account-muted">' + missingHints.join(' ') + '</p>' : '';

    var merchantBlock = '';
    if (request.isOrder) {
      merchantBlock =
        '<div class="tracking-code-block" data-code-group="merchant">' +
          '<h3>Merchant Pickup Code</h3>' +
          '<p>' + merchantHint + '</p>' +
          renderCodeCells('merchant', false, '') +
          '<button type="button" class="verify-code-btn" data-kind="merchant">Verify Merchant Code</button>' +
        '</div>';
    }

    var posterBlock =
      '<div class="tracking-code-block" data-code-group="poster">' +
        '<h3>Poster Delivery Code</h3>' +
        '<p>' + deliveryHint + '</p>' +
        renderCodeCells('poster', false, '') +
        '<button type="button" class="verify-code-btn" data-kind="poster">Verify Delivery Code</button>' +
      '</div>';

    return merchantBlock + posterBlock + missingText;
  }

  function setCodeMessage(text, isError){
    var root = document.getElementById('tracking-code-message');
    if(!root) return;
    root.textContent = text || '';
    root.className = isError ? 'msg-error' : 'msg-success';
  }

  function bindCodeCells(group){
    var cells = Array.prototype.slice.call(document.querySelectorAll('.code-cell[data-group="' + group + '"]'));
    if(!cells.length) return;
    cells.forEach(function(cell, index){
      cell.addEventListener('input', function(){
        var onlyDigit = String(cell.value || '').replace(/[^0-9]/g, '');
        cell.value = onlyDigit.slice(0, 1);
        if(cell.value && index < cells.length - 1) cells[index + 1].focus();
      });
      cell.addEventListener('keydown', function(event){
        if(event.key === 'Backspace' && !cell.value && index > 0) cells[index - 1].focus();
      });
    });
  }

  function readFourDigitCode(group){
    var cells = Array.prototype.slice.call(document.querySelectorAll('.code-cell[data-group="' + group + '"]'));
    var value = cells.map(function(cell){ return String(cell.value || ''); }).join('');
    if(!/^\d{4}$/.test(value)) return '';
    return value;
  }

  function verifyErrandDeliveryCode(errandId, code){
    var found = findErrandById(errandId);
    if (!found) return { ok:false, reason:'not-found' };
    if (String(found.item.customerDeliveryCode || '') !== String(code || '')) return { ok:false, reason:'invalid' };
    if (String(found.item.status || '').toLowerCase() === 'completed' || found.item.delivered) return { ok:false, reason:'already-delivered' };
    found.item.state = 'Completed';
    found.item.status = 'completed';
    found.item.delivered = true;
    found.item.history = Array.isArray(found.item.history) ? found.item.history : [];
    found.item.history.push({ when: Date.now(), who: localStorage.getItem('mavsideUserEmail') || 'unknown', action: 'delivered' });
    writeErrands(found.list);
    return { ok:true };
  }

  function bindCodeButtons(request){
    var pickupBtn = document.getElementById('pickup-btn');
    if (pickupBtn) {
      pickupBtn.addEventListener('click', function(){
        var result = markTaskPickedUp(request.id);
        if (result.ok) {
          setCodeMessage('Task marked as picked up successfully.', false);
          render();
          return;
        }
        setCodeMessage('Failed to mark task as picked up.', true);
      });
    }

    document.querySelectorAll('.verify-code-btn').forEach(function(btn){
      btn.addEventListener('click', function(){
        var kind = btn.getAttribute('data-kind');
        var group = kind === 'merchant' ? 'merchant' : 'poster';
        var code = readFourDigitCode(group);
        if(!code){
          setCodeMessage('Please enter a valid 4-digit numeric code.', true);
          return;
        }

        if(kind === 'merchant'){
          if (!request.isOrder) {
            setCodeMessage('Merchant code is only required for order tasks.', true);
            return;
          }
          var merchantResult = window.verifyMerchantPickupCode ? window.verifyMerchantPickupCode(request.id, code) : { ok:false };
          if(merchantResult.ok){
            setCodeMessage('Merchant code verified successfully.', false);
            render();
            return;
          }
          setCodeMessage('Merchant code verification failed.', true);
          return;
        }

        var deliveryResult = request.isOrder
          ? (window.verifyDeliveryCode ? window.verifyDeliveryCode(request.id, code) : { ok:false })
          : verifyErrandDeliveryCode(request.id, code);

        if(deliveryResult.ok){
          grantCompletionReward(request);
          setCodeMessage('Delivery code verified successfully.', false);
          render();
          return;
        }
        setCodeMessage('Delivery code verification failed.', true);
      });
    });
  }

  function renderCode(request){
    var root = document.getElementById('tracking-code');
    if(!root) return;
    var role = getViewerRole(request);
    if (role === 'poster') {
      root.innerHTML = renderPosterVerifyBlock(request) + '<p id="tracking-code-message" aria-live="polite"></p>';
      return;
    }
    root.innerHTML = renderBringerPickupBlock(request) + renderBringerVerifyBlock(request) + '<p id="tracking-code-message" aria-live="polite"></p>';
    bindCodeCells('merchant');
    bindCodeCells('poster');
    bindCodeButtons(request);
  }

  function loadRequest(){
    var id = getRequestId();
    var kind = getRequestKind();
    if (!id) return null;
    if (kind === 'order') {
      var order = window.findOrder ? window.findOrder(id) : null;
      return toUnifiedRequest('order', order);
    }
    var errand = ensureErrandDeliveryCode(id);
    return toUnifiedRequest('errand', errand);
  }

  function bindBackButton(){
    var btn = document.getElementById('tracking-back-btn');
    if(!btn) return;
    btn.addEventListener('click', function(){
      if (window.history.length > 1) {
        window.history.back();
        return;
      }
      window.location.href = '/view/manage.html';
    });
  }

  function render(){
    var root = document.getElementById('tracking-overview');
    var request = loadRequest();
    if(!request){
      if(root) root.innerHTML = '<p>Request not found.</p>';
      return;
    }
    renderOverview(request);
    renderHistory(request);
    renderCode(request);
  }

  document.addEventListener('DOMContentLoaded', function(){
    render();
    bindBackButton();
    document.addEventListener('mavside:ordersUpdated', render);
  });
})();
