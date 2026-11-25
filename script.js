
// Backend URL
const API_URL = "https://nexora-admission-backend.onrender.com";

let applications = [];

const $ = id => document.getElementById(id);


// Scroll to dashboard
function goToDashboard(id) {
    const section = $(id);

    if (section) {
        section.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
    }
}


// Open Login
function openLogin(type) {
    if (type === "student") {
        window.location.href = "login.html";
        return;
    }

    const modal = $("loginModal");

    if (!modal) return;

    modal.dataset.type = "admin";

    $("loginTitle").textContent = "Admin Login";
    $("loginText").textContent =
        "Login to manage student applications.";

    $("loginIcon").textContent = "🔐";

    $("tabs").classList.add("hidden");
    $("registerForm").classList.add("hidden");
    $("loginForm").classList.remove("hidden");

    $("loginMessage").textContent = "";

    modal.style.display = "grid";
}


// Close Login Modal
function closeLogin() {
    if ($("loginModal")) {
        $("loginModal").style.display = "none";
    }
}


// Show Login Form
function showLogin() {
    $("loginForm").classList.remove("hidden");
    $("registerForm").classList.add("hidden");

    if ($("loginTab")) {
        $("loginTab").classList.add("active");
    }

    if ($("registerTab")) {
        $("registerTab").classList.remove("active");
    }

    $("loginMessage").textContent = "";
}


// Show Registration Form
function showRegister() {
    $("loginForm").classList.add("hidden");
    $("registerForm").classList.remove("hidden");

    if ($("loginTab")) {
        $("loginTab").classList.remove("active");
    }

    if ($("registerTab")) {
        $("registerTab").classList.add("active");
    }

    $("loginMessage").textContent = "";
}


// Login Form
if ($("loginForm")) {
    $("loginForm").onsubmit = async function(e) {
        e.preventDefault();

        const email = $("loginEmail").value.trim().toLowerCase();
        const password = $("loginPassword").value;
        const type = $("loginModal").dataset.type;

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
                $("loginMessage").textContent =
                    result.message || "Login failed.";
                return;
            }

            if (!result.token || !result.user) {
                $("loginMessage").textContent =
                    "Invalid server response.";
                return;
            }

            // Check user role
            if (type === "admin" && result.user.role !== "admin") {
                $("loginMessage").textContent =
                    "Admin access only.";
                return;
            }

            if (type === "student" && result.user.role !== "student") {
                $("loginMessage").textContent =
                    "Student access only.";
                return;
            }

            // Save login details
            localStorage.setItem("token", result.token);

            localStorage.setItem(
                "user",
                JSON.stringify(result.user)
            );

            closeLogin();

            if (result.user.role === "admin") {
                await adminDashboard();
            } else {
                await studentDashboard();
            }

        } catch (error) {
            console.error("Login error:", error);

            $("loginMessage").textContent =
                "Cannot connect to backend.";
        }
    };
}


// Registration Form
if ($("registerForm")) {
    $("registerForm").onsubmit = async function(e) {
        e.preventDefault();

        const name = $("registerName").value.trim();
        const email = $("registerEmail").value.trim().toLowerCase();
        const password = $("registerPassword").value;

        if (!name || !email || !password) {
            $("loginMessage").textContent =
                "Please fill all required fields.";
            return;
        }

        if (password.length < 8) {
            $("loginMessage").textContent =
                "Password must contain at least 8 characters.";
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
                        full_name: name,
                        email: email,
                        password: password
                    })
                }
            );

            const result = await response.json();

            if (!response.ok) {
                $("loginMessage").textContent =
                    result.message || "Registration failed.";
                return;
            }

            $("registerForm").reset();

            showLogin();

            $("loginMessage").style.color = "green";

            $("loginMessage").textContent =
                "Registration successful! Please login.";

        } catch (error) {
            console.error("Registration error:", error);

            $("loginMessage").textContent =
                "Cannot connect to backend.";
        }
    };
}


