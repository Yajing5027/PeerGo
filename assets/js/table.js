const DELIVERY_STORAGE_KEY = 'peergoDeliveryPosts';
const postPagePath = '/view/add.html';

const defaultDeliveryData = [
    { id: 'd-1', time: '2026-03-31', type: 'Shopping', content: 'Buy snacks from campus store', pickupLocation: 'Library', deliveryLocation: 'Dorm', reward: '$5', state: 'Open' },
    { id: 'd-2', time: '2026-03-31', type: 'Delivery', content: 'Pick up parcel', pickupLocation: 'Office', deliveryLocation: 'Dorm', reward: '$3', state: 'Open' },
    { id: 'd-3', time: '2026-03-30', type: 'Printing', content: 'Print assignment', pickupLocation: 'Library', deliveryLocation: 'Dining Hall', reward: '$2', state: 'Accepted' }
];

function normalizeText(value) {
    return String(value || '').trim().toLowerCase();
}

function normalizeState(value) {
    const state = normalizeText(value);

    if (state === 'accepted' || state === '已接单' || state === '已接受') {
        return 'accepted';
    }

    if (state === 'open' || state === '待接单' || state === '开放') {
        return 'open';
    }

    return state;
}

function pickValue(item, candidates) {
    for (let i = 0; i < candidates.length; i++) {
        const key = candidates[i];
        if (item && item[key] !== undefined && item[key] !== null && item[key] !== '') {
            return item[key];
        }
    }
    return '';
}

function normalizeItem(item) {
    const normalizedState = normalizeState(pickValue(item, ['state', 'status']));

    return {
        id: pickValue(item, ['id']) || createRequestId(),
        time: pickValue(item, ['time', 'createdAt']) || '-',
        type: pickValue(item, ['type', 'requestType', 'category']) || '-',
        content: pickValue(item, ['content', 'requestContent', 'description']) || '-',
        pickupLocation: pickValue(item, ['pickupLocation', 'pickup', 'pickupPoint', 'pickup_site']) || '-',
        deliveryLocation: pickValue(item, ['deliveryLocation', 'delivery', 'dropoff', 'deliveryPoint', 'delivery_site']) || '-',
        reward: pickValue(item, ['reward', 'price', 'amount']) || '$0',
        state: normalizedState === 'accepted' ? 'Accepted' : 'Open'
    };
}

function createRequestId() {
    return 'd-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
}

function ensureIds(items) {
    let changed = false;
    const normalized = items.map(function(item) {
        const normalizedItem = normalizeItem(item);
        if (!item || item.id !== normalizedItem.id || item.state !== normalizedItem.state) {
            changed = true;
        }
        return normalizedItem;
    });

    return { normalized: normalized, changed: changed };
}

function readDeliveryData() {
    const raw = localStorage.getItem(DELIVERY_STORAGE_KEY);
    if (!raw) {
        localStorage.setItem(DELIVERY_STORAGE_KEY, JSON.stringify(defaultDeliveryData));
        return defaultDeliveryData.slice();
    }

    try {
        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed)) {
            return defaultDeliveryData.slice();
        }

        const idCheck = ensureIds(parsed);
        if (idCheck.changed) {
            writeDeliveryData(idCheck.normalized);
        }
        return idCheck.normalized;
    } catch (error) {
        console.error('Failed to parse delivery data from storage:', error);
        return defaultDeliveryData.slice();
    }
}

function writeDeliveryData(data) {
    localStorage.setItem(DELIVERY_STORAGE_KEY, JSON.stringify(data));
}

function normalizeReward(reward) {
    if (!reward) return '$0';
    return reward.startsWith('$') ? reward : ('$' + reward);
}

