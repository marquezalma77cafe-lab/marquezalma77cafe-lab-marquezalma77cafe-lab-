/* Lógica de la interfaz. Usa el motor SocialUrlAnalyzer cargado globalmente. */
(function () {
  'use strict';

  const analyzer = window.SocialUrlAnalyzer;

  const PLATFORM_ICONS = {
    instagram: '📸',
    tiktok: '🎵',
    youtube: '▶️',
    twitter: '🐦',
    facebook: '👍',
    threads: '🧵',
    linkedin: '💼',
    pinterest: '📌',
    reddit: '👽',
    twitch: '🎮',
    snapchat: '👻',
    shortener: '🔗',
    generic: '🌐',
  };

  const $ = (id) => document.getElementById(id);
  const input = $('url-input');
  const errorMsg = $('error-msg');
  const results = $('results');

  function run() {
    const value = input.value;
    hideError();
    const result = analyzer.analyze(value);
    if (!result.ok) {
      showError(result.error || 'No se pudo analizar la URL.');
      results.hidden = true;
      return;
    }
    render(result);
  }

  function showError(msg) {
    errorMsg.textContent = msg;
    errorMsg.hidden = false;
  }
  function hideError() {
    errorMsg.hidden = true;
  }

  function render(r) {
    results.hidden = false;

    $('platform-icon').textContent = PLATFORM_ICONS[r.platform] || '🌐';
    $('platform-name').textContent = r.platformName;
    $('content-type').textContent = capitalize(r.contentType || '—');

    // Detalles
    const grid = $('detail-grid');
    grid.innerHTML = '';
    addDetail(grid, 'Dominio', r.host);
    if (r.username) addDetail(grid, 'Usuario', '@' + r.username.replace(/^@/, ''));
    if (r.contentId) addDetail(grid, 'ID de contenido', r.contentId);
    if (r.path && r.path !== '/') addDetail(grid, 'Ruta', r.path);

    // URL limpia
    setCode('clean-url', r.cleanUrl || r.input);

    // Embed
    const embedPanel = $('embed-panel');
    if (r.embedUrl) {
      setCode('embed-url', r.embedUrl);
      embedPanel.hidden = false;
    } else {
      embedPanel.hidden = true;
    }

    // Avisos
    const warnPanel = $('warnings-panel');
    const warnList = $('warnings-list');
    warnList.innerHTML = '';
    if (r.warnings && r.warnings.length) {
      r.warnings.forEach((w) => {
        const li = document.createElement('li');
        li.textContent = w;
        warnList.appendChild(li);
      });
      warnPanel.hidden = false;
    } else {
      warnPanel.hidden = true;
    }

    // Parámetros
    const paramsPanel = $('params-panel');
    const body = $('params-body');
    body.innerHTML = '';
    if (r.params && r.params.length) {
      r.params.forEach((p) => {
        const tr = document.createElement('tr');
        if (p.tracking) tr.className = 'tracking';
        tr.innerHTML =
          '<td><code>' + esc(p.key) + '</code></td>' +
          '<td>' + esc(p.value) + '</td>' +
          '<td>' + (p.tracking ? '🚫 sí' : '—') + '</td>';
        body.appendChild(tr);
      });
      paramsPanel.hidden = false;
    } else {
      paramsPanel.hidden = true;
    }
  }

  function addDetail(grid, label, value) {
    const wrap = document.createElement('div');
    wrap.className = 'detail-item';
    const l = document.createElement('div');
    l.className = 'detail-label';
    l.textContent = label;
    const v = document.createElement('div');
    v.className = 'detail-value';
    v.textContent = value;
    wrap.appendChild(l);
    wrap.appendChild(v);
    grid.appendChild(wrap);
  }

  function setCode(id, text) {
    $(id).textContent = text;
  }

  function capitalize(s) {
    if (!s) return s;
    return s.charAt(0).toUpperCase() + s.slice(1);
  }

  function esc(s) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  // --- Eventos ---
  $('analyze-btn').addEventListener('click', run);
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') run();
  });

  document.querySelectorAll('.chip').forEach((chip) => {
    chip.addEventListener('click', () => {
      input.value = chip.getAttribute('data-url');
      run();
    });
  });

  document.querySelectorAll('.copy-btn').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const target = $(btn.getAttribute('data-copy'));
      const text = target ? target.textContent : '';
      try {
        await navigator.clipboard.writeText(text);
        const prev = btn.textContent;
        btn.textContent = '¡Copiado!';
        setTimeout(() => (btn.textContent = prev), 1200);
      } catch (e) {
        // Fallback silencioso si el portapapeles no está disponible.
      }
    });
  });
})();
