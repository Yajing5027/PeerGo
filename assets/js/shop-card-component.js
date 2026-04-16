(function(){
  function safeText(value){
    return String(value || '');
  }

  // 可复用商铺卡片组件：只依赖传入的数据对象，便于在 shops/dashboard 等页面复用。
  function renderShopCardComponent(shop, options){
    var cfg = Object.assign({
      actionText: 'Enter Shop',
      actionClass: 'enter-merchant-btn',
      cardClass: 'merchant-card'
    }, options || {});

    var showcase = (shop.heroImages || []).slice(0, 3).map(function(url){
      return '<img src="' + url + '" alt="' + safeText(shop.name) + ' photo" loading="lazy">';
    }).join('');

    return '<article class="' + cfg.cardClass + '" data-store="' + safeText(shop.id) + '">' +
      '<div class="merchant-card-head">' +
        '<img class="merchant-logo" src="' + safeText(shop.logoUrl) + '" alt="' + safeText(shop.name) + ' logo">' +
        '<div class="merchant-meta">' +
          '<h3>' + safeText(shop.name) + '</h3>' +
          '<p class="merchant-tagline">' + safeText(shop.tagline) + '</p>' +
          '<p class="merchant-address"><span>' + safeText(shop.address || '-') + '</span></p>' +
        '</div>' +
      '</div>' +
      '<div class="merchant-showcase">' + showcase + '</div>' +
      '<button class="' + cfg.actionClass + '" data-store="' + safeText(shop.id) + '">' + safeText(cfg.actionText) + '</button>' +
    '</article>';
  }

  window.ShopCardComponent = {
    renderShopCardComponent: renderShopCardComponent
  };
})();
