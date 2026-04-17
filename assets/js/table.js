const DELIVERY_STORAGE_KEY = 'mavsideDeliveryPosts';
const DELIVERY_DATA_VERSION_KEY = 'mavsideDeliveryDataVersion';
const DELIVERY_DATA_VERSION = '2026-04-15-v3';
const postPagePath = 'add.html';

const defaultDeliveryData = [
    { id: 'd-201', time: '2026-04-14', deliverAt: '2026-04-16T12:10', type: 'Shopping', taskType: 'general', content: 'Buy stationery set', pickupLocation: 'Centennial Student Union', deliveryLocation: 'Preska Residence Community', reward: '$4.20', state: 'Open', owner: 'admin@mnsu.edu', acceptedBy: '', depositAmount: 4.2, depositPaid: false, depositReleased: false, delivered: false, sourceType: 'post', sourceOrderId: '', history: [{ when: Date.parse('2026-04-14T09:00:00Z'), who: 'admin@mnsu.edu', action: 'created' }] },
    { id: 'd-202', time: '2026-04-13', deliverAt: '2026-04-15T18:00', type: 'Delivery', taskType: 'general', content: 'Pick up parcel from office', pickupLocation: 'Wigley Administration Center', deliveryLocation: 'Stadium Heights Residence Community', reward: '$3.80', state: 'Accepted', owner: 'admin@mnsu.edu', acceptedBy: 'mavaccess@mnsu.edu', depositAmount: 3.8, depositPaid: true, depositReleased: false, delivered: false, sourceType: 'post', sourceOrderId: '', history: [{ when: Date.parse('2026-04-13T08:20:00Z'), who: 'admin@mnsu.edu', action: 'created' }, { when: Date.parse('2026-04-13T08:55:00Z'), who: 'mavaccess@mnsu.edu', action: 'accepted' }] },
    { id: 'd-203', time: '2026-04-12', deliverAt: '2026-04-15T11:30', type: 'Delivery', taskType: 'order', content: 'Merchant order #A103', pickupLocation: 'Einstein Bros Bagels', deliveryLocation: 'Ford Hall', reward: '$5.00', state: 'Accepted', owner: 'admin@mnsu.edu', acceptedBy: 'mavaccess@mnsu.edu', depositAmount: 5, depositPaid: true, depositReleased: false, delivered: false, sourceType: 'post', sourceOrderId: '', history: [{ when: Date.parse('2026-04-12T07:30:00Z'), who: 'admin@mnsu.edu', action: 'created' }, { when: Date.parse('2026-04-12T07:50:00Z'), who: 'mavaccess@mnsu.edu', action: 'accepted' }] },
    { id: 'd-204', time: '2026-04-11', deliverAt: '2026-04-14T13:20', type: 'Delivery', taskType: 'order', content: 'Merchant order #B209', pickupLocation: 'Starbucks', deliveryLocation: 'Trafton Science Center', reward: 'heart', state: 'Open', owner: 'admin@mnsu.edu', acceptedBy: '', depositAmount: 0, depositPaid: false, depositReleased: false, delivered: false, sourceType: 'post', sourceOrderId: '', history: [{ when: Date.parse('2026-04-11T10:10:00Z'), who: 'admin@mnsu.edu', action: 'created' }] },
    { id: 'd-205', time: '2026-04-10', deliverAt: '2026-04-13T09:40', type: 'Printing', taskType: 'general', content: 'Print thesis chapter', pickupLocation: 'Memorial Library', deliveryLocation: 'Otto Recreation Center', reward: 'heart', state: 'Completed', owner: 'admin@mnsu.edu', acceptedBy: 'mavaccess@mnsu.edu', depositAmount: 0, depositPaid: true, depositReleased: true, delivered: true, sourceType: 'post', sourceOrderId: '', history: [{ when: Date.parse('2026-04-10T06:40:00Z'), who: 'admin@mnsu.edu', action: 'created' }, { when: Date.parse('2026-04-10T07:15:00Z'), who: 'mavaccess@mnsu.edu', action: 'accepted' }, { when: Date.parse('2026-04-10T07:50:00Z'), who: 'mavaccess@mnsu.edu', action: 'picked_up' }, { when: Date.parse('2026-04-10T08:30:00Z'), who: 'admin@mnsu.edu', action: 'delivered' }] }
];

