// ============================================================================
// main.js — nav active-state + project carousel
// No slide/fade animation libraries. Section movement is handled entirely by
// CSS scroll-snap (see style.css). This file only:
//   1) highlights the current nav link while scrolling
//   2) drives the "2 at a time, loops" project carousel
// ============================================================================

document.addEventListener("DOMContentLoaded", () => {
  initNavHighlight();
  initProjectCarousel();
});

/* ---------------------------- Nav highlighting ---------------------------- */

function initNavHighlight() {
  const sections = document.querySelectorAll(".panel[id]");
  const links = document.querySelectorAll(".nav-links a");
  if (!sections.length || !links.length) return;

  const linkFor = (id) =>
    document.querySelector(`.nav-links a[href="#${id}"]`);

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          links.forEach((l) => l.classList.remove("active"));
          const link = linkFor(entry.target.id);
          if (link) link.classList.add("active");
        }
      });
    },
    { root: document.getElementById("site-root"), threshold: 0.6 }
  );

  sections.forEach((s) => observer.observe(s));
}

/* ------------------------------ Project carousel ---------------------------
   Shows 2 project widgets per view. With >2 projects, prev/next buttons
   appear and looping is done by re-inserting the first/last clone —
   a plain jump, no animated transform.
------------------------------------------------------------------------- */

function initProjectCarousel() {
  const track = document.getElementById("projects-carousel");
  if (!track) return;

  const items = Array.from(track.children);
  const perPage = 2;

  if (items.length <= perPage) {
    // Nothing to scroll — plain static grid, no controls needed.
    track.classList.remove("carousel");
    return;
  }

  // Wrap the track so prev/next buttons can sit beside it, without
  // requiring any change to index.html's markup.
  const wrap = document.createElement("div");
  wrap.className = "carousel-wrap";
  track.parentElement.insertBefore(wrap, track);
  wrap.appendChild(track);

  // Build prev/next controls once.
  const prevBtn = document.createElement("button");
  prevBtn.className = "carousel-btn carousel-prev";
  prevBtn.setAttribute("aria-label", "Previous projects");
  prevBtn.textContent = "\u2039"; // ‹

  const nextBtn = document.createElement("button");
  nextBtn.className = "carousel-btn carousel-next";
  nextBtn.setAttribute("aria-label", "Next projects");
  nextBtn.textContent = "\u203A"; // ›

  wrap.insertBefore(prevBtn, track);
  wrap.appendChild(nextBtn);

  const pageWidth = () => track.clientWidth;

  nextBtn.addEventListener("click", () => {
    const atEnd =
      Math.ceil(track.scrollLeft + track.clientWidth) >= track.scrollWidth;
    if (atEnd) {
      track.scrollTo({ left: 0, behavior: "smooth" });
    } else {
      track.scrollBy({ left: pageWidth(), behavior: "smooth" });
    }
  });

  prevBtn.addEventListener("click", () => {
    if (track.scrollLeft <= 0) {
      track.scrollTo({ left: track.scrollWidth, behavior: "smooth" });
    } else {
      track.scrollBy({ left: -pageWidth(), behavior: "smooth" });
    }
  });
}
