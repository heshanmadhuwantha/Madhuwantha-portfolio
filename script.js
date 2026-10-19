(function () {
    const menuToggle = document.querySelector(".menu-toggle");
    const navigation = document.getElementById("site-navigation");
    const contactForm = document.getElementById("contact-form");
    const submitButton = document.getElementById("submit-button");
    const formStatus = document.getElementById("form-status");
    const hero = document.querySelector(".hero");
    const heroStage = document.querySelector(".hero-stage");
    const heroVideo = document.querySelector(".hero-video");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    if (hero && heroStage && heroVideo) {
        let frameRequest = 0;
        let videoFrameRequest = 0;
        let metadataReady = false;
        let seekInFlight = false;
        let targetTime = 0;
        let lastCompletedTime = null;

        function disableHeroVideo() {
            heroVideo.hidden = true;
            metadataReady = false;
            hero.style.setProperty("--hero-scroll-distance", "0px");

            if (videoFrameRequest && heroVideo.cancelVideoFrameCallback) {
                heroVideo.cancelVideoFrameCallback(videoFrameRequest);
                videoFrameRequest = 0;
            }
        }

        function handleVideoError() {
            console.warn(
                "Hero background video could not be loaded or decoded; showing the static background.",
                heroVideo.error
            );
            disableHeroVideo();
        }

        function updateScrollTarget() {
            const scrollDistance =
                hero.offsetHeight - heroStage.offsetHeight;

            const scrollProgress =
                scrollDistance > 0
                    ? Math.max(0, Math.min(1, -hero.getBoundingClientRect().top / scrollDistance))
                    : 0;

            if (
                reducedMotion.matches ||
                !metadataReady ||
                !Number.isFinite(heroVideo.duration) ||
                heroVideo.duration <= 0
            ) {
                return;
            }

            targetTime = Math.min(
                scrollProgress * heroVideo.duration,
                Math.max(0, heroVideo.duration - 0.001)
            );

            seekToLatestTarget();
        }

        function monitorPresentedFrame() {
            if (
                videoFrameRequest ||
                document.hidden ||
                typeof heroVideo.requestVideoFrameCallback !== "function"
            ) {
                return;
            }

            videoFrameRequest = heroVideo.requestVideoFrameCallback(function (now, metadata) {
                videoFrameRequest = 0;
                heroVideo.dataset.frameMonitor = "video-frame-callback";
                heroVideo.dataset.presentedFrames = String(metadata.presentedFrames);
                heroVideo.dataset.presentedMediaTime = metadata.mediaTime.toFixed(3);
            });
        }

        function seekToLatestTarget() {
            if (
                reducedMotion.matches ||
                document.hidden ||
                !metadataReady ||
                seekInFlight ||
                heroVideo.seeking
            ) {
                return;
            }

            const frameDuration = 1 / 24;
            const currentTime =
                lastCompletedTime === null ? heroVideo.currentTime : lastCompletedTime;

            if (Math.abs(targetTime - currentTime) < frameDuration) {
                return;
            }

            // Keep only the latest scroll target; never queue decoder seeks on top of an active seek.
            seekInFlight = true;
            heroVideo.currentTime = targetTime;
            monitorPresentedFrame();
        }

        function requestHeroUpdate() {
            if (!frameRequest) {
                frameRequest = window.requestAnimationFrame(function () {
                    frameRequest = 0;
                    updateScrollTarget();
                });
            }
        }

        function handleMetadata() {
            if (!Number.isFinite(heroVideo.duration) || heroVideo.duration <= 0) {
                console.warn("Hero background video has no valid duration.");
                disableHeroVideo();
                return;
            }

            metadataReady = true;
            requestHeroUpdate();
        }

        function handleReducedMotionChange() {
            if (reducedMotion.matches) {
                heroVideo.autoplay = false;
                heroVideo.pause();
                disableHeroVideo();
                return;
            }

            hero.style.removeProperty("--hero-scroll-distance");
            heroVideo.hidden = false;
            metadataReady = false;
            seekInFlight = false;
            lastCompletedTime = null;
            heroVideo.preload = "auto";
            heroVideo.autoplay = true;
            heroVideo.load();
            requestHeroUpdate();
        }

        heroVideo.addEventListener("loadedmetadata", handleMetadata);
        heroVideo.addEventListener("canplay", function () {
            requestHeroUpdate();
        });
        heroVideo.addEventListener("playing", function () {
            heroVideo.pause();
        });
        heroVideo.addEventListener("seeking", function () {
            seekInFlight = true;
        });
        heroVideo.addEventListener("seeked", function () {
            seekInFlight = false;
            lastCompletedTime = heroVideo.currentTime;

            if (typeof heroVideo.requestVideoFrameCallback !== "function" && heroVideo.getVideoPlaybackQuality) {
                const quality = heroVideo.getVideoPlaybackQuality();
                heroVideo.dataset.frameMonitor = "playback-quality";
                heroVideo.dataset.presentedFrames = String(quality.totalVideoFrames);
                heroVideo.dataset.droppedFrames = String(quality.droppedVideoFrames);
            }

            requestHeroUpdate();
        });
        heroVideo.addEventListener("error", handleVideoError);

        window.addEventListener("scroll", requestHeroUpdate, { passive: true });
        window.addEventListener("resize", requestHeroUpdate, { passive: true });
        reducedMotion.addEventListener("change", handleReducedMotionChange);
        document.addEventListener("visibilitychange", function () {
            if (document.hidden) {
                if (frameRequest) {
                    window.cancelAnimationFrame(frameRequest);
                    frameRequest = 0;
                }

                if (videoFrameRequest && heroVideo.cancelVideoFrameCallback) {
                    heroVideo.cancelVideoFrameCallback(videoFrameRequest);
                    videoFrameRequest = 0;
                }

                return;
            }

            requestHeroUpdate();
        });

        if (reducedMotion.matches) {
            handleReducedMotionChange();
        } else {
            heroVideo.preload = "auto";
            heroVideo.autoplay = true;
            heroVideo.load();
            requestHeroUpdate();
        }
    }

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
                submitButton.textContent = "Start a Project ↗";
            });
    });
})();