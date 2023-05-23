function login() {
    const username = document.querySelector("#username").value;
    const password = document.querySelector("#password").value;
    localStorage.setItem("username", username);
    localStorage.setItem("password", password);
    window.location.href = "select.html";
}

function signUp() {
    const username = document.querySelector("#username").value;
    const password = document.querySelector("#password").value;
    localStorage.setItem("username", username);
    localStorage.setItem("password", password);
    window.location.href = "select.html";
}