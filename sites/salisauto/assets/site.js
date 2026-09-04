/* SALIS AUTO site behaviour: language, header, mobile menu. No dependencies. */
(function () {
  var root = document.documentElement;
  var KEY = 'salisauto-lang';

  function apply(l) {
    root.lang = l;
    root.dir = l === 'ar' ? 'rtl' : 'ltr';
    var ttl = l === 'ar' ? root.dataset.titleAr : root.dataset.titleEn;
    if (ttl) document.title = ttl;
    try { localStorage.setItem(KEY, l); } catch (e) { /* storage may be unavailable */ }
  }

  var q = null;
  try { q = new URLSearchParams(location.search).get('lang'); } catch (e) { /* old browsers */ }
  var saved = null;
  try { saved = localStorage.getItem(KEY); } catch (e) { /* storage may be unavailable */ }
  apply(q === 'ar' || q === 'en' ? q : (saved === 'ar' ? 'ar' : 'en'));

  var toggle = document.getElementById('langToggle');
  if (toggle) toggle.addEventListener('click', function () { apply(root.lang === 'ar' ? 'en' : 'ar'); });

  /* Sticky header: shrink the wordmark and add a shadow after 24px, transform only. */
  var header = document.getElementById('site-header');
  var scrolled = false;
  function onScroll() {
    var s = (window.scrollY || document.documentElement.scrollTop) > 24;
    if (s !== scrolled) { scrolled = s; header.classList.toggle('is-scrolled', s); }
  }
  if (header) { onScroll(); window.addEventListener('scroll', onScroll, { passive: true }); }

  /* Mobile menu */
  var burger = document.getElementById('menuToggle');
  var menu = document.getElementById('mobile-menu');
  if (burger && menu) {
    burger.addEventListener('click', function () {
      var open = menu.hidden;
      menu.hidden = !open;
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
      burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    });
  }

  /* Trace animation runs once on load; reduced motion is handled in CSS. */
  root.classList.add('is-ready');
})();
