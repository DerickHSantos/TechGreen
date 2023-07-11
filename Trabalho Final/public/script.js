document.addEventListener('DOMContentLoaded', function () {

  // Código das estrelas 
  const ratingStars = document.getElementsByName('rating');
  let selectedRating;

  for (let i = 0; i < ratingStars.length; i++) {
    ratingStars[i].addEventListener('click', function () {
      selectedRating = this.value;
      console.log('Avaliação selecionada: ' + selectedRating);
    });
  }

  //Código do feedback
  const btnFeedback = document.getElementById('btnFeedback');
  let textoFeedback = document.getElementById('textoFeedback');

  btnFeedback.addEventListener('click', function () {
    preven
    let textoFeedbackValue = textoFeedback.value;
    console.log(textoFeedbackValue);
  });

  //Código do menu

  const menuButton = document.querySelector('.menu-button');
  const menuList = document.querySelector('.menu-list');
  const imgFundo = document.querySelector('.containerImagemFundo1');

  menuButton.addEventListener('click', function() {
    imgFundo.style.display = (imgFundo.style.display === 'none') ? 'block' : 'none';
    if(imgFundo.style.display === 'block'){
      menuList.style.padding = 0;
    }else if(imgFundo.style.display === 'none'){
      menuList.style.padding = '3%';
    }
    menuList.classList.toggle('open'); 
  });
});

//Setar tema Claro como padrão
function verificarTema(){
  if(localStorage.temaClaroLocal == undefined)
    localStorage.setItem("temaClaroLocal", "true");
  //Verificar se o usuário já tinha preferido o tema escuro
  if(localStorage.temaClaroLocal == "false")
    temaEscuro();
}

//Trocar entre tema claro e escuro ao apertar no botão que não é um botão e que na verdade está no menu superior
function trocarTema(){
  if (localStorage.temaClaroLocal == "true")
    temaEscuro();
  else
    temaClaro();
}

function temaClaro(){
  document.body.style.backgroundColor = "#ffffff";
  document.body.style.color = "black";
  localStorage.setItem("temaClaroLocal", "true");
  document.getElementById("temaBotao").textContent = "Tema Escuro";
}
function temaEscuro(){
  document.body.style.backgroundColor = "#161616";
  document.body.style.color = "aliceblue";
  localStorage.setItem("temaClaroLocal", "false");
  document.getElementById("temaBotao").textContent = "Tema Claro";
}

//Propriedade de ©TechGrenn, Todos os direitos reservados, 2023