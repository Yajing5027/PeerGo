(function(){
  const DELIVERY_STORAGE_KEY = 'mavsideDeliveryPosts';

  function createRequestId(){
    return 'd-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
  }

  function normalizeReward(value){
    const raw = String(value || '').trim();
    const lowered = raw.toLowerCase();
    if (lowered === 'heart' || raw === '❤' || raw === '💜') return '💜';
    if(!raw) return '$0';
    if(raw.indexOf('$') === 0) return raw;
    const numeric = raw.replace(/[^0-9.]/g, '');
    return '$' + (numeric || '0');
  }

  function pickValue(item, candidates){
    for(let i = 0; i < candidates.length; i++){
      const key = candidates[i];
      if(item && item[key] !== undefined && item[key] !== null && item[key] !== ''){
        return item[key];
      }
    }
    return '';
  }

  function normalizeStateLabel(status){
    const s = String(status || '').toLowerCase();
    if(s === 'accepted' || s === 'assigned' || s === 'pickup_in_progress' || s === 'delivery_in_progress' || s === 'picked_up') return 'Accepted';
    if(s === 'completed' || s === 'delivered') return 'Completed';
    return 'Open';
  }

  function toErrandModel(item){
    const reward = pickValue(item, ['reward', 'price', 'amount']) || '$0';
    const depositAmt = pickValue(item, ['depositAmount', 'deposit', 'deposit_amt']);
    return {
      id: pickValue(item, ['id']) || createRequestId(),
      time: pickValue(item, ['time', 'createdAt']) || '-',
      deliverAt: pickValue(item, ['deliverAt', 'desiredDelivery', 'deliveryTime', 'deliverBy']) || '-',
      type: pickValue(item, ['type', 'requestType', 'category']) || 'Delivery',
      taskType: pickValue(item, ['taskType']) || (pickValue(item, ['sourceOrderId']) ? 'order' : 'general'),
      content: pickValue(item, ['content', 'requestContent', 'description']) || '-',
      note: pickValue(item, ['note', 'remark', 'memo']) || '',
      pickupLocation: pickValue(item, ['pickupLocation', 'pickup', 'pickupPoint', 'pickup_site']) || '-',
      deliveryLocation: pickValue(item, ['deliveryLocation', 'delivery', 'dropoff', 'deliveryPoint', 'delivery_site']) || '-',
      reward: normalizeReward(reward),
      state: normalizeStateLabel(pickValue(item, ['state', 'status'])),
      owner: pickValue(item, ['owner', 'postedBy', 'user', 'email']) || '',
      acceptedBy: pickValue(item, ['acceptedBy', 'accepted', 'assignee']) || '',
      sourceType: pickValue(item, ['sourceType']) || 'post',
      sourceOrderId: pickValue(item, ['sourceOrderId']) || '',
      depositAmount: depositAmt !== '' ? Number(depositAmt) : (Number(String(reward).replace(/[^0-9.]/g, '')) || 0),
      depositPaid: Boolean(pickValue(item, ['depositPaid', 'paid'])),
      depositReleased: Boolean(pickValue(item, ['depositReleased', 'released'])),
      delivered: Boolean(pickValue(item, ['delivered'])),
      history: Array.isArray(item && item.history) ? item.history : []
    };
  }

  function mapOrderToErrand(order, shopAddress){
    const rewardRaw = order && order.reward;
    const isHeart = String(rewardRaw || '').trim().toLowerCase() === 'heart' || rewardRaw === '❤';
    const rewardValue = isHeart ? 0 : (Number(rewardRaw) || 0);
    const delivery = String(order && order.deliveryAddress || '').trim() || '-';
    const pickup = String(shopAddress || '').trim() || String(order && order.pickupLocation || '').trim() || '-';

    return toErrandModel({
      id: 'ord-' + (order && order.orderId ? order.orderId : createRequestId()),
      time: new Date().toISOString().slice(0, 10),
      deliverAt: '-',
      type: 'Delivery',
      content: 'Merchant Order #' + (order && order.orderId ? order.orderId : '-'),
      note: order && (order.courierNote || order.note) ? (order.courierNote || order.note) : '',
      pickupLocation: pickup,
      deliveryLocation: delivery,
      reward: isHeart ? '💜' : ('$' + rewardValue),
      state: order && order.status ? order.status : 'open',
      owner: order && order.owner ? order.owner : '',
      acceptedBy: order && order.assignedTo ? order.assignedTo : '',
      sourceType: 'order',
      sourceOrderId: order && order.orderId ? order.orderId : '',
      depositAmount: rewardValue,
      depositPaid: true,
      depositReleased: false,
      delivered: order && order.status === 'delivered'
    });
  }

  function upsertOrderErrand(order, shopAddress){
    if(!order || !order.orderId) return null;
    const raw = localStorage.getItem(DELIVERY_STORAGE_KEY);
    let list = [];
    try { list = raw ? JSON.parse(raw) : []; } catch (e) { list = []; }
    if(!Array.isArray(list)) list = [];

    const model = mapOrderToErrand(order, shopAddress);
    const index = list.findIndex(function(item){
      return item && (item.sourceOrderId === order.orderId || item.id === model.id);
    });

    if(index >= 0){
      const current = toErrandModel(list[index]);
      list[index] = Object.assign({}, current, model, {
        id: current.id || model.id,
        time: current.time || model.time,
        history: Array.isArray(current.history) ? current.history : (Array.isArray(model.history) ? model.history : [])
      });
    } else {
      list.unshift(model);
    }

    localStorage.setItem(DELIVERY_STORAGE_KEY, JSON.stringify(list));
    return model;
  }

  function renderErrandRow(item){
    const isAccepted = item.state === 'Accepted';
    const isCompleted = item.state === 'Completed';
    const stateClass = isCompleted ? 'state-completed' : (isAccepted ? 'state-accepted' : 'state-open');
    const actionLabel = isCompleted ? 'Done' : (isAccepted ? 'Accepted' : 'Accept');
    const disabledAttr = (isCompleted || isAccepted) ? ' disabled' : '';

    return '<tr data-id="' + item.id + '">' +
      '<td>' + item.time + '</td>' +
      '<td>' + item.deliverAt + '</td>' +
      '<td>' + item.type + '</td>' +
      '<td>' + item.content + '</td>' +
      '<td>' + item.pickupLocation + '</td>' +
      '<td>' + item.deliveryLocation + '</td>' +
      '<td>' + item.reward + '</td>' +
      '<td class="state-cell ' + stateClass + '">' + item.state + '</td>' +
      '<td><button type="button" class="accept-button" data-id="' + item.id + '"' + disabledAttr + '>' + actionLabel + '</button></td>' +
    '</tr>';
  }

  window.ErrandsModel = {
    STORAGE_KEY: DELIVERY_STORAGE_KEY,
    normalizeReward: normalizeReward,
    toErrandModel: toErrandModel,
    mapOrderToErrand: mapOrderToErrand,
    upsertOrderErrand: upsertOrderErrand,
    renderErrandRow: renderErrandRow
  };
})();
