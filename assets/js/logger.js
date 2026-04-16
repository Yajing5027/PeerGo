(function() {
    window.logEvent = function(type, payload) {
        try {
            const raw = localStorage.getItem('mavsideLogs') || '[]';
            const logs = JSON.parse(raw);
            const entry = {
                id: 'log-' + Date.now() + '-' + Math.floor(Math.random()*1000),
                timestamp: new Date().toISOString(),
                type: String(type || ''),
                actor: localStorage.getItem('mavsideUserEmail') || '',
                payload: payload || {}
            };
            logs.unshift(entry);
            // keep last 500 entries
            localStorage.setItem('mavsideLogs', JSON.stringify(logs.slice(0, 500)));
            return entry;
        } catch (e) {
            console.error('logEvent error', e);
            return null;
        }
    };

    window.getLogs = function(limit) {
        try {
            const raw = localStorage.getItem('mavsideLogs') || '[]';
            const logs = JSON.parse(raw);
            if (!limit) return logs;
            return logs.slice(0, limit);
        } catch (e) {
            return [];
        }
    };

    window.clearLogs = function() {
        try {
            localStorage.removeItem('mavsideLogs');
            return true;
        } catch (e) {
            return false;
        }
    };

    window.showToast = function(message, type) {
        try {
            let container = document.getElementById('mavside-toast-container');
            if (!container) {
                container = document.createElement('div');
                container.id = 'mavside-toast-container';
                container.style.cssText = 'position:fixed;bottom:18px;right:18px;z-index:9999;display:flex;flex-direction:column;gap:8px;align-items:flex-end;';
                document.body.appendChild(container);
            }

            const el = document.createElement('div');
            el.className = 'mavside-toast ' + (type || 'info');
            el.style.cssText = 'background:var(--color-surface);padding:10px 14px;border-radius:8px;box-shadow:var(--shadow-soft);border:1px solid var(--color-border);min-width:120px;text-align:right;font-weight:600;';
            el.textContent = message;
            container.appendChild(el);
            setTimeout(() => { el.remove(); }, 3600);
            return el;
        } catch (e) {
            console.warn('showToast failed', e);
            try { alert(message); } catch (err) {}
        }
    };
})();
