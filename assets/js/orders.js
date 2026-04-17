(function(){
  function readOrders(){ return JSON.parse(localStorage.getItem('mavsideOrders') || '[]'); }
  function writeOrders(list){ localStorage.setItem('mavsideOrders', JSON.stringify(list)); document.dispatchEvent(new CustomEvent('mavside:ordersUpdated')); }
  function genId(){ return 'O' + Date.now().toString(36) + Math.floor(Math.random()*900+100); }
  function genCustomerDeliveryCode(){ return String(Math.floor(1000+Math.random()*9000)); }
  function genMerchantPickupCode(){ return String(Math.floor(1000+Math.random()*9000)); }

  function getShopAddress(storeId){
    if(!storeId || !window.getShop) return '';
    const shop = window.getShop(storeId);
    return shop && shop.address ? shop.address : '';
  }

  function isHeartReward(reward){
    var raw = String(reward || '').trim().toLowerCase();
    return raw === 'heart' || raw === '❤' || raw === '💜';
  }

  function formatRewardLabel(reward){
    if (isHeartReward(reward)) return '💜';
    return '$' + roundCurrency(Number(reward || 0)).toFixed(2);
  }

  function roundCurrency(value){
    return Math.round(Number(value || 0) * 100) / 100;
  }

  function creditCompletionReward(order){
    if (!order || !window.AccountManager || !window.AccountManager.readWallet || !window.AccountManager.writeWallet) return;

    var rewardText = String(order.reward || '').trim().toLowerCase();
    var wallet = window.AccountManager.readWallet() || { balance: 0, heartPoints: 0 };

    if (isHeartReward(rewardText)) {
      wallet.heartPoints = Number(wallet.heartPoints || 0) + 1;
      window.AccountManager.writeWallet(wallet);
      if (window.AccountManager.addWalletHistory) {
        window.AccountManager.addWalletHistory('heart-reward', 1, 'Completed supported task: +1 MavPoint');
      }
      return;
    }

    var amount = Number(String(order.reward || '').replace(/[^0-9.]/g, '')) || 0;
    amount = roundCurrency(amount);
    if (amount <= 0) return;

    wallet.balance = roundCurrency(Number(wallet.balance || 0) + amount);
    window.AccountManager.writeWallet(wallet);
    if (window.AccountManager.addWalletHistory) {
      window.AccountManager.addWalletHistory('task-reward', amount, 'Completed task reward: +' + '$' + amount.toFixed(2));
    }
  }

  function syncErrandHall(order){
    if(!order) return;
    if(window.ErrandsModel && window.ErrandsModel.upsertOrderErrand){
      window.ErrandsModel.upsertOrderErrand(order, getShopAddress(order.storeId));
      return;
    }
    const key = 'mavsideDeliveryPosts';
    let list = [];
    try { list = JSON.parse(localStorage.getItem(key) || '[]'); } catch(e) { list = []; }
    if(!Array.isArray(list)) list = [];

    const id = 'ord-' + order.orderId;
    const item = {
      id: id,
      time: new Date().toISOString().slice(0, 10),
      deliverAt: '-',
      type: 'Delivery',
      content: 'Merchant Order #' + order.orderId,
      pickupLocation: getShopAddress(order.storeId) || order.pickupLocation || '-',
      deliveryLocation: order.deliveryAddress || '-',
      reward: formatRewardLabel(order.reward),
      state: order.status === 'delivered' ? 'Completed' : (order.status === 'cancelled' ? 'Cancelled' : (order.status === 'assigned' || order.status === 'picked_up' ? 'Accepted' : 'Open')),
      owner: order.owner || '',
      acceptedBy: order.assignedTo || '',
      sourceType: 'order',
      sourceOrderId: order.orderId
    };

    const idx = list.findIndex(function(x){ return x && (x.id === id || x.sourceOrderId === order.orderId); });
    if(idx >= 0) list[idx] = Object.assign({}, list[idx], item);
    else list.unshift(item);
    localStorage.setItem(key, JSON.stringify(list));
  }

  async function simulatePayment(amount){
    try{
      const res = await fetch('/api/pay', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({amount}) });
      if(res.ok){ const j = await res.json(); return { paid: true, transactionId: j.transactionId || ('txn_'+Date.now()) }; }
    }catch(e){}
    await new Promise(r=>setTimeout(r,500));
    return { paid: true, transactionId: 'mock_' + Date.now() };
  }

  function orderStatusLabel(status){
    const map = {
      posted: 'Pending',
      matching: 'Pending',
      assigned: 'Assigned',
      pickup_in_progress: 'Pickup in progress',
      picked_up: 'Picked up',
      delivery_in_progress: 'Delivery in progress',
      delivered: 'Completed',
      cancelled: 'Cancelled'
    };
    return map[status] || status || 'Unknown';
  }

  function updateOrderStatus(order, nextStatus, actor, action){
    if(!order) return;
    const prev = order.status;
    order.status = nextStatus;
    order.history.push({ when: Date.now(), who: actor || 'system', action: action || ('status:' + nextStatus) });
    if (window.NotificationCenter && window.NotificationCenter.publishOrderStatusChange) {
      window.NotificationCenter.publishOrderStatusChange(order, prev, nextStatus);
    }
  }

  async function createOrder(cart, options){
    const user = localStorage.getItem('mavsideUserEmail') || 'guest@local';
    const storeId = cart[0] && cart[0].storeId ? cart[0].storeId : 'unknown';
    const total = roundCurrency(cart.reduce((s,i)=>s + (i.price||0) * (i.qty||1), 0));
    const tip = roundCurrency(Number(options && options.tip) || 0);
    const deliveryAddress = (options && options.deliveryAddress) || '';
    const pickupLocation = (options && options.pickupLocation) || getShopAddress(storeId) || '';
    const rawReward = options && options.reward;
    const reward = isHeartReward(rawReward) ? 'heart' : roundCurrency(Number(rawReward) || 0);
    const rewardAmount = isHeartReward(reward) ? 0 : roundCurrency(Number(reward));
    const merchantNote = String(options && options.merchantNote || '').trim();
    const courierNote = String(options && options.courierNote || '').trim();
    const payable = roundCurrency(total + tip + rewardAmount);
    const pay = await simulatePayment(payable);
    const orderId = genId();
    const customerDeliveryCode = genCustomerDeliveryCode();
    const order = {
      orderId,
      owner: user,
      storeId,
      items: cart,
      total,
      tip,
      reward,
      merchantNote,
      courierNote,
      // Backward-compatible field for old readers.
      note: courierNote,
      pickupLocation,
      deliveryAddress,
      amountPaid: payable,
      status: 'matching',
      customerDeliveryCode,
      customerDeliveryCodeExpiresAt: Date.now() + 1000*60*60,
      merchantPickupCode: null,
      merchantPickupCodeExpiresAt: null,
      assignedTo: null,
      assignedAt: null,
      courier: null,
      pickupAt: null,
      deliveredAt: null,
      payment: { paid: !!pay.paid, transactionId: pay.transactionId },
      payout: { paid:false },
      history: [
        { when: Date.now(), who: user, action: 'created' },
        { when: Date.now(), who: 'system', action: 'matching_started' }
      ]
    };
    const list = readOrders(); list.push(order); writeOrders(list);
    syncErrandHall(order);
    window.showToast && window.showToast('Order created', 'success');

    // Auto-assign in demo mode to simulate a matching flow.
    setTimeout(function(){
      const current = readOrders();
      const idx = current.findIndex(function(o){ return o.orderId === orderId; });
      if(idx < 0) return;
      if(current[idx].status !== 'matching') return;
      current[idx].status = 'assigned';
      current[idx].assignedTo = current[idx].assignedTo || 'courier.demo@mavside.local';
      current[idx].assignedAt = Date.now();
      current[idx].history.push({ when: Date.now(), who: 'system', action: 'matched' });
      writeOrders(current);
      syncErrandHall(current[idx]);
      if (window.NotificationCenter && window.NotificationCenter.publishOrderStatusChange) {
        window.NotificationCenter.publishOrderStatusChange(current[idx], 'matching', 'assigned');
      }
    }, 1800);

    return order;
  }

  function findOrder(orderId){ return readOrders().find(o=>o.orderId===orderId); }

  function claimOrder(orderId){ const user = localStorage.getItem('mavsideUserEmail') || 'guest@local'; const list = readOrders(); const idx = list.findIndex(o=>o.orderId===orderId); if(idx<0) return null; if(list[idx].assignedTo) return null; list[idx].assignedTo = user; list[idx].assignedAt = Date.now(); updateOrderStatus(list[idx], 'assigned', user, 'claimed'); writeOrders(list); syncErrandHall(list[idx]); window.showToast && window.showToast('Order claimed', 'success'); return list[idx]; }

  function generateMerchantPickupCode(orderId){ const list = readOrders(); const idx = list.findIndex(o=>o.orderId===orderId); if(idx<0) return null; const code = genMerchantPickupCode(); list[idx].merchantPickupCode = code; list[idx].merchantPickupCodeExpiresAt = Date.now() + 1000*60*30; list[idx].history.push({when:Date.now(), who:'merchant', action:'merchantPickupCodeGenerated'}); writeOrders(list); return code; }

  function verifyMerchantPickupCode(orderId, code){
    const list = readOrders();
    const idx = list.findIndex(o=>o.orderId===orderId);
    if(idx<0) return { ok:false, reason:'not found' };
    const order = list[idx];
    if(!order.merchantPickupCode || order.merchantPickupCode !== code) return { ok:false, reason:'invalid' };
    if(Date.now() > order.merchantPickupCodeExpiresAt) return { ok:false, reason:'expired' };
    const prev = order.status;
    order.status = 'picked_up';
    order.pickupAt = Date.now();
    order.history.push({when:Date.now(), who:'merchant', action:'picked_up'});
    writeOrders(list);
    syncErrandHall(order);
    if (window.NotificationCenter && window.NotificationCenter.publishOrderStatusChange) {
      window.NotificationCenter.publishOrderStatusChange(order, prev, 'picked_up');
    }
    window.showToast && window.showToast('Merchant verification passed — poster delivery code visible to bringer', 'success');
    return { ok:true, order };
  }

  function verifyDeliveryCode(orderId, code){
    const list = readOrders();
    const idx = list.findIndex(o=>o.orderId===orderId);
    if(idx<0) return { ok:false, reason:'not found' };
    const order = list[idx];
    if(order.customerDeliveryCode !== code) return { ok:false, reason:'invalid' };
    if (order.status === 'delivered') return { ok:false, reason:'already-delivered' };
    const prev = order.status;
    order.status = 'delivered';
    order.deliveredAt = Date.now();
    order.history.push({when:Date.now(), who: order.assignedTo || 'unknown', action:'delivered'});
    order.payout = { paid:true, txId: 'payout_' + Date.now(), amount: order.total };
    writeOrders(list);
    creditCompletionReward(order);
    syncErrandHall(order);
    if (window.NotificationCenter && window.NotificationCenter.publishOrderStatusChange) {
      window.NotificationCenter.publishOrderStatusChange(order, prev, 'delivered');
    }
    window.showToast && window.showToast('Delivery verified — payout simulated', 'success');
    return { ok:true, order };
  }

  function setOrderStatus(orderId, status, who){
    const list = readOrders();
    const idx = list.findIndex(function(o){ return o.orderId === orderId; });
    if(idx < 0) return null;
    var prev = list[idx].status;
    list[idx].status = status;
    list[idx].history.push({ when: Date.now(), who: who || 'system', action: 'status:' + status });
    writeOrders(list);
    syncErrandHall(list[idx]);
    if (window.NotificationCenter && window.NotificationCenter.publishOrderStatusChange) {
      window.NotificationCenter.publishOrderStatusChange(list[idx], prev, status);
    }
    return list[idx];
  }

  window.readOrders = readOrders;
  window.writeOrders = writeOrders;
  window.createOrder = createOrder;
  window.findOrder = findOrder;
  window.claimOrder = claimOrder;
  window.generateMerchantPickupCode = generateMerchantPickupCode;
  window.verifyMerchantPickupCode = verifyMerchantPickupCode;
  window.verifyDeliveryCode = verifyDeliveryCode;
  window.orderStatusLabel = orderStatusLabel;
  window.setOrderStatus = setOrderStatus;
})();
