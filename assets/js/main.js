// Main site scripts: section snap on wheel and projects horizontal looping carousel

(function(){
  // Section snap on wheel: one full section per wheel action
  const sections = Array.from(document.querySelectorAll('.panel'));
  if(sections.length){
    let isScrolling = false;
    let currentIdx = 0;
    const navbarHeight = 68;

    const updateIndexByScroll = (dir) => {
      currentIdx = Math.max(0, Math.min(sections.length - 1, currentIdx + dir));
      isScrolling = true;
      sections[currentIdx].scrollIntoView({behavior: 'smooth', block: 'start'});
      setTimeout(()=> { isScrolling = false; }, 700);
    };

    // map initial index by current scroll
    const findCurrent = () => {
      const y = window.scrollY + navbarHeight + 10;
      for(let i=0;i<sections.length;i++){
        const r = sections[i].getBoundingClientRect();
        const top = window.scrollY + r.top;
        if(y >= top && y < top + sections[i].offsetHeight) { currentIdx = i; break; }
      }
    };
    findCurrent();

    window.addEventListener('wheel', (e)=>{
      if(isScrolling) return;
      e.preventDefault();
      const dir = e.deltaY > 0 ? 1 : -1;
      updateIndexByScroll(dir);
    }, {passive:false});

    // Nav links
    const navLinks = document.querySelectorAll('.nav-links a, .home-btn');
    navLinks.forEach(link => {
      link.addEventListener('click', (ev)=>{
        ev.preventDefault();
        const href = link.getAttribute('href');
        if(!href || !href.startsWith('#')) return;
        const target = document.querySelector(href);
        if(target) {
          const idx = sections.indexOf(target);
          if(idx >= 0) { currentIdx = idx; }
          target.scrollIntoView({behavior:'smooth', block:'start'});
        }
      });
    });

    // Update index on manual scroll (e.g., keyboard or touch)
    let scrollTimer = null;
    window.addEventListener('scroll', ()=>{
      if(scrollTimer) clearTimeout(scrollTimer);
      scrollTimer = setTimeout(()=>{
        findCurrent();
      }, 120);
    });
  }

  // Projects carousel: horizontal, auto-advance with smooth transition and loop
  const carousel = document.getElementById('projects-carousel');
  if(carousel){
    const speed = 2800; // ms between auto moves
    const items = Array.from(carousel.querySelectorAll('.project-item'));
    if(items.length > 1){
      // duplicate items to allow smooth looping
      const total = items.length;
      // clone nodes
      items.forEach(node => { carousel.appendChild(node.cloneNode(true)); });
      let index = 0;
      const itemWidth = items[0].getBoundingClientRect().width + 18; // include gap
      // ensure starting at the first set
      carousel.scrollLeft = 0;

      const step = ()=>{
        index++;
        carousel.scrollBy({left: itemWidth, behavior: 'smooth'});
        // when we've scrolled past the original set, reset without animation
        if(index >= total){
          // after animation ends, jump back
          setTimeout(()=>{
            carousel.scrollLeft = 0;
            index = 0;
          }, 520);
        }
      };

      let loopTimer = setInterval(step, speed);

      // Pause on hover
      carousel.addEventListener('mouseenter', ()=> clearInterval(loopTimer));
      carousel.addEventListener('mouseleave', ()=> { loopTimer = setInterval(step, speed); });

      // allow user manual scroll to move carousel - keep looping behavior
      carousel.addEventListener('scroll', ()=>{
        // noop for now
      });
    }
  }

})();
