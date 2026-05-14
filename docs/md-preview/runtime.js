async function initShiki() {
  const codeBlocks = document.querySelectorAll('pre code[class*="language-"]');
  if (codeBlocks.length === 0) return;

  const { createHighlighter } = await import('https://esm.sh/shiki');
  const highlighter = await createHighlighter({
    themes: ['github-light', 'github-dark'],
    langs: ['typescript', 'python', 'bash', 'css', 'html', 'json', 'yaml', 'rust', 'go', 'sql', 'markdown', 'jsx', 'tsx', 'diff']
  });

  codeBlocks.forEach(block => {
    const lang = Array.from(block.classList)
      .find(c => c.startsWith('language-'))
      ?.replace('language-', '') || 'text';
    
    if (lang === 'mermaid') return;
    if (lang === 'text') return;

    try {
      if (!highlighter.getLoadedLanguages().includes(lang)) return;
      const darkHtml = highlighter.codeToHtml(block.textContent, { lang, theme: 'github-dark' });
      const lightHtml = highlighter.codeToHtml(block.textContent, { lang, theme: 'github-light' });

      const wrapper = document.createElement('div');
      wrapper.className = 'shiki-wrapper';
      wrapper.innerHTML = darkHtml;
      wrapper.querySelector('pre')?.classList.add('shiki-dark');
      const lightPre = document.createElement('pre');
      lightPre.className = 'shiki-light';
      lightPre.innerHTML = new DOMParser().parseFromString(lightHtml, 'text/html').querySelector('pre')?.innerHTML || '';
      wrapper.appendChild(lightPre);

      const pre = block.parentElement;
      const langLabel = pre.querySelector('.code-lang');
      const copyBtn = pre.querySelector('.copy-btn');
      pre.innerHTML = '';
      if (langLabel) pre.appendChild(langLabel);
      if (copyBtn) pre.appendChild(copyBtn);
      pre.appendChild(wrapper);
    } catch (e) {}
  });
}

function initMermaid() {
  const mermaidBlocks = document.querySelectorAll('pre.mermaid');
  if (mermaidBlocks.length === 0) return;

  import('https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs').then(mermaid => {
    mermaid.default.initialize({
      startOnLoad: false,
      theme: 'dark',
      themeVariables: {
        darkMode: true,
        background: '#101111',
        primaryColor: '#1b1c1e',
        primaryTextColor: '#f9f9f9',
        primaryBorderColor: '#252829',
        lineColor: '#9c9c9d',
        secondaryColor: '#161718',
        tertiaryColor: '#07080a'
      }
    });
    mermaid.default.run({ nodes: mermaidBlocks });
  });
}

function initThemeToggle() {
  const toggle = document.getElementById('theme-toggle');
  const html = document.documentElement;

  const saved = localStorage.getItem('md-preview-theme');
  if (saved) {
    html.setAttribute('data-theme', saved);
    toggle.textContent = saved === 'dark' ? '\u2600' : '\uD83C\uDF19';
  } else if (window.matchMedia('(prefers-color-scheme: light)').matches) {
    html.setAttribute('data-theme', 'light');
    toggle.textContent = '\uD83C\uDF19';
  }

  toggle.addEventListener('click', () => {
    const current = html.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    html.setAttribute('data-theme', next);
    toggle.textContent = next === 'dark' ? '\u2600' : '\uD83C\uDF19';
    localStorage.setItem('md-preview-theme', next);
  });
}

function initTocScroll() {
  const tocLinks = document.querySelectorAll('.toc-sidebar a');
  const headings = document.querySelectorAll('article h2[id], article h3[id]');
  if (tocLinks.length === 0 || headings.length === 0) return;

  let active = null;
  function updateToc() {
    const top = 80;
    let current = null;
    for (const h of headings) {
      if (h.getBoundingClientRect().top <= top) current = h;
    }
    if (current && current !== active) {
      active = current;
      tocLinks.forEach(a => {
        a.classList.toggle('active', a.getAttribute('href') === '#' + current.id);
      });
      history.replaceState(null, '', '#' + current.id);
    }
  }

  let ticking = false;
  window.addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => { updateToc(); ticking = false; });
  }, { passive: true });
  updateToc();
}

function initCopyButtons() {
  document.querySelectorAll('.copy-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const pre = btn.closest('pre');
      const code = pre.querySelector('code') || pre.querySelector('.shiki-wrapper');
      const text = code ? code.textContent : '';
      navigator.clipboard.writeText(text).then(() => {
        btn.textContent = 'Copied!';
        setTimeout(() => btn.textContent = 'Copy', 1500);
      });
    });
  });
}

initThemeToggle();
initTocScroll();
initCopyButtons();
initShiki();
initMermaid();
