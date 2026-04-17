(function(){
  const SHOP_STORAGE_KEY = 'mavsideShops';
  // 升级版本号，触发本地商铺缓存重建，确保 logo 重命名和图片更新立即生效。
  const SHOPS_DATA_VERSION = 'v8';
  const SHOPS_VERSION_KEY = 'mavsideShopsVersion';

  const SEED_SHOPS = Array.isArray(window.MAVSIDE_FIXED_SHOPS) ? window.MAVSIDE_FIXED_SHOPS : [];

  function gpsIcon(){
    return '<span class="gps-icon" aria-hidden="true"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2C14.8 2 17 4.2 17 7c0 4.8-5 11-5 11S7 11.8 7 7c0-2.8 2.2-5 5-5z" fill="#ff5d57"/><circle cx="12" cy="7" r="2.2" fill="#fff"/></svg></span>';
  }

  function seedShops(){
    try{
      const storedVersion = localStorage.getItem(SHOPS_VERSION_KEY);
      const storedShops = localStorage.getItem(SHOP_STORAGE_KEY);
      if(storedVersion !== SHOPS_DATA_VERSION || !storedShops){
        localStorage.setItem(SHOP_STORAGE_KEY, JSON.stringify(SEED_SHOPS));
        localStorage.setItem(SHOPS_VERSION_KEY, SHOPS_DATA_VERSION);
      }
    }catch(e){
      localStorage.setItem(SHOP_STORAGE_KEY, JSON.stringify(SEED_SHOPS));
      localStorage.setItem(SHOPS_VERSION_KEY, SHOPS_DATA_VERSION);
    }
  }

  function getShops(){
    return JSON.parse(localStorage.getItem(SHOP_STORAGE_KEY) || '[]');
  }

  function getShop(id){
    return getShops().find(function(s){ return s.id === id; });
  }

  function flattenItems(shop){
    if(!shop || !Array.isArray(shop.categories)) return [];
    return shop.categories.reduce(function(acc, cat){
      const mapped = (cat.items || []).map(function(item){
        return Object.assign({}, item, { categoryId: cat.id, categoryName: cat.name });
      });
      return acc.concat(mapped);
    }, []);
  }

  function renderMerchantCard(shop){
    // 优先使用可复用组件输出卡片，保证 shops/dashboard 传数据即可复用。
    if(window.ShopCardComponent && window.ShopCardComponent.renderShopCardComponent){
      return window.ShopCardComponent.renderShopCardComponent(shop, {
        actionText: 'Enter Shop'
      });
    }

    const showcase = (shop.heroImages || []).slice(0, 3).map(function(url){
      return '<img src="' + url + '" alt="' + shop.name + ' photo" loading="lazy" onerror="this.onerror=null;this.src=\'' + shop.logoUrl + '\'">';
    }).join('');

    return '<article class="merchant-card" data-store="' + shop.id + '">' +
      '<div class="merchant-card-head">' +
        '<img class="merchant-logo" src="' + shop.logoUrl + '" alt="' + shop.name + ' logo">' +
        '<div class="merchant-meta">' +
          '<h3>' + shop.name + '</h3>' +
          '<p class="merchant-tagline">' + (shop.tagline || '') + '</p>' +
          '<p class="merchant-address">' + gpsIcon() + '<span>' + (shop.address || '-') + '</span></p>' +
        '</div>' +
      '</div>' +
      '<div class="merchant-showcase">' + showcase + '</div>' +
      '<button class="enter-merchant-btn" data-store="' + shop.id + '">View</button>' +
    '</article>';
  }

  function renderMerchantGrid(root, shops){
    if(!root) return;
    root.innerHTML = shops.map(renderMerchantCard).join('');
    root.querySelectorAll('.enter-merchant-btn, .merchant-card').forEach(function(el){
      el.addEventListener('click', function(e){
        const store = e.target && e.target.dataset && e.target.dataset.store ? e.target.dataset.store : el.dataset.store;
        if(!store) return;
        window.location.href = 'shop.html?store=' + encodeURIComponent(store);
      });
    });
  }

  function renderShopHeader(shop){
    const images = (shop.heroImages || []).slice(0,3).map(function(url){
      return '<img src="' + url + '" alt="' + shop.name + ' showcase" loading="lazy" onerror="this.onerror=null;this.src=\'' + shop.logoUrl + '\'">';
    }).join('');

    return '<div class="shop-hero">' +
      '<div class="shop-hero-main">' +
        '<img class="shop-logo" src="' + shop.logoUrl + '" alt="' + shop.name + ' logo">' +
        '<div>' +
          '<h2>' + shop.name + '</h2>' +
          '<p>' + (shop.tagline || '') + '</p>' +
          '<p class="merchant-address">' + gpsIcon() + '<span>' + (shop.address || '-') + '</span></p>' +
        '</div>' +
      '</div>' +
      '<div class="shop-hero-images">' + images + '</div>' +
    '</div>';
  }

  function renderCategories(shop){
    return (shop.categories || []).map(function(cat, idx){
      return '<button class="category-btn' + (idx === 0 ? ' is-active' : '') + '" data-category="' + cat.id + '">' + cat.name + '</button>';
    }).join('');
  }

  function renderMenuItems(shop, selectedCategoryId){
    const category = (shop.categories || []).find(function(cat){ return cat.id === selectedCategoryId; }) || (shop.categories || [])[0];
    if(!category){ return '<p>No menu yet.</p>'; }
    return '<h3 class="menu-category-title">' + category.name + '</h3>' +
      '<div class="menu-items-grid">' +
      (category.items || []).map(function(it){
        return '<article class="menu-item-card">' +
          '<img src="' + it.image + '" alt="' + it.name + '" loading="lazy" onerror="this.onerror=null;this.src=\'' + shop.logoUrl + '\'">' +
          '<div class="menu-item-content">' +
            '<h4>' + it.name + '</h4>' +
            '<p>' + (it.desc || '') + '</p>' +
            '<div class="menu-item-footer">' +
              '<span>¥' + it.price + '</span>' +
              '<button class="add-to-cart" data-id="' + it.id + '" data-store="' + shop.id + '">Add</button>' +
            '</div>' +
          '</div>' +
        '</article>';
      }).join('') +
      '</div>';
  }

  function renderShopsList(){
    const root = document.getElementById('shops-list');
    if(!root) return;
    renderMerchantGrid(root, getShops());
  }

  function renderShopDetail(){
    const params = new URLSearchParams(location.search);
    const store = params.get('store');
    if(!store) return;

    const shop = getShop(store);
    const title = document.getElementById('shop-title');
    const info = document.getElementById('shop-info');
    const categories = document.getElementById('menu-categories');
    const menu = document.getElementById('menu-list');
    if(!shop){
      if(title) title.textContent = 'Shop not found';
      return;
    }

    if(title) title.textContent = shop.name;
    if(info) info.innerHTML = renderShopHeader(shop);
    if(categories) categories.innerHTML = renderCategories(shop);
    if(menu){
      const firstCategory = shop.categories && shop.categories[0] ? shop.categories[0].id : null;
      menu.innerHTML = renderMenuItems(shop, firstCategory);

      if(categories){
        categories.addEventListener('click', function(e){
          const btn = e.target.closest('.category-btn');
          if(!btn) return;
          categories.querySelectorAll('.category-btn').forEach(function(n){ n.classList.remove('is-active'); });
          btn.classList.add('is-active');
          menu.innerHTML = renderMenuItems(shop, btn.dataset.category);
        });
      }

      menu.addEventListener('click', function(e){
        const b = e.target.closest('.add-to-cart');
        if(!b) return;
        const id = b.dataset.id;
        const storeId = b.dataset.store;
        const all = flattenItems(shop);
        const item = all.find(function(x){ return x.id === id; });
        if(item && window.addToCart){
          window.addToCart({
            id: item.id,
            name: item.name,
            desc: item.desc,
            price: item.price,
            image: item.image,
            storeId: storeId,
            categoryName: item.categoryName
          });
          if(window.showToast) window.showToast('Added to cart', 'success');
        }
      });
    }
  }

  document.addEventListener('DOMContentLoaded', function(){
    seedShops();
    renderShopsList();
    renderShopDetail();
  });

  window.MerchantComponents = {
    gpsIcon: gpsIcon,
    renderMerchantCard: renderMerchantCard,
    renderMerchantGrid: renderMerchantGrid,
    renderShopHeader: renderShopHeader,
    renderCategories: renderCategories,
    renderMenuItems: renderMenuItems
  };
  window.getShops = getShops;
  window.getShop = getShop;
})();
