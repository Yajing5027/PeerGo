const campusLocations = ['Dorm', 'Library', 'Office', 'Parking Lot', 'Dining Hall', 'Gym', 'Other'];
const deliveryTypes = ['Shopping', 'Delivery', 'Printing'];

const defaultDeliveryData = [
  { time: '2025-11-29', type: 'Shopping', content: 'Grocery shopping', pickupLocation: 'Parking Lot', deliveryLocation: 'Dorm', inspire: '$12', state: 'Enable' },
  { time: '2025-11-29', type: 'Delivery', content: 'Pick up package', pickupLocation: 'Library', deliveryLocation: 'Dorm', inspire: '$3', state: 'Unable' },
  { time: '2025-11-28', type: 'Delivery', content: 'Send documents', pickupLocation: 'Office', deliveryLocation: 'Library', inspire: '$7', state: 'Enable' },
  { time: '2025-11-28', type: 'Delivery', content: 'Take out food', pickupLocation: 'Dining Hall', deliveryLocation: 'Dorm', inspire: '$5', state: 'Unable' },
  { time: '2025-11-27', type: 'Delivery', content: 'Deliver mail', pickupLocation: 'Library', deliveryLocation: 'Dorm', inspire: '$4', state: 'Unable' },
  { time: '2025-11-26', type: 'Printing', content: 'Print documents', pickupLocation: 'Library', deliveryLocation: 'Dorm', inspire: '$2', state: 'Enable' },
  { time: '2025-11-25', type: 'Delivery', content: 'Delivery meals', pickupLocation: 'Dining Hall', deliveryLocation: 'Dorm', inspire: '4', state: 'Enable' }
];

const defaultLostFoundData = [
  { type: 'lost', date: '2025-11-29', itemName: 'Key', location: 'Library', color: 'Red', description: 'With cat pendant', contact: 'bob@mnsu.edu' },
  { type: 'lost', date: '2025-11-28', itemName: 'Watch', location: 'Office', color: 'Blue', description: 'Tiny black part on screen', contact: 'amy@mnsu.edu' },
  { type: 'found', date: '2025-11-27', itemName: 'Glasses', location: 'Dorm', color: 'Black', description: 'Broken frame', contact: 'tom@mnsu.edu' },
  { type: 'found', date: '2025-11-26', itemName: 'Wallet', location: 'Parking Lot', color: 'Brown', description: 'Leather wallet with ID', contact: 'john@mnsu.edu' },
  { type: 'lost', date: '2025-11-25', itemName: 'Phone', location: 'Gym', color: 'Silver', description: 'iPhone with blue case', contact: 'jane@mnsu.edu' },
  { type: 'found', date: '2025-11-24', itemName: 'Book', location: 'Dining Hall', color: 'Green', description: 'Math textbook', contact: 'sam@mnsu.edu' }
];

const deliveryData = defaultDeliveryData;
const lostFoundData = defaultLostFoundData;

function generateDeliveryTable() {
  const table = document.getElementById('request-table');
  if (!table) return;
  const tableBody = table.getElementsByTagName('tbody')[0];
  const tableFoot = table.getElementsByTagName('tfoot')[0];
  
  tableBody.innerHTML = '';
  
  for (let i = 0; i < deliveryData.length; i++) {
    const item = deliveryData[i];
    let inspireDisplay;
    if (item.inspire.startsWith('$')) {
      inspireDisplay = item.inspire;
    } else {
      inspireDisplay = '$' + item.inspire;
    }
    const row = '<tr><td>' + item.time + '</td><td>' + item.type + '</td><td>' + item.content + '</td><td>' + item.pickupLocation + '</td><td>' + item.deliveryLocation + '</td><td>' + inspireDisplay + '</td><td>' + item.state + '</td><td><button type="button">Accept</button></td></tr>';
    
    tableBody.innerHTML += row;
  }
  
  if (tableFoot) {
    const totalRow = tableFoot.querySelector('tr td[colspan]');
    if (totalRow) {
      totalRow.textContent = deliveryData.length;
    }
  }
}

function generateLostFoundTable() {
  generateLostTable();
  generateFoundTable();
}

function generateLostTable() {
  const table = document.getElementById('lost-table');
  if (!table) return;
  const tableBody = table.getElementsByTagName('tbody')[0];
  
  tableBody.innerHTML = '';
  
  const lostItems = [];
  let lostIndex = 0;
  for (let i = 0; i < lostFoundData.length; i++) {
    if (lostFoundData[i].type === 'lost') {
      lostItems[lostIndex] = lostFoundData[i];
      lostIndex++;
    }
  }
  
  for (let i = 0; i < lostItems.length; i++) {
    const item = lostItems[i];
    const row = '<tr><td>' + item.date + '</td><td>' + item.itemName + '</td><td>' + item.location + '</td><td>' + item.color + '</td><td>' + item.description + '</td><td><a href="mailto:' + item.contact + '" target="_blank">email</a></td></tr>';
    
    tableBody.innerHTML += row;
  }
}

function generateFoundTable() {
  const table = document.getElementById('found-table');
  if (!table) return;
  const tableBody = table.getElementsByTagName('tbody')[0];
  
  tableBody.innerHTML = '';
  
  const foundItems = [];
  let foundIndex = 0;
  for (let i = 0; i < lostFoundData.length; i++) {
    if (lostFoundData[i].type === 'found') {
      foundItems[foundIndex] = lostFoundData[i];
      foundIndex++;
    }
  }
  
  for (let i = 0; i < foundItems.length; i++) {
    const item = foundItems[i];
    const row = '<tr><td>' + item.date + '</td><td>' + item.itemName + '</td><td>' + item.location + '</td><td>' + item.color + '</td><td>' + item.description + '</td><td><a href="mailto:' + item.contact + '" target="_blank">email</a></td></tr>';
    
    tableBody.innerHTML += row;
  }
}

document.addEventListener('DOMContentLoaded', function() {
  generateDeliveryTable();
  generateLostFoundTable();
});