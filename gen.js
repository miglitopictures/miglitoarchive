// Selecionamos o elemento!
let element = document.getElementById('generated-page');

// Agora podemos editar o elemento, navegando suas propriedades com element.<propriedade>
element.style = "color: red";
element.classList.add('subtitle-text');

let mensagemDinamica = "Vic";
element.innerHTML = `<p>Meu nome eh ${mensagemDinamica}!</p>`;