(function(){
  const SERVICE_FEE = 0;
  const HEART_POINTS_FOR_ACCESS_SUPPORT = 1;

  function getDraft(){
    return JSON.parse(localStorage.getItem('mavsidePendingOrderDraft') || 'null');
  }

  function formatMoney(value){
    return '$' + Number(value || 0).toFixed(2);
  }

  function getSubtotal(draft){
    if (!draft || !Array.isArray(draft.items)) return 0;
    return draft.items.reduce(function(total, item){
      return total + (Number(item.price) || 0) * (Number(item.qty) || 1);
    }, 0);
  }

  function getMavAccess(){
    if (!window.AccountManager || !window.AccountManager.readMavAccess) {
      return { verified: false };
    }
    return window.AccountManager.readMavAccess() || { verified: false };
  }

  function getWallet(){
    if (!window.AccountManager || !window.AccountManager.readWallet) {
      return { heartPoints: 0 };
    }
    return window.AccountManager.readWallet() || { heartPoints: 0 };
  }

  function resolveLocation(key){
    if(window.FormComponents && window.FormComponents.readLocationValue){
      return window.FormComponents.readLocationValue(key);
    }
    const selectEl = document.getElementById(key + '-select');
    const detailEl = document.getElementById(key + '-detail');
    const selected = String(selectEl && selectEl.value || '').trim();
    const detail = String(detailEl && detailEl.value || '').trim();
    if(selected && detail) return selected + ' - ' + detail;
    return selected || detail;
  }

  function setMessage(text, isError){
    const el = document.getElementById('confirm-order-message');
    if(!el) return;
    el.textContent = text || '';
    el.className = isError ? 'msg-error' : 'msg-success';
  }

  function renderDraft(){
    const root = document.getElementById('confirm-order-summary');
    const draft = getDraft();
    if(!root) return;
    if(!draft || !draft.items || !draft.items.length){
      root.innerHTML = '<p>No pending cart data. Please add items in a shop first.</p>';
      return;
    }

    const rows = draft.items.map(function(it){
      const rowTotal = (Number(it.price) || 0) * (Number(it.qty) || 1);
      return '<li>' + it.name + ' x ' + it.qty + ' - ' + formatMoney(rowTotal) + '</li>';
    }).join('');

    const subtotal = getSubtotal(draft);
    const wallet = getWallet();

    root.innerHTML =
      '<div class="account-mav-card">' +
        '<p><strong>Store:</strong> ' + (draft.storeId || '-') + '</p>' +
        '<div><strong>Items</strong></div>' +
        '<ul>' + rows + '</ul>' +
        '<p><strong>Amount:</strong> ' + formatMoney(subtotal) + '</p>' +
        '<p><strong>Service Fee:</strong> ' + formatMoney(SERVICE_FEE) + '</p>' +
        '<hr>' +
        window.FormComponents.renderSupportField({
          id: 'use-access-support',
          name: 'use-access-support',
          label: 'Use 1 MavPoint to support this task (requires MavAccess verification)',
          hintId: 'heart-fee-hint',
          hintText: 'Available MavPoints: ' + Number(wallet.heartPoints || 0) + '. Need ' + HEART_POINTS_FOR_ACCESS_SUPPORT + ' point.'
        }) +
        '<hr>' +
        '<p><strong>Payable:</strong> <span id="confirm-payable-amount"></span></p>' +
      '</div>';

    const payableEl = document.getElementById('confirm-payable-amount');
    if (payableEl) payableEl.textContent = formatMoney(subtotal + SERVICE_FEE);

    if (window.FormComponents && window.FormComponents.bindSupportMode) {
      window.FormComponents.bindSupportMode({
        checkboxId: 'use-access-support',
        rewardInputId: 'delivery-reward',
        hintId: 'heart-fee-hint',
        availablePoints: function(){ return getWallet().heartPoints; },
        enabledHint: 'Use 1 MavPoint to support this task (requires MavAccess verification).',
        disabledHint: 'Available MavPoints: {points}. Need ' + HEART_POINTS_FOR_ACCESS_SUPPORT + ' point.'
      });
    }
  }

  async function submitOrder(e){
    e.preventDefault();
    const draft = getDraft();
    if(!draft || !draft.items || !draft.items.length){
      setMessage('No pending order draft', true);
      return;
    }

    const pickupLocation = resolveLocation('order-pickup');
    const deliveryAddress = resolveLocation('order-delivery');
    const rewardInput = document.getElementById('delivery-reward');
    const merchantNoteInput = document.getElementById('order-merchant-note');
    const courierNoteInput = document.getElementById('order-courier-note');
    const useAccessSupport = !!(document.getElementById('use-access-support') && document.getElementById('use-access-support').checked);
    const rewardText = window.FormComponents && window.FormComponents.normalizeReward
      ? window.FormComponents.normalizeReward(rewardInput ? rewardInput.value : '', { supportMode: useAccessSupport })
      : String(rewardInput ? rewardInput.value : '').trim();
    const reward = useAccessSupport ? 'heart' : (Number(String(rewardText || '').replace(/[^0-9.]/g, '')) || 0);
    const merchantNote = String(merchantNoteInput && merchantNoteInput.value || '').trim();
    const courierNote = String(courierNoteInput && courierNoteInput.value || '').trim();

    if(!pickupLocation || !deliveryAddress){
      setMessage('Pickup and delivery locations are required', true);
      return;
    }

    let usedHeartPointsForAccessSupport = false;

    if (useAccessSupport) {
      const mavAccess = getMavAccess();
      if (!mavAccess.verified) {
        setMessage('MavAccess verification is required for accessibility support.', true);
        return;
      }
      const wallet = getWallet();
      if (Number(wallet.heartPoints || 0) < HEART_POINTS_FOR_ACCESS_SUPPORT) {
        setMessage('Not enough MavPoints for accessibility support.', true);
        return;
      }
      wallet.heartPoints -= HEART_POINTS_FOR_ACCESS_SUPPORT;
      if (window.AccountManager && window.AccountManager.writeWallet) {
        window.AccountManager.writeWallet(wallet);
        if (window.AccountManager.addWalletHistory) {
          window.AccountManager.addWalletHistory('support', 0, 'Accessibility support used 1 MavPoint');
        }
      }
      usedHeartPointsForAccessSupport = true;
    }

    try{
      setMessage('Processing payment...', false);
      const order = await window.createOrder(draft.items, {
        pickupLocation: pickupLocation,
        deliveryAddress: deliveryAddress,
        reward: reward,
        merchantNote: merchantNote,
        courierNote: courierNote,
        serviceFee: 0,
        usedHeartPointsForAccessSupport: usedHeartPointsForAccessSupport,
        tip: 0
      });
      localStorage.removeItem('mavsidePendingOrderDraft');
      if(window.clearCart) window.clearCart();
      window.location.href = '/view/order-tracking.html?orderId=' + encodeURIComponent(order.orderId);
    }catch(err){
      setMessage('Order creation failed', true);
    }
  }

  function bind(){
    const form = document.getElementById('confirm-order-form');
    if(form) form.addEventListener('submit', submitOrder);

    const back = document.getElementById('back-to-shop');
    if(back){
      back.addEventListener('click', function(){
        const draft = getDraft();
        const target = draft && draft.storeId ? '/view/shop.html?store=' + encodeURIComponent(draft.storeId) : '/view/shops.html';
        window.location.href = target;
      });
    }
  }

  document.addEventListener('DOMContentLoaded', function(){
    const draft = getDraft();
    const shopAddress = draft && draft.storeId && window.getShop ? ((window.getShop(draft.storeId) || {}).address || '') : '';

    const pickupComponent = document.getElementById('order-pickup-location-component');
    const deliveryComponent = document.getElementById('order-delivery-location-component');
    const rewardComponent = document.getElementById('order-reward-component');
    const merchantNoteComponent = document.getElementById('order-merchant-note-component');
    const courierNoteComponent = document.getElementById('order-courier-note-component');

    if(pickupComponent && window.FormComponents){
      pickupComponent.innerHTML = window.FormComponents.renderLocationField({
        title: 'Pickup Location',
        key: 'order-pickup',
        required: true,
        placeholder: 'Pickup detail (building / room)',
        readonly: true
      });

      const pickupSelect = document.getElementById('order-pickup-select');
      const pickupDetail = document.getElementById('order-pickup-detail');
      if(pickupSelect && shopAddress){
        pickupSelect.value = 'Other';
      }
      if(pickupDetail && shopAddress){
        pickupDetail.value = shopAddress;
      }
    }

    if(deliveryComponent && window.FormComponents){
      deliveryComponent.innerHTML = window.FormComponents.renderLocationField({
        title: 'Delivery Location',
        key: 'order-delivery',
        required: true,
        enableSavedAddressSelect: true,
        savedAddressLabel: 'Use saved address',
        placeholder: 'Delivery detail (building / room)'
      });
      window.FormComponents.initLocationAutocomplete && window.FormComponents.initLocationAutocomplete('order-delivery');
      window.FormComponents.initSavedAddressPicker && window.FormComponents.initSavedAddressPicker('order-delivery');
    }

    if(rewardComponent && window.FormComponents){
      rewardComponent.innerHTML = window.FormComponents.renderRewardField({
        id: 'delivery-reward',
        name: 'reward',
        label: 'Reward',
        required: false,
        placeholder: 'e.g. 2'
      });
    }

    if(merchantNoteComponent && window.FormComponents){
      merchantNoteComponent.innerHTML = window.FormComponents.renderNoteField({
        id: 'order-merchant-note',
        label: 'Note for Merchant',
        name: 'merchantNote',
        placeholder: 'e.g. light ice',
        rows: 3
      });
    }

    if(courierNoteComponent && window.FormComponents){
      courierNoteComponent.innerHTML = window.FormComponents.renderNoteField({
        id: 'order-courier-note',
        label: 'Note for Bringer',
        name: 'courierNote',
        placeholder: 'e.g. Please call me when you arrive downstairs',
        rows: 3
      });
    }

    renderDraft();
    bind();
  });
})();