function renderDeliveryTable(data) {
    const table = document.getElementById('request-table');
    if (!table) return;

    const tableBody = table.querySelector('tbody');
    const totalCell = table.querySelector('tfoot td[colspan]');

    tableBody.innerHTML = '';

    if (!data.length) {
        const emptyRow = document.createElement('tr');
        emptyRow.innerHTML = '<td colspan="8">No matching errands found. Try another filter.</td>';
        tableBody.appendChild(emptyRow);
    }

    data.forEach(function(item) {
        const isAccepted = item.state === 'Accepted';
        const stateClass = isAccepted ? 'state-accepted' : 'state-open';
        const actionLabel = isAccepted ? 'Accepted' : 'Accept';
        const disabledAttr = isAccepted ? ' disabled' : '';

        const row = document.createElement('tr');
        row.innerHTML =
            '<td>' + item.time + '</td>' +
            '<td>' + item.type + '</td>' +
            '<td>' + item.content + '</td>' +
            '<td>' + item.pickupLocation + '</td>' +
            '<td>' + item.deliveryLocation + '</td>' +
            '<td>' + normalizeReward(item.reward) + '</td>' +
            '<td class="state-cell ' + stateClass + '">' + item.state + '</td>' +
            '<td><button type="button" class="accept-button" data-id="' + item.id + '"' + disabledAttr + '>' + actionLabel + '</button></td>';

        tableBody.appendChild(row);
    });

    if (totalCell) {
        totalCell.textContent = String(data.length);
    }
}

function acceptRequest(requestId) {
    const allItems = readDeliveryData();
    let changed = false;

    const updated = allItems.map(function(item) {
        if (item.id === requestId && item.state !== 'Accepted') {
            changed = true;
            return Object.assign({}, item, { state: 'Accepted' });
        }
        return item;
    });

    if (changed) {
        writeDeliveryData(updated);
        applyFilters();
    }
}

function applyFilters() {
    const allItems = readDeliveryData();
    const typeValue = normalizeText(document.getElementById('request-type') ? document.getElementById('request-type').value : '');
    const pickupValue = normalizeText(document.getElementById('pickup-location') ? document.getElementById('pickup-location').value : '');
    const deliveryValue = normalizeText(document.getElementById('delivery-location') ? document.getElementById('delivery-location').value : '');
    const stateValue = normalizeState(document.getElementById('state') ? document.getElementById('state').value : '');

    const filtered = allItems.filter(function(item) {
        const normalized = normalizeItem(item);
        const typeMatched = !typeValue || normalizeText(normalized.type) === typeValue;
        const pickupMatched = !pickupValue || normalizeText(normalized.pickupLocation) === pickupValue;
        const deliveryMatched = !deliveryValue || normalizeText(normalized.deliveryLocation) === deliveryValue;
        const stateMatched = !stateValue || normalizeState(normalized.state) === stateValue;
        return typeMatched && pickupMatched && deliveryMatched && stateMatched;
    });

    renderDeliveryTable(filtered);
}

function initializeDeliveryPage() {
    const filterButton = document.getElementById('filter-button');
    const postButton = document.getElementById('post-button');
    const table = document.getElementById('request-table');
    const typeSelect = document.getElementById('request-type');
    const pickupSelect = document.getElementById('pickup-location');
    const deliverySelect = document.getElementById('delivery-location');
    const stateSelect = document.getElementById('state');
    const allItems = readDeliveryData();
    writeDeliveryData(allItems);
    renderDeliveryTable(allItems);

    if (filterButton) {
        filterButton.addEventListener('click', applyFilters);
    }

    [typeSelect, pickupSelect, deliverySelect, stateSelect].forEach(function(selectElement) {
        if (!selectElement) return;
        selectElement.addEventListener('change', applyFilters);
    });

    if (postButton) {
        postButton.addEventListener('click', function() {
            window.location.href = postPagePath;
        });
    }

    if (table) {
        table.addEventListener('click', function(event) {
            const button = event.target.closest('.accept-button');
            if (!button) return;

            const requestId = button.getAttribute('data-id');
            if (!requestId) return;
            acceptRequest(requestId);
        });
    }
}

document.addEventListener('DOMContentLoaded', initializeDeliveryPage);