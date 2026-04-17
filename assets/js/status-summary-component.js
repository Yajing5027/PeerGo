(function(){
  var ITEMS = [
    { key: 'in-progress', label: 'In Progress', countKey: 'inProgress' },
    { key: 'completed', label: 'Completed', countKey: 'completed' },
    { key: 'cancelled', label: 'Cancelled', countKey: 'cancelled' }
  ];

  function escapeHtml(text){
    var safe = text === undefined || text === null ? '' : String(text);
    return safe.replace(/[&<>"']/g, function(ch){
      return ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' })[ch];
    });
  }

  function render(container, options){
    if (!container) return;
    var opts = options || {};
    var mode = opts.mode || 'tab';
    var counts = opts.counts || {};
    var activeStatus = opts.activeStatus || 'in-progress';
    var baseHref = opts.baseHref || 'manage.html?status=';

    var html = '<div class="status-summary-grid">' + ITEMS.map(function(item){
      var count = Number(counts[item.countKey] || 0);
      var activeClass = item.key === activeStatus ? ' active-link' : '';

      if (mode === 'link') {
        return '<a class="account-summary-link task-status-card' + activeClass + '" href="' + baseHref + encodeURIComponent(item.key) + '">' +
          '<div class="account-muted">' + escapeHtml(item.label) + '</div>' +
          '<strong>' + escapeHtml(count) + '</strong>' +
        '</a>';
      }

      return '<button type="button" class="account-summary-link task-status-card task-status-tab' + activeClass + '" data-status="' + item.key + '">' +
        '<div class="account-muted">' + escapeHtml(item.label) + '</div>' +
        '<strong>' + escapeHtml(count) + '</strong>' +
      '</button>';
    }).join('') + '</div>';

    container.innerHTML = html;
  }

  window.StatusSummaryComponent = {
    render: render
  };
})();
