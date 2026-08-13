(function () {
  const sections = Array.from(document.querySelectorAll('.panel'));

  if (sections.length) {
    let isScrolling = false;
    let currentIdx = 0;
    const navbarHeight = 72;

    const findCurrent = () => {
      const y = window.scrollY + navbarHeight + 10;
      sections.forEach((section, i) => {
        const top = window.scrollY + section.getBoundingClientRect().top;
        if (y >= top && y < top + section.offsetHeight) currentIdx = i;
      });
    };

    const move = (direction) => {
      currentIdx = Math.max(0, Math.min(sections.length - 1, currentIdx + direction));
      isScrolling = true;
      sections[currentIdx].scrollIntoView({ behavior: 'smooth', block: 'start' });
      setTimeout(() => { isScrolling = false; }, 700);
    };

    findCurrent();

    window.addEventListener('wheel', (event) => {
      if (isScrolling || Math.abs(event.deltaY) < 5) return;
      event.preventDefault();
      move(event.deltaY > 0 ? 1 : -1);
    }, { passive: false });

    window.addEventListener('scroll', () => {
      clearTimeout(window.__sectionTimer);
      window.__sectionTimer = setTimeout(findCurrent, 100);
    });
  }

  const carousel = document.getElementById('projects-carousel');
  if (carousel) {
    const items = Array.from(carousel.querySelectorAll('.project-item'));
    if (items.length > 1) {
      items.forEach(item => carousel.appendChild(item.cloneNode(true)));
      let index = 0;
      const gap = 24;
      const getStep = () => items[0].getBoundingClientRect().width + gap;

      const step = () => {
        index += 1;
        carousel.scrollBy({ left: getStep(), behavior: 'smooth' });
        if (index >= items.length) {
          setTimeout(() => {
            carousel.scrollLeft = 0;
            index = 0;
          }, 550);
        }
      };

      let timer = setInterval(step, 3200);
      carousel.addEventListener('mouseenter', () => clearInterval(timer));
      carousel.addEventListener('mouseleave', () => { timer = setInterval(step, 3200); });
    }
  }
})();
