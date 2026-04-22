/* ============================================
   Academic Homepage — behavior
   ============================================ */

(function () {
  'use strict';

  // ----- i18n (EN / ZH) -----
  const STORAGE_KEY = 'site-lang';
  const html = document.documentElement;

  function applyLang(lang) {
    html.setAttribute('data-lang', lang);
    html.setAttribute('lang', lang === 'zh' ? 'zh-CN' : 'en');
    document.querySelectorAll('[data-en], [data-zh]').forEach(el => {
      const txt = el.getAttribute('data-' + lang);
      if (txt !== null) el.textContent = txt;
    });
    document.querySelectorAll('[data-lang-switch]').forEach(btn => {
      btn.classList.toggle('is-active', btn.dataset.langSwitch === lang);
    });
    localStorage.setItem(STORAGE_KEY, lang);
    const titleEl = document.querySelector('title');
    if (titleEl) {
      titleEl.textContent = lang === 'zh'
        ? '姜金 — 北京大学'
        : 'Jin Jiang — Peking University';
    }
  }

  const saved = localStorage.getItem(STORAGE_KEY) || 'en';
  applyLang(saved);

  document.querySelectorAll('[data-lang-switch]').forEach(btn => {
    btn.addEventListener('click', () => applyLang(btn.dataset.langSwitch));
  });

  // ----- Nav scroll state -----
  const nav = document.querySelector('.nav');
  const onScroll = () => {
    if (window.scrollY > 40) nav.classList.add('is-scrolled');
    else nav.classList.remove('is-scrolled');
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // ----- Reveal on scroll -----
  const toReveal = document.querySelectorAll(
    '.section__header, .about__grid, .pub, .topic, .news-item, .contact__inner'
  );
  toReveal.forEach(el => el.classList.add('reveal'));

  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    toReveal.forEach(el => io.observe(el));
  } else {
    toReveal.forEach(el => el.classList.add('is-visible'));
  }

  // ----- Mobile burger (toggles nav__links visibility) -----
  const burger = document.querySelector('.nav__burger');
  const links = document.querySelector('.nav__links');
  if (burger && links) {
    burger.addEventListener('click', () => {
      const open = links.classList.toggle('is-open');
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    links.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => links.classList.remove('is-open'));
    });
  }
})();
