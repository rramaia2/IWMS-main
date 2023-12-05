document.addEventListener('DOMContentLoaded', function () {
    const usernameDisplayElement = document.getElementById('usernamePlaceholder');
    const userID = localStorage.getItem("userID");
    const storedUsername = localStorage.getItem('username');
    
    if (usernameDisplayElement && storedUsername) {
        usernameDisplayElement.textContent = storedUsername;
    }
});