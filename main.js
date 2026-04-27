/* ==========================================================================
   環友科技 UTK Technology — interactions
   - Mobile hamburger menu
   - Scroll-reveal via IntersectionObserver
   - Scrollspy: highlight nav link of currently visible section
   - Top nav background transition (transparent over hero -> solid after scroll)
   ========================================================================== */

(() => {
  'use strict';

  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------- Mobile hamburger ---------------- */
  const toggle = document.querySelector('.nav-toggle');
  const menu = document.getElementById('nav-menu');
  const body = document.body;

  if (toggle && menu) {
    const closeMenu = () => {
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-label', '開啟主選單');
      body.classList.remove('menu-open');
    };
    const openMenu = () => {
      toggle.setAttribute('aria-expanded', 'true');
      toggle.setAttribute('aria-label', '關閉主選單');
      body.classList.add('menu-open');
    };

    toggle.addEventListener('click', () => {
      const isOpen = toggle.getAttribute('aria-expanded') === 'true';
      isOpen ? closeMenu() : openMenu();
    });

    menu.addEventListener('click', (e) => {
      if (e.target.matches('a')) closeMenu();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && body.classList.contains('menu-open')) {
        closeMenu();
        toggle.focus();
      }
    });

    // Close menu when crossing the desktop breakpoint
    const desktopMQ = matchMedia('(min-width: 1024px)');
    const handleDesktop = (e) => { if (e.matches) closeMenu(); };
    desktopMQ.addEventListener
      ? desktopMQ.addEventListener('change', handleDesktop)
      : desktopMQ.addListener(handleDesktop);
  }

  /* ---------------- Nav background on scroll ---------------- */
  const nav = document.getElementById('nav');
  if (nav) {
    let ticking = false;
    const update = () => {
      const solid = window.scrollY > 64;
      nav.classList.toggle('nav--solid', solid);
      ticking = false;
    };
    update();
    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(update);
        ticking = true;
      }
    }, { passive: true });
  }

  /* ---------------- Scroll-reveal ---------------- */
  const revealEls = document.querySelectorAll('[data-reveal]');
  if (revealEls.length && 'IntersectionObserver' in window && !reduceMotion) {
    const revealObs = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    revealEls.forEach((el) => revealObs.observe(el));
  } else {
    // Reduced motion or no IO support: show everything
    revealEls.forEach((el) => el.classList.add('is-visible'));
  }

  /* ---------------- Scrollspy (active nav link) ---------------- */
  const navLinks = document.querySelectorAll('.nav-links a.nav-link');
  const sections = [...navLinks]
    .map((a) => {
      const id = a.getAttribute('href');
      if (!id || !id.startsWith('#')) return null;
      const target = document.querySelector(id);
      return target ? { link: a, target } : null;
    })
    .filter(Boolean);

  if (sections.length && 'IntersectionObserver' in window) {
    const setActive = (id) => {
      sections.forEach(({ link }) => {
        const matches = link.getAttribute('href') === '#' + id;
        link.classList.toggle('is-active', matches);
      });
    };

    const spyObs = new IntersectionObserver((entries) => {
      // Track most-visible section in viewport
      const visible = entries
        .filter((e) => e.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
      if (visible[0]) setActive(visible[0].target.id);
    }, {
      rootMargin: '-30% 0px -55% 0px',
      threshold: [0, 0.25, 0.5, 0.75, 1]
    });

    sections.forEach(({ target }) => spyObs.observe(target));
  }

})();
