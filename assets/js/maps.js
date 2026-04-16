const MAP_MANIFEST_PATH = window.mavsideResolvePath ? window.mavsideResolvePath('/assets/maps/manifest.json') : '/assets/maps/manifest.json';
const OFFICIAL_MAP_PORTAL_URL = 'https://mankato.mnsu.edu/about-the-university/maps-and-transportation/maps-and-directions/';
const FALLBACK_MAP_URL = 'https://mankato.mnsu.edu/globalassets/maps/university/campus-map.pdf';

function normalizePath(input) {
    const raw = String(input || '').trim();
    if (!raw) {
        return '';
    }

    if (raw.indexOf('http://') === 0) {
        console.warn('Map URL uses insecure HTTP and will be skipped:', raw);
        return '';
    }

    if (raw.indexOf('https://') === 0) {
        return raw;
    }

    if (raw.indexOf('/') === 0) {
        return window.mavsideResolvePath ? window.mavsideResolvePath(raw) : raw;
    }

    const normalized = '/' + raw.replace(/^\.\//, '');
    return window.mavsideResolvePath ? window.mavsideResolvePath(normalized) : normalized;
}

function normalizeMapEntry(item, index) {
    const source = normalizePath(item && (item.localPath || item.path || item.url || item.sourceUrl));
    const title = String(item && item.title ? item.title : ('Map ' + (index + 1)));
    const contentType = String(item && item.contentType ? item.contentType : '');

    return {
        id: String(item && item.id ? item.id : ('map-' + (index + 1))),
        title: title,
        source: source,
        sourceUrl: String(item && item.sourceUrl ? item.sourceUrl : ''),
        contentType: contentType
    };
}

async function loadMapManifest() {
    try {
        const response = await fetch(MAP_MANIFEST_PATH, { cache: 'no-store' });
        if (!response.ok) {
            return [];
        }

        const payload = await response.json();
        const list = Array.isArray(payload) ? payload : payload && Array.isArray(payload.maps) ? payload.maps : [];

        return list
            .map(function(item, index) {
                return normalizeMapEntry(item, index);
            })
            .filter(function(item) {
                return Boolean(item.source);
            });
    } catch (error) {
        console.error('Failed to load map manifest:', error);
        return [];
    }
}

function fillMapSelect(select, maps) {
    select.innerHTML = '';

    maps.forEach(function(map) {
        const option = document.createElement('option');
        option.value = map.id;
        option.textContent = map.title;
        select.appendChild(option);
    });

    if (maps.length) {
        select.value = maps[0].id;
    }
}

function getMapTypeLabel(map) {
    const type = String(map && map.contentType || '').toLowerCase();
    if (type.indexOf('pdf') > -1 || String(map.source || '').toLowerCase().endsWith('.pdf')) {
        return 'PDF';
    }
    return 'Image';
}

function renderSelectedMap(state) {
    if (!state.select.value) {
        return;
    }

    const selected = state.maps.find(function(item) {
        return item.id === state.select.value;
    });

    if (!selected) {
        return;
    }

    state.frame.src = selected.source;
    state.frame.setAttribute('title', selected.title + ' Preview');

    const mapType = getMapTypeLabel(selected);
    const sourceText = selected.isFallback
        ? 'No local map manifest detected. Switched to the official online map.'
        : 'Using the local map manifest.';

    state.meta.textContent = 'Current Map: ' + selected.title + ' | Type: ' + mapType + ' | ' + sourceText;
}

function getFallbackMap() {
    return {
        id: 'official-fallback',
        title: 'Official Campus Map (Online)',
        source: FALLBACK_MAP_URL,
        sourceUrl: OFFICIAL_MAP_PORTAL_URL,
        contentType: 'application/pdf',
        isFallback: true
    };
}

async function refreshMapList(state, showRefreshHint) {
    state.select.disabled = true;
    state.select.innerHTML = '<option value="">Loading map manifest...</option>';

    const loaded = await loadMapManifest();
    state.maps = loaded.length ? loaded : [getFallbackMap()];

    fillMapSelect(state.select, state.maps);
    state.select.disabled = false;
    renderSelectedMap(state);

    if (showRefreshHint) {
        const source = loaded.length ? 'Local manifest loaded successfully.' : 'No local manifest found. Using official fallback map.';
        state.meta.textContent = state.meta.textContent + ' ' + source;
    }
}

function initializeCampusMapPanel() {
    const select = document.getElementById('campus-map-select');
    const frame = document.getElementById('campus-map-frame');
    const refreshButton = document.getElementById('map-refresh-button');
    const meta = document.getElementById('map-meta');

    if (!select || !frame || !refreshButton || !meta) {
        return;
    }

    const state = {
        select: select,
        frame: frame,
        meta: meta,
        maps: []
    };

    select.addEventListener('change', function() {
        renderSelectedMap(state);
    });

    refreshButton.addEventListener('click', function() {
        refreshMapList(state, true);
    });

    refreshMapList(state, false);
}

document.addEventListener('DOMContentLoaded', initializeCampusMapPanel);
