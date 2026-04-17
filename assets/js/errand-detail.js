(function(){
  const KEY = 'mavsideDeliveryPosts';

  function normalizeStatus(value){
    const text = String(value || '').toLowerCase();
    if (text.includes('cancel')) return 'cancelled';
    if (text.includes('complete') || text.includes('deliver')) return 'completed';
    if (text.includes('pick')) return 'picked_up';
    if (text.includes('assign') || text.includes('accept')) return 'assigned';
    return 'pending';
  }

  function getId(){
    const params = new URLSearchParams(window.location.search);
    return params.get('id');
  }

  function getBackTarget(){
    const params = new URLSearchParams(window.location.search);
    return params.get('from') === 'manage' ? 'manage.html' : 'delivery.html';
  }

  function readAll(){
    try {
      const raw = localStorage.getItem(KEY);
      const data = raw ? JSON.parse(raw) : [];
      return Array.isArray(data) ? data : [];
    } catch (e) {
      return [];
    }
  }

  function render(){
    const id = getId();
    const overview = document.getElementById('errand-detail-overview');
    const noteEl = document.getElementById('errand-detail-note');
    if(!overview || !noteEl) return;

    if(!id){
      overview.innerHTML = '<p>Missing task id.</p>';
      noteEl.innerHTML = '<p>-</p>';
      return;
    }

    const all = readAll();
    const row = all.find(function(item){ return item && item.id === id; });
    if(!row){
      overview.innerHTML = '<p>Task not found.</p>';
      noteEl.innerHTML = '<p>-</p>';
      return;
    }

    const normalized = window.ErrandsModel && window.ErrandsModel.toErrandModel
      ? window.ErrandsModel.toErrandModel(row)
      : row;

    var fields = [
      { label: 'ID', value: normalized.id || '-' },
      { label: 'Type', value: normalized.type || '-' },
      { label: 'Pickup', value: normalized.pickupLocation || '-' },
      { label: 'Delivery', value: normalized.deliveryLocation || '-' },
      { label: 'Status', value: normalized.state || '-' },
      { label: 'Reward', value: normalized.reward || '$0' },
      { label: 'Poster', value: normalized.owner || '-' }
    ];

    overview.innerHTML =
      '<div class="detail-overview-grid">' +
      fields.map(function(field){
        return '<div class="detail-overview-item">' +
          '<div class="detail-overview-label">' + field.label + '</div>' +
          '<div class="detail-overview-value">' + field.value + '</div>' +
        '</div>';
      }).join('') +
      '</div>';

    noteEl.innerHTML = '<p>' + (normalized.note ? normalized.note : 'No note provided.') + '</p>';

    const progressHost = document.getElementById('errand-detail-progress');
    if (progressHost && window.TaskProgress && typeof window.TaskProgress.renderAxis === 'function') {
      const status = normalizeStatus(normalized.state || normalized.status);
      progressHost.innerHTML = window.TaskProgress.renderAxis(status, { compact: true });
    }
  }

  function bind(){
    const back = document.getElementById('errand-detail-back');
    if(back){
      back.addEventListener('click', function(){
        window.location.href = getBackTarget();
      });
    }
  }

  document.addEventListener('DOMContentLoaded', function(){
    render();
    bind();
    window.addEventListener('storage', function(evt){
      if (evt && (evt.key === KEY || evt.key === 'mavside_orders')) {
        render();
      }
    });
    document.addEventListener('mavside:ordersUpdated', render);
  });
})();