function normalizeText(value) {
    return String(value || '').trim().toLowerCase();
}

function normalizeState(value) {
    const state = normalizeText(value);

    if (state === 'accepted') {
        return 'accepted';
    }

    if (state === 'open') {
        return 'open';
    }

    if (state === 'completed') {
        return 'completed';
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
    if (window.ErrandsModel && window.ErrandsModel.toErrandModel) {
        return window.ErrandsModel.toErrandModel(item);
    }

    const normalizedState = normalizeState(pickValue(item, ['state', 'status']));
    const reward = pickValue(item, ['reward', 'price', 'amount']) || '$0';
    const depositAmt = pickValue(item, ['depositAmount', 'deposit', 'deposit_amt']);

    let stateLabel = 'Open';
    if (normalizedState === 'accepted') stateLabel = 'Accepted';
    if (normalizedState === 'completed') stateLabel = 'Completed';

    return {
        id: pickValue(item, ['id']) || createRequestId(),
        time: pickValue(item, ['time', 'createdAt']) || '-',
        deliverAt: pickValue(item, ['deliverAt', 'deliverAt', 'desiredDelivery', 'deliveryTime', 'deliverBy']) || '-',
        type: pickValue(item, ['type', 'requestType', 'category']) || '-',
        taskType: pickValue(item, ['taskType']) || 'general',
        content: pickValue(item, ['content', 'requestContent', 'description']) || '-',
        pickupLocation: pickValue(item, ['pickupLocation', 'pickup', 'pickupPoint', 'pickup_site']) || '-',
        deliveryLocation: pickValue(item, ['deliveryLocation', 'delivery', 'dropoff', 'deliveryPoint', 'delivery_site']) || '-',
        reward: reward,
        state: stateLabel,
        owner: pickValue(item, ['owner', 'postedBy', 'user', 'email']) || '',
        acceptedBy: pickValue(item, ['acceptedBy', 'accepted', 'assignee']) || '',
        depositAmount: depositAmt !== '' ? Number(depositAmt) : (Number((reward || '').replace(/[^0-9.]/g, '')) || 0),
        depositPaid: Boolean(pickValue(item, ['depositPaid', 'paid'])) || false,
        depositReleased: Boolean(pickValue(item, ['depositReleased', 'released'])) || false,
        delivered: Boolean(pickValue(item, ['delivered'])) || false,
        sourceType: pickValue(item, ['sourceType']) || 'post',
        sourceOrderId: pickValue(item, ['sourceOrderId']) || '',
        customerDeliveryCode: pickValue(item, ['customerDeliveryCode']) || '',
        history: Array.isArray(item && item.history)
            ? item.history.map(function(h){
                return {
                    when: Number(h && h.when) || Date.now(),
                    who: String(h && h.who || ''),
                    action: String(h && h.action || '')
                };
            })
            : []
    };
}

function formatDeliverAt(value) {
    if (!value) return '-';
    // If it's already human-readable, just return it
    if (value === '-' ) return '-';
    try {
        if (window.formatUSDateTime) return window.formatUSDateTime(value);
        return new Date(value).toLocaleString('en-US');
    } catch (e) { return value; }
}

function parseDateValue(value) {
    if (!value || value === '-') return 0;
    var ms = new Date(value).getTime();
    return Number.isNaN(ms) ? 0 : ms;
}

function calcRouteMatch(item) {
    const navPickup = normalizeText(localStorage.getItem('mavsideNavPickup') || '');
    const navDelivery = normalizeText(localStorage.getItem('mavsideNavDelivery') || '');
    const pickup = normalizeText(item && item.pickupLocation || '');
    const delivery = normalizeText(item && item.deliveryLocation || '');

    let score = 0;
    if (navPickup && pickup && navPickup === pickup) score += 50;
    if (navDelivery && delivery && navDelivery === delivery) score += 50;
    if (score > 0) return score;

    const seed = String(item && (item.id || item.content || item.pickupLocation || item.deliveryLocation) || 'route');
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
        hash = (hash * 31 + seed.charCodeAt(i)) % 1000;
    }
    return 70 + (hash % 30);
}

