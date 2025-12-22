// To-do list:
// - [ ] Load navbar and footer using fetch

// Declare elements for undeveloped features
const companionshipLink = document.querySelector('#companionship-link');
const profileLink = document.querySelector('#profile-link');
const settingLink = document.querySelector('#setting-link');

// Function to show under development alert
function showUnderDevelopmentAlert(e) {
    e.preventDefault();
    alert("Feature under development. Coming soon.");
}
// Add event listeners for undeveloped features
if (companionshipLink) {
    companionshipLink.addEventListener('click', showUnderDevelopmentAlert);
}
if (profileLink) {
    profileLink.addEventListener('click', showUnderDevelopmentAlert);
}
if (settingLink) {
    settingLink.addEventListener('click', showUnderDevelopmentAlert);
}


// HTML includes content
const navbarHTML = `<nav class="navbar"><div class="navbar-brand"><a href="index.html">PeerGo</a></div><ul class="navbar-nav"><li><a href="dashboard.html" id="dashboard-link">Dashboard</a></li><li><a href="companionship.html" id="companionship-link">Companionship</a></li><li><a href="delivery.html" id="delivery-link">Delivery</a></li><li><a href="lostfound.html" id="lostfound-link">Lost & Found</a></li><li><a href="add.html" id="add-link">Add</a></li><li><a href="#" id="profile-link">Profile</a></li><li><a href="#" id="setting-link">Setting</a></li></ul></nav>`;
const footerHTML = `<footer class="footer"><small>© 2025 PeerGo</small></footer>`;
// Function to load HTML includes
function loadIncludes() {
    const navbarElement = document.querySelector('[data-include="components/navbar.html"]');
    const footerElement = document.querySelector('[data-include="components/footer.html"]');
    if (navbarElement) {
        navbarElement.innerHTML = navbarHTML;
    }
    if (footerElement) {
        footerElement.innerHTML = footerHTML;
    }
}
// Load components after page loads
document.addEventListener('DOMContentLoaded', loadIncludes);


