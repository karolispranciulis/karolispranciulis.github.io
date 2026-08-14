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
     * One wheel gesture = one section.
     *
     * There is deliberately NO time cooldown and no animation lock.
     * Instead, a gesture is defined by a short period of wheel inactivity.
     * A strong mouse-wheel tick or a large trackpad delta still produces
     * only one section move, while a completely new gesture can immediately
     * move again. This prevents accidental multi-section skipping without
     * making the page feel locked.
     */
    const sections = Array.from(
        document.querySelectorAll("main#site-root > section[id]")
    );

    if (sections.length) {
        const nav = document.querySelector(".navbar");
        const gestureGap = 110;
        const scrollDuration = 650;

        let currentIndex = 0;
        let gestureTimer = null;
        let gestureActive = false;
        let lastDirection = 0;
        let animationFrame = null;

        function navOffset() {
            return nav ? nav.getBoundingClientRect().height : 0;
        }

        function sectionY(index) {
            const section = sections[index];
            return Math.max(
                0,
                section.getBoundingClientRect().top + window.scrollY - navOffset()
            );
        }

        function nearestIndex() {
            const marker = window.scrollY + navOffset() + 2;
            let best = 0;
            let distance = Infinity;

            sections.forEach(function (section, index) {
                const d = Math.abs(
                    section.getBoundingClientRect().top + window.scrollY - marker
                );
                if (d < distance) {
                    distance = d;
                    best = index;
                }
            });

            return best;
        }

        function easeInOutCubic(t) {
            return t < 0.5
                ? 4 * t * t * t
                : 1 - Math.pow(-2 * t + 2, 3) / 2;
        }

        function animateTo(index) {
            const target = Math.max(0, Math.min(sections.length - 1, index));
            const start = window.scrollY;
            const end = sectionY(target);
            const distance = end - start;

            currentIndex = target;

            if (animationFrame) {
                cancelAnimationFrame(animationFrame);
                animationFrame = null;
            }

            if (Math.abs(distance) < 1) {
                window.scrollTo(0, end);
                return;
            }

            const started = performance.now();

            function frame(now) {
                const progress = Math.min(1, (now - started) / scrollDuration);
                const eased = easeInOutCubic(progress);

                window.scrollTo(0, start + distance * eased);

                if (progress < 1) {
                    animationFrame = requestAnimationFrame(frame);
                } else {
                    animationFrame = null;
                }
            }

            animationFrame = requestAnimationFrame(frame);
        }

        function beginGesture(direction) {
            /* Repeated wheel events belonging to the same physical gesture
               must NOT stack multiple section jumps. There is no time-based
               animation cooldown: the latch only waits for the wheel burst
               to end. A direction reversal is accepted immediately. */
            if (gestureActive && direction === lastDirection) {
                clearTimeout(gestureTimer);
                gestureTimer = setTimeout(endGesture, gestureGap);
                return;
            }

            currentIndex = nearestIndex();
            gestureActive = true;
            lastDirection = direction;

            const next = Math.max(
                0,
                Math.min(sections.length - 1, currentIndex + direction)
            );

            if (next !== currentIndex) {
                animateTo(next);
            }

            clearTimeout(gestureTimer);
            gestureTimer = setTimeout(endGesture, gestureGap);
        }

        function endGesture() {
            gestureActive = false;
            lastDirection = 0;
            currentIndex = nearestIndex();
            gestureTimer = null;
        }

        /* Only the homepage wheel is handled. IDE/project pages are untouched. */
        window.addEventListener("wheel", function (event) {
            if (event.ctrlKey) return;
            if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;
            if (!sections.length) return;

            event.preventDefault();
            beginGesture(event.deltaY > 0 ? 1 : -1);
        }, { passive: false });

        /* Explicit anchor navigation is always smooth. */
        document.querySelectorAll('a[href^="#"]').forEach(function (link) {
            link.addEventListener("click", function (event) {
                const id = link.getAttribute("href").slice(1);
                const index = sections.findIndex(function (section) {
                    return section.id === id;
                });

                if (index === -1) return;

                event.preventDefault();
                gestureActive = false;
                clearTimeout(gestureTimer);
                currentIndex = index;
                animateTo(index);
                history.replaceState(null, "", "#" + id);
            });
        });

        /* Keyboard navigation remains natural and predictable. */
        window.addEventListener("keydown", function (event) {
            if (event.defaultPrevented) return;

            if (event.key === "PageDown" || event.key === "ArrowDown") {
                event.preventDefault();
                beginGesture(1);
            } else if (event.key === "PageUp" || event.key === "ArrowUp") {
                event.preventDefault();
                beginGesture(-1);
            } else if (event.key === "Home") {
                event.preventDefault();
                animateTo(0);
            } else if (event.key === "End") {
                event.preventDefault();
                animateTo(sections.length - 1);
            }
        });

        if (window.location.hash) {
            const id = window.location.hash.slice(1);
            const index = sections.findIndex(function (section) {
                return section.id === id;
            });
            if (index >= 0) {
                currentIndex = index;
                requestAnimationFrame(function () {
                    window.scrollTo(0, sectionY(index));
                });
            }
        } else {
            currentIndex = nearestIndex();
        }
    }

})();
