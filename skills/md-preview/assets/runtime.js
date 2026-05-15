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

function initCommentSystem() {
  var meta = document.querySelector('meta[name="source-file"]');
  var sourceFile = meta ? meta.content : '';
  if (!sourceFile) return;

  var comments = [];
  var nextId = 1;
  var tooltip = null;
  var popover = null;
  var article = document.getElementById('content');
  var layout = document.querySelector('.page-layout');

  var panel = document.createElement('aside');
  panel.className = 'comments-panel';
  renderPanel();
  layout.appendChild(panel);

  function renderPanel() {
    var count = comments.length;
    panel.innerHTML =
      '<div class="comments-panel-header">' +
        '<div class="comments-panel-title">Comments' + (count > 0 ? ' (' + count + ')' : '') + '</div>' +
        (count > 0 ? '<div class="comments-panel-actions">' +
          '<button class="comments-panel-btn" data-action="copy">Copy All</button>' +
          '<button class="comments-panel-btn" data-action="clear">Clear</button>' +
        '</div>' : '') +
      '</div>' +
      (count === 0
        ? '<div class="comments-panel-empty">Select text to comment</div>'
        : '<div class="comments-panel-list">' + comments.map(renderCard).join('') + '</div>');

    panel.querySelectorAll('.comment-card-delete').forEach(function(btn) {
      btn.addEventListener('click', function() {
        deleteComment(parseInt(btn.dataset.id, 10));
      });
    });
    panel.querySelectorAll('.comment-card').forEach(function(card) {
      card.addEventListener('click', function(e) {
        if (e.target.closest('.comment-card-delete')) return;
        var id = parseInt(card.dataset.id, 10);
        scrollToBadge(id);
      });
    });
    var copyBtn = panel.querySelector('[data-action="copy"]');
    if (copyBtn) copyBtn.addEventListener('click', copyAll);
    var clearBtn = panel.querySelector('[data-action="clear"]');
    if (clearBtn) clearBtn.addEventListener('click', clearAll);
  }

  function renderCard(c) {
    var loc = sourceFile + ':' + c.startLine + (c.startLine !== c.endLine ? '-' + c.endLine : '');
    var preview = c.selectedText.split('\n')[0].slice(0, 60);
    return '<div class="comment-card" data-id="' + c.id + '">' +
      '<div class="comment-card-header">' +
        '<span>#' + c.id + ' ' + loc + '</span>' +
        '<button class="comment-card-delete" data-id="' + c.id + '">&times;</button>' +
      '</div>' +
      '<div class="comment-card-body">' + escapeHtml(c.comment) + '</div>' +
      '<div class="comment-card-preview">' + escapeHtml(preview) + '</div>' +
    '</div>';
  }

  function scrollToBadge(id) {
    var badge = document.querySelector('span.comment-badge[data-comment-id="' + id + '"]');
    if (badge) badge.scrollIntoView({ behavior: 'smooth', block: 'center' });
    panel.querySelectorAll('.comment-card').forEach(function(card) {
      card.classList.toggle('active', parseInt(card.dataset.id, 10) === id);
    });
  }

  document.addEventListener('selectionchange', function() {
    var sel = window.getSelection();
    if (!sel || sel.isCollapsed || !sel.toString().trim()) { hideTooltip(); return; }
    if (!sel.rangeCount) { hideTooltip(); return; }
    var range = sel.getRangeAt(0);
    if (!article.contains(range.commonAncestorContainer)) { hideTooltip(); return; }
    if (popover) return;
    var startLine = findLine(range.startContainer);
    var endLine = findLine(range.endContainer);
    if (!startLine && !endLine) { hideTooltip(); return; }
    showTooltip(range);
  });

  function findLine(node) {
    var el = node.nodeType === 3 ? node.parentElement : node;
    while (el && el !== document.body) {
      if (el.dataset && el.dataset.sourceLine) return parseInt(el.dataset.sourceLine, 10);
      el = el.parentElement;
    }
    return null;
  }

  function showTooltip(range) {
    hideTooltip();
    var rect = range.getBoundingClientRect();
    var el = document.createElement('div');
    el.className = 'comment-tooltip';
    el.textContent = 'Comment';
    el.style.left = Math.max(8, rect.left + rect.width / 2 - 36 + window.scrollX) + 'px';
    el.style.top = (rect.top + window.scrollY - 36) + 'px';
    document.body.appendChild(el);
    tooltip = el;
    el.addEventListener('mousedown', function(e) {
      e.preventDefault();
      e.stopPropagation();
      hideTooltip();
      showPopover();
    });
  }

  function hideTooltip() {
    if (tooltip) { tooltip.remove(); tooltip = null; }
  }

  function showPopover() {
    hidePopover();
    var sel = window.getSelection();
    if (!sel || sel.isCollapsed || !sel.rangeCount) return;
    var range = sel.getRangeAt(0);
    var startLine = findLine(range.startContainer) || 0;
    var endLine = findLine(range.endContainer) || startLine;
    var text = sel.toString().trim();
    var rect = range.getBoundingClientRect();
    var loc = sourceFile + ':' + startLine + (startLine !== endLine ? '-' + endLine : '');

    var el = document.createElement('div');
    el.className = 'comment-popover';
    el.innerHTML =
      '<div class="comment-popover-loc">' + loc + '</div>' +
      '<div class="comment-popover-preview">' + escapeHtml(text.slice(0, 200)) + (text.length > 200 ? '...' : '') + '</div>' +
      '<textarea class="comment-popover-input" placeholder="Write your comment..." rows="3"></textarea>' +
      '<div class="comment-popover-actions">' +
        '<button class="comment-popover-cancel">Cancel</button>' +
        '<button class="comment-popover-add">Add</button>' +
      '</div>';
    el.style.left = Math.max(8, Math.min(rect.left + window.scrollX, window.innerWidth - 360)) + 'px';
    el.style.top = (rect.bottom + 8 + window.scrollY) + 'px';
    document.body.appendChild(el);
    popover = el;

    var input = el.querySelector('.comment-popover-input');
    input.focus();

    function addComment() {
      var commentText = input.value.trim();
      if (!commentText) return;
      var id = nextId++;
      comments.push({ id: id, startLine: startLine, endLine: endLine, selectedText: text, comment: commentText });
      try {
        var mark = document.createElement('mark');
        mark.className = 'comment-highlight';
        mark.dataset.commentId = id;
        range.surroundContents(mark);
        var badge = document.createElement('span');
        badge.className = 'comment-badge';
        badge.textContent = id;
        badge.dataset.commentId = id;
        mark.after(badge);
        badge.addEventListener('click', function(e) {
          e.stopPropagation();
          scrollToBadge(id);
        });
      } catch (err) {}
      sel.removeAllRanges();
      renderPanel();
      hidePopover();
    }

    el.querySelector('.comment-popover-add').addEventListener('click', addComment);
    el.querySelector('.comment-popover-cancel').addEventListener('click', hidePopover);
    input.addEventListener('keydown', function(e) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') addComment();
      if (e.key === 'Escape') hidePopover();
    });
  }

  function hidePopover() {
    if (popover) { popover.remove(); popover = null; }
  }

  function deleteComment(id) {
    var idx = comments.findIndex(function(x) { return x.id === id; });
    if (idx === -1) return;
    comments.splice(idx, 1);
    var mark = document.querySelector('mark[data-comment-id="' + id + '"]');
    var badge = document.querySelector('span.comment-badge[data-comment-id="' + id + '"]');
    if (mark) {
      var parent = mark.parentNode;
      while (mark.firstChild) parent.insertBefore(mark.firstChild, mark);
      mark.remove();
    }
    if (badge) badge.remove();
    renderPanel();
  }

  function clearAll() {
    var ids = comments.map(function(c) { return c.id; });
    ids.forEach(function(id) { deleteComment(id); });
  }

  function copyAll() {
    var parts = comments.map(function(c) {
      var loc = c.startLine === c.endLine
        ? sourceFile + ':' + c.startLine
        : sourceFile + ':' + c.startLine + '-' + c.endLine;
      var lines = c.selectedText.split('\n').slice(0, 5);
      if (c.selectedText.split('\n').length > 5) lines.push('...');
      var quoted = lines.map(function(l) { return '> ' + l; }).join('\n');
      return '@' + loc + '\n\n' + quoted + '\n\n' + c.comment;
    });
    navigator.clipboard.writeText(parts.join('\n\n---\n\n')).then(function() {
      var btn = panel.querySelector('[data-action="copy"]');
      if (btn) {
        btn.textContent = 'Copied!';
        setTimeout(function() { renderPanel(); }, 1500);
      }
    });
  }

  function escapeHtml(text) {
    var div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
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
initCommentSystem();
