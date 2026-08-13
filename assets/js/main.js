(function () {

    /* =====================================================
       NAVIGATION
    ===================================================== */

    const navLinks =
        document.querySelectorAll(".nav-links a");


    navLinks.forEach(function (link) {

        link.addEventListener("click", function () {

            document
                .querySelector(".nav-links")
                ?.classList.remove("open");

        });

    });



    /* =====================================================
       PROJECT CAROUSEL
    ===================================================== */

    const viewport =
        document.getElementById("projects-viewport");

    const track =
        document.getElementById("projects-track");

    const previousButton =
        document.querySelector(".carousel-prev");

    const nextButton =
        document.querySelector(".carousel-next");

    const dotsContainer =
        document.getElementById("carousel-dots");


    if (
        !viewport ||
        !track ||
        !previousButton ||
        !nextButton
    ) {
        return;
    }


    let originalItems =
        Array.from(
            track.querySelectorAll(".project-item")
        );


    let currentIndex = 0;

    let autoPlay;


    /*
     * Number of cards visible.
     */

    function getVisibleCount() {

        return window.innerWidth <= 900
            ? 1
            : 2;

    }


    /*
     * Don't create an unnecessarily complicated
     * infinite carousel if there is only one project.
     */

    if (originalItems.length <= 1) {

        previousButton.style.display = "none";

        nextButton.style.display = "none";

        if (dotsContainer) {
            dotsContainer.style.display = "none";
        }

        return;

    }


    /*
     * Clone cards at both ends.
     *
     * This allows:
     *
     * A B C D
     *
     * to behave like:
     *
     * C D | A B C D | A B
     */

    function createLoop() {

        const visible =
            getVisibleCount();


        track.innerHTML = "";


        const before =
            originalItems
                .slice(-visible)
                .map(function (item) {
                    return item.cloneNode(true);
                });


        const after =
            originalItems
                .slice(0, visible)
                .map(function (item) {
                    return item.cloneNode(true);
                });


        before.forEach(function (item) {
            track.appendChild(item);
        });


        originalItems.forEach(function (item) {
            track.appendChild(
                item.cloneNode(true)
            );
        });


        after.forEach(function (item) {
            track.appendChild(item);
        });


        currentIndex = visible;


        updatePosition(false);

        createDots();

    }


    /*
     * Move the track.
     */

    function updatePosition(animate) {

        const firstCard =
            track.querySelector(".project-item");


        if (!firstCard) {
            return;
        }


        const cardWidth =
            firstCard.getBoundingClientRect().width;


        const gap =
            parseFloat(
                getComputedStyle(track).gap
            ) || 0;


        if (!animate) {

            track.style.transition = "none";

        } else {

            track.style.transition =
                "transform 0.55s cubic-bezier(0.22, 0.61, 0.36, 1)";

        }


        track.style.transform =
            "translateX(-" +
            (
                currentIndex *
                (cardWidth + gap)
            ) +
            "px)";


        if (!animate) {

            requestAnimationFrame(function () {

                track.style.transition =
                    "transform 0.55s cubic-bezier(0.22, 0.61, 0.36, 1)";

            });

        }


        updateDots();

    }


    /*
     * Move forward.
     */

    function next() {

        currentIndex++;

        updatePosition(true);

    }


    /*
     * Move backwards.
     */

    function previous() {

        currentIndex--;

        updatePosition(true);

    }


    /*
     * When reaching a cloned card,
     * silently jump back into the real list.
     */

    track.addEventListener(
        "transitionend",
        function () {

            const visible =
                getVisibleCount();


            const total =
                originalItems.length;


            if (
                currentIndex >=
                total + visible
            ) {

                currentIndex =
                    visible;

                updatePosition(false);

            }


            if (
                currentIndex < visible
            ) {

                currentIndex =
                    total + visible - 1;

                updatePosition(false);

            }

        }
    );


    /*
     * Buttons.
     */

    nextButton.addEventListener(
        "click",
        function () {

            next();

            restartAutoPlay();

        }
    );


    previousButton.addEventListener(
        "click",
        function () {

            previous();

            restartAutoPlay();

        }
    );



    /* =====================================================
       DOTS
    ===================================================== */

    function createDots() {

        if (!dotsContainer) {
            return;
        }


        dotsContainer.innerHTML = "";


        originalItems.forEach(
            function (_, index) {

                const dot =
                    document.createElement("button");


                dot.type = "button";


                dot.className =
                    "carousel-dot";


                dot.setAttribute(
                    "aria-label",
                    "Go to project " +
                    (index + 1)
                );


                dot.addEventListener(
                    "click",
                    function () {

                        const visible =
                            getVisibleCount();


                        currentIndex =
                            visible + index;


                        updatePosition(true);

                        restartAutoPlay();

                    }
                );


                dotsContainer.appendChild(dot);

            }
        );

    }


    function updateDots() {

        if (!dotsContainer) {
            return;
        }


        const dots =
            dotsContainer.querySelectorAll(
                ".carousel-dot"
            );


        const visible =
            getVisibleCount();


        let realIndex =
            currentIndex - visible;


        realIndex =
            (
                realIndex %
                originalItems.length +
                originalItems.length
            ) %
            originalItems.length;


        dots.forEach(
            function (dot, index) {

                dot.classList.toggle(
                    "active",
                    index === realIndex
                );

            }
        );

    }



    /* =====================================================
       AUTO LOOP
    ===================================================== */

    function startAutoPlay() {

        clearInterval(autoPlay);


        autoPlay =
            setInterval(
                function () {

                    next();

                },
                4500
            );

    }


    function restartAutoPlay() {

        startAutoPlay();

    }


    /*
     * Don't auto-move while the mouse is
     * over the carousel.
     */

    viewport.addEventListener(
        "mouseenter",
        function () {

            clearInterval(autoPlay);

        }
    );


    viewport.addEventListener(
        "mouseleave",
        function () {

            startAutoPlay();

        }
    );



    /* =====================================================
       RESIZE
    ===================================================== */

    let resizeTimer;


    window.addEventListener(
        "resize",
        function () {

            clearTimeout(resizeTimer);


            resizeTimer =
                setTimeout(
                    function () {

                        createLoop();

                    },
                    150
                );

        }
    );


    createLoop();

    startAutoPlay();



    /* =====================================================
       SECTION NAVIGATION / SOFT SNAP
    ===================================================== */

    const sections = Array.from(
        document.querySelectorAll("main > section")
    );

    if (sections.length > 1) {
        let scrollTimer = null;
        let lastWheelDirection = 0;
        let gestureStartY = window.scrollY;
        let gestureStartSection = 0;
        let gestureActive = false;

        function nearestSectionIndex() {
            const y = window.scrollY;
            let best = 0;
            let distance = Infinity;

            sections.forEach(function (section, index) {
                const d = Math.abs(section.offsetTop - y);
                if (d < distance) {
                    distance = d;
                    best = index;
                }
            });

            return best;
        }

        function beginGesture(direction) {
            if (!gestureActive) {
                gestureActive = true;
                gestureStartY = window.scrollY;
                gestureStartSection = nearestSectionIndex();
            }

            lastWheelDirection = direction;
        }

        function finishGesture() {
            if (!gestureActive) return;

            gestureActive = false;

            const moved = Math.abs(window.scrollY - gestureStartY);
            const viewport = window.innerHeight || 800;
            const smallGesture = moved < viewport * 0.45;

            let targetIndex = nearestSectionIndex();

            /*
             * Small wheel movement: gently continue to the next/previous
             * section. Large/fast movement: respect where the user actually
             * scrolled and only settle to the nearest section.
             *
             * Nothing is prevented here. The browser remains fully in control
             * of scrolling, so fast wheel/trackpad scrolling is never locked.
             */
            if (smallGesture && lastWheelDirection !== 0) {
                targetIndex = Math.max(
                    0,
                    Math.min(
                        sections.length - 1,
                        gestureStartSection + lastWheelDirection
                    )
                );
            }

            sections[targetIndex].scrollIntoView({
                behavior: "smooth",
                block: "start"
            });
        }

        window.addEventListener("wheel", function (event) {
            if (Math.abs(event.deltaX) > Math.abs(event.deltaY)) return;

            beginGesture(event.deltaY > 0 ? 1 : -1);

            clearTimeout(scrollTimer);
            scrollTimer = setTimeout(finishGesture, 140);
            // IMPORTANT: no preventDefault(). Fast scrolling stays native.
        }, { passive: true });

        window.addEventListener("scroll", function () {
            if (!gestureActive) return;

            clearTimeout(scrollTimer);
            scrollTimer = setTimeout(finishGesture, 140);
        }, { passive: true });
    }

})();
