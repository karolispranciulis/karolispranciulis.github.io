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
       SECTION SCROLL NAVIGATION
    ===================================================== */

    /*
     * Section wheel navigation:
     * - One physical wheel/trackpad gesture moves one section.
     * - A large delta is still only one move (no skipping).
     * - There is NO animation cooldown and NO animation lock.
     * - A new gesture can interrupt an animation immediately.
     * - A direction reversal is accepted immediately.
     *
     * The short idle window only separates physical gestures. It is
     * deliberately independent from the animation duration.
     */
    const sections = Array.from(
        document.querySelectorAll("main#site-root > section[id]")
    );

    if (sections.length > 1) {
        const nav = document.querySelector(".navbar");
        const GESTURE_IDLE_MS = 120;
        const ANIMATION_MS = 620;

        let targetIndex = 0;
        let gestureDirection = 0;
        let gestureTimer = null;
        let animationFrame = null;

        function navHeight() {
            return nav ? nav.getBoundingClientRect().height : 0;
        }

        function sectionTop(index) {
            const section = sections[index];
            return Math.max(
                0,
                section.getBoundingClientRect().top +
                    window.scrollY -
                    navHeight()
            );
        }

        function nearestSection() {
            const viewportMarker = window.scrollY + navHeight() + 2;
            let nearest = 0;
            let distance = Infinity;

            sections.forEach(function (section, index) {
                const top =
                    section.getBoundingClientRect().top + window.scrollY;
                const d = Math.abs(top - viewportMarker);

                if (d < distance) {
                    distance = d;
                    nearest = index;
                }
            });

            return nearest;
        }

        function ease(t) {
            return t < 0.5
                ? 4 * t * t * t
                : 1 - Math.pow(-2 * t + 2, 3) / 2;
        }

        function stopAnimation() {
            if (animationFrame !== null) {
                cancelAnimationFrame(animationFrame);
                animationFrame = null;
            }
        }

        function animateTo(index) {
            const clamped = Math.max(
                0,
                Math.min(sections.length - 1, index)
            );

            targetIndex = clamped;

            const startY = window.scrollY;
            const endY = sectionTop(clamped);
            const distance = endY - startY;

            stopAnimation();

            if (Math.abs(distance) < 1) {
                window.scrollTo(0, endY);
                return;
            }

            const startTime = performance.now();

            function frame(now) {
                const progress = Math.min(
                    1,
                    (now - startTime) / ANIMATION_MS
                );

                window.scrollTo(
                    0,
                    startY + distance * ease(progress)
                );

                if (progress < 1) {
                    animationFrame = requestAnimationFrame(frame);
                } else {
                    animationFrame = null;
                }
            }

            animationFrame = requestAnimationFrame(frame);
        }

        function finishGesture() {
            gestureDirection = 0;
            gestureTimer = null;
            targetIndex = nearestSection();
        }

        function markGesture(direction) {
            clearTimeout(gestureTimer);

            gestureTimer = setTimeout(
                finishGesture,
                GESTURE_IDLE_MS
            );

            /*
             * First event of a gesture:
             * move exactly one section.
             */
            if (gestureDirection === 0) {
                gestureDirection = direction;
                targetIndex = nearestSection();

                animateTo(targetIndex + direction);
                return;
            }

            /*
             * If the user reverses direction, treat it as a new
             * intentional gesture immediately. No cooldown.
             */
            if (direction !== gestureDirection) {
                gestureDirection = direction;
                targetIndex = nearestSection();

                animateTo(targetIndex + direction);
            }

            /*
             * Same-direction wheel events belong to the current
             * physical gesture and therefore do not stack.
             */
        }

        window.addEventListener(
            "wheel",
            function (event) {
                if (event.ctrlKey) return;

                /*
                 * Ignore horizontal gestures. This keeps horizontal
                 * project/carousel interactions independent.
                 */
                if (
                    Math.abs(event.deltaX) >
                    Math.abs(event.deltaY)
                ) {
                    return;
                }

                /*
                 * Do not hijack scrolling inside a vertically scrollable
                 * element if one is ever added later.
                 */
                const scrollable = event.target.closest(
                    ".editor-content, .ide-explorer, textarea, input, select"
                );

                if (scrollable) return;

                event.preventDefault();

                markGesture(event.deltaY > 0 ? 1 : -1);
            },
            { passive: false }
        );

        /*
         * Anchor links use the exact same animation, but do not create
         * a wheel gesture.
         */
        document
            .querySelectorAll('a[href^="#"]')
            .forEach(function (link) {
                link.addEventListener("click", function (event) {
                    const id = link.getAttribute("href").slice(1);
                    const index = sections.findIndex(function (section) {
                        return section.id === id;
                    });

                    if (index < 0) return;

                    event.preventDefault();

                    clearTimeout(gestureTimer);
                    gestureDirection = 0;

                    animateTo(index);

                    history.replaceState(
                        null,
                        "",
                        "#" + id
                    );
                });
            });

        /*
         * Keep keyboard section navigation consistent with wheel
         * navigation. Home/End remain direct jumps.
         */
        window.addEventListener("keydown", function (event) {
            if (event.defaultPrevented) return;

            if (
                event.key === "ArrowDown" ||
                event.key === "PageDown"
            ) {
                event.preventDefault();
                clearTimeout(gestureTimer);
                gestureDirection = 0;
                targetIndex = nearestSection();
                animateTo(targetIndex + 1);
            } else if (
                event.key === "ArrowUp" ||
                event.key === "PageUp"
            ) {
                event.preventDefault();
                clearTimeout(gestureTimer);
                gestureDirection = 0;
                targetIndex = nearestSection();
                animateTo(targetIndex - 1);
            } else if (event.key === "Home") {
                event.preventDefault();
                clearTimeout(gestureTimer);
                gestureDirection = 0;
                animateTo(0);
            } else if (event.key === "End") {
                event.preventDefault();
                clearTimeout(gestureTimer);
                gestureDirection = 0;
                animateTo(sections.length - 1);
            }
        });

        /*
         * If the page is opened directly with a hash, place the
         * corresponding section without animation.
         */
        if (window.location.hash) {
            const id = window.location.hash.slice(1);
            const index = sections.findIndex(function (section) {
                return section.id === id;
            });

            if (index >= 0) {
                requestAnimationFrame(function () {
                    window.scrollTo(0, sectionTop(index));
                    targetIndex = index;
                });
            } else {
                targetIndex = nearestSection();
            }
        } else {
            targetIndex = nearestSection();
        }
    }

})();
