/* mermaid-bridge.js — renders <pre class="mermaid"> blocks using beautiful-mermaid.
   Replaces Mermaid.js CDN with beautiful-mermaid browser bundle.
   Theme: Raycast dark. Runs before runtime.js so zoom/interaction works on rendered SVGs. */

(function () {
  var THEME = {
    bg: '#07080a',
    fg: '#f9f9f9',
    line: '#434345',
    accent: '#FF6363',
    muted: '#9c9c9d',
    surface: '#101111',
    border: '#252829',
  };

  function renderAll() {
    var blocks = document.querySelectorAll('pre.mermaid');
    if (!blocks.length) return;

    var render = window.__mermaid && window.__mermaid.renderMermaidSVGAsync;
    if (!render) { console.error('beautiful-mermaid: bundle not loaded'); return; }

    var tasks = [];
    blocks.forEach(function (pre) {
      var src = (pre.textContent || '').trim();
      if (!src) return;

      tasks.push(render(src, THEME).then(function (svg) {
        var wrapper = document.createElement('div');
        wrapper.className = 'figure-diagram';
        wrapper.innerHTML = svg;

        var svgEl = wrapper.querySelector('svg');
        if (svgEl) {
          svgEl.style.maxWidth = '100%';
          svgEl.style.height = 'auto';
        }

        pre.replaceWith(wrapper);
      }).catch(function (err) {
        console.error('beautiful-mermaid error:', err);
        var errDiv = document.createElement('pre');
        errDiv.className = 'mermaid-error';
        errDiv.textContent = String(err.message || err);
        pre.replaceWith(errDiv);
      }));
    });

    return Promise.all(tasks);
  }

  function boot() {
    renderAll().then(function () {
      document.dispatchEvent(new CustomEvent('mermaid:rendered'));
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
