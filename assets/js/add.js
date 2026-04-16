const DELIVERY_STORAGE_KEY = 'mavsideDeliveryPosts';
const deliveryPagePath = window.mavsideResolvePath ? window.mavsideResolvePath('/view/delivery.html') : '/view/delivery.html';

function createRequestId() {
    return 'd-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
}

function getTodayDate() {
    return new Date().toISOString().slice(0, 10);
}

function readDeliveryData() {
    const raw = localStorage.getItem(DELIVERY_STORAGE_KEY);
    if (!raw) return [];

    try {
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
        console.error('Failed to parse delivery storage:', error);
        return [];
    }
}

function writeDeliveryData(data) {
    localStorage.setItem(DELIVERY_STORAGE_KEY, JSON.stringify(data));
}

function resolveLocationByKey(key, selectElement, customInputElement) {
    if (window.FormComponents && window.FormComponents.readLocationValue) {
        return window.FormComponents.readLocationValue(key);
    }

    if (!selectElement || !customInputElement) return '';
    const selected = String(selectElement.value || '').trim();
    const detail = String(customInputElement.value || '').trim();
    if (selected && detail) return selected + ' - ' + detail;
    return selected || detail;
}

function normalizeReward(value) {
    if (window.FormComponents && window.FormComponents.normalizeReward) {
        return window.FormComponents.normalizeReward(value);
    }
    const reward = String(value || '').trim();
    if (!reward) return '';
    return reward.startsWith('$') ? reward : ('$' + reward);
}

function getMavAccess() {
    if (!window.AccountManager || !window.AccountManager.readMavAccess) {
        return { verified: false };
    }
    return window.AccountManager.readMavAccess() || { verified: false };
}

function getWallet() {
    if (!window.AccountManager || !window.AccountManager.readWallet) {
        return { heartPoints: 0 };
    }
    return window.AccountManager.readWallet() || { heartPoints: 0 };
}

function handleFormSubmission(event) {
    event.preventDefault();

    const content = document.getElementById('request-content').value.trim();
    const pickupSelect = document.getElementById('pickup-select');
    const deliverySelect = document.getElementById('delivery-select');
    const customPickup = document.getElementById('pickup-detail');
    const customDelivery = document.getElementById('delivery-detail');
    const typeInput = document.getElementById('request-type');
    const rewardInput = document.getElementById('reward');
    const supportCheckbox = document.getElementById('use-access-support-task');
    const deliverAtInput = document.getElementById('deliver-at');
    const noteInput = document.getElementById('request-note');

    const pickupLocation = resolveLocationByKey('pickup', pickupSelect, customPickup);
    const deliveryLocation = resolveLocationByKey('delivery', deliverySelect, customDelivery);
    const useAccessSupport = !!(supportCheckbox && supportCheckbox.checked);
    const reward = useAccessSupport
        ? 'heart'
        : normalizeReward(rewardInput.value);
    const selectedType = String(typeInput && typeInput.value || '').trim();
    const ownerEmail = localStorage.getItem('mavsideUserEmail') || '';
    const depositAmount = useAccessSupport ? 0 : (parseFloat((reward || '').replace(/[^0-9.]/g, '')) || 0);
    const deliverAt = (deliverAtInput && deliverAtInput.value) ? deliverAtInput.value : '';
    const note = noteInput ? noteInput.value.trim() : '';

    if (!content || !selectedType || !pickupLocation || !deliveryLocation || !reward) {
        alert('Please fill in all fields.');
        return;
    }

    if (useAccessSupport) {
        const mavAccess = getMavAccess();
        if (!mavAccess.verified) {
            alert('MavAccess verification is required for accessibility support.');
            return;
        }

        const wallet = getWallet();
        if (Number(wallet.heartPoints || 0) < 1) {
            alert('Not enough MavPoints for accessibility support.');
            return;
        }

        wallet.heartPoints -= 1;
        if (window.AccountManager && window.AccountManager.writeWallet) {
            window.AccountManager.writeWallet(wallet);
            if (window.AccountManager.addWalletHistory) {
                window.AccountManager.addWalletHistory('support', 0, 'Accessibility support used 1 MavPoint');
            }
        }
    }

    const newRequest = {
        id: createRequestId(),
        time: getTodayDate(),
        type: selectedType,
        taskType: 'general',
        content: content,
        note: note,
        pickupLocation: pickupLocation,
        deliveryLocation: deliveryLocation,
        deliverAt: deliverAt,
        reward: reward,
        state: 'Open',
        owner: ownerEmail,
        acceptedBy: '',
        depositAmount: depositAmount,
        depositPaid: false,
        depositReleased: false,
        delivered: false,
        history: [
            {
                when: Date.now(),
                who: ownerEmail || 'unknown',
                action: 'created'
            }
        ]
    };

    const requests = readDeliveryData();
    requests.unshift(newRequest);
    writeDeliveryData(requests);

    alert('Task posted successfully.');
    event.target.reset();
    window.location.href = deliveryPagePath;
}

