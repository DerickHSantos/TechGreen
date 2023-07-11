  //Código do menu
const menuButton = document.querySelector('.menu-button');
const menuList = document.querySelector('.menu-list');
menuButton.addEventListener('click', function() {
  menuList.classList.toggle('open'); 
}); 
  
  //Declarar a variável do mapa globalmente
  var map; 
  //Após o login bem-sucedido
  axios.get('/usuario')
  .then(response => {
    //Pegar o cep do usuario
    const usuario = response.data;
    const cepUsuario = usuario.cep;
    //Pegar os pontos de coleta
    axios.get('/pontos-coleta')
    .then(response => {
      const pontosColeta = response.data;
      exibirPontosColetaNoMapa(pontosColeta);
    })
    
    .catch(error => {
      console.error('Erro ao obter pontos de coleta:', error);
    });
    //Inicializar o mapa centralizado no cep do usuário 
    initMap(cepUsuario);
  })
  .catch(error => {
    console.error('Erro ao obter informações do usuário:', error);
  });
  
//Exibir os pontos de coleta do db no mapa
  function exibirPontosColetaNoMapa(pontosColeta) {
    pontosColeta.forEach(ponto => {
      //Obter coordenadas a partir do CEP usando a API Geocoding
      getCoordinatesFromCEP(ponto.cep)
        .then(coordinates => {
          const position = {
            lat: coordinates.latitude,
            lng: coordinates.longitude
          };
  
          new google.maps.Marker({
            position: position,
            map: map,
            title: ponto.nome
          });
        })
        .catch(error => {
          console.error('Erro ao obter coordenadas do CEP:', error);
        });
    });
  }
  
  //Função para obter transformar cep em coordenadas
  function getCoordinatesFromCEP(cep) {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${cep}&key=AIzaSyBexpx9CU1P4UFY6PSVWjVDBn15mQ5Kin4`;
  
    //Faz uma requisição HTTP para a API Geocoding
    return axios.get(url)
      .then(response => {
        const results = response.data.results;
        if (results.length > 0) {
          const location = results[0].geometry.location;
          const latitude = location.lat;
          const longitude = location.lng;
          return { latitude, longitude };
        } else {
          throw new Error('CEP inválido');
        }
      })
      .catch(error => {
        console.error('Erro ao obter coordenadas:', error);
      });
  }
  
  //Marcador padrão para não deixar o mapa em branco
    let markers = [
    {
      position: { lat: -19.918698522039413, lng: -43.93798276189918 },
      title: 'Sede TechGreen'
    },
];
    
  //Função para obter coordenadas do CEP da API do Google Maps
  function getCoordinatesFromCEP(cep) {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${cep}&key=AIzaSyBexpx9CU1P4UFY6PSVWjVDBn15mQ5Kin4`;
  
    return axios.get(url)
      .then(response => {
        const results = response.data.results;
        if (results.length > 0) {
          const location = results[0].geometry.location;
          if (location) {
            const latitude = location.lat;
            const longitude = location.lng;
            return { latitude, longitude };
          } else {
            throw new Error('Coordenadas não disponíveis');
          }
        } else {
          throw new Error('CEP inválido');
        }
      })
      .catch(error => {
        console.error('Erro ao obter coordenadas:', error);
      });
  }
  
  //Função para calcular distância usando a fórmula do haversine
  function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = toRadians(lat2 - lat1);
    const dLon = toRadians(lon2 - lon1);

    //Monte de conta complicada
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    const distance = R * c;
    //O importante é que retorna a distância
    return distance;
  }

  //Função converter graus em radianos
  function toRadians(degrees) {
    return degrees * (Math.PI / 180);
  }

  //Função para exibir a rota
  function displayRoute(origin, destination) {
    const directionsService = new google.maps.DirectionsService();
    const directionsDisplay = new google.maps.DirectionsRenderer();

    directionsDisplay.setMap(map);

    //Pega do modo de dirigir do Google Maps
    const request = {
      origin: origin,
      destination: destination,
      travelMode: google.maps.TravelMode.DRIVING
    };

    //Se tiver pegado, mostrar
    directionsService.route(request, function(result, status) {
      if (status === google.maps.DirectionsStatus.OK) {
        directionsDisplay.setDirections(result);
      } else {
        //Se não tiver pegado, não mostrar
        console.error('Falha ao calcular a rota:', status);
      }
    });
  }

  //Função para exibir mapa e os pontos de coleta
  function initMap(cepUsuario) {    
    //Fazer a requisição para obter as coordenadas do CEP do usuario
    getCoordinatesFromCEP(cepUsuario)
      .then(userCoordinates => {
        var myLatLng = {
          lat: -19.918698522039413,
          lng: -43.93798276189918
        };
        if (userCoordinates !== undefined) {
          myLatLng = {
            lat: userCoordinates.latitude,
            lng: userCoordinates.longitude
          };
          markerHome(userCoordinates.latitude, userCoordinates.longitude, cepUsuario);
        }
  
        map = new google.maps.Map(document.getElementById('map'), {
          zoom: 12,
          center: myLatLng
        });
  
        //Criar marcador para o usuário
        new google.maps.Marker({
          position: myLatLng,
          map: map,
          title: "Seu endereço"
        });
  
        //Mostrar os pontos no mapa
        markers.forEach(function(marker) {
          new google.maps.Marker({
            position: marker.position,
            map: map,
            title: marker.title
          });
        });
  
        //Executar ao confirmar formulário
        document.getElementById('cepForm').addEventListener('submit', function(event) {
          event.preventDefault();
          //Pegar o CEP do html
          const cep = document.getElementById('cepInput').value;
  
          //Pegar as coordenadas pelo CEP
          getCoordinatesFromCEP(cep)
            .then(userCoordinates => {
              //Clonar o array de marcadores
              let markersCopy = [...markers];
              //Remover o marcador do usuário do array da array para não atrapalhar nos cálculos de distância
              markersCopy.pop();
  
              //Calcular o ponto mais perto
              let nearestPoint = null;
              let nearestDistance = Infinity;
  
              markersCopy.forEach(function(marker) {
                //Pegar a distância
                const distance = calculateDistance(userCoordinates.latitude, userCoordinates.longitude, marker.position.lat, marker.position.lng);
                //Calcular o ponto mais perto
                if (distance < nearestDistance) {
                  nearestDistance = distance;
                  nearestPoint = marker.position;
                }
              });
  
              //Mostrar a rota para o ponto mais perto
              const distanceResultElement = document.getElementById('distanceResult');
              if (nearestPoint) {
                distanceResultElement.innerHTML = `Distância para o ponto mais próximo: ${nearestDistance.toFixed(2)} km<br>`;
                displayRoute(new google.maps.LatLng(userCoordinates.latitude, userCoordinates.longitude), new google.maps.LatLng(nearestPoint.lat, nearestPoint.lng));
              } else {
                distanceResultElement.innerHTML = 'Não foi possível calcular a distância.';
              }
            });
        });
  
        geocoder = new google.maps.Geocoder();
      })
      .catch(error => {
        console.error('Erro ao obter coordenadas do CEP:', error);
      });
  }

  //Função para criar um marcador na localização que usuário inseriu ao se cadastrar
  function markerHome(latitude, longitude, cep) {
    var markerHome = {
      position: {
        lat: latitude,
        lng: longitude
      },
      title: "Seu endereço"
    };
    markers.push(markerHome);
    document.getElementById("cepInput").value = cep;
  }
  //Função criar um novo marcador no mapa
  function newMarker() {
  //Pega os dados do html
  var address = document.getElementById("inserirCep").value;
  var titulo = document.getElementById("inserirTitulo").value;

  //Chama a função cepToCoor para obter as coordenadas do endereço
  cepToCoor(address, function(positionCoor) {
    //Atribui as informações no novo marcador
    var novoMarker = {
      position: {
        lat: positionCoor.lat,
        lng: positionCoor.lng
      },
      title: titulo
    };

    //Insere no array dos marcadores
    markers.push(novoMarker);
    //Coloca os pontos no localstorage
    localStorage.setItem("markers", JSON.stringify(markers));
    
    // Enviar os dados do novo ponto de coleta para o servidor
fetch('/enviar-coleta', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(novoMarker)
})
.then(response => response.json())
.then(data => {
})
.catch(error => {
  console.error('Erro ao enviar novo ponto de coleta:', error);
});

    //Insere o novo marcador no mapa
    var novoMarcadorMapa = new google.maps.Marker({
      position: novoMarker.position,
      title: novoMarker.title,
      map: map
    });
  });
  }

  //Função para converter o cep em coordenadas
  function cepToCoor(address, callback) {
  //Inicia a API do Geocoder
  var geocoder = new google.maps.Geocoder();

  //Tenta fazer a conversão
  geocoder.geocode({ 'address': address }, function(results, status) {
  //Se ok, tudo deu certo e atribui as coordenadas em variáveis
  if (status == google.maps.GeocoderStatus.OK) {
    var latitude = results[0].geometry.location.lat();
    var longitude = results[0].geometry.location.lng();

    var position = {
      lat: latitude,
      lng: longitude
    };
    callback(position);
  } else {
    //Se erro, hora de sentar e chorar
  alert("Não foi possível obter localização: " + status);
  }
  });
  }

  //Feedback
  let estrelasFeedback = "";
  $('.ui.star.rating')
  .rating({
    initialRating: 0,
    maxRating: 5,
    onRate: function(rating) {
      //Preparar pra passar pro banco
      estrelasFeedback = rating;
    }
  });


//Enviar feedback para o servidor (node.js com mysql)
document.getElementById("feedbackForm").addEventListener("submit", function(event){
  event.preventDefault();
  let nota = estrelasFeedback;
  let comentario = document.getElementById("textoFeedback").value;
  let email = document.getElementById("emailFeedback").value;
  
  //Enviar requisição POST para a rota "/enviar-feedback" setado no node.js
  fetch("/enviar-feedback", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    //Converter para enviar
    body: JSON.stringify({ email, nota, comentario })
  })
  .then(response => response.json())
  .then(data => {
    window.alert("Feedback enviado com sucesso!");
    document.getElementById("textoFeedback").value = "";
    document.getElementById("emailFeedback").value = "";
  })
  .catch(error => {
    console.error("Erro ao enviar dados de feedback.", error);
    window.alert("Erro ao enviar feedback, por favor tente novamente.");
  });
});

//Menu
//Inicialização do menu dropdown
$('.ui.dropdown').dropdown();

//Inicialização da barra de pesquisa
$('.ui.search').search();

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