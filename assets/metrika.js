(function (window, document) {
  'use strict';

  const script = document.currentScript;
  const rawId = script && script.getAttribute('data-counter-id');
  if (!/^\d+$/.test(rawId || '')) return;
  const counterId = Number(rawId);
  if (!Number.isSafeInteger(counterId) || counterId <= 0) return;

  // Count only this published portfolio, never previews or other project sites.
  if (window.location.hostname !== 'shahmen2088.github.io' ||
      !window.location.pathname.startsWith('/professional-portfolio/')) return;
  if (window.__portfolioMetrikaCounterId === counterId) return;

  if (typeof window.ym !== 'function') {
    window.ym = function () {
      (window.ym.a = window.ym.a || []).push(arguments);
    };
    window.ym.l = Date.now();
  }

  window.__portfolioMetrikaCounterId = counterId;
  const libraryUrl = 'https://mc.yandex.ru/metrika/tag.js?id=' + counterId;
  if (!document.querySelector('script[src="' + libraryUrl + '"]')) {
    const library = document.createElement('script');
    library.async = true;
    library.src = libraryUrl;
    document.head.appendChild(library);
  }

  window.ym(counterId, 'init', {
    clickmap: true,
    trackLinks: true,
    accurateTrackBounce: true,
    webvisor: false,
    trackHash: false,
  });
})(window, document);
