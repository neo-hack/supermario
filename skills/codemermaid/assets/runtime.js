/* runtime.js — minimal interactive runtime for codemermaid v2.
   Handles: TOC scroll, quiz, annotation alignment, annotation clicks, code-graph sync, zoom.
   Linked via <script src="runtime.js"> in each generated HTML page. */

function initTocScroll() {
  var tocLinks = Array.from(document.querySelectorAll('.toc-item'));
  var units = Array.from(document.querySelectorAll('.unit[id]'));
  if (tocLinks.length === 0 || units.length === 0) return;

  var active = null;
  function pickActive() {
    var center = window.innerHeight / 2;
    var best = null, bestDist = Infinity;
    for (var i = 0; i < units.length; i++) {
      var r = units[i].getBoundingClientRect();
      var d = Math.abs((r.top + r.bottom) / 2 - center);
      if (d < bestDist) { bestDist = d; best = units[i]; }
    }
    if (best && best !== active) {
      active = best;
      for (var j = 0; j < tocLinks.length; j++) {
        var href = tocLinks[j].getAttribute('href');
        tocLinks[j].classList.toggle('active', href === '#' + active.id);
      }
    }
  }

  var ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function() { pickActive(); ticking = false; });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  onScroll();
}

function initQuiz() {
  var options = document.querySelectorAll('.quiz-option');
  for (var i = 0; i < options.length; i++) {
    options[i].addEventListener('click', function() {
      var quiz = this.closest('.quiz');
      if (quiz.classList.contains('answered')) return;
      quiz.classList.add('answered');
      var isCorrect = this.dataset.correct === 'true';
      var all = quiz.querySelectorAll('.quiz-option');
      for (var j = 0; j < all.length; j++) {
        if (all[j] === this) {
          all[j].classList.add(isCorrect ? 'correct' : 'wrong');
        } else if (all[j].dataset.correct === 'true') {
          all[j].classList.add('correct');
        } else {
          all[j].classList.add('dimmed');
        }
      }
      var explanation = quiz.querySelector('.quiz-explanation');
      if (explanation) explanation.classList.add('visible');
    });
  }
}

function bindAnnotationClicks(scope) {
  var annotations = Array.from(scope.querySelectorAll('[data-note-lines]'));
  var codeLines = Array.from(scope.querySelectorAll('.code-block .line'));
  if (annotations.length === 0 || codeLines.length === 0) return;

  function activate(note, lineNumber) {
    for (var i = 0; i < annotations.length; i++) {
      annotations[i].classList.toggle('active', annotations[i] === note);
    }
    for (var j = 0; j < codeLines.length; j++) {
      codeLines[j].classList.toggle('active-note-line', codeLines[j].dataset.line === lineNumber);
    }
  }

  for (var k = 0; k < codeLines.length; k++) {
    codeLines[k].addEventListener('click', function() {
      var self = this;
      var target = null;
      for (var m = 0; m < annotations.length; m++) {
        var lines = String(annotations[m].dataset.noteLines || '').split(',').filter(Boolean);
        if (lines.indexOf(self.dataset.line) !== -1) { target = annotations[m]; break; }
      }
      if (!target) return;
      activate(target, self.dataset.line);
      target.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });
  }

  for (var n = 0; n < annotations.length; n++) {
    annotations[n].addEventListener('click', function() {
      var firstLine = String(this.dataset.noteLines || '').split(',')[0];
      var target = null;
      for (var p = 0; p < codeLines.length; p++) {
        if (codeLines[p].dataset.line === firstLine) { target = codeLines[p]; break; }
      }
      if (!target) return;
      activate(this, firstLine);
      target.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
    });
  }
}

function alignAnnotations(container) {
  var annotations = container.querySelectorAll('.codewalk-annotation');
  var codeLines = container.querySelectorAll('.code-block .line');
  if (annotations.length === 0 || codeLines.length === 0) return;
  var preBlock = container.querySelector('pre.code-block');
  if (!preBlock) return;
  var preTop = preBlock.getBoundingClientRect().top;
  var annoPanel = container.querySelector('.codewalk-annotations');
  if (!annoPanel) return;
  var panelTop = annoPanel.getBoundingClientRect().top;
  var offset = preTop - panelTop;
  var minGap = 6;
  var prevBottom = offset;
  for (var i = 0; i < annotations.length; i++) {
    var noteLines = String(annotations[i].dataset.noteLines || '').split(',');
    var firstLine = noteLines[0];
    var targetLine = null;
    for (var j = 0; j < codeLines.length; j++) {
      if (codeLines[j].dataset.line === firstLine) { targetLine = codeLines[j]; break; }
    }
    if (!targetLine) { prevBottom += annotations[i].offsetHeight + minGap; continue; }
    var targetTop = targetLine.getBoundingClientRect().top - preTop + offset;
    var marginTop = Math.max(minGap, targetTop - prevBottom);
    annotations[i].style.marginTop = marginTop + 'px';
    prevBottom = targetTop + annotations[i].offsetHeight + minGap;
  }
}

