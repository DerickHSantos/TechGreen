//Menu
//Inicialização do menu dropdown
$('.ui.dropdown').dropdown();

//Inicialização da barra de pesquisa
$('.ui.search').search();

//Pegar do form
document.getElementById("loginForm").addEventListener("submit", function(event) {
    event.preventDefault();
  
    let email = document.getElementById("emailLogin").value;
    let senha = document.getElementById("senhaLogin").value;
  
    //Enviar requisição POST para a rota "/login" no servidor Node.js
    fetch("/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      //Converter
      body: JSON.stringify({ email, senha })
    })
      .then(response => {
        if (!response.ok) {
          throw new Error("Credenciais inválidas");
        }
        return response.json();
      })
      .then(data => {
        alert("Login feito com sucesso!")
        //Volta para página inicial
        document.location.href = "/index.html";
      })
      .catch(error => {
        console.error("Erro ao fazer login:", error);
        window.alert("Credenciais inválidas. Por favor, tente novamente.");
        document.getElementById("loginForm").reset();
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