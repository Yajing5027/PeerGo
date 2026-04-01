const DELIVERY_STORAGE_KEY = 'peergoDeliveryPosts';
const deliveryPagePath = '/view/delivery.html';

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

function resolveLocation(selectElement, customInputElement) {
    if (!selectElement || !customInputElement) return '';

    if (selectElement.value === 'Other') {
        return customInputElement.value.trim();
    }
    return selectElement.value;
}

function normalizeReward(value) {
    const reward = value.trim();
    if (!reward) return '';
    return reward.startsWith('$') ? reward : ('$' + reward);
}

function toggleCustomInput(selectElement, inputElement) {
    if (!selectElement || !inputElement) return;
    if (selectElement.value === 'Other') {
        inputElement.hidden = false;
    } else {
        inputElement.hidden = true;
        inputElement.value = '';
    }
}

function handleFormSubmission(event) {
    event.preventDefault();

    const content = document.getElementById('request-content').value.trim();
    const pickupSelect = document.getElementById('pickup-location');
    const deliverySelect = document.getElementById('delivery-location');
    const customPickup = document.getElementById('custom-pickup');
    const customDelivery = document.getElementById('custom-delivery');
    const rewardInput = document.getElementById('reward');

    const pickupLocation = resolveLocation(pickupSelect, customPickup);
    const deliveryLocation = resolveLocation(deliverySelect, customDelivery);
    const reward = normalizeReward(rewardInput.value);

    if (!content || !pickupLocation || !deliveryLocation || !reward) {
        alert('Please fill in all fields.');
        return;
    }

    const postType = content.toLowerCase().includes('print') ? 'Printing' : 'Delivery';

    const newRequest = {
        id: createRequestId(),
        time: getTodayDate(),
        type: postType,
        content: content,
        pickupLocation: pickupLocation,
        deliveryLocation: deliveryLocation,
        reward: reward,
        state: 'Open'
    };

    const requests = readDeliveryData();
    requests.unshift(newRequest);
    writeDeliveryData(requests);

    alert('Errand request posted successfully.');
    event.target.reset();
    window.location.href = deliveryPagePath;
}

document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('add-post-form');
    const cancelButton = document.getElementById('cancel-button');
    const pickupSelect = document.getElementById('pickup-location');
    const deliverySelect = document.getElementById('delivery-location');
    const customPickup = document.getElementById('custom-pickup');
    const customDelivery = document.getElementById('custom-delivery');
    const rewardInput = document.getElementById('reward');

    if (pickupSelect) {
        pickupSelect.addEventListener('change', function() {
            toggleCustomInput(pickupSelect, customPickup);
        });
    }

    if (deliverySelect) {
        deliverySelect.addEventListener('change', function() {
            toggleCustomInput(deliverySelect, customDelivery);
        });
    }

    if (rewardInput) {
        rewardInput.addEventListener('blur', function() {
            rewardInput.value = normalizeReward(rewardInput.value);
        });
    }

    if (cancelButton) {
        cancelButton.addEventListener('click', function() {
            window.location.href = deliveryPagePath;
        });
    }

    if (form) {
        form.addEventListener('submit', handleFormSubmission);
    }
});