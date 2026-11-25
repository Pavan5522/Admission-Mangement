
const API_URL = "https://nexora-admission-backend.onrender.com";

const $ = id => document.getElementById(id);


// Check student login
const token = localStorage.getItem("token");
const user = JSON.parse(localStorage.getItem("user") || "null");

if (!token || !user || user.role !== "student") {
    window.location.href = "login.html";
}


// Display logged-in student's email
if (user) {
    $("studentEmail").value = user.email;
}


// Submit Admission Application
$("admissionForm").addEventListener("submit", async function(event) {

    event.preventDefault();

    const photo = $("photo").files[0];
    const certificate = $("certificate").files[0];

    const message = $("formMessage");

    message.textContent = "";
    message.style.color = "#c0392b";


    // Check documents
    if (!photo || !certificate) {
        message.textContent =
            "Please upload your photo and certificate.";
        return;
    }


    // Check file sizes
    if (photo.size > 5 * 1024 * 1024 ||
        certificate.size > 5 * 1024 * 1024) {

        message.textContent =
            "Each document must be smaller than 5 MB.";
        return;
    }


    // Prepare form data
    const formData = new FormData();

    const fullName =
        $("firstName").value.trim() + " " +
        $("lastName").value.trim();

    formData.append("full_name", fullName);
    formData.append("phone", $("phone").value.trim());
    formData.append("date_of_birth", $("dob").value);
    formData.append("gender", $("gender").value);
    formData.append("address", $("address").value.trim());
    formData.append("qualification", $("qualification").value);
    formData.append("percentage", $("percentage").value);
    formData.append("passing_year", $("passingYear").value);
    formData.append("course", $("course").value);
    formData.append("study_mode", $("mode").value);

    formData.append("photo", photo);
    formData.append("certificate", certificate);


    try {

        message.style.color = "#173b7a";
        message.textContent = "Submitting your application...";


        const response = await fetch(`${API_URL}/api/admissions`, {

            method: "POST",

            headers: {
                "Authorization": `Bearer ${token}`
            },

            body: formData

        });


        const result = await response.json();


        if (!response.ok) {
            throw new Error(
                result.message || "Application submission failed."
            );
        }


        message.style.color = "#16854a";

        message.textContent =
            "Application submitted successfully! Application ID: " +
            result.applicationId;


        $("admissionForm").reset();

        $("studentEmail").value = user.email;


        // Automatically redirect to Student Dashboard
setTimeout(() => {
    window.location.href = "index.html?dashboard=student";
}, 2000);


    } catch (error) {

        console.error("Application submission error:", error);

        message.style.color = "#c0392b";

        message.textContent =
            error.message || "Unable to connect to the server.";

    }

});
