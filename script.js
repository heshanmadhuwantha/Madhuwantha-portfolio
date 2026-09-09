(function () {
    const menuToggle = document.querySelector(".menu-toggle");
    const navigation = document.getElementById("site-navigation");
    const contactForm = document.getElementById("contact-form");
    const submitButton = document.getElementById("submit-button");
    const formStatus = document.getElementById("form-status");

    // Initialize EmailJS
    if (window.emailjs) {
        emailjs.init("ptKT5rJCZ0MLGS7sw");
    }

    // Close mobile navigation
    function closeMenu() {
        if (!menuToggle || !navigation) return;

        menuToggle.setAttribute("aria-expanded", "false");
        menuToggle.setAttribute("aria-label", "Open navigation menu");
        navigation.classList.remove("is-open");
    }

    // Mobile navigation
    if (menuToggle && navigation) {
        menuToggle.addEventListener("click", function () {
            const isOpen =
                menuToggle.getAttribute("aria-expanded") === "true";

            menuToggle.setAttribute("aria-expanded", String(!isOpen));

            menuToggle.setAttribute(
                "aria-label",
                isOpen
                    ? "Open navigation menu"
                    : "Close navigation menu"
            );

            navigation.classList.toggle("is-open", !isOpen);
        });

        // Close menu after clicking a navigation link
        navigation.querySelectorAll("a").forEach(function (link) {
            link.addEventListener("click", closeMenu);
        });

        // Close menu when clicking outside
        document.addEventListener("click", function (event) {
            if (
                !navigation.contains(event.target) &&
                !menuToggle.contains(event.target)
            ) {
                closeMenu();
            }
        });
    }

    // Stop here if the contact form is not available
    if (!contactForm || !submitButton || !formStatus) return;

    // Contact form submission
    contactForm.addEventListener("submit", function (event) {
        event.preventDefault();

        // Check EmailJS availability
        if (!window.emailjs) {
            formStatus.textContent =
                "Unable to send your message right now. Please try again later.";

            formStatus.className = "form-status error";
            return;
        }

        // Prevent duplicate submissions
        submitButton.disabled = true;
        submitButton.textContent = "Sending...";

        formStatus.textContent = "";
        formStatus.className = "form-status";

        // Send form using EmailJS
        emailjs
            .sendForm(
                "service_qf0e1bm",
                "template_5w8qut3",
                contactForm
            )
            .then(function () {
                // Clear form after successful submission
                contactForm.reset();

                formStatus.textContent =
                    "Message sent successfully. Thank you for reaching out.";

                formStatus.className = "form-status success";
            })
            .catch(function (error) {
                console.error(
                    "EmailJS submission failed:",
                    error
                );

                formStatus.textContent =
                    "Unable to send your message right now. Please try again later.";

                formStatus.className = "form-status error";
            })
            .finally(function () {
                // Restore button
                submitButton.disabled = false;
                submitButton.textContent = "✈ Send Message";
            });
    });
})();