// Student Dashboard
async function studentDashboard() {
    const token = localStorage.getItem("token");

    const user = JSON.parse(
        localStorage.getItem("user") || "null"
    );

    if (!token || !user || user.role !== "student") {
        window.location.href = "login.html";
        return;
    }

    $("studentArea").classList.remove("hidden");
    $("adminArea").classList.add("hidden");

    const studentName =
        user.full_name || user.name || user.email;

    $("studentWelcome").textContent =
        `Welcome, ${studentName}`;

    $("studentAccount").textContent = studentName;

    if ($("studentEmail")) {
        $("studentEmail").value = user.email;
    }

    // Show dashboard
    goToDashboard("studentArea");

    try {
        const response = await fetch(
            `${API_URL}/api/admissions/student/me`,
            {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            }
        );

        const row = await response.json();

        if (!response.ok) {
            throw new Error(
                row.message || "Could not load application."
            );
        }

        if (!row || !row.id) {
            $("studentStatus").textContent = "Not Applied";
            $("appId").textContent = "-";
            $("appCourse").textContent = "-";
            $("appMode").textContent = "-";
            $("appStatus").textContent = "Not Applied";

            return;
        }

        $("studentStatus").textContent =
            row.application_status;

        $("appId").textContent = row.id;
        $("appCourse").textContent = row.course;
        $("appMode").textContent = row.study_mode;

        $("appStatus").textContent =
            row.application_status;

    } catch (error) {
        console.error("Student dashboard error:", error);

        $("studentStatus").textContent =
            "Unable to load status";

        if ($("formMessage")) {
            $("formMessage").textContent = error.message;
        }
    }
}


// Student Logout
function studentLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    $("studentArea").classList.add("hidden");

    window.location.href = "index.html";
}


// Admin Dashboard
async function adminDashboard() {
    const token = localStorage.getItem("token");

    const user = JSON.parse(
        localStorage.getItem("user") || "null"
    );

    if (!token || !user || user.role !== "admin") {
        openLogin("admin");
        return;
    }

    $("adminArea").classList.remove("hidden");
    $("studentArea").classList.add("hidden");

    // Show dashboard
    goToDashboard("adminArea");

    try {
        const response = await fetch(
            `${API_URL}/api/admissions`,
            {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            }
        );

        const rows = await response.json();

        if (!response.ok) {
            throw new Error(
                rows.message || "Could not load applications."
            );
        }

        applications = rows.map(row => ({
            id: row.id,
            name: row.full_name,
            email: row.email,
            phone: row.phone,
            course: row.course,
            mode: row.study_mode,
            status: row.application_status,
            date: row.created_at
        }));

        displayApplications();

    } catch (error) {
        console.error("Admin dashboard error:", error);

        $("applicationList").innerHTML =
            '<tr><td colspan="7">Unable to load applications.</td></tr>';
    }
}


// Escape HTML before displaying database values
function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, character => {
        const characters = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#039;"
        };

        return characters[character];
    });
}


// Display Applications
function displayApplications() {
    const search = $("search").value.trim().toLowerCase();
    const filter = $("filter").value;

    const list = applications.filter(app => {
        const text = (
            app.id + " " + app.name + " " + app.email
        ).toLowerCase();

        const searchMatch = text.includes(search);

        const filterMatch =
            filter === "All" || app.status === filter;

        return searchMatch && filterMatch;
    });

    $("applicationList").innerHTML = list.map(app => `
        <tr>
            <td>${escapeHTML(app.id)}</td>
            <td>${escapeHTML(app.name)}</td>
            <td>${escapeHTML(app.email)}</td>
            <td>${escapeHTML(app.course)}</td>
            <td>-</td>

            <td>
                <span class="status">
                    ${escapeHTML(app.status)}
                </span>
            </td>

            <td>
                <button class="action-btn approve"
                    onclick="changeStatus('${escapeHTML(app.id)}','Approved')">
                    Approve
                </button>

                <button class="action-btn reject"
                    onclick="changeStatus('${escapeHTML(app.id)}','Rejected')">
                    Reject
                </button>

                <button class="action-btn pending-btn"
                    onclick="changeStatus('${escapeHTML(app.id)}','Pending')">
                    Pending
                </button>
            </td>
        </tr>
    `).join("");

    $("noData").style.display =
        list.length ? "none" : "block";

    $("total").textContent = applications.length;

    $("pending").textContent =
        applications.filter(a => a.status === "Pending").length;

    $("approved").textContent =
        applications.filter(a => a.status === "Approved").length;

    $("rejected").textContent =
        applications.filter(a => a.status === "Rejected").length;
}


// Update Application Status
async function changeStatus(id, status) {
    const token = localStorage.getItem("token");

    try {
        const response = await fetch(
            `${API_URL}/api/admissions/${id}/status`,
            {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ status })
            }
        );

        const result = await response.json();

        if (!response.ok) {
            alert(
                result.message || "Failed to update status."
            );
            return;
        }

        await adminDashboard();

    } catch (error) {
        console.error("Status update error:", error);

        alert("Cannot connect to the backend server.");
    }
}


// Admin Logout
function adminLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    $("adminArea").classList.add("hidden");

    window.location.href = "index.html";
}


// Open the correct dashboard after login
window.addEventListener("DOMContentLoaded", () => {

    const params = new URLSearchParams(window.location.search);

    const dashboard = params.get("dashboard");

    if (dashboard === "student") {
        studentDashboard();
    }

    if (dashboard === "admin") {
        adminDashboard();
    }

});
