function showUnderDevelopmentAlert() {
  alert("Feature under development. Coming soon.");
}

function loadIncludes() {
  const elementsToInclude = document.querySelectorAll('[data-include]');
  
  for (let i = 0; i < elementsToInclude.length; i++) {
    const element = elementsToInclude[i];
    const filePath = element.getAttribute('data-include');
    
    if (filePath) {
      fetch('/' + filePath).then(function(response) {
        return response.text();
      }).then(function(html) {
        element.innerHTML = html;
      });
    }
  }
}

function initMain() {
  loadIncludes();
  initNavLinks();
}

function initNavLinks() {
  const navLinks = document.querySelectorAll('nav a');

  for (let i = 0; i < navLinks.length; i++) {
    navLinks[i].addEventListener('click', function(event) {
    });
  }
}

document.addEventListener('DOMContentLoaded', function() {
  initMain();
});