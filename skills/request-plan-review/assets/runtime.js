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
        background: '#1d1d1f',
        primaryColor: '#272729',
        primaryTextColor: '#ffffff',
        primaryBorderColor: '#333333',
        lineColor: '#cccccc',
        secondaryColor: '#2a2a2c',
        tertiaryColor: '#000000'
      }
    });
    mermaid.default.run({ nodes: mermaidBlocks });
  });
}

var roughAnnotate = null;
var roughNotationLoad = null;

function loadRoughNotation() {
  if (roughNotationLoad) return roughNotationLoad;
  roughNotationLoad = import('https://unpkg.com/rough-notation?module')
    .then(function(mod) {
      roughAnnotate = mod.annotate;
      return roughAnnotate;
    })
    .catch(function() {
      roughAnnotate = null;
      return null;
    });
  return roughNotationLoad;
}

function applyRoughAnnotation(el, options) {
  if (!el) return;
  loadRoughNotation().then(function(annotate) {
    if (!annotate || !document.body.contains(el)) return;
    try {
      var annotation = annotate(el, {
        type: options && options.type ? options.type : 'highlight',
        color: options && options.color ? options.color : 'var(--comment-highlight-bg)',
        animate: options && Object.prototype.hasOwnProperty.call(options, 'animate') ? options.animate : true,
        multiline: true
      });
      annotation.show();
    } catch (err) {}
  });
}

