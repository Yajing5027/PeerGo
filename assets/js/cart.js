(function(){
  const CART_UI_STATE = { expanded: false, bound: false };

  function getUserEmail(){ return localStorage.getItem('mavsideUserEmail') || 'guest@local'; }
  function cartKey(){ return 'mavsideCart:' + getUserEmail(); }
  function getCart(){ return JSON.parse(localStorage.getItem(cartKey()) || '[]'); }
  function saveCart(cart){ localStorage.setItem(cartKey(), JSON.stringify(cart)); document.dispatchEvent(new CustomEvent('mavside:cartUpdated')); }
  function addToCart(item){ const cart = getCart(); const found = cart.find(i=>i.id===item.id && i.storeId===item.storeId); if(found){ found.qty = (found.qty||1)+1; } else { cart.push(Object.assign({qty:1}, item)); } saveCart(cart); }
  function clearCart(){ saveCart([]); }
  function updateQty(id, storeId, delta){
    const cart = getCart();
    const row = cart.find(i=>i.id===id && i.storeId===storeId);
    if(!row) return;
    row.qty = (row.qty || 1) + delta;
    if(row.qty <= 0){
      const next = cart.filter(i=>!(i.id===id && i.storeId===storeId));
      saveCart(next);
      return;
    }
    saveCart(cart);
  }

  function roundMoney(value){
    return Math.round((Number(value) || 0) * 100) / 100;
  }

  function formatMoney(value){
    return '$' + roundMoney(value).toFixed(2);
  }

  function cartToDraftOrder(cart){
    const total = roundMoney(cart.reduce((sum, it)=>sum + (Number(it.price)||0) * (Number(it.qty)||1), 0));
    const storeId = cart[0] && cart[0].storeId ? cart[0].storeId : '';
    const draft = {
      storeId,
      items: cart,
      subtotal: total,
      tip: 0,
      deliveryAddress: '',
      createdAt: Date.now()
    };
    localStorage.setItem('mavsidePendingOrderDraft', JSON.stringify(draft));
    return draft;
  }

  function renderCartPanel(){
    const panel = document.getElementById('cart-panel');
    if(!panel) return;
    const cart = getCart();
    const totalQty = cart.reduce(function(sum, it){ return sum + (Number(it.qty) || 0); }, 0);
    if(!cart || cart.length===0){
      panel.innerHTML = '<div class="cart-dock-bar">' +
        '<button class="cart-icon-btn" type="button" id="cart-toggle-btn" aria-label="Toggle cart details">' +
          '<span class="cart-icon" aria-hidden="true">🛒</span>' +
          '<span class="cart-badge">0</span>' +
        '</button>' +
        '<div class="cart-dock-meta"><strong>Cart</strong><span>Empty</span></div>' +
        '<button id="checkout-btn" type="button" disabled>Place Order</button>' +
      '</div>' +
      '<div class="cart-dock-drawer"><p>Your cart is empty</p></div>';
      CART_UI_STATE.expanded = false;
      bindPanelEvents(panel);
      return;
    }
    let total = 0;
    const rows = cart.map(function(it){
      const rowTotal = (Number(it.price)||0) * (Number(it.qty)||1);
      total += rowTotal;
      return `<li class="cart-row"><div><strong>${it.name}</strong><span> ${formatMoney(it.price)}</span></div><div class="cart-row-actions"><button class="qty-btn decrease" data-id="${it.id}" data-store="${it.storeId}">-</button><span>${it.qty}</span><button class="qty-btn increase" data-id="${it.id}" data-store="${it.storeId}">+</button></div></li>`;
    }).join('');

    panel.innerHTML = `<div class="cart-dock-bar"><button class="cart-icon-btn" type="button" id="cart-toggle-btn" aria-label="Toggle cart details"><span class="cart-icon" aria-hidden="true">🛒</span><span class="cart-badge">${totalQty}</span></button><div class="cart-dock-meta"><strong>Cart</strong><span>${totalQty} items · Total ${formatMoney(total)}</span></div><button id="checkout-btn" type="button">Place Order</button></div><div class="cart-dock-drawer ${CART_UI_STATE.expanded ? 'is-open' : ''}"><ul class="cart-list">${rows}</ul><div class="cart-buttons"><button id="clear-cart" type="button">Clear</button></div></div>`;
    bindPanelEvents(panel);
  }

  function bindPanelEvents(panel){
    if(!panel || CART_UI_STATE.bound) return;
    CART_UI_STATE.bound = true;

    panel.addEventListener('click', function(e){
      const toggle = e.target.closest('#cart-toggle-btn');
      if(toggle){
        CART_UI_STATE.expanded = !CART_UI_STATE.expanded;
        renderCartPanel();
        return;
      }

      const checkout = e.target.closest('#checkout-btn');
      if(checkout && !checkout.disabled){
        const current = getCart();
        if(!current.length){
          window.showToast && window.showToast('Cart is empty', 'warning');
          return;
        }
        cartToDraftOrder(current);
        window.location.href = '/order-confirm.html';
        return;
      }

      const clearBtn = e.target.closest('#clear-cart');
      if(clearBtn){
        clearCart();
        renderCartPanel();
        return;
      }

      const dec = e.target.closest('.decrease');
      const inc = e.target.closest('.increase');
      if(!dec && !inc) return;
      const b = dec || inc;
      const delta = dec ? -1 : 1;
      updateQty(b.dataset.id, b.dataset.store, delta);
      renderCartPanel();
    });
  }

  window.addToCart = addToCart;
  window.getCart = getCart;
  window.clearCart = clearCart;

  document.addEventListener('mavside:cartUpdated', renderCartPanel);
  document.addEventListener('DOMContentLoaded', renderCartPanel);
})();
