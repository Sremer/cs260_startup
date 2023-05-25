function login() {
    const username = document.querySelector("#username").value;
    const password = document.querySelector("#password").value;
    localStorage.setItem("username", username);
    localStorage.setItem("password", password);

    const title = document.querySelector('h1');
    title.classList.add('exitTitle');
    const main = document.querySelector('section');
    main.classList.add('exitFields');

    setTimeout(()=>{
        window.location.href = "select.html";
    }, 1200);
}

function signUp() {
    const username = document.querySelector("#username").value;
    const password = document.querySelector("#password").value;
    localStorage.setItem("username", username);
    localStorage.setItem("password", password);
    
    const title = document.querySelector('h1');
    title.classList.add('exitTitle');
    const main = document.querySelector('section');
    main.classList.add('exitFields');

    setTimeout(()=>{
        window.location.href = "select.html";
    }, 1200);
}

