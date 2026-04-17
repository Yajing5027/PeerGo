(function(){
  function getShopsSafe(){
    try{
      return window.getShops ? window.getShops() : [];
    }catch(e){
      return [];
    }
  }

  function getRouteSummary(){
    var pickup = localStorage.getItem('mavsideNavPickup') || 'Library';
    var delivery = localStorage.getItem('mavsideNavDelivery') || 'Dorm';
    return { pickup: pickup, delivery: delivery };
  }

  function getUserName(){
    var email = localStorage.getItem('mavsideUserEmail') || '';
    if (!email) return 'Maverick';
    var local = email.split('@')[0] || 'Maverick';
    return local.charAt(0).toUpperCase() + local.slice(1);
  }

  function readOpenErrands(){
    try {
      var all = JSON.parse(localStorage.getItem('mavsideDeliveryPosts') || '[]');
      if (!Array.isArray(all)) return [];
      return all.filter(function(item){
        var state = String(item && (item.state || item.status) || '').toLowerCase();
        return state === 'open' || state === 'accepted';
      }).slice(0, 4);
    } catch (e) {
      return [];
    }
  }

  function routeMatchPercent(index){
    return 88 + (index % 11);
  }

  function renderPrimaryAction(item){
    return '<a class="dashboard-primary-card" href="' + item.href + '">' +
      '<div class="dashboard-primary-icon">' + item.icon + '</div>' +
      '<div>' +
        '<h3>' + item.title + '</h3>' +
        '<p>' + item.subtitle + '</p>' +
      '</div>' +
    '</a>';
  }

  function renderMerchantLiteCard(shop, index){
    return '<article class="dashboard-merchant-lite" data-store="' + shop.id + '">' +
      '<img src="' + shop.logoUrl + '" alt="' + shop.name + '" loading="lazy">' +
      '<h3>' + shop.name + '</h3>' +
      '<p>' + (shop.tagline || 'Campus favorite') + '</p>' +
    '</article>';
  }

  function renderRouteTask(item, idx){
    var pickup = item.pickupLocation || item.pickup || '-';
    var delivery = item.deliveryLocation || item.delivery || '-';
    var content = item.content || item.requestContent || item.description || 'Campus task';
    var reward = String(item.reward || '$0');
    return '<article class="dashboard-route-task">' +
      '<div class="dashboard-route-top">From ' + pickup + ' to ' + delivery + '</div>' +
      '<div class="dashboard-route-content">📦 ' + content + '</div>' +
      '<div class="dashboard-route-foot">' +
        '<span>💰 ' + reward + ' · <span class="dashboard-route-highlight">🚶 On route ' + routeMatchPercent(idx + 2) + '%</span></span>' +
        '<a class="dashboard-view-more" href="/delivery.html">Take Along</a>' +
      '</div>' +
    '</article>';
  }

  function renderDashboardHub(){
    var root = document.getElementById('dashboard-hub');
    if(!root) return;

    var route = getRouteSummary();
    var username = getUserName();

    var primaryActions = [
      {
        icon: '📦',
        title: 'Post Task',
        subtitle: 'I need help',
        href: '/add.html'
      },
      {
        icon: '🚶',
        title: 'Take Along',
        subtitle: 'I can bring it on my route',
        href: '/delivery.html'
      }
    ];

    var shops = getShopsSafe().slice(0, 8);
    var errands = readOpenErrands();

    root.innerHTML =
      '<section class="dashboard-hero" aria-label="Greeting">' +
        '<h2>Good day, ' + username + '</h2>' +
        '<p>Your campus, closer than ever.</p>' +
        '<p>What do you need today?</p>' +
      '</section>' +
      '<section class="dashboard-block" aria-label="Primary Actions">' +
        '<div class="dashboard-primary-grid">' + primaryActions.map(renderPrimaryAction).join('') + '</div>' +
      '</section>' +
      '<section class="dashboard-block" aria-labelledby="dashboard-shops-title">' +
        '<div class="dashboard-block-head">' +
          '<h2 id="dashboard-shops-title">Campus Merchants</h2>' +
          '<a class="dashboard-view-more" href="/shops.html">See More</a>' +
        '</div>' +
        '<div class="dashboard-merchant-scroll">' +
          (shops.length ? shops.map(renderMerchantLiteCard).join('') : '<p>No merchants available.</p>') +
        '</div>' +
      '</section>' +
      '<section class="dashboard-block" aria-labelledby="dashboard-route-title">' +
        '<div class="dashboard-block-head">' +
          '<h2 id="dashboard-route-title">Route Picks</h2>' +
          '<a class="dashboard-view-more" href="/delivery.html">See More</a>' +
        '</div>' +
        '<p class="account-muted">From ' + route.pickup + ' to ' + route.delivery + '</p>' +
        '<div class="dashboard-route-list">' +
          (errands.length ? errands.map(renderRouteTask).join('') : '<p class="account-muted">No route tasks right now.</p>') +
        '</div>' +
      '</section>';

    root.querySelectorAll('.dashboard-merchant-lite').forEach(function(card){
      card.addEventListener('click', function(){
        var id = card.getAttribute('data-store');
        if (!id) return;
        window.location.href = 'shop.html?store=' + encodeURIComponent(id);
      });
    });
  }

  document.addEventListener('DOMContentLoaded', renderDashboardHub);
})();
