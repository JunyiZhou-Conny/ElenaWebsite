// Keep navigation native. Warm only pages the visitor is about to open.
const connection = navigator.connection;
if (!connection?.saveData && !/2g/.test(connection?.effectiveType || '')) {
  const prepared = new Set();
  function prepare(event) {
    const anchor = event.target.closest?.('a[href]');
    if (!anchor || anchor.target || anchor.hasAttribute('download')) return;
    const url = new URL(anchor.href);
    if (url.origin !== location.origin || url.pathname === location.pathname || prepared.has(url.href)) return;
    prepared.add(url.href);
    const link = document.createElement('link');
    link.rel = 'prefetch'; link.href = url.href; link.as = 'document';
    document.head.append(link);
  }
  document.addEventListener('pointerover', prepare, {passive: true});
  document.addEventListener('focusin', prepare);
}