function calcMavPointValue(item) {
    const rawReward = String(item && item.reward || '').trim().toLowerCase();
    if (rawReward === 'heart' || rawReward === '❤' || rawReward === '💜') return 1;
    const numeric = Number(String(item && item.reward || '').replace(/[^0-9.]/g, '')) || 0;
    return numeric;
}

function sortItems(items) {
    const sortByEl = document.getElementById('sort-by');
    const sortDirEl = document.getElementById('sort-dir');
    const sortBy = sortByEl ? String(sortByEl.value || 'time') : 'time';
    const sortDir = sortDirEl ? String(sortDirEl.value || 'desc') : 'desc';
    const dir = sortDir === 'asc' ? 1 : -1;

    const sorted = (Array.isArray(items) ? items.slice() : []).sort(function(a, b) {
        const aN = normalizeItem(a);
        const bN = normalizeItem(b);
        let diff = 0;

        if (sortBy === 'reward') {
            const aReward = Number(String(aN.reward || '').replace(/[^0-9.]/g, '')) || 0;
            const bReward = Number(String(bN.reward || '').replace(/[^0-9.]/g, '')) || 0;
            diff = aReward - bReward;
        } else if (sortBy === 'mavPoint') {
            diff = calcMavPointValue(aN) - calcMavPointValue(bN);
        } else if (sortBy === 'routeMatch') {
            diff = calcRouteMatch(aN) - calcRouteMatch(bN);
        } else if (sortBy === 'deliverAt') {
            diff = parseDateValue(aN.deliverAt) - parseDateValue(bN.deliverAt);
        } else {
            diff = parseDateValue(aN.time) - parseDateValue(bN.time);
        }

        return diff * dir;
    });

    // Always keep completed tasks at the bottom of the list.
    sorted.sort(function(a, b) {
        const aState = normalizeState((a && (a.state || a.status)) || '');
        const bState = normalizeState((b && (b.state || b.status)) || '');
        const aCompleted = aState === 'completed' ? 1 : 0;
        const bCompleted = bState === 'completed' ? 1 : 0;
        return aCompleted - bCompleted;
    });

    return sorted;
}

function createRequestId() {
    return 'd-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
}

function ensureIds(items) {
    let changed = false;
    const normalized = items.map(function(item) {
        const normalizedItem = normalizeItem(item);
        // detect structural changes by shallow comparison via JSON
        try {
            if (!item || JSON.stringify(item) !== JSON.stringify(normalizedItem)) {
                changed = true;
            }
        } catch (e) {
            changed = true;
        }
        return normalizedItem;
    });

    return { normalized: normalized, changed: changed };
}

function readDeliveryData() {
    const currentVersion = localStorage.getItem(DELIVERY_DATA_VERSION_KEY) || '';
    const raw = localStorage.getItem(DELIVERY_STORAGE_KEY);
    if (!raw || currentVersion !== DELIVERY_DATA_VERSION) {
        localStorage.setItem(DELIVERY_STORAGE_KEY, JSON.stringify(defaultDeliveryData));
        localStorage.setItem(DELIVERY_DATA_VERSION_KEY, DELIVERY_DATA_VERSION);
        return defaultDeliveryData.slice();
    }

    try {
        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed)) {
            localStorage.setItem(DELIVERY_DATA_VERSION_KEY, DELIVERY_DATA_VERSION);
            return defaultDeliveryData.slice();
        }

        const idCheck = ensureIds(parsed);
        if (idCheck.changed) {
            writeDeliveryData(idCheck.normalized);
        }
        localStorage.setItem(DELIVERY_DATA_VERSION_KEY, DELIVERY_DATA_VERSION);
        return idCheck.normalized;
    } catch (error) {
        console.error('Failed to parse delivery data from storage:', error);
        localStorage.setItem(DELIVERY_DATA_VERSION_KEY, DELIVERY_DATA_VERSION);
        return defaultDeliveryData.slice();
    }
}

function writeDeliveryData(data) {
    localStorage.setItem(DELIVERY_STORAGE_KEY, JSON.stringify(data));
}