document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('add-post-form');
    const typeContainer = document.getElementById('type-component');
    const pickupContainer = document.getElementById('pickup-location-component');
    const deliveryContainer = document.getElementById('delivery-location-component');
    const rewardContainer = document.getElementById('reward-component');
    const noteContainer = document.getElementById('note-component');

    if (typeContainer && window.FormComponents) {
        typeContainer.innerHTML = window.FormComponents.renderTypeField({
            id: 'request-type',
            label: 'Type',
            name: 'type',
            required: true
        });
    }

    if (pickupContainer && window.FormComponents) {
        // 这里使用统一的 location 组件，便于后续在其他页面复用同一交互逻辑。
        pickupContainer.innerHTML = window.FormComponents.renderLocationField({
            title: 'Pickup Location',
            key: 'pickup',
            required: true,
            enableSavedAddressSelect: true,
            savedAddressLabel: 'Use saved address',
            placeholder: 'Pickup detail (building / room)'
        });
        window.FormComponents.initLocationAutocomplete && window.FormComponents.initLocationAutocomplete('pickup');
        window.FormComponents.initSavedAddressPicker && window.FormComponents.initSavedAddressPicker('pickup');
    }

    if (deliveryContainer && window.FormComponents) {
        // 这里使用统一的 location 组件，便于后续在其他页面复用同一交互逻辑。
        deliveryContainer.innerHTML = window.FormComponents.renderLocationField({
            title: 'Delivery Location',
            key: 'delivery',
            required: true,
            enableSavedAddressSelect: true,
            savedAddressLabel: 'Use saved address',
            placeholder: 'Delivery detail (building / room)'
        });
        window.FormComponents.initLocationAutocomplete && window.FormComponents.initLocationAutocomplete('delivery');
        window.FormComponents.initSavedAddressPicker && window.FormComponents.initSavedAddressPicker('delivery');
    }

    if (rewardContainer && window.FormComponents) {
        rewardContainer.innerHTML = window.FormComponents.renderRewardField({
            id: 'reward',
            name: 'reward',
            label: 'Reward',
            required: true,
            placeholder: 'e.g., 5'
        }) + window.FormComponents.renderSupportField({
            id: 'use-access-support-task',
            name: 'use-access-support-task',
            label: 'Use 1 MavPoint to support this task (requires MavAccess verification)',
            hintId: 'task-heart-fee-hint',
            hintText: 'Available MavPoints: ' + Number(getWallet().heartPoints || 0) + '. Need 1 point.'
        });
    }

    if (noteContainer && window.FormComponents) {
        noteContainer.innerHTML = window.FormComponents.renderNoteField({
            id: 'request-note',
            label: 'Note',
            name: 'note',
            placeholder: 'Any extra details for this task',
            rows: 3
        });
    }

    const pickupSelect = document.getElementById('pickup-select');
    const deliverySelect = document.getElementById('delivery-select');
    const rewardInput = document.getElementById('reward');

    if (window.FormComponents && window.FormComponents.bindSupportMode) {
        window.FormComponents.bindSupportMode({
            checkboxId: 'use-access-support-task',
            rewardInputId: 'reward',
            hintId: 'task-heart-fee-hint',
            availablePoints: function() { return getWallet().heartPoints; },
            enabledHint: 'Use 1 MavPoint to support this task (requires MavAccess verification).',
            disabledHint: 'Available MavPoints: {points}. Need 1 point.'
        });
    }

    if (rewardInput) {
        rewardInput.addEventListener('blur', function() {
            rewardInput.value = normalizeReward(rewardInput.value);
        });
    }

    if (form) {
        form.addEventListener('submit', handleFormSubmission);
    }
});
