document.addEventListener("DOMContentLoaded", function () {
    const authToken = localStorage.getItem('authToken');

    if (!authToken) {
        window.location.href = "./login/login.html";
    } else {
        document.body.style.display = "block";
    }
});

function logout() {
    localStorage.removeItem('authToken');
    location.reload();
}