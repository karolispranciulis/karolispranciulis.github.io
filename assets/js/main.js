/* =====================================================
   SECTION SCROLL NAVIGATION
   ===================================================== */

const sections = Array.from(
    document.querySelectorAll("main#site-root > section[id]")
);

if (sections.length > 1) {
    const nav = document.querySelector(".navbar");

    /*
     * We speed up the animation to 400ms to feel snappy.
     * We set the cooldown to exactly match it.
     * The millisecond the animation is done, you can scroll again.
     */
    const ANIMATION_DURATION = 400; 
    const WHEEL_COOLDOWN = 400;

    let targetIndex = 0; 
    let lastScrollTime = 0;
    let animationFrame = null;

    function getNavHeight() {
        return nav ? nav.getBoundingClientRect().height : 0;
    }

    function getSectionTop(index) {
        const section = sections[index];
        if (!section) return window.scrollY;

        return Math.max(
            0,
            section.getBoundingClientRect().top + window.scrollY - getNavHeight()
        );
    }

    function clampIndex(index) {
        return Math.max(0, Math.min(sections.length - 1, index));
    }

    function getCurrentSection() {
        const marker = window.scrollY + getNavHeight() + 8;
        let closestIndex = 0;
        let closestDistance = Infinity;

        sections.forEach(function (section, index) {
            const top = section.getBoundingClientRect().top + window.scrollY;
            const distance = Math.abs(top - marker);

            if (distance < closestDistance) {
                closestDistance = distance;
                closestIndex = index;
            }
        });

        return closestIndex;
    }

    function easeInOutCubic(t) {
        return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }

    function cancelAnimation() {
        if (animationFrame !== null) {
            cancelAnimationFrame(animationFrame);
            animationFrame = null;
        }
    }

    function animateToSection(index) {
        index = clampIndex(index);
        targetIndex = index;

        const startY = window.scrollY;
        const endY = getSectionTop(index);

        if (Math.abs(endY - startY) < 2) {
            window.scrollTo(0, endY);
            return;
        }

        cancelAnimation();
        const startTime = performance.now();

        function animate(now) {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / ANIMATION_DURATION, 1);
            const eased = easeInOutCubic(progress);
            const position = startY + (endY - startY) * eased;

            window.scrollTo(0, position);

            if (progress < 1) {
                animationFrame = requestAnimationFrame(animate);
            } else {
                animationFrame = null;
                window.scrollTo(0, endY);
            }
        }

        animationFrame = requestAnimationFrame(animate);
    }

    function handleWheel(event) {
        if (event.ctrlKey) return;
        if (Math.abs(event.deltaX) > Math.abs(event.deltaY)) return;

        const scrollableElement = event.target.closest(
            [
                ".editor-content",
                ".ide-explorer",
                "textarea",
                "input",
                "select",
                "[data-native-scroll]"
            ].join(",")
        );

        if (scrollableElement) return;

        event.preventDefault();

        const now = Date.now();

        // -------------------------------------------------
        // STRICT THROTTLE (NO RESETTING)
        // -------------------------------------------------
        // If we are within the 400ms window, ignore the hardware's 
        // leftover momentum entirely.
        if (now - lastScrollTime < WHEEL_COOLDOWN) {
            return;
        }

        const direction = event.deltaY > 0 ? 1 : -1;
        const nextIndex = clampIndex(targetIndex + direction);

        if (nextIndex !== targetIndex) {
            lastScrollTime = now; // Lock the timestamp
            animateToSection(nextIndex);
        }
    }

    window.addEventListener("wheel", handleWheel, { passive: false });

    /*
     * -----------------------------------------------------
     * ANCHOR NAVIGATION
     * -----------------------------------------------------
     */
    document.querySelectorAll('a[href^="#"]').forEach(function (link) {
        link.addEventListener("click", function (event) {
            const id = link.getAttribute("href").slice(1);
            const index = sections.findIndex(section => section.id === id);

            if (index === -1) return;

            event.preventDefault();
            lastScrollTime = Date.now(); 

            animateToSection(index);
            history.replaceState(null, "", "#" + id);
        });
    });

    /*
     * -----------------------------------------------------
     * KEYBOARD NAVIGATION
     * -----------------------------------------------------
     */
    window.addEventListener("keydown", function (event) {
        if (event.defaultPrevented) return;

        const tag = event.target.tagName?.toLowerCase();
        if (
            tag === "input" ||
            tag === "textarea" ||
            tag === "select" ||
            event.target.isContentEditable
        ) {
            return;
        }

        let direction = 0;

        if (event.key === "ArrowDown" || event.key === "PageDown") {
            direction = 1;
        } else if (event.key === "ArrowUp" || event.key === "PageUp") {
            direction = -1;
        }

        if (direction !== 0) {
            event.preventDefault();
            lastScrollTime = Date.now();
            animateToSection(targetIndex + direction);
            return;
        }

        if (event.key === "Home") {
            event.preventDefault();
            lastScrollTime = Date.now();
            animateToSection(0);
            return;
        }

        if (event.key === "End") {
            event.preventDefault();
            lastScrollTime = Date.now();
            animateToSection(sections.length - 1);
        }
    });

    if (window.location.hash) {
        const id = window.location.hash.slice(1);
        const index = sections.findIndex(section => section.id === id);

        if (index >= 0) {
            requestAnimationFrame(function () {
                window.scrollTo(0, getSectionTop(index));
                targetIndex = index;
            });
        } else {
            targetIndex = getCurrentSection();
        }
    } else {
        targetIndex = getCurrentSection();
    }
}