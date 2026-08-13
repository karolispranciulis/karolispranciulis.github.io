(() => {
  const scroller = document.getElementById("projectScroller");
  const rail = document.getElementById("projectRail");
  if (!scroller || !rail) return;

  const cards = Array.from(scroller.querySelectorAll(".project-card"));

  if (cards.length <= 2) {
    rail.hidden = true;
    return;
  }

  cards.forEach((card, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "project-dot";
    button.setAttribute("aria-label", `Show project ${index + 1}`);
    button.addEventListener("click", () => {
      card.scrollIntoView({ behavior: "auto", block: "nearest", inline: "start" });
    });
    rail.appendChild(button);
  });

  const dots = Array.from(rail.querySelectorAll(".project-dot"));

  const updateActive = () => {
    let closestIndex = 0;
    let closestDistance = Infinity;

    cards.forEach((card, index) => {
      const distance = Math.abs(card.offsetLeft - scroller.scrollLeft);
      if (distance < closestDistance) {
        closestDistance = distance;
        closestIndex = index;
      }
    });

    dots.forEach((dot, index) => {
      dot.classList.toggle("active", index === closestIndex);
    });
  };

  scroller.addEventListener("scroll", updateActive, { passive: true });
  updateActive();
})();