function initCodeWalkAnnotations() {
  var containers = document.querySelectorAll('.codewalk-split');
  for (var i = 0; i < containers.length; i++) {
    bindAnnotationClicks(containers[i]);
    alignAnnotations(containers[i]);
  }
}

function initAnnotationResize() {
  var ticking = false;
  window.addEventListener('resize', function() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function() {
      var containers = document.querySelectorAll('.codewalk-split');
      for (var i = 0; i < containers.length; i++) {
        alignAnnotations(containers[i]);
      }
      ticking = false;
    });
  });
}

function initCodeGraphSync() {
  var containers = document.querySelectorAll('.codegraph-split');
  for (var ci = 0; ci < containers.length; ci++) {
    (function(container) {
      var codeLines = Array.from(container.querySelectorAll('.code-block .line'));
      var svgNodes = Array.from(container.querySelectorAll('.codegraph-graph [data-node-id]'));
      if (codeLines.length === 0 || svgNodes.length === 0) return;

      function highlightNode(nodeId) {
        for (var i = 0; i < svgNodes.length; i++) {
          svgNodes[i].classList.toggle('node-active', svgNodes[i].dataset.nodeId === nodeId);
        }
      }

      function highlightLine(lineNum) {
        for (var j = 0; j < codeLines.length; j++) {
          codeLines[j].classList.remove('active-note-line');
        }
        var target = null;
        for (var k = 0; k < codeLines.length; k++) {
          if (codeLines[k].dataset.line === lineNum) { target = codeLines[k]; break; }
        }
        if (target) target.classList.add('active-note-line');
      }

      for (var si = 0; si < svgNodes.length; si++) {
        svgNodes[si].addEventListener('click', function() {
          var nodeId = this.dataset.nodeId;
          highlightNode(nodeId);
          var matching = null;
          for (var m = 0; m < codeLines.length; m++) {
            if (codeLines[m].dataset.graphNode === nodeId) { matching = codeLines[m]; break; }
          }
          if (matching) {
            highlightLine(matching.dataset.line);
            matching.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          }
        });
      }

      for (var li = 0; li < codeLines.length; li++) {
        codeLines[li].addEventListener('click', function() {
          var nodeId = this.dataset.graphNode;
          if (!nodeId) return;
          highlightNode(nodeId);
          highlightLine(this.dataset.line);
        });
      }
    })(containers[ci]);
  }
}

function initZoomOverlay() {
  var overlay = document.querySelector('.zoom-overlay');
  if (!overlay) return;
  var stage = overlay.querySelector('.zoom-stage');
  var levelEl = overlay.querySelector('[data-zoom-level]');
  var scale = 1, tx = 0, ty = 0;
  var MIN = 0.3, MAX = 6;

  function applyTransform() {
    stage.style.transform = 'translate(' + tx + 'px,' + ty + 'px) scale(' + scale + ')';
    if (levelEl) levelEl.textContent = Math.round(scale * 100) + '%';
  }

  function openZoom(svg) {
    var clone = svg.cloneNode(true);
    var r = svg.getBoundingClientRect();
    clone.removeAttribute('style');
    clone.setAttribute('width', r.width);
    clone.setAttribute('height', r.height);
    clone.classList.add('zoom-svg-fix');
    stage.innerHTML = '';
    stage.appendChild(clone);
    scale = 1; tx = 0; ty = 0;
    applyTransform();
    overlay.classList.add('open');
    overlay.removeAttribute('hidden');
    document.body.style.overflow = 'hidden';
  }

  function closeZoom() {
    overlay.classList.remove('open');
    overlay.setAttribute('hidden', '');
    document.body.style.overflow = '';
  }

  var triggers = document.querySelectorAll('[data-zoom-trigger]');
  for (var i = 0; i < triggers.length; i++) {
    triggers[i].addEventListener('click', function() {
      var fig = this.closest('.figure, .unit-diagram');
      var svg = fig && fig.querySelector('svg');
      if (svg) openZoom(svg);
    });
  }

  var closeBtn = overlay.querySelector('[data-zoom-close]');
  if (closeBtn) closeBtn.addEventListener('click', closeZoom);
  overlay.addEventListener('click', function(e) { if (e.target === overlay) closeZoom(); });
  document.addEventListener('keydown', function(e) { if (e.key === 'Escape' && overlay.classList.contains('open')) closeZoom(); });

  var zoomIn = overlay.querySelector('[data-zoom-in]');
  if (zoomIn) zoomIn.addEventListener('click', function() { scale = Math.min(MAX, scale * 1.25); applyTransform(); });
  var zoomOut = overlay.querySelector('[data-zoom-out]');
  if (zoomOut) zoomOut.addEventListener('click', function() { scale = Math.max(MIN, scale / 1.25); applyTransform(); });
  var zoomReset = overlay.querySelector('[data-zoom-reset]');
  if (zoomReset) zoomReset.addEventListener('click', function() { scale = 1; tx = 0; ty = 0; applyTransform(); });

  overlay.addEventListener('wheel', function(e) {
    if (!overlay.classList.contains('open')) return;
    e.preventDefault();
    var rect = stage.getBoundingClientRect();
    var cx = e.clientX - (rect.left + rect.width / 2);
    var cy = e.clientY - (rect.top + rect.height / 2);
    var factor = e.deltaY < 0 ? 1.12 : 1 / 1.12;
    var ns = Math.min(MAX, Math.max(MIN, scale * factor));
    var r = ns / scale;
    tx -= cx * (r - 1); ty -= cy * (r - 1);
    scale = ns;
    applyTransform();
  }, { passive: false });

  var dragging = false, lx = 0, ly = 0;
  overlay.addEventListener('mousedown', function(e) {
    if (e.target.closest('.zoom-controls')) return;
    dragging = true; lx = e.clientX; ly = e.clientY;
    overlay.classList.add('dragging');
  });
  window.addEventListener('mousemove', function(e) {
    if (!dragging) return;
    tx += e.clientX - lx; ty += e.clientY - ly;
    lx = e.clientX; ly = e.clientY;
    applyTransform();
  });
  window.addEventListener('mouseup', function() { dragging = false; overlay.classList.remove('dragging'); });
}

