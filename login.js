document.getElementById("loginForm").addEventListener("submit", async function(event) {
    event.preventDefault();

    const loginData = {
        username: document.getElementById("username").value,
        password: document.getElementById("password").value,
    };

    try {
        const response = await fetch("http://127.0.0.1:3000/login", {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(loginData),
        });

        const result = await response.json();
        if (result.message === "Login successful") {
            alert("Login successful!");
            window.location.href = "index.html"; // Redirect to main page
        } else {
            alert("Login failed!");
        }
    } catch (error) {
        console.error("Error logging in:", error);
    }
});
