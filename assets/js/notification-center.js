(function(){
  var NOTIFICATION_KEY = 'mavsideNotifications';
  var PREF_KEY = 'mavsideNotificationPrefs';

  var DEFINITIONS = [
    { key: 'assigned', label: 'Order accepted by bringer' },
    { key: 'picked_up', label: 'Order picked up from merchant' },
    { key: 'delivered', label: 'Order completed' },
    { key: 'cancelled', label: 'Order cancelled' },
    { key: 'errand_accepted', label: 'Task accepted in hall' }
  ];

  function now(){ return Date.now(); }

  function readJson(key, fallback){
    try {
      var raw = localStorage.getItem(key);
      if (!raw) return fallback;
      var value = JSON.parse(raw);
      return value == null ? fallback : value;
    } catch (e) {
      return fallback;
    }
  }

  function writeJson(key, value){
    localStorage.setItem(key, JSON.stringify(value));
  }

  function getCurrentUser(){
    return localStorage.getItem('mavsideUserEmail') || '';
  }

  function getDefaultPrefs(){
    var events = {};
    DEFINITIONS.forEach(function(def){ events[def.key] = true; });
    return {
      inAppEnabled: true,
      emailEnabled: true,
      events: events
    };
  }

  function readPrefs(){
    var all = readJson(PREF_KEY, {});
    var user = getCurrentUser();
    var defaults = getDefaultPrefs();
    var mine = (all && user && all[user]) || {};
    var merged = {
      inAppEnabled: mine.inAppEnabled !== false,
      emailEnabled: mine.emailEnabled !== false,
      events: Object.assign({}, defaults.events, mine.events || {})
    };
    return merged;
  }

  function writePrefs(next){
    var user = getCurrentUser();
    if (!user) return;
    var all = readJson(PREF_KEY, {});
    all[user] = {
      inAppEnabled: next && next.inAppEnabled !== false,
      emailEnabled: next && next.emailEnabled !== false,
      events: Object.assign({}, getDefaultPrefs().events, next && next.events ? next.events : {})
    };
    writeJson(PREF_KEY, all);
  }

  function listForUser(user){
    var all = readJson(NOTIFICATION_KEY, {});
    var list = all[user] || [];
    return Array.isArray(list) ? list : [];
  }

  function saveForUser(user, list){
    var all = readJson(NOTIFICATION_KEY, {});
    all[user] = list.slice(0, 200);
    writeJson(NOTIFICATION_KEY, all);
    document.dispatchEvent(new CustomEvent('mavside:notificationsUpdated'));
  }

  function publish(eventKey, payload){
    var data = payload || {};
    var recipients = Array.isArray(data.recipients) ? data.recipients.filter(Boolean) : [];
    if (!recipients.length) return;

    recipients.forEach(function(user){
      var prefs = readPrefsForUser(user);
      if (!prefs.events[eventKey]) return;

      var item = {
        id: 'ntf-' + now() + '-' + Math.floor(Math.random() * 1000),
        event: eventKey,
        title: data.title || 'Notification',
        message: data.message || '',
        relatedOrderId: data.orderId || '',
        at: now(),
        read: false
      };

      var list = listForUser(user);
      list.unshift(item);
      saveForUser(user, list);

      if (prefs.inAppEnabled && user === getCurrentUser() && window.showToast) {
        window.showToast(item.title + ': ' + item.message, 'info');
      }
    });
  }

  function readPrefsForUser(user){
    var all = readJson(PREF_KEY, {});
    var defaults = getDefaultPrefs();
    var mine = (all && user && all[user]) || {};
    return {
      inAppEnabled: mine.inAppEnabled !== false,
      emailEnabled: mine.emailEnabled !== false,
      events: Object.assign({}, defaults.events, mine.events || {})
    };
  }

  function publishOrderStatusChange(order, fromStatus, toStatus){
    if (!order) return;
    var nextStatus = window.TaskProgress ? window.TaskProgress.normalizeStatus(toStatus) : String(toStatus || '').toLowerCase();
    var recipients = [];
    if (order.owner) recipients.push(order.owner);
    if (nextStatus === 'delivered' && order.assignedTo) recipients.push(order.assignedTo);

    var messageMap = {
      assigned: {
        title: 'Order Accepted',
        message: 'Order accepted.'
      },
      picked_up: {
        title: 'Order Picked Up',
        message: 'Order picked up.'
      },
      delivered: {
        title: 'Order Completed',
        message: 'Order completed.'
      },
      cancelled: {
        title: 'Order Cancelled',
        message: 'Order cancelled.'
      }
    };

    var message = messageMap[nextStatus];
    if (!message) return;
    publish(nextStatus, {
      recipients: recipients,
      title: message.title,
      message: message.message,
      orderId: order.orderId || ''
    });
  }

  function publishErrandAccepted(errand, accepter){
    if (!errand || !errand.owner || !accepter) return;
    if (errand.owner === accepter) return;
    publish('errand_accepted', {
      recipients: [errand.owner],
      title: 'Task Accepted',
      message: 'Task accepted.',
      orderId: errand.sourceOrderId || errand.id || ''
    });
  }

  function readMine(){
    var user = getCurrentUser();
    if (!user) return [];
    return listForUser(user);
  }

  function markAllRead(){
    var user = getCurrentUser();
    if (!user) return;
    var list = listForUser(user).map(function(item){
      return Object.assign({}, item, { read: true });
    });
    saveForUser(user, list);
  }

  function markRead(notificationId){
    var user = getCurrentUser();
    if (!user || !notificationId) return;
    var changed = false;
    var list = listForUser(user).map(function(item){
      if (item && item.id === notificationId && !item.read) {
        changed = true;
        return Object.assign({}, item, { read: true });
      }
      return item;
    });
    if (changed) saveForUser(user, list);
  }

  window.NotificationCenter = {
    definitions: DEFINITIONS,
    getDefaultPrefs: getDefaultPrefs,
    readPrefs: readPrefs,
    writePrefs: writePrefs,
    readMine: readMine,
    markAllRead: markAllRead,
    markRead: markRead,
    publish: publish,
    publishOrderStatusChange: publishOrderStatusChange,
    publishErrandAccepted: publishErrandAccepted
  };
})();
