(function(){
  var ORDER_FLOW = ['matching', 'assigned', 'picked_up', 'delivered'];

  function normalizeStatus(raw){
    var s = String(raw || '').toLowerCase();
    if (s === 'posted' || s === 'open' || s === 'pending') return 'matching';
    if (s === 'accepted') return 'assigned';
    if (s === 'completed') return 'delivered';
    if (s === 'canceled') return 'cancelled';
    return s;
  }

  function getBucket(raw){
    var status = normalizeStatus(raw);
    if (status === 'delivered') return 'completed';
    if (status === 'cancelled') return 'cancelled';
    return 'in-progress';
  }

  function getStatusLabel(raw){
    var status = normalizeStatus(raw);
    var labels = {
      matching: 'Pending',
      assigned: 'Assigned',
      picked_up: 'Picked Up',
      delivered: 'Completed',
      cancelled: 'Cancelled'
    };
    return labels[status] || (window.orderStatusLabel ? window.orderStatusLabel(status) : status || 'Unknown');
  }

  function renderAxis(raw, opts){
    var status = normalizeStatus(raw);
    var options = opts || {};
    var index = ORDER_FLOW.indexOf(status);
    var isCancelled = status === 'cancelled';
    var currentIndex = index >= 0 ? index : 0;

    var points = ORDER_FLOW.map(function(step, stepIndex){
      var cls = 'task-progress-step';
      if (!isCancelled && stepIndex < currentIndex) cls += ' is-done';
      if (!isCancelled && stepIndex === currentIndex) cls += ' is-current';
      return '<li class="' + cls + '">' +
        '<span class="task-progress-dot"></span>' +
        '<span class="task-progress-text">' + getStatusLabel(step) + '</span>' +
      '</li>';
    }).join('');

    var cancelTag = isCancelled
      ? '<span class="task-progress-cancelled">Cancelled</span>'
      : '';

    var compactClass = options.compact ? ' is-compact' : '';
    return '<div class="task-progress' + compactClass + '" data-status="' + status + '">' +
      '<ol class="task-progress-list">' + points + '</ol>' +
      cancelTag +
    '</div>';
  }

  window.TaskProgress = {
    normalizeStatus: normalizeStatus,
    getBucket: getBucket,
    getStatusLabel: getStatusLabel,
    renderAxis: renderAxis
  };
})();
