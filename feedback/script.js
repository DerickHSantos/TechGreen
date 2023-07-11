const menuButton = document.querySelector('.menu-button');
  const menuList = document.querySelector('.menu-list');

  menuButton.addEventListener('click', function() {
    
    menuList.classList.toggle('open'); 
  });

  //Código do feedback
  const btnFeedback = document.getElementById('btnFeedback');
  let textoFeedback = document.getElementById('textoFeedback');

  btnFeedback.addEventListener('click', function (event) {
    event.preventDefault();
    alert("Feedback enviado com sucesso!")
  });

  // Código das estrelas 
  const ratingStars = document.getElementsByName('rating');
  let selectedRating;

  for (let i = 0; i < ratingStars.length; i++) {
    ratingStars[i].addEventListener('click', function () {
      selectedRating = this.value;
      console.log('Avaliação selecionada: ' + selectedRating);
    });
  }