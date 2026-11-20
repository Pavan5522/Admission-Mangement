
let users = JSON.parse(localStorage.getItem("users")) || [
    {
        name: "Demo Student",
        email: "student@nexora.com",
        password: "student123"
    }
];

let applications =
    JSON.parse(localStorage.getItem("applications")) || [];

const admin = {
    email: "admin@nexora.com",
    password: "admin123"
};

const $ = id => document.getElementById(id);


// Save browser data
function save() {
    localStorage.setItem("users", JSON.stringify(users));
    localStorage.setItem("applications", JSON.stringify(applications));
}


// Login Modal
function openLogin(type) {
    $("loginModal").style.display = "grid";
    $("loginModal").dataset.type = type;
    $("loginMessage").textContent = "";

    $("loginForm").classList.remove("hidden");
    $("registerForm").classList.add("hidden");

    if (type === "admin") {
        $("loginTitle").textContent = "Admin Login";
        $("loginText").textContent =
            "Login to manage admission applications.";
        $("loginIcon").textContent = "🛡️";
        $("tabs").classList.add("hidden");
        $("demo").textContent =
            "Admin: admin@nexora.com / admin123";
    } else {
        $("loginTitle").textContent = "Student Login";
        $("loginText").textContent =
            "Login to manage your admission application.";
        $("loginIcon").textContent = "👨‍🎓";
        $("tabs").classList.remove("hidden");
        $("demo").textContent =
            "Student: student@nexora.com / student123";
    }
}


function closeLogin() {
    $("loginModal").style.display = "none";
}


function showLogin() {
    $("loginForm").classList.remove("hidden");
    $("registerForm").classList.add("hidden");
}


function showRegister() {
    $("loginForm").classList.add("hidden");
    $("registerForm").classList.remove("hidden");
}


// Login Form
$("loginForm").onsubmit = async function(e) {
    e.preventDefault();

    const email = $("loginEmail").value.trim().toLowerCase();
    const password = $("loginPassword").value;
    const type = $("loginModal").dataset.type;

    try {
        const response = await fetch(
            "http://localhost:5000/api/auth/login",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    email: email,
                    password: password
                })
            }
        );

        const result = await response.json();

        if (!response.ok) {
            $("loginMessage").textContent =
                result.message || "Login failed.";
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

        // Save token and user details
        localStorage.setItem("token", result.token);
        localStorage.setItem("user", JSON.stringify(result.user));

        closeLogin();

        if (result.user.role === "admin") {
            adminDashboard();
        } else {
            studentDashboard();
        }

    } catch (error) {
        console.error("Login error:", error);
        $("loginMessage").textContent =
            "Cannot connect to backend.";
    }
};


// Registration Form
$("registerForm").onsubmit = async function(e) {
    e.preventDefault();

    const name = $("registerName").value.trim();
    const email = $("registerEmail").value.trim().toLowerCase();
    const password = $("registerPassword").value;

    try {
        const response = await fetch(
            "http://localhost:5000/api/auth/register",
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

        $("loginMessage").textContent =
            "Registration successful! Please login.";

        $("registerForm").reset();

        showLogin();

    } catch (error) {
        console.error("Registration error:", error);

        $("loginMessage").textContent =
            "Cannot connect to backend.";
    }
};


// Student Dashboard - Get Latest Status from MySQL

async function studentDashboard() {
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user"));

    if (!token || !user || user.role !== "student") {
        openLogin("student");
        return;
    }

    $("studentArea").classList.remove("hidden");
    $("adminArea").classList.add("hidden");

    const studentName = user.full_name || user.name || user.email;

    $("studentWelcome").textContent = `Welcome, ${studentName}`;
    $("studentAccount").textContent = studentName;
    $("studentEmail").value = user.email;

    try {
        const response = await fetch(
            "http://localhost:5000/api/admissions/student/me",
            {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            }
        );

        const row = await response.json();

        if (!response.ok) {
            throw new Error(row.message || "Could not load application.");
        }

        if (!row) {
            $("studentStatus").textContent = "Not Applied";
            $("appId").textContent = "-";
            $("appCourse").textContent = "-";
            $("appMode").textContent = "-";
            $("appStatus").textContent = "Not Applied";
            return;
        }

        $("studentStatus").textContent = row.application_status;
        $("appId").textContent = row.id;
        $("appCourse").textContent = row.course;
        $("appMode").textContent = row.study_mode;
        $("appStatus").textContent = row.application_status;

    } catch (error) {
        console.error("Student dashboard error:", error);

        $("studentStatus").textContent = "Unable to load status";
        $("formMessage").textContent = error.message;
    }
}

    

// Submit Admission Form to MySQL
$("admissionForm").onsubmit = async function(e) {
    e.preventDefault();

    const token = localStorage.getItem("token");

    if (!token) {
        $("formMessage").textContent = "Please login first.";
        return;
    }

    const fullName =
        $("firstName").value.trim() + " " +
        $("lastName").value.trim();

    const course = $("course").value;
    const mode = $("mode").value;

    try {
        const response = await fetch(
            "http://localhost:5000/api/admissions",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    full_name: fullName,
                    phone: $("phone").value,
                    course: course,
                    study_mode: mode
                })
            }
        );

        const result = await response.json();

        if (!response.ok) {
            $("formMessage").textContent =
                result.message || "Application submission failed.";
            return;
        }

        $("formMessage").textContent =
            "Application submitted successfully!";

        $("admissionForm").reset();

        await studentDashboard();

    } catch (error) {
        console.error("Submission error:", error);

        $("formMessage").textContent =
            "Cannot connect to the backend.";
    }
};


// Student Logout
function studentLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    $("studentArea").classList.add("hidden");
    window.scrollTo(0, 0);
}


// Admin Dashboard - Load Applications from MySQL
async function adminDashboard() {
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user"));

    if (!token || !user || user.role !== "admin") {
        openLogin("admin");
        return;
    }

    $("adminArea").classList.remove("hidden");
    $("studentArea").classList.add("hidden");

    try {
        const response = await fetch(
            "http://localhost:5000/api/admissions",
            {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            }
        );

        const rows = await response.json();

        if (!response.ok) {
            throw new Error(rows.message || "Could not load applications.");
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
            <td>${app.id}</td>
            <td>${app.name}</td>
            <td>${app.email}</td>
            <td>${app.course}</td>
            <td>${app.percentage || ""}${app.percentage ? "%" : ""}</td>
            <td>
                <span class="status status-${app.status}">
                    ${app.status}
                </span>
            </td>
            <td>
                <button class="action-btn approve"
                    onclick="changeStatus('${app.id}','Approved')">
                    Approve
                </button>

                <button class="action-btn reject"
                    onclick="changeStatus('${app.id}','Rejected')">
                    Reject
                </button>

                <button class="action-btn pending-btn"
                    onclick="changeStatus('${app.id}','Pending')">
                    Pending
                </button>
            </td>
        </tr>
    `).join("");

    $("noData").style.display = list.length ? "none" : "block";

    $("total").textContent = applications.length;

    $("pending").textContent =
        applications.filter(a => a.status === "Pending").length;

    $("approved").textContent =
        applications.filter(a => a.status === "Approved").length;

    $("rejected").textContent =
        applications.filter(a => a.status === "Rejected").length;
}


// Update Application Status in MySQL

async function changeStatus(id, status) {
    const token = localStorage.getItem("token");

    try {
        const response = await fetch(
            `http://localhost:5000/api/admissions/${id}/status`,
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
            alert(result.message || "Failed to update status.");
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
    window.scrollTo(0, 0);
}


// Initial Save
save();
