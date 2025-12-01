function getReferringPage() {
  const referrer = document.referrer;
  
  if (referrer.includes('delivery.html')) {
    return 'services/delivery.html';
  } else if (referrer.includes('lostfound.html')) {
    return 'services/lostfound.html';
  } else {
    return 'dashboard.html';
  }
}

function handleFormSubmission(event) {
  event.preventDefault();

  const referrer = getReferringPage();
  let postType;
  if (referrer.includes('delivery')) {
    postType = 'delivery';
  } else if (referrer.includes('lostfound')) {
    postType = 'lostfound';
  } else {
    alert('Unable to determine post type');
    return;
  }

  if (postType === 'delivery') {
    const content = document.getElementById('request-content').value;
    const pickupLocation = document.getElementById('pickup-location').value;
    const deliveryLocation = document.getElementById('delivery-location').value;
    const inspire = document.getElementById('inspire').value;

    if (!content || !pickupLocation || !deliveryLocation || !inspire) {
      alert('Please fill in all fields');
      return;
    }

    let formattedInspire;
    if (inspire.startsWith('$')) {
      formattedInspire = inspire;
    } else {
      formattedInspire = '$' + inspire;
    }

    const newItem = {
      type: 'Delivery',
      content: content,
      pickupLocation: pickupLocation,
      deliveryLocation: deliveryLocation,
      inspire: formattedInspire,
      state: 'Enable',
      time: '2025-11-30'
    };

    window.deliveryData.push(newItem);

    alert('Delivery request posted successfully!');
    document.getElementById('add-post-form').reset();
    
    window.location.href = getReferringPage();

  } else if (postType === 'lostfound') {
    const itemType = document.getElementById('item-type').value;
    const itemName = document.getElementById('item-name').value;
    const location = document.getElementById('item-location').value;
    const description = document.getElementById('item-description').value;
    const contact = document.getElementById('contact-email').value;

    const selectedColors = [];
    const colorCheckboxes = document.querySelectorAll('input[name="color"]:checked');
    for (let i = 0; i < colorCheckboxes.length; i++) {
      selectedColors.push(colorCheckboxes[i].value);
    }
    let color = '';
    for (let i = 0; i < selectedColors.length; i++) {
      if (i > 0) color += ', ';
      color += selectedColors[i];
    }

    if (!itemType || !itemName || !location || selectedColors.length === 0 || !contact) {
      alert('Please fill in all fields');
      return;
    }

    const newItem = {
      type: itemType,
      date: '2025-11-30',
      itemName: itemName,
      location: location,
      color: color,
      description: description,
      contact: contact
    };

    window.lostFoundData.push(newItem);

    alert('Lost & Found item posted successfully!');
    document.getElementById('add-post-form').reset();
    
    window.location.href = getReferringPage();
  }
}

document.addEventListener('DOMContentLoaded', function() {
  const referrer = getReferringPage();
  if (referrer.includes('delivery')) {
    document.getElementById('delivery-fields').style.display = 'block';
    document.getElementById('lostfound-fields').style.display = 'none';
  } else if (referrer.includes('lostfound')) {
    document.getElementById('delivery-fields').style.display = 'none';
    document.getElementById('lostfound-fields').style.display = 'block';
  }

    if (inspireInput) {
      inspireInput.addEventListener('input', function() {
        let value = this.value;
        if (value && !value.startsWith('$')) {
          this.value = '$' + value;
        }
      });
    }  const pickupSelect = document.getElementById('pickup-location');
  const deliverySelect = document.getElementById('delivery-location');
  const itemLocationSelect = document.getElementById('item-location');
  const customPickup = document.getElementById('custom-pickup');
  const customDelivery = document.getElementById('custom-delivery');
  const customItemLocation = document.getElementById('custom-item-location');

  function toggleCustomInput(select, input) {
    if (select && input) {
      if (select.value === 'Other') {
        input.style.display = 'block';
      } else {
        input.style.display = 'none';
        input.value = '';
      }
    }
  }

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

  if (itemLocationSelect) {
    itemLocationSelect.addEventListener('change', function() {
      toggleCustomInput(itemLocationSelect, customItemLocation);
    });
  }

  document.getElementById('add-post-form').addEventListener('submit', handleFormSubmission);
});