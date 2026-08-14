/* =====================================================
   SECTION SCROLL NAVIGATION
   ===================================================== */

const sections = Array.from(
    document.querySelectorAll("main#site-root > section[id]")
);

if (sections.length > 1) {
    const nav = document.querySelector(".navbar");

    /*
     * This is NOT an animation cooldown.
     *
     * It is only used to detect when one physical wheel gesture
     * has ended. A single fast wheel flick can produce dozens of
     * wheel events, so those events must belong to one gesture.
     */
    const GESTURE_END_DELAY = 180;

    /*
     * Animation duration.
     * Short enough to feel responsive, long enough to be smooth.
     */
    const ANIMATION_DURATION = 520;

    let currentIndex = 0;
    let animationFrame = null;

    let gestureActive = false;
    let gestureDirection = 0;
    let gestureEndTimer = null;

    function getNavHeight() {
        return nav
            ? nav.getBoundingClientRect().height
            : 0;
    }

    function getSectionTop(index) {
        const section = sections[index];

        if (!section) {
            return window.scrollY;
        }

        return Math.max(
            0,
            section.getBoundingClientRect().top +
                window.scrollY -
                getNavHeight()
        );
    }

    function clampIndex(index) {
        return Math.max(
            0,
            Math.min(sections.length - 1, index)
        );
    }

    /*
     * Find the section that is currently closest to the
     * top of the usable viewport.
     */
    function getCurrentSection() {
        const marker = window.scrollY + getNavHeight() + 8;

        let closestIndex = 0;
        let closestDistance = Infinity;

        sections.forEach(function (section, index) {
            const top =
                section.getBoundingClientRect().top +
                window.scrollY;

            const distance = Math.abs(top - marker);

            if (distance < closestDistance) {
                closestDistance = distance;
                closestIndex = index;
            }
        });

        return closestIndex;
    }

    /*
     * Smooth easing.
     */
    function easeInOutCubic(t) {
        return t < 0.5
            ? 4 * t * t * t
            : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }

    /*
     * Stop ONLY the current animation.
     *
     * This is important:
     * there is no cooldown preventing another scroll.
     */
    function cancelAnimation() {
        if (animationFrame !== null) {
            cancelAnimationFrame(animationFrame);
            animationFrame = null;
        }
    }

    function animateToSection(index) {
        index = clampIndex(index);

        const startY = window.scrollY;
        const endY = getSectionTop(index);

        currentIndex = index;

        /*
         * If we're already there, don't animate.
         */
        if (Math.abs(endY - startY) < 2) {
            window.scrollTo(0, endY);
            return;
        }

        /*
         * A new gesture is allowed to interrupt the old animation.
         */
        cancelAnimation();

        const startTime = performance.now();

        function animate(now) {
            const elapsed = now - startTime;

            const progress = Math.min(
                elapsed / ANIMATION_DURATION,
                1
            );

            const eased = easeInOutCubic(progress);

            const position =
                startY +
                (endY - startY) * eased;

            window.scrollTo(0, position);

            if (progress < 1) {
                animationFrame =
                    requestAnimationFrame(animate);
            } else {
                animationFrame = null;
                window.scrollTo(0, endY);
            }
        }

        animationFrame = requestAnimationFrame(animate);
    }

    /*
     * End the current wheel gesture.
     *
     * Again: this isn't a cooldown. It simply says:
     * "the physical wheel movement has stopped."
     */
    function endGesture() {
        gestureActive = false;
        gestureDirection = 0;
        gestureEndTimer = null;

        currentIndex = getCurrentSection();
    }

    function resetGestureTimer() {
        clearTimeout(gestureEndTimer);

        gestureEndTimer = setTimeout(
            endGesture,
            GESTURE_END_DELAY
        );
    }

    /*
     * Handle one wheel gesture.
     */
    function handleWheel(event) {
        if (event.ctrlKey) {
            return;
        }

        /*
         * Ignore horizontal scrolling.
         */
        if (
            Math.abs(event.deltaX) >
            Math.abs(event.deltaY)
        ) {
            return;
        }

        /*
         * Don't interfere with things that have their own
         * vertical scrolling.
         */
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

        if (scrollableElement) {
            return;
        }

        /*
         * We intentionally control the page wheel here.
         */
        event.preventDefault();

        const direction =
            event.deltaY > 0 ? 1 : -1;

        /*
         * -------------------------------------------------
         * NEW WHEEL GESTURE
         * -------------------------------------------------
         *
         * One physical wheel flick = ONE section.
         */
        if (!gestureActive) {
            gestureActive = true;
            gestureDirection = direction;

            /*
             * Always calculate from the actual visible
             * section rather than from accumulated wheel
             * events.
             */
            currentIndex = getCurrentSection();

            const nextIndex =
                clampIndex(
                    currentIndex + direction
                );

            animateToSection(nextIndex);

            resetGestureTimer();

            return;
        }

        /*
         * -------------------------------------------------
         * SAME GESTURE
         * -------------------------------------------------
         *
         * A mouse/trackpad can generate many wheel events
         * from one flick.
         *
         * NEVER stack them.
         *
         * This is what prevents:
         *
         *   wheel → wheel → wheel → wheel → END
         *
         * from becoming:
         *
         *   Home → Skills → Projects → About → Contact
         */
        if (direction === gestureDirection) {
            resetGestureTimer();
            return;
        }

        /*
         * -------------------------------------------------
         * DIRECTION REVERSAL
         * -------------------------------------------------
         *
         * If the user deliberately reverses direction,
         * allow it immediately.
         *
         * The previous animation is cancelled and we move
         * exactly ONE section in the new direction.
         */
        gestureDirection = direction;

        currentIndex = getCurrentSection();

        const previousOrNext =
            clampIndex(
                currentIndex + direction
            );

        animateToSection(previousOrNext);

        resetGestureTimer();
    }

    window.addEventListener(
        "wheel",
        handleWheel,
        { passive: false }
    );

    /*
     * -----------------------------------------------------
     * ANCHOR NAVIGATION
     * -----------------------------------------------------
     *
     * Clicking Home / Skills / Projects / About / Contact
     * goes directly to that section.
     */
    document
        .querySelectorAll('a[href^="#"]')
        .forEach(function (link) {
            link.addEventListener("click", function (event) {
                const id =
                    link.getAttribute("href").slice(1);

                const index =
                    sections.findIndex(
                        function (section) {
                            return section.id === id;
                        }
                    );

                if (index === -1) {
                    return;
                }

                event.preventDefault();

                clearTimeout(gestureEndTimer);

                gestureActive = false;
                gestureDirection = 0;

                animateToSection(index);

                history.replaceState(
                    null,
                    "",
                    "#" + id
                );
            });
        });

    /*
     * -----------------------------------------------------
     * KEYBOARD NAVIGATION
     * -----------------------------------------------------
     */
    window.addEventListener("keydown", function (event) {
        if (event.defaultPrevented) {
            return;
        }

        /*
         * Don't hijack typing or form controls.
         */
        const tag =
            event.target.tagName?.toLowerCase();

        if (
            tag === "input" ||
            tag === "textarea" ||
            tag === "select" ||
            event.target.isContentEditable
        ) {
            return;
        }

        let direction = 0;

        if (
            event.key === "ArrowDown" ||
            event.key === "PageDown"
        ) {
            direction = 1;
        } else if (
            event.key === "ArrowUp" ||
            event.key === "PageUp"
        ) {
            direction = -1;
        }

        if (direction !== 0) {
            event.preventDefault();

            clearTimeout(gestureEndTimer);

            gestureActive = false;
            gestureDirection = 0;

            currentIndex = getCurrentSection();

            animateToSection(
                currentIndex + direction
            );

            return;
        }

        if (event.key === "Home") {
            event.preventDefault();

            clearTimeout(gestureEndTimer);

            gestureActive = false;
            gestureDirection = 0;

            animateToSection(0);

            return;
        }

        if (event.key === "End") {
            event.preventDefault();

            clearTimeout(gestureEndTimer);

            gestureActive = false;
            gestureDirection = 0;

            animateToSection(
                sections.length - 1
            );
        }
    });

    /*
     * -----------------------------------------------------
     * INITIAL HASH
     * -----------------------------------------------------
     */
    if (window.location.hash) {
        const id =
            window.location.hash.slice(1);

        const index =
            sections.findIndex(
                function (section) {
                    return section.id === id;
                }
            );

        if (index >= 0) {
            requestAnimationFrame(function () {
                window.scrollTo(
                    0,
                    getSectionTop(index)
                );

                currentIndex = index;
            });
        } else {
            currentIndex = getCurrentSection();
        }
    } else {
        currentIndex = getCurrentSection();
    }
}