async function loginOrSignUp(endpoint) {
    const username = document.querySelector("#username").value;
    const password = document.querySelector("#password").value;
    const response = await fetch(endpoint, {
        method: 'post',
        body: JSON.stringify({ username: username, password: password }),
        headers: {
          'Content-type': 'application/json; charset=UTF-8',
        },
    });

    if (response.ok) {
        localStorage.setItem('username', username);
        
        setExitText();

        setTimeout(()=>{
            window.location.href = "select.html";
        }, 1200);

    } else {
        const body = await response.json();
        alert(body.msg);
    }
}

function setExitText() {
    const title = document.querySelector('h1');
    title.classList.add('exitTitle');
    const main = document.querySelector('section');
    main.classList.add('exitFields');
}

function login() {
    loginOrSignUp(`/api/auth/login`);
}

function signUp() {
    loginOrSignUp(`/api/auth/signUp`);
}

function getQuote() {
    fetch('https://api.quotable.io/random')
        .then((response) => response.json())
        .then((data) => {
            let quote = `\"` + data.content + `\" -` + data.author;
            
            document.querySelector('h3').textContent = quote;
        })
}

getQuote();
