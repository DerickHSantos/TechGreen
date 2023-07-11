const menuButton = document.querySelector('.menu-button');
const menuList = document.querySelector('.menu-list');
menuButton.addEventListener('click', function() {
  menuList.classList.toggle('open'); 
});

//Menu
//Inicialização do menu dropdown
$('.ui.dropdown').dropdown();

//Inicialização da barra de pesquisa
$('.ui.search').search();

//Enviar novos pontos de coleta para o banco de dados
document.getElementById("adicionarMarcadorForm").addEventListener("submit", function(event){
    event.preventDefault();
    let dbNome = document.getElementById("inserirTitulo").value;
    let dbCep = document.getElementById("inserirCep").value;
    
    //Enviar requisição POST para a rota "/enviar-feedback" setado no node.js
    fetch("/enviar-coleta", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      //Converter para enviar
      body: JSON.stringify({ dbNome, dbCep })
    })
    .then(response => response.json())
    .then(data => {
      window.alert("Ponto de Coleta adicionado com sucesso!");
      document.getElementById("inserirCep").value = "";
      document.getElementById("inserirTitulo").value = "";
    })
    .catch(error => {
      console.error("Erro ao adicionar ponto de coleta.", error);
      window.alert("Erro ao enviar pc, por favor tente novamente.");
    });
  });

//Apenas gerar o relatório uma vez para ter menos poluição visual
let relatorioGerado = false;

  document.getElementById("gerarRelatorio").addEventListener("submit", function(event){
    event.preventDefault();
    if (relatorioGerado === false)
    {
    //Fazer requisição GET para obter os feedbacks
    fetch('/feedbacks')
    .then(response => response.json())
    .then(feedbacks => {
      console.log(feedbacks);
      //Mostrar os feedbacks em formato de lista
      const feedbackList = document.getElementById('feedback-list');
      feedbacks.forEach(feedback => {
        const listItem = document.createElement('li');
        listItem.textContent = `Email: ${feedback.email}, Nota: ${feedback.nota}, Comentário: ${feedback.comentario}`;
        feedbackList.appendChild(listItem);
      });
    })
    .catch(error => {
      console.error('Erro ao obter os feedbacks:', error);
    });
    relatorioGerado = true;
  }
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