function initCommentSystem() {
  var meta = document.querySelector('meta[name="source-file"]');
  var sourceFile = meta ? meta.content : '';
  if (!sourceFile) return;

  var comments = seedAutomatedComments();
  var nextId = 1;
  var tooltip = null;
  var popover = null;
  var article = document.getElementById('content');
  var layout = document.querySelector('.page-layout');

  var panel = document.createElement('aside');
  panel.className = 'comments-panel';

  function seedAutomatedComments() {
    var raw = Array.isArray(window.__AUTOMATED_REVIEW_COMMENTS__)
      ? window.__AUTOMATED_REVIEW_COMMENTS__
      : [];
    return raw.map(function(c, index) {
      return {
        id: c.id || ('A' + (index + 1)),
        source: 'automated',
        reviewer: c.reviewer || 'reviewer',
        severity: c.severity || 'note',
        title: c.title || 'Automated review comment',
        startLine: parseInt(c.startLine, 10) || 0,
        endLine: parseInt(c.endLine, 10) || parseInt(c.startLine, 10) || 0,
        selectedText: c.selectedText || '',
        comment: c.comment || '',
        unanchored: Boolean(c.unanchored)
      };
    });
  }

  function displayId(c) {
    return String(c.id);
  }

  function commentLocation(c) {
    var start = c.startLine || 0;
    var end = c.endLine || start;
    return sourceFile + ':' + start + (start !== end ? '-' + end : '');
  }

  function severityClass(c) {
    return 'severity-' + String(c.severity || 'note').toLowerCase();
  }

  var reviewerIcons = {
    claudecode: '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path clip-rule="evenodd" d="M20.998 10.949H24v3.102h-3v3.028h-1.487V20H18v-2.921h-1.487V20H15v-2.921H9V20H7.488v-2.921H6V20H4.487v-2.921H3V14.05H0V10.95h3V5h17.998v5.949zM6 10.949h1.488V8.102H6v2.847zm10.51 0H18V8.102h-1.49v2.847z" fill="#D97757" fill-rule="evenodd"></path></svg>',
    geminicli: '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M0 4.391A4.391 4.391 0 014.391 0h15.217A4.391 4.391 0 0124 4.391v15.217A4.391 4.391 0 0119.608 24H4.391A4.391 4.391 0 010 19.608V4.391z" fill="url(#lobe-icons-gemini-cli-_R_0_)"></path><path clip-rule="evenodd" d="M19.74 1.444a2.816 2.816 0 012.816 2.816v15.48a2.816 2.816 0 01-2.816 2.816H4.26a2.816 2.816 0 01-2.816-2.816V4.26A2.816 2.816 0 014.26 1.444h15.48zM7.236 8.564l7.752 3.728-7.752 3.727v2.802l9.557-4.596v-3.866L7.236 5.763v2.801z" fill="#1E1E2E" fill-rule="evenodd"></path><defs><linearGradient gradientUnits="userSpaceOnUse" id="lobe-icons-gemini-cli-_R_0_" x1="24" x2="0" y1="6.587" y2="16.494"><stop stop-color="#EE4D5D"></stop><stop offset=".328" stop-color="#B381DD"></stop><stop offset=".476" stop-color="#207CFE"></stop></linearGradient></defs></svg>',
    codex: '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M19.503 0H4.496A4.496 4.496 0 000 4.496v15.007A4.496 4.496 0 004.496 24h15.007A4.496 4.496 0 0024 19.503V4.496A4.496 4.496 0 0019.503 0z" fill="#fff"></path><path d="M9.064 3.344a4.578 4.578 0 012.285-.312c1 .115 1.891.54 2.673 1.275.01.01.024.017.037.021a.09.09 0 00.043 0 4.55 4.55 0 013.046.275l.047.022.116.057a4.581 4.581 0 012.188 2.399c.209.51.313 1.041.315 1.595a4.24 4.24 0 01-.134 1.223.123.123 0 00.03.115c.594.607.988 1.33 1.183 2.17.289 1.425-.007 2.71-.887 3.854l-.136.166a4.548 4.548 0 01-2.201 1.388.123.123 0 00-.081.076c-.191.551-.383 1.023-.74 1.494-.9 1.187-2.222 1.846-3.711 1.838-1.187-.006-2.239-.44-3.157-1.302a.107.107 0 00-.105-.024c-.388.125-.78.143-1.204.138a4.441 4.441 0 01-1.945-.466 4.544 4.544 0 01-1.61-1.335c-.152-.202-.303-.392-.414-.617a5.81 5.81 0 01-.37-.961 4.582 4.582 0 01-.014-2.298.124.124 0 00.006-.056.085.085 0 00-.027-.048 4.467 4.467 0 01-1.034-1.651 3.896 3.896 0 01-.251-1.192 5.189 5.189 0 01.141-1.6c.337-1.112.982-1.985 1.933-2.618.212-.141.413-.251.601-.33.215-.089.43-.164.646-.227a.098.098 0 00.065-.066 4.51 4.51 0 01.829-1.615 4.535 4.535 0 011.837-1.388zm3.482 10.565a.637.637 0 000 1.272h3.636a.637.637 0 100-1.272h-3.636zM8.462 9.23a.637.637 0 00-1.106.631l1.272 2.224-1.266 2.136a.636.636 0 101.095.649l1.454-2.455a.636.636 0 00.005-.64L8.462 9.23z" fill="url(#lobe-icons-codex-_R_0_)"></path><defs><linearGradient gradientUnits="userSpaceOnUse" id="lobe-icons-codex-_R_0_" x1="12" x2="12" y1="3" y2="21"><stop stop-color="#B1A7FF"></stop><stop offset=".5" stop-color="#7A9DFF"></stop><stop offset="1" stop-color="#3941FF"></stop></linearGradient></defs></svg>',
    opencode: '<svg fill="#8f8f94" fill-rule="evenodd" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M16 6H8v12h8V6zm4 16H4V2h16v20z"></path></svg>',
    qwen: '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12.604 1.34c.393.69.784 1.382 1.174 2.075a.18.18 0 00.157.091h5.552c.174 0 .322.11.446.327l1.454 2.57c.19.337.24.478.024.837-.26.43-.513.864-.76 1.3l-.367.658c-.106.196-.223.28-.04.512l2.652 4.637c.172.301.111.494-.043.77-.437.785-.882 1.564-1.335 2.34-.159.272-.352.375-.68.37-.777-.016-1.552-.01-2.327.016a.099.099 0 00-.081.05 575.097 575.097 0 01-2.705 4.74c-.169.293-.38.363-.725.364-.997.003-2.002.004-3.017.002a.537.537 0 01-.465-.271l-1.335-2.323a.09.09 0 00-.083-.049H4.982c-.285.03-.553-.001-.805-.092l-1.603-2.77a.543.543 0 01-.002-.54l1.207-2.12a.198.198 0 000-.197 550.951 550.951 0 01-1.875-3.272l-.79-1.395c-.16-.31-.173-.496.095-.965.465-.813.927-1.625 1.387-2.436.132-.234.304-.334.584-.335a338.3 338.3 0 012.589-.001.124.124 0 00.107-.063l2.806-4.895a.488.488 0 01.422-.246c.524-.001 1.053 0 1.583-.006L11.704 1c.341-.003.724.032.9.34zm-3.432.403a.06.06 0 00-.052.03L6.254 6.788a.157.157 0 01-.135.078H3.253c-.056 0-.07.025-.041.074l5.81 10.156c.025.042.013.062-.034.063l-2.795.015a.218.218 0 00-.2.116l-1.32 2.31c-.044.078-.021.118.068.118l5.716.008c.046 0 .08.02.104.061l1.403 2.454c.046.081.092.082.139 0l5.006-8.76.783-1.382a.055.055 0 01.096 0l1.424 2.53a.122.122 0 00.107.062l2.763-.02a.04.04 0 00.035-.02.041.041 0 000-.04l-2.9-5.086a.108.108 0 010-.113l.293-.507 1.12-1.977c.024-.041.012-.062-.035-.062H9.2c-.059 0-.073-.026-.043-.077l1.434-2.505a.107.107 0 000-.114L9.225 1.774a.06.06 0 00-.053-.031zm6.29 8.02c.046 0 .058.02.034.06l-.832 1.465-2.613 4.585a.056.056 0 01-.05.029.058.058 0 01-.05-.029L8.498 9.841c-.02-.034-.01-.052.028-.054l.216-.012 6.722-.012z" fill="url(#lobe-icons-qwen-_R_0_)" fill-rule="nonzero"></path><defs><linearGradient id="lobe-icons-qwen-_R_0_" x1="0%" x2="100%" y1="0%" y2="0%"><stop offset="0%" stop-color="#6336E7" stop-opacity=".84"></stop><stop offset="100%" stop-color="#6F69F7" stop-opacity=".84"></stop></linearGradient></defs></svg>'
  };

  function reviewerKey(reviewer) {
    var key = String(reviewer || '').toLowerCase().replace(/[^a-z0-9]/g, '');
    if (key === 'claude' || key === 'claudecode') return 'claudecode';
    if (key === 'gemini' || key === 'geminicli') return 'geminicli';
    if (key === 'qwen' || key === 'qwencode') return 'qwen';
    if (key === 'openai' || key === 'codex') return 'codex';
    if (key === 'opencode') return 'opencode';
    return key;
  }

  function reviewerLabel(reviewer) {
    var key = reviewerKey(reviewer);
    var labels = {
      claudecode: 'Claude Code',
      geminicli: 'Gemini CLI',
      codex: 'Codex',
      opencode: 'OpenCode',
      qwen: 'Qwen Code'
    };
    return labels[key] || String(reviewer || 'Reviewer');
  }

  function reviewerFallback(reviewer) {
    return escapeHtml(String(reviewer || 'R').trim().charAt(0).toUpperCase() || 'R');
  }

  function automatedUser(c) {
    if (c.source !== 'automated') return '';
    var label = reviewerLabel(c.reviewer);
    var svg = reviewerIcons[reviewerKey(c.reviewer)];
    var icon = svg
      ? '<img class="comment-card-reviewer-icon" src="data:image/svg+xml,' + encodeURIComponent(svg) + '" alt="">'
      : '<span class="comment-card-reviewer-fallback">' + reviewerFallback(c.reviewer) + '</span>';
    return '<span class="comment-card-reviewer" title="' + escapeHtml(label) + '" aria-label="' + escapeHtml(label) + '">' + icon + '</span>';
  }

  function automatedMeta(c, unanchored) {
    if (c.source !== 'automated') return '';
    return '<div class="comment-card-meta-row">' +
      automatedUser(c) +
      '<span class="comment-card-priority ' + severityClass(c) + '">priority: ' + escapeHtml(c.severity || 'note') + '</span>' +
      unanchored +
    '</div>';
  }

  applyAutomatedCommentAnchors();
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
        deleteComment(btn.dataset.id);
      });
    });
    panel.querySelectorAll('.comment-card').forEach(function(card) {
      card.addEventListener('click', function(e) {
        if (e.target.closest('.comment-card-delete')) return;
        scrollToBadge(card.dataset.id);
      });
    });
    var copyBtn = panel.querySelector('[data-action="copy"]');
    if (copyBtn) copyBtn.addEventListener('click', copyAll);
    var clearBtn = panel.querySelector('[data-action="clear"]');
    if (clearBtn) clearBtn.addEventListener('click', clearAll);
  }

  function renderCard(c) {
    var loc = commentLocation(c);
    var preview = c.selectedText ? c.selectedText.split('\n')[0].slice(0, 60) : '';
    var title = c.source === 'automated' && c.title
      ? '<div class="comment-card-title">' + escapeHtml(c.title) + '</div>'
      : '';
    var unanchored = c.unanchored ? '<span class="comment-card-unanchored">unanchored</span>' : '';
    var meta = automatedMeta(c, unanchored);
    return '<div class="comment-card ' + (c.source === 'automated' ? 'comment-card-automated' : '') + '" data-id="' + displayId(c) + '">' +
      '<div class="comment-card-header">' +
        '<span class="comment-card-location">#' + displayId(c) + ' ' + loc + '</span>' +
        '<button class="comment-card-delete" data-id="' + displayId(c) + '">&times;</button>' +
      '</div>' +
      title +
      '<div class="comment-card-body">' + escapeHtml(c.comment) + '</div>' +
      (preview ? '<div class="comment-card-preview">' + escapeHtml(preview) + '</div>' : '') +
      meta +
    '</div>';
  }

  function scrollToBadge(id) {
    var badge = document.querySelector('span.comment-badge[data-comment-id="' + id + '"]');
    if (badge) badge.scrollIntoView({ behavior: 'smooth', block: 'center' });
    setActiveComment(id);
  }

  function setActiveComment(id) {
    id = String(id);
    document.querySelectorAll('mark.comment-highlight, span.comment-badge').forEach(function(el) {
      el.classList.toggle('active', el.dataset.commentId === id);
    });
    panel.querySelectorAll('.comment-card').forEach(function(card) {
      card.classList.toggle('active', card.dataset.id === id);
    });
  }

  function scrollToCard(id) {
    var card = panel.querySelector('.comment-card[data-id="' + id + '"]');
    if (card) card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    setActiveComment(id);
  }

  function bindSourceActivator(el, id) {
    if (!el) return;
    el.setAttribute('role', 'button');
    el.tabIndex = 0;
    el.addEventListener('click', function(e) {
      e.stopPropagation();
      scrollToCard(id);
    });
    el.addEventListener('keydown', function(e) {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      e.preventDefault();
      scrollToCard(id);
    });
  }

  function canUseRoughNotation(el) {
    return !el.closest('table, pre, code');
  }

  function sourceLineOf(el) {
    return el && el.dataset && el.dataset.sourceLine
      ? parseInt(el.dataset.sourceLine, 10)
      : null;
  }

  function findAnchorForComment(c) {
    var blocks = Array.from(article.querySelectorAll('[data-source-line]'));
    var exact = blocks.find(function(el) {
      return sourceLineOf(el) === c.startLine;
    });
    if (exact) return exact;

    var inRange = blocks.find(function(el) {
      var line = sourceLineOf(el);
      return line && line >= c.startLine && line <= c.endLine;
    });
    if (inRange) return inRange;

    c.unanchored = true;
    return blocks.find(function(el) {
      var line = sourceLineOf(el);
      return line && line > c.endLine;
    }) || null;
  }

  function findTextNode(root, text) {
    if (!text) return null;
    var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    var node;
    while ((node = walker.nextNode())) {
      var index = node.nodeValue.indexOf(text);
      if (index !== -1) return { node: node, index: index };
    }
    return null;
  }

  function wrapMatchedQuote(anchor, c) {
    if (!c.selectedText || !canUseRoughNotation(anchor)) return null;
    var firstLine = c.selectedText.split('\n').map(function(line) {
      return line.trim();
    }).find(Boolean);
    if (!firstLine) return null;

    var match = findTextNode(anchor, firstLine);
    if (!match) return null;

    var range = document.createRange();
    range.setStart(match.node, match.index);
    range.setEnd(match.node, match.index + firstLine.length);
    var mark = document.createElement('mark');
    mark.className = 'comment-highlight comment-highlight-automated';
    mark.dataset.commentId = displayId(c);
    try {
      range.surroundContents(mark);
      bindSourceActivator(mark, displayId(c));
      applyRoughAnnotation(mark, { animate: false });
      return mark;
    } catch (err) {
      return null;
    }
  }

  function createBadge(c) {
    var badge = document.createElement('span');
    badge.className = 'comment-badge comment-badge-automated';
    badge.textContent = displayId(c);
    badge.dataset.commentId = displayId(c);
    bindSourceActivator(badge, displayId(c));
    return badge;
  }

  function applyAutomatedCommentAnchors() {
    comments.filter(function(c) {
      return c.source === 'automated';
    }).forEach(function(c) {
      var anchor = findAnchorForComment(c);
      if (!anchor) {
        c.unanchored = true;
        return;
      }

      var mark = wrapMatchedQuote(anchor, c);
      var badge = createBadge(c);
      if (mark) mark.after(badge);
      else anchor.appendChild(badge);
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
        applyRoughAnnotation(mark, { animate: true });
        bindSourceActivator(mark, id);
        bindSourceActivator(badge, id);
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
    id = String(id);
    var idx = comments.findIndex(function(x) { return String(x.id) === id; });
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
    toggle.textContent = saved === 'dark' ? 'Light' : 'Dark';
  } else {
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    html.setAttribute('data-theme', systemTheme);
    toggle.textContent = systemTheme === 'dark' ? 'Light' : 'Dark';
  }

  toggle.addEventListener('click', () => {
    const current = html.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    html.setAttribute('data-theme', next);
    toggle.textContent = next === 'dark' ? 'Light' : 'Dark';
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
