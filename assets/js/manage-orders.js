(function(){
  function getUser(){
    return localStorage.getItem('mavsideUserEmail') || '';
  }

  function escapeHtml(text){
    return String(text || '').replace(/[&<>"']/g, function(ch){
      return ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' })[ch];
    });
  }

  function statusBucket(raw){
    if (window.TaskProgress && window.TaskProgress.getBucket) {
      return window.TaskProgress.getBucket(raw);
    }
    var s = String(raw || '').toLowerCase();
    if (s === 'delivered' || s === 'completed') return 'completed';
    if (s === 'cancelled' || s === 'canceled') return 'cancelled';
    return 'in-progress';
  }

  function formatRewardDisplay(value){
    var raw = String(value || '').trim().toLowerCase();
    if (raw === 'heart' || raw === '❤' || raw === '💜') return '💜';
    return '$' + Number(value || 0).toFixed(2);
  }

  function readErrands(){
    try {
      var raw = JSON.parse(localStorage.getItem('mavsideDeliveryPosts') || '[]');
      return Array.isArray(raw) ? raw : [];
    } catch (e) {
      return [];
    }
  }

  function createOrderRow(order, role){
    var shop = window.getShop ? window.getShop(order.storeId) : null;
    var title = shop && shop.name ? shop.name : (order.storeId || 'Merchant Order');
    return {
      id: 'ord-' + (order.orderId || '') + '-' + role,
      kind: 'order',
      bucket: statusBucket(order.status),
      role: role,
      createdAt: order.assignedAt || order.deliveredAt || Date.now(),
      route: (order.storeId || '-') + ' -> ' + (order.deliveryAddress || '-'),
      title: title,
      reward: formatRewardDisplay(order.reward),
      state: window.orderStatusLabel ? window.orderStatusLabel(order.status) : String(order.status || '-'),
      actionText: 'View',
      actionUrl: '/order-tracking.html?orderId=' + encodeURIComponent(order.orderId || '') + '&role=' + encodeURIComponent(role)
    };
  }

  function mapOrderToRows(order, user){
    if (!order) return [];
    var rows = [];
    if (order.owner === user) rows.push(createOrderRow(order, 'poster'));
    if (order.assignedTo === user) rows.push(createOrderRow(order, 'bringer'));
    return rows;
  }

  function mapErrandToRow(item, user){
    var model = window.ErrandsModel && window.ErrandsModel.toErrandModel
      ? window.ErrandsModel.toErrandModel(item)
      : item;

    var mine = model && (model.owner === user || model.acceptedBy === user);
    if (!mine) return null;
    var role = model.owner === user ? 'poster' : 'bringer';

    var bucket = statusBucket(model.state);
    var actionUrl = '/order-tracking.html?kind=errand&id=' + encodeURIComponent(model.id || '') + '&role=' + encodeURIComponent(role);
    if (model.sourceType === 'order' && model.sourceOrderId) {
      actionUrl = '/order-tracking.html?orderId=' + encodeURIComponent(model.sourceOrderId) + '&kind=order&role=' + encodeURIComponent(role);
    }

    return {
      id: model.id || '',
      kind: 'errand',
      bucket: bucket,
      role: role,
      createdAt: model.time || '-',
      route: (model.pickupLocation || '-') + ' -> ' + (model.deliveryLocation || '-'),
      title: model.content || 'Errand Task',
      reward: model.reward || '$0',
      state: model.state || '-',
      actionText: 'View',
      actionUrl: actionUrl
    };
  }

  function getRowsForUser(user){
    var rows = [];
    var orders = window.readOrders ? window.readOrders() : [];
    var errands = readErrands();

    orders.forEach(function(o){
      var orderRows = mapOrderToRows(o, user);
      orderRows.forEach(function(row){ rows.push(row); });
    });

    errands.forEach(function(e){
      // Order tasks are rendered from mavsideOrders already; skip mirrored hall copies.
      if (e && e.sourceType === 'order' && e.sourceOrderId) return;
      var row = mapErrandToRow(e, user);
      if (row) rows.push(row);
    });

    rows.sort(function(a, b){
      return String(b.createdAt).localeCompare(String(a.createdAt));
    });
    return rows;
  }

  function getStatusCounts(rows){
    var list = Array.isArray(rows) ? rows : [];
    return {
      inProgress: list.filter(function(r){ return r.bucket === 'in-progress'; }).length,
      completed: list.filter(function(r){ return r.bucket === 'completed'; }).length,
      cancelled: list.filter(function(r){ return r.bucket === 'cancelled'; }).length
    };
  }

  function renderRows(root, rows){
    if (!root) return;
    if (!rows.length) {
      root.innerHTML = '<p class="account-muted">No tasks in this status.</p>';
      return;
    }

    var html =
      '<table id="manage-task-table">' +
        '<thead><tr>' +
          '<th>Source</th><th>Title</th><th>Route</th><th>Reward</th><th>Status</th><th>Action</th>' +
        '</tr></thead>' +
        '<tbody>' +
          rows.map(function(row){
            return '<tr>' +
              '<td>' + escapeHtml(row.kind === 'order' ? 'Order' : 'Errand') + '</td>' +
              '<td>' + escapeHtml(row.title) + '</td>' +
              '<td>' + escapeHtml(row.route) + '</td>' +
              '<td>' + escapeHtml(row.reward) + '</td>' +
              '<td>' + escapeHtml(row.state) + '</td>' +
              '<td>' +
                (window.TaskProgress ? window.TaskProgress.renderAxis(row.state, { compact: true }) : '') +
                '<a class="dashboard-view-more" href="' + escapeHtml(row.actionUrl) + '">' + escapeHtml(row.actionText) + '</a>' +
              '</td>' +
            '</tr>';
          }).join('') +
        '</tbody>' +
      '</table>';

    root.innerHTML = html;
  }

  window.TaskListComponent = {
    getUser: getUser,
    getRowsForUser: getRowsForUser,
    getStatusCounts: getStatusCounts,
    renderRows: renderRows
  };
})();
