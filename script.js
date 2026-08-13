(function () {
    "use strict";

    /* =====================================================
       NAVIGATION
    ===================================================== */

    document.querySelectorAll(".nav-links a").forEach(function (link) {
        link.addEventListener("click", function () {
            document.querySelector(".nav-links")?.classList.remove("open");
        });
    });


    /* =====================================================
       PROJECT CAROUSEL
    ===================================================== */

    const viewport = document.getElementById("projects-viewport");
    const track = document.getElementById("projects-track");
    const previousButton = document.querySelector(".carousel-prev");
    const nextButton = document.querySelector(".carousel-next");
    const dotsContainer = document.getElementById("carousel-dots");
    const projectsSection = document.getElementById("projects");

    let carouselReady = false;
    let originalItems = [];
    let currentIndex = 0;
    let autoPlay = null;

    function getVisibleCount() {
        return window.innerWidth <= 900 ? 1 : 2;
    }

    function updatePosition(animate) {
        if (!track || !track.children.length) return;

        const firstCard = track.querySelector(".project-item");
        if (!firstCard) return;

        const cardWidth = firstCard.getBoundingClientRect().width;
        const gap = parseFloat(getComputedStyle(track).gap) || 0;

        track.style.transition = animate
            ? "transform .55s cubic-bezier(.22,.61,.36,1)"
            : "none";

        track.style.transform =
            "translateX(-" + currentIndex * (cardWidth + gap) + "px)";

        if (!animate) {
            requestAnimationFrame(function () {
                track.style.transition =
                    "transform .55s cubic-bezier(.22,.61,.36,1)";
            });
        }

        updateDots();
    }

    function updateDots() {
        if (!dotsContainer || !originalItems.length) return;

        const visible = getVisibleCount();
        let realIndex = currentIndex - visible;

        realIndex =
            (realIndex % originalItems.length + originalItems.length) %
            originalItems.length;

        dotsContainer.querySelectorAll(".carousel-dot").forEach(function (dot, index) {
            dot.classList.toggle("active", index === realIndex);
        });
    }

    function createDots() {
        if (!dotsContainer) return;

        dotsContainer.innerHTML = "";

        originalItems.forEach(function (_, index) {
            const dot = document.createElement("button");
            dot.type = "button";
            dot.className = "carousel-dot";
            dot.setAttribute("aria-label", "Go to project " + (index + 1));

            dot.addEventListener("click", function () {
                currentIndex = getVisibleCount() + index;
                updatePosition(true);
                restartAutoPlay();
            });

            dotsContainer.appendChild(dot);
        });
    }

    function createLoop() {
        if (!track) return;

        const visible = getVisibleCount();
        track.innerHTML = "";

        originalItems.slice(-visible).forEach(function (item) {
            track.appendChild(item.cloneNode(true));
        });

        originalItems.forEach(function (item) {
            track.appendChild(item.cloneNode(true));
        });

        originalItems.slice(0, visible).forEach(function (item) {
            track.appendChild(item.cloneNode(true));
        });

        currentIndex = visible;
        updatePosition(false);
        createDots();
    }

    function nextProject() {
        if (!carouselReady) return;
        currentIndex++;
        updatePosition(true);
    }

    function previousProject() {
        if (!carouselReady) return;
        currentIndex--;
        updatePosition(true);
    }

    function startAutoPlay() {
        if (!carouselReady) return;
        clearInterval(autoPlay);
        autoPlay = setInterval(nextProject, 5000);
    }

    function restartAutoPlay() {
        startAutoPlay();
    }

    if (viewport && track) {
        originalItems = Array.from(track.querySelectorAll(".project-item"));

        if (originalItems.length > 1) {
            carouselReady = true;

            createLoop();
            startAutoPlay();

            nextButton?.addEventListener("click", function () {
                nextProject();
                restartAutoPlay();
            });

            previousButton?.addEventListener("click", function () {
                previousProject();
                restartAutoPlay();
            });

            viewport.addEventListener("mouseenter", function () {
                clearInterval(autoPlay);
            });

            viewport.addEventListener("mouseleave", function () {
                startAutoPlay();
            });

            track.addEventListener("transitionend", function () {
                const visible = getVisibleCount();
                const total = originalItems.length;

                if (currentIndex >= total + visible) {
                    currentIndex = visible;
                    updatePosition(false);
                } else if (currentIndex < visible) {
                    currentIndex = total + visible - 1;
                    updatePosition(false);
                }
            });

            let resizeTimer;

            window.addEventListener("resize", function () {
                clearTimeout(resizeTimer);
                resizeTimer = setTimeout(createLoop, 150);
            });

            /*
             * Do not capture the mouse wheel here. Vertical wheel/trackpad
             * input must always remain normal page scrolling. Use the
             * arrows (and touch swipe) to control the project carousel.
             */

            /* Touch swipe on mobile. */
            let touchStartX = 0;

            viewport.addEventListener("touchstart", function (event) {
                touchStartX = event.touches[0].clientX;
            }, { passive: true });

            viewport.addEventListener("touchend", function (event) {
                const touchEndX = event.changedTouches[0].clientX;
                const distance = touchEndX - touchStartX;

                if (Math.abs(distance) < 45) return;

                if (distance < 0) {
                    nextProject();
                } else {
                    previousProject();
                }

                restartAutoPlay();
            }, { passive: true });
        } else {
            /* There is currently one project. Keep the layout ready for more. */
            if (previousButton) previousButton.disabled = true;
            if (nextButton) nextButton.disabled = true;
            if (dotsContainer) dotsContainer.style.display = "none";
        }
    }


    /* =====================================================
       PROJECT SECTION REVEAL
    ===================================================== */

    if (projectsSection) {
        const observer = new IntersectionObserver(
            function (entries) {
                entries.forEach(function (entry) {
                    if (!entry.isIntersecting) return;

                    const wrap = entry.target.querySelector(".projects-carousel-wrap");
                    if (!wrap) return;

                    wrap.classList.remove("is-revealing");
                    void wrap.offsetWidth;
                    wrap.classList.add("is-revealing");
                });
            },
            { threshold: 0.25 }
        );

        observer.observe(projectsSection);
    }


    /* =====================================================
       PAGE SCROLLING
    ===================================================== */

    /*
     * Intentionally do not intercept wheel events here.
     * The browser owns page scrolling so users can scroll as
     * quickly or as slowly as they want without a cooldown,
     * preventDefault(), or forced section jumps.
     */

})();
