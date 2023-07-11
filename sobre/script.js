const menuButton = document.querySelector('.menu-button');
  const menuList = document.querySelector('.menu-list');

  menuButton.addEventListener('click', function() {
    
    menuList.classList.toggle('open'); 
  });