function splitFileTarget(value) {
  var match = String(value || '').match(/^(.*?)(?::(\d+))?$/);
  return {
    filePath: match && match[1] ? match[1] : '',
    line: match && match[2] ? match[2] : '1'
  };
}

function openEditorPath(value, editor) {
  var target = splitFileTarget(value);
  if (!target.filePath) return;
  var scheme = editor === 'vscode' ? 'vscode' : 'cursor';
  window.location.href = scheme + '://file/' + target.filePath + ':' + target.line;
}

function closeEditorMenus(except) {
  var menus = document.querySelectorAll('[data-editor-menu]');
  for (var i = 0; i < menus.length; i++) {
    if (menus[i] === except) continue;
    var trigger = menus[i].querySelector('[data-editor-trigger]');
    var list = menus[i].querySelector('[data-editor-list]');
    if (trigger) trigger.setAttribute('aria-expanded', 'false');
    if (list) list.hidden = true;
  }
}

function copyEditorPath(value, button) {
  var originalText = button.textContent;
  function markCopied() {
    button.textContent = 'Copied';
    button.setAttribute('data-copy-state', 'copied');
    window.setTimeout(function() {
      button.textContent = originalText;
      button.removeAttribute('data-copy-state');
    }, 1400);
  }

  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(value).then(markCopied).catch(function() {
      window.prompt('Copy path', value);
    });
    return;
  }

  window.prompt('Copy path', value);
}

function initFileActions() {
  var menus = document.querySelectorAll('[data-editor-menu]');
  for (var i = 0; i < menus.length; i++) {
    (function(menu) {
      var trigger = menu.querySelector('[data-editor-trigger]');
      var list = menu.querySelector('[data-editor-list]');
      var current = menu.querySelector('[data-editor-current]');
      var actions = menu.closest('.file-actions');
      var copyButton = actions && actions.querySelector('[data-copy-path]');
      var value = copyButton ? copyButton.getAttribute('data-copy-path') || '' : '';

      if (trigger) {
        trigger.addEventListener('click', function(event) {
          event.stopPropagation();
          var expanded = trigger.getAttribute('aria-expanded') === 'true';
          closeEditorMenus(menu);
          trigger.setAttribute('aria-expanded', expanded ? 'false' : 'true');
          if (list) list.hidden = expanded;
        });
      }

      var options = menu.querySelectorAll('[data-editor-option]');
      for (var j = 0; j < options.length; j++) {
        options[j].addEventListener('click', function(event) {
          event.stopPropagation();
          var editor = this.getAttribute('data-editor-option') || 'cursor';
          menu.setAttribute('data-editor', editor);
          if (current) current.textContent = editor === 'vscode' ? 'VS Code' : 'Cursor';
          var allOptions = menu.querySelectorAll('[data-editor-option]');
          for (var k = 0; k < allOptions.length; k++) {
            allOptions[k].setAttribute('aria-selected', allOptions[k] === this ? 'true' : 'false');
          }
          closeEditorMenus();
          openEditorPath(value, editor);
        });
      }
    })(menus[i]);
  }

  var copyButtons = document.querySelectorAll('[data-copy-path]');
  for (var b = 0; b < copyButtons.length; b++) {
    copyButtons[b].addEventListener('click', function() {
      copyEditorPath(this.getAttribute('data-copy-path') || '', this);
    });
  }

  document.addEventListener('click', function() { closeEditorMenus(); });
  document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') closeEditorMenus();
  });
}

function bootPage() {
  initTocScroll();
  initQuiz();
  initCodeWalkAnnotations();
  initAnnotationResize();
  initCodeGraphSync();
  initZoomOverlay();
  initFileActions();
}

document.addEventListener('DOMContentLoaded', bootPage);
document.addEventListener('mermaid:rendered', initZoomOverlay);
