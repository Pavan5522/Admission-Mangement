
// Nexora student authentication page
const API_URL = "https://nexora-admission-backend.onrender.com";

const $ = id => document.getElementById(id);


function setMessage(message, color = "#c0392b") {
    $("authMessage").textContent = message;
    $("authMessage").style.color = color;
}


// Show Login Form
function showLogin() {
    $("studentLoginForm").classList.remove("hidden");
    $("studentRegisterForm").classList.add("hidden");

    $("showLoginTab").classList.add("active");
    $("showRegisterTab").classList.remove("active");

    $("authTitle").textContent = "Student Login";
    $("authSubtitle").textContent =
        "Login to continue your admission application.";

    setMessage("");
}


// Show Registration Form
function showRegister() {
    $("studentLoginForm").classList.add("hidden");
    $("studentRegisterForm").classList.remove("hidden");

    $("showLoginTab").classList.remove("active");
    $("showRegisterTab").classList.add("active");

    $("authTitle").textContent = "Create Student Account";
    $("authSubtitle").textContent =
        "Register to start your admission application.";

    setMessage("");
}


// Student Login
$("studentLoginForm").addEventListener("submit", async function(event) {
    event.preventDefault();

    const email =
        $("studentLoginEmail").value.trim().toLowerCase();

    const password =
        $("studentLoginPassword").value;

    try {
        const response = await fetch(
            `${API_URL}/api/auth/login`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    email,
                    password
                })
            }
        );

        const result = await response.json();

        if (!response.ok) {
            setMessage(result.message || "Login failed.");
            return;
        }

        if (!result.token || !result.user) {
            setMessage("Invalid server response.");
            return;
        }

        if (result.user.role !== "student") {
            setMessage(
                "Student access only. Please use the correct login."
            );
            return;
        }

        localStorage.setItem("token", result.token);

        localStorage.setItem(
            "user",
            JSON.stringify(result.user)
        );

        window.location.href = "index.html?dashboard=student";

    } catch (error) {
        console.error("Student login error:", error);

        setMessage(
            "Cannot connect to the backend. Please try again."
        );
    }
});


// Student Registration
$("studentRegisterForm").addEventListener("submit", async function(event) {
    event.preventDefault();

    const full_name =
        $("studentRegisterName").value.trim();

    const email =
        $("studentRegisterEmail").value.trim().toLowerCase();

    const password =
        $("studentRegisterPassword").value;

    if (!full_name || !email || !password) {
        setMessage("Please fill all required fields.");
        return;
    }

    if (password.length < 8) {
        setMessage(
            "Password must contain at least 8 characters."
        );
        return;
    }

    try {
        const response = await fetch(
            `${API_URL}/api/auth/register`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    full_name,
                    email,
                    password
                })
            }
        );

        const result = await response.json();

        if (!response.ok) {
            setMessage(
                result.message || "Registration failed."
            );
            return;
        }

        $("studentRegisterForm").reset();

        showLogin();

        setMessage(
            "Registration successful! Please login.",
            "#16854a"
        );

    } catch (error) {
        console.error("Student registration error:", error);

        setMessage(
            "Cannot connect to the backend. Please try again."
        );
    }
});