function claimOrderFallback(orderId) {
    const user = localStorage.getItem('mavsideUserEmail') || '';
    if (!orderId || !user) return null;
    let list = [];
    try {
        const raw = JSON.parse(localStorage.getItem('mavsideOrders') || '[]');
        list = Array.isArray(raw) ? raw : [];
    } catch (e) {
        list = [];
    }

    const idx = list.findIndex(function(order){ return order && order.orderId === orderId; });
    if (idx < 0) return null;
    if (list[idx].assignedTo) return null;

    list[idx].assignedTo = user;
    list[idx].assignedAt = Date.now();
    list[idx].status = 'assigned';
    list[idx].history = Array.isArray(list[idx].history) ? list[idx].history : [];
    list[idx].history.push({ when: Date.now(), who: user, action: 'claimed' });
    localStorage.setItem('mavsideOrders', JSON.stringify(list));
    document.dispatchEvent(new CustomEvent('mavside:ordersUpdated'));
    return list[idx];
}

function normalizeReward(reward) {
    if (window.ErrandsModel && window.ErrandsModel.normalizeReward) {
        return window.ErrandsModel.normalizeReward(reward);
    }
    var rewardText = String(reward || '').trim();
    if (rewardText.toLowerCase() === 'heart' || rewardText === '❤' || rewardText === '💜') return '💜';
    var numeric = Number(String(rewardText).replace(/[^0-9.]/g, '')) || 0;
    return '$' + numeric.toFixed(2);
}

function renderDeliveryTable(data) {
    const table = document.getElementById('request-table');
    if (!table) return;

    const tableBody = table.querySelector('tbody');
    const totalCell = table.querySelector('tfoot td[colspan]');

    tableBody.innerHTML = '';

    if (!data.length) {
        const emptyRow = document.createElement('tr');
        emptyRow.innerHTML = '<td colspan="10">No matching tasks found. Try another filter.</td>';
        tableBody.appendChild(emptyRow);
    }

    data.forEach(function(item) {
        const normalized = normalizeItem(item);
        normalized.time = window.formatUSDate ? window.formatUSDate(normalized.time) : normalized.time;
        normalized.deliverAt = formatDeliverAt(normalized.deliverAt);

        const row = document.createElement('tr');

        const isAccepted = normalized.state === 'Accepted';
        const isCompleted = normalized.state === 'Completed';
        const stateClass = isCompleted ? 'state-completed' : (isAccepted ? 'state-accepted' : 'state-open');
        const actionLabel = isCompleted ? 'Done' : (isAccepted ? 'Accepted' : 'Accept');
        const disabledAttr = (isAccepted || isCompleted) ? ' disabled' : '';
        const routeMatch = calcRouteMatch(normalized);
        row.innerHTML =
                '<td>' + normalized.type + '</td>' +
                '<td>' + normalized.content + '</td>' +
                '<td>' + normalized.pickupLocation + '</td>' +
                '<td>' + normalized.deliveryLocation + '</td>' +
            '<td>' + routeMatch + '%</td>' +
                '<td>' + normalizeReward(normalized.reward) + '</td>' +
                '<td class="state-cell ' + stateClass + '">' + normalized.state + '</td>' +
            '<td>' + normalized.time + '</td>' +
            '<td>' + normalized.deliverAt + '</td>' +
                '<td><button type="button" class="accept-button" data-id="' + normalized.id + '"' + disabledAttr + '>' + actionLabel + '</button></td>';

        tableBody.appendChild(row);
    });

    if (totalCell) {
        totalCell.textContent = String(data.length);
    }
}

function buildUniqueValues(items, key) {
    const set = new Set();
    items.forEach(function(item) {
        const normalized = normalizeItem(item);
        const value = String(normalized[key] || '').trim();
        if (value) set.add(value);
    });
    return Array.from(set);
}

function syncFilterOptions(items) {
    const typeSelect = document.getElementById('request-type');
    const pickupSelect = document.getElementById('pickup-location');
    const deliverySelect = document.getElementById('delivery-location');
    const stateSelect = document.getElementById('state');
    if (!typeSelect || !pickupSelect || !deliverySelect || !stateSelect) return;

    const applyOptions = function(selectEl, values, allLabel) {
        const currentValue = selectEl.value;
        selectEl.innerHTML = '<option value="">' + allLabel + '</option>' + values.map(function(v) {
            return '<option value="' + v + '">' + v + '</option>';
        }).join('');
        if (currentValue && values.indexOf(currentValue) >= 0) {
            selectEl.value = currentValue;
        }
    };

    applyOptions(typeSelect, buildUniqueValues(items, 'type'), 'All');
    applyOptions(pickupSelect, buildUniqueValues(items, 'pickupLocation'), 'All');
    applyOptions(deliverySelect, buildUniqueValues(items, 'deliveryLocation'), 'All');
    applyOptions(stateSelect, ['Open', 'Accepted', 'Completed'], 'All');
}

