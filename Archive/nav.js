'use strict';

/* Mobile navigation toggle + active-link highlighter.
   External so the page can keep a strict CSP without 'unsafe-inline' on scripts. */
(function () {
  const t = document.querySelector('.nav-toggle');
  const links = document.querySelector('.nav-links');
  if (t && links) {
    t.addEventListener('click', function () {
      const open = links.classList.toggle('open');
      t.classList.toggle('open', open);
      t.setAttribute('aria-expanded', String(open));
    });
    document.addEventListener('click', function (e) {
      if (!e.target.closest('.nav')) {
        links.classList.remove('open');
        t.classList.remove('open');
        t.setAttribute('aria-expanded', 'false');
      }
    });
  }

  /* Active link */
  const page = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a:not(.pill)').forEach(function (a) {
    const href = a.getAttribute('href');
    if (href === page || (page === '' && href === 'index.html')) {
      a.classList.add('current');
    }
  });
})();
