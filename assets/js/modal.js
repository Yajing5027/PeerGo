(function(){
    // showConfirmModal(message, options) -> Promise<boolean>
    window.showConfirmModal = function(message, options) {
        options = options || {};
        return new Promise(function(resolve) {
            var overlay = document.getElementById('mavside-modal-overlay');
            if (!overlay) {
                overlay = document.createElement('div');
                overlay.id = 'mavside-modal-overlay';
                overlay.className = 'mavside-modal-overlay';
                document.body.appendChild(overlay);
            }

            // Recreate inner HTML each time to avoid stale event listeners
            overlay.innerHTML = `
                <div class="mavside-modal" role="dialog" aria-modal="true">
                    <div class="mavside-modal-content"><div id="mavside-modal-message"></div></div>
                    <div class="mavside-modal-actions">
                        <button id="mavside-modal-cancel" class="mavside-modal-btn">${options.cancelText || 'Cancel'}</button>
                        <button id="mavside-modal-confirm" class="mavside-modal-btn primary">${options.confirmText || 'Confirm'}</button>
                    </div>
                </div>
            `;

            const msgEl = overlay.querySelector('#mavside-modal-message');
            const btnConfirm = overlay.querySelector('#mavside-modal-confirm');
            const btnCancel = overlay.querySelector('#mavside-modal-cancel');

            msgEl.textContent = message || '';
            btnConfirm.textContent = options.confirmText || 'Confirm';
            btnCancel.textContent = options.cancelText || 'Cancel';

            overlay.style.display = 'flex';

            const prevActive = document.activeElement;

            function cleanup(result) {
                overlay.style.display = 'none';
                btnConfirm.removeEventListener('click', onConfirm);
                btnCancel.removeEventListener('click', onCancel);
                document.removeEventListener('keydown', onKey);
                if (prevActive && prevActive.focus) try { prevActive.focus(); } catch(e){}
                resolve(result);
            }

            function onConfirm(e) { e && e.preventDefault(); cleanup(true); }
            function onCancel(e) { e && e.preventDefault(); cleanup(false); }
            function onKey(e) {
                if (e.key === 'Escape') cleanup(false);
                if (e.key === 'Enter') cleanup(true);
            }

            btnConfirm.addEventListener('click', onConfirm);
            btnCancel.addEventListener('click', onCancel);
            document.addEventListener('keydown', onKey);

            // focus confirm
            setTimeout(function(){ try{ btnConfirm.focus(); }catch(e){} }, 10);
        });
    };
})();