async function acceptRequest(requestId) {
    // Ask user to confirm before accepting (use modal if available)
    try {
        let ok = true;
        if (typeof window.showConfirmModal === 'function') {
            ok = await window.showConfirmModal('Are you sure you want to accept this request?', { confirmText: 'Accept', cancelText: 'Cancel' });
        } else if (typeof window.confirm === 'function') {
            ok = window.confirm('Are you sure you want to accept this request?');
        }
        if (!ok) return;
    } catch (e) {
        // ignore
    }
    const allItems = readDeliveryData();
    const targetItem = allItems.find(function(item){ return item && item.id === requestId; });
    if (!targetItem) return;

    // For merchant orders mirrored in the hall, claim the real order first so My Tasks can read it.
    if (targetItem.sourceType === 'order' && targetItem.sourceOrderId && typeof window.claimOrder === 'function') {
        const claimed = window.claimOrder(targetItem.sourceOrderId);
        if (!claimed) {
            window.showToast && window.showToast('This order is already claimed.', 'error');
            return;
        }
        applyFilters();
        window.location.href = 'order-tracking.html?orderId=' + encodeURIComponent(targetItem.sourceOrderId) + '&kind=order&role=bringer';
        return;
    }

    if (targetItem.sourceType === 'order' && targetItem.sourceOrderId) {
        const claimed = claimOrderFallback(targetItem.sourceOrderId);
        if (!claimed) {
            window.showToast && window.showToast('This order is already claimed.', 'error');
            return;
        }
        applyFilters();
        window.location.href = 'order-tracking.html?orderId=' + encodeURIComponent(targetItem.sourceOrderId) + '&kind=order&role=bringer';
        return;
    }

    let changed = false;

    const updated = allItems.map(function(item) {
        if (item.id === requestId && item.state !== 'Accepted') {
            changed = true;
            const accepter = localStorage.getItem('mavsideUserEmail') || '';
            var history = Array.isArray(item.history) ? item.history.slice() : [];
            history.push({ when: Date.now(), who: accepter, action: 'accepted' });
            return Object.assign({}, item, { state: 'Accepted', acceptedBy: accepter, delivered: false, history: history });
        }
        return item;
    });

    if (changed) {
        writeDeliveryData(updated);
        applyFilters();
        try {
            const accepter = localStorage.getItem('mavsideUserEmail') || '';
            const acceptedItem = updated.find(function(item){ return item && item.id === requestId; });
            if (window.NotificationCenter && window.NotificationCenter.publishErrandAccepted && acceptedItem) {
                window.NotificationCenter.publishErrandAccepted(acceptedItem, accepter);
            }
            if (window.logEvent) {
                window.logEvent('request.accepted', { requestId: requestId, acceptedBy: accepter });
            }
        } catch (e) {
            console.warn('log request.accepted failed', e);
        }

        // For regular errand posts, go straight to detail after accept for bringer flow.
        window.location.href = 'order-tracking.html?kind=errand&id=' + encodeURIComponent(requestId) + '&role=bringer';
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

    renderDeliveryTable(sortItems(filtered));
}

function initializeDeliveryPage() {
    const table = document.getElementById('request-table');
    const typeSelect = document.getElementById('request-type');
    const pickupSelect = document.getElementById('pickup-location');
    const deliverySelect = document.getElementById('delivery-location');
    const stateSelect = document.getElementById('state');
    const sortBySelect = document.getElementById('sort-by');
    const sortDirSelect = document.getElementById('sort-dir');
    const allItems = readDeliveryData();
    writeDeliveryData(allItems);
    syncFilterOptions(allItems);
    renderDeliveryTable(sortItems(allItems));

    [typeSelect, pickupSelect, deliverySelect, stateSelect, sortBySelect, sortDirSelect].forEach(function(selectElement) {
        if (!selectElement) return;
        selectElement.addEventListener('change', applyFilters);
    });

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