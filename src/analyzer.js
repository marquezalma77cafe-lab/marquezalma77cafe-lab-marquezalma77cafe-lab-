/**
 * Analizador de URLs de redes sociales.
 *
 * Motor puro (sin dependencias, sin acceso a red) que, a partir de una URL:
 *  - detecta la plataforma (Instagram, TikTok, YouTube, X/Twitter, ...)
 *  - detecta el tipo de contenido (perfil, post, reel, video, short, ...)
 *  - extrae el usuario/handle y el identificador del contenido
 *  - elimina parámetros de rastreo (utm_*, fbclid, igshid, ...)
 *  - genera una URL canónica limpia y, cuando es posible, una URL de embed
 *  - emite avisos de validación
 *
 * Funciona tanto en Node como en el navegador (se exporta vía CommonJS y
 * también se cuelga de `window` / `globalThis`).
 */

(function (root, factory) {
  const api = factory();
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  }
  root.SocialUrlAnalyzer = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  // Parámetros de query considerados "rastreo" y que se eliminan de la
  // URL canónica.
  const TRACKING_PARAMS = [
    'igshid', 'igsh', 'fbclid', 'gclid', 'dclid', 'msclkid', 'yclid',
    'mc_cid', 'mc_eid', 'ref', 'ref_src', 'ref_url', 'referrer', 's',
    'spm', 'share_app_id', 'share_link_id', 'share_item_id', 'timestamp',
    'sender_device', 'sender_web_id', 'social_sharing', 'source',
    'feature', 'app', '_r', '_t', '_d', 'is_from_webapp', 'web_id',
    'trk', 'originalSubdomain', 'mibextid', 'rdid',
  ];

  const TRACKING_PREFIXES = ['utm_'];

  // Plataformas reconocidas: cada una tiene una lista de hostnames (sin
  // "www.") y una función que interpreta el path.
  const PLATFORMS = [
    {
      id: 'instagram',
      name: 'Instagram',
      hosts: ['instagram.com', 'instagr.am'],
      parse: parseInstagram,
    },
    {
      id: 'tiktok',
      name: 'TikTok',
      hosts: ['tiktok.com', 'vm.tiktok.com', 'vt.tiktok.com'],
      parse: parseTikTok,
    },
    {
      id: 'youtube',
      name: 'YouTube',
      hosts: ['youtube.com', 'youtu.be', 'm.youtube.com', 'music.youtube.com'],
      parse: parseYouTube,
    },
    {
      id: 'twitter',
      name: 'X (Twitter)',
      hosts: ['twitter.com', 'x.com', 'mobile.twitter.com'],
      parse: parseTwitter,
    },
    {
      id: 'facebook',
      name: 'Facebook',
      hosts: ['facebook.com', 'fb.com', 'fb.watch', 'm.facebook.com'],
      parse: parseFacebook,
    },
    {
      id: 'threads',
      name: 'Threads',
      hosts: ['threads.net', 'threads.com'],
      parse: parseThreads,
    },
    {
      id: 'linkedin',
      name: 'LinkedIn',
      hosts: ['linkedin.com'],
      parse: parseLinkedIn,
    },
    {
      id: 'pinterest',
      name: 'Pinterest',
      hosts: ['pinterest.com', 'pin.it'],
      parse: parsePinterest,
    },
    {
      id: 'reddit',
      name: 'Reddit',
      hosts: ['reddit.com', 'redd.it'],
      parse: parseReddit,
    },
    {
      id: 'twitch',
      name: 'Twitch',
      hosts: ['twitch.tv'],
      parse: parseTwitch,
    },
    {
      id: 'snapchat',
      name: 'Snapchat',
      hosts: ['snapchat.com'],
      parse: parseSnapchat,
    },
  ];

  // Servicios acortadores conocidos: no se puede resolver el destino sin
  // red, pero conviene avisarlo.
  const SHORTENERS = [
    'bit.ly', 't.co', 'tinyurl.com', 'goo.gl', 'ow.ly', 'buff.ly',
    'lnkd.in', 'rebrand.ly', 'cutt.ly', 'shorturl.at',
  ];

  /**
   * Normaliza la entrada del usuario a algo que `URL` pueda parsear.
   * Acepta URLs sin protocolo ("instagram.com/alma").
   */
  function normalizeInput(raw) {
    if (typeof raw !== 'string') return '';
    let s = raw.trim();
    if (!s) return '';
    // Quita envolturas comunes al pegar.
    s = s.replace(/^<|>$/g, '');
    if (!/^https?:\/\//i.test(s)) {
      // No añadas protocolo si claramente no es una URL.
      if (/\s/.test(s)) return s; // se rechazará luego
      s = 'https://' + s;
    }
    return s;
  }

  function stripWww(host) {
    return host.replace(/^www\./i, '');
  }

  function isTrackingParam(key) {
    if (TRACKING_PARAMS.includes(key)) return true;
    return TRACKING_PREFIXES.some((p) => key.toLowerCase().startsWith(p));
  }

  /** Devuelve los segmentos del path sin vacíos. */
  function segments(pathname) {
    return pathname.split('/').filter(Boolean).map(decodeSafe);
  }

  function decodeSafe(s) {
    try {
      return decodeURIComponent(s);
    } catch (e) {
      return s;
    }
  }

  // ---- Parsers por plataforma -------------------------------------------
  // Cada parser recibe { seg, url, host } y devuelve un objeto parcial:
  //   { contentType, username, contentId, embedUrl }

  function parseInstagram(ctx) {
    const { seg } = ctx;
    if (seg.length === 0) return { contentType: 'inicio' };
    const first = seg[0].toLowerCase();
    if (first === 'p' && seg[1]) {
      return { contentType: 'post', contentId: seg[1], embedUrl: `https://www.instagram.com/p/${seg[1]}/embed` };
    }
    if (first === 'reel' || first === 'reels') {
      if (seg[1]) return { contentType: 'reel', contentId: seg[1], embedUrl: `https://www.instagram.com/reel/${seg[1]}/embed` };
    }
    if (first === 'tv' && seg[1]) {
      return { contentType: 'igtv', contentId: seg[1], embedUrl: `https://www.instagram.com/tv/${seg[1]}/embed` };
    }
    if (first === 'stories' && seg[1]) {
      return { contentType: 'historia', username: seg[1], contentId: seg[2] };
    }
    if (first === 'explore' || first === 'accounts' || first === 'direct') {
      return { contentType: 'sistema' };
    }
    // /usuario  o  /usuario/reel/ID
    if (seg[1] && (seg[1] === 'reel' || seg[1] === 'p') && seg[2]) {
      return { contentType: seg[1] === 'reel' ? 'reel' : 'post', username: seg[0], contentId: seg[2] };
    }
    return { contentType: 'perfil', username: seg[0] };
  }

  function parseTikTok(ctx) {
    const { seg, host } = ctx;
    if (host === 'vm.tiktok.com' || host === 'vt.tiktok.com') {
      return { contentType: 'enlace corto', contentId: seg[0] };
    }
    if (seg.length === 0) return { contentType: 'inicio' };
    if (seg[0].startsWith('@')) {
      const username = seg[0].slice(1);
      if (seg[1] === 'video' && seg[2]) {
        return { contentType: 'video', username, contentId: seg[2], embedUrl: `https://www.tiktok.com/embed/v2/${seg[2]}` };
      }
      if (seg[1] === 'live') return { contentType: 'live', username };
      return { contentType: 'perfil', username };
    }
    if (seg[0] === 't' && seg[1]) return { contentType: 'enlace corto', contentId: seg[1] };
    if (seg[0] === 'tag' && seg[1]) return { contentType: 'hashtag', contentId: seg[1] };
    return { contentType: 'desconocido' };
  }

  function parseYouTube(ctx) {
    const { seg, url, host } = ctx;
    if (host === 'youtu.be') {
      const id = seg[0];
      return id ? { contentType: 'video', contentId: id, embedUrl: `https://www.youtube.com/embed/${id}` } : { contentType: 'inicio' };
    }
    if (seg.length === 0) {
      const v = url.searchParams.get('v');
      if (v) return { contentType: 'video', contentId: v, embedUrl: `https://www.youtube.com/embed/${v}` };
      return { contentType: 'inicio' };
    }
    const first = seg[0].toLowerCase();
    if (first === 'watch') {
      const v = url.searchParams.get('v');
      return v ? { contentType: 'video', contentId: v, embedUrl: `https://www.youtube.com/embed/${v}` } : { contentType: 'video' };
    }
    if (first === 'shorts' && seg[1]) {
      return { contentType: 'short', contentId: seg[1], embedUrl: `https://www.youtube.com/embed/${seg[1]}` };
    }
    if (first === 'embed' && seg[1]) {
      return { contentType: 'embed', contentId: seg[1], embedUrl: `https://www.youtube.com/embed/${seg[1]}` };
    }
    if (first === 'live' && seg[1]) {
      return { contentType: 'directo', contentId: seg[1], embedUrl: `https://www.youtube.com/embed/${seg[1]}` };
    }
    if (first === 'playlist') {
      const list = url.searchParams.get('list');
      return { contentType: 'playlist', contentId: list || undefined };
    }
    if (first.startsWith('@')) {
      return { contentType: 'canal', username: first.slice(1) };
    }
    if (first === 'channel' && seg[1]) return { contentType: 'canal', contentId: seg[1] };
    if (first === 'c' || first === 'user') return { contentType: 'canal', username: seg[1] };
    return { contentType: 'desconocido' };
  }

  function parseTwitter(ctx) {
    const { seg } = ctx;
    if (seg.length === 0) return { contentType: 'inicio' };
    const reserved = ['home', 'explore', 'notifications', 'messages', 'search', 'settings', 'i', 'hashtag'];
    if (reserved.includes(seg[0].toLowerCase())) return { contentType: 'sistema' };
    const username = seg[0];
    if (seg[1] === 'status' && seg[2]) {
      return { contentType: 'tweet', username, contentId: seg[2] };
    }
    return { contentType: 'perfil', username };
  }

  function parseFacebook(ctx) {
    const { seg, url, host } = ctx;
    if (host === 'fb.watch') return { contentType: 'video', contentId: seg[0] };
    if (seg.length === 0) return { contentType: 'inicio' };
    const first = seg[0].toLowerCase();
    if (first === 'watch') {
      const v = url.searchParams.get('v');
      return { contentType: 'video', contentId: v || undefined };
    }
    if (first === 'reel' && seg[1]) return { contentType: 'reel', contentId: seg[1] };
    if (first === 'story.php' || first === 'stories') return { contentType: 'historia' };
    if (first === 'groups' && seg[1]) return { contentType: 'grupo', contentId: seg[1] };
    if (first === 'events' && seg[1]) return { contentType: 'evento', contentId: seg[1] };
    if (first === 'profile.php') {
      return { contentType: 'perfil', username: url.searchParams.get('id') || undefined };
    }
    if (seg[1] === 'posts' && seg[2]) return { contentType: 'post', username: seg[0], contentId: seg[2] };
    if (seg[1] === 'videos' && seg[2]) return { contentType: 'video', username: seg[0], contentId: seg[2] };
    return { contentType: 'página', username: seg[0] };
  }

  function parseThreads(ctx) {
    const { seg } = ctx;
    if (seg.length === 0) return { contentType: 'inicio' };
    if (seg[0].startsWith('@')) {
      const username = seg[0].slice(1);
      if (seg[1] === 'post' && seg[2]) return { contentType: 'post', username, contentId: seg[2] };
      return { contentType: 'perfil', username };
    }
    return { contentType: 'desconocido' };
  }

  function parseLinkedIn(ctx) {
    const { seg } = ctx;
    if (seg.length === 0) return { contentType: 'inicio' };
    const first = seg[0].toLowerCase();
    if (first === 'in' && seg[1]) return { contentType: 'perfil', username: seg[1] };
    if (first === 'company' && seg[1]) return { contentType: 'empresa', username: seg[1] };
    if (first === 'posts' && seg[1]) return { contentType: 'post', contentId: seg[1] };
    if (first === 'feed' && seg[1] === 'update') return { contentType: 'post', contentId: seg[2] };
    if (first === 'jobs') return { contentType: 'empleo' };
    return { contentType: 'desconocido' };
  }

  function parsePinterest(ctx) {
    const { seg, host } = ctx;
    if (host === 'pin.it') return { contentType: 'enlace corto', contentId: seg[0] };
    if (seg.length === 0) return { contentType: 'inicio' };
    if (seg[0].toLowerCase() === 'pin' && seg[1]) return { contentType: 'pin', contentId: seg[1] };
    if (seg[1]) return { contentType: 'tablero', username: seg[0], contentId: seg[1] };
    return { contentType: 'perfil', username: seg[0] };
  }

  function parseReddit(ctx) {
    const { seg, host } = ctx;
    if (host === 'redd.it') return { contentType: 'enlace corto', contentId: seg[0] };
    if (seg.length === 0) return { contentType: 'inicio' };
    const first = seg[0].toLowerCase();
    if (first === 'r' && seg[1]) {
      if (seg[2] === 'comments' && seg[3]) {
        return { contentType: 'post', username: seg[1], contentId: seg[3] };
      }
      return { contentType: 'subreddit', username: seg[1] };
    }
    if (first === 'user' || first === 'u') return { contentType: 'usuario', username: seg[1] };
    return { contentType: 'desconocido' };
  }

  function parseTwitch(ctx) {
    const { seg } = ctx;
    if (seg.length === 0) return { contentType: 'inicio' };
    const first = seg[0].toLowerCase();
    if (first === 'videos' && seg[1]) return { contentType: 'vod', contentId: seg[1] };
    if (first === 'directory') return { contentType: 'sistema' };
    if (seg[1] === 'clip' && seg[2]) return { contentType: 'clip', username: seg[0], contentId: seg[2] };
    return { contentType: 'canal', username: seg[0] };
  }

  function parseSnapchat(ctx) {
    const { seg } = ctx;
    if (seg.length === 0) return { contentType: 'inicio' };
    if (seg[0].toLowerCase() === 'add' && seg[1]) return { contentType: 'perfil', username: seg[1] };
    if (seg[0].toLowerCase() === 't' && seg[1]) return { contentType: 'enlace corto', contentId: seg[1] };
    return { contentType: 'desconocido' };
  }

  // ---- Núcleo ------------------------------------------------------------

  /**
   * Analiza una URL de red social.
   * @param {string} raw - la URL o cadena introducida por el usuario.
   * @returns {object} resultado del análisis.
   */
  function analyze(raw) {
    const input = raw;
    const normalized = normalizeInput(raw);

    if (!normalized) {
      return { ok: false, input, error: 'No se ha introducido ninguna URL.' };
    }

    let url;
    try {
      url = new URL(normalized);
    } catch (e) {
      return { ok: false, input, error: 'La URL no tiene un formato válido.' };
    }

    if (url.protocol !== 'http:' && url.protocol !== 'https:') {
      return { ok: false, input, error: 'Solo se admiten URLs http(s).' };
    }

    const host = stripWww(url.hostname.toLowerCase());
    const warnings = [];

    if (url.protocol === 'http:') {
      warnings.push('La URL usa http sin cifrar; se recomienda https.');
    }

    if (SHORTENERS.includes(host)) {
      return {
        ok: true,
        input,
        platform: 'shortener',
        platformName: 'Enlace acortado',
        contentType: 'redirección',
        host,
        cleanUrl: buildCleanUrl(url, host, []),
        warnings: ['Es un enlace acortado; el destino real no puede resolverse sin conexión.'],
        isShortener: true,
        params: collectParams(url),
      };
    }

    const platform = PLATFORMS.find((p) => p.hosts.includes(host) || host.endsWith('.' + p.hosts[0]));

    const seg = segments(url.pathname);
    let detail = { contentType: 'desconocido' };
    if (platform) {
      try {
        detail = platform.parse({ seg, url, host }) || detail;
      } catch (e) {
        detail = { contentType: 'desconocido' };
      }
    } else {
      warnings.push('Dominio no reconocido como red social; análisis genérico.');
    }

    // Parámetros de rastreo detectados.
    const params = collectParams(url);
    const trackingFound = params.filter((p) => p.tracking).map((p) => p.key);
    if (trackingFound.length) {
      warnings.push('Parámetros de rastreo detectados: ' + trackingFound.join(', ') + '.');
    }

    const cleanUrl = buildCleanUrl(url, host, seg, detail);

    return {
      ok: true,
      input,
      platform: platform ? platform.id : 'generic',
      platformName: platform ? platform.name : host,
      contentType: detail.contentType || 'desconocido',
      username: detail.username || null,
      contentId: detail.contentId || null,
      host,
      path: url.pathname,
      cleanUrl,
      embedUrl: detail.embedUrl || null,
      isShortener: false,
      params,
      trackingRemoved: trackingFound,
      warnings,
    };
  }

  function collectParams(url) {
    const out = [];
    url.searchParams.forEach((value, key) => {
      out.push({ key, value, tracking: isTrackingParam(key) });
    });
    return out;
  }

  /** Reconstruye una URL sin parámetros de rastreo ni fragmento. */
  function buildCleanUrl(url, host, seg, detail) {
    const clean = new URL(url.toString());
    // Normaliza el host (www fuera, minúsculas).
    clean.hostname = host;
    // Elimina parámetros de rastreo.
    const keep = [];
    clean.searchParams.forEach((value, key) => {
      if (!isTrackingParam(key)) keep.push([key, value]);
    });
    // Reasigna los parámetros conservados.
    const keys = [];
    clean.searchParams.forEach((_, k) => keys.push(k));
    keys.forEach((k) => clean.searchParams.delete(k));
    keep.forEach(([k, v]) => clean.searchParams.append(k, v));
    clean.hash = '';
    let str = clean.toString();
    // Quita la barra final sobrante para rutas simples.
    str = str.replace(/\?$/, '');
    return str;
  }

  return { analyze, normalizeInput, PLATFORMS, TRACKING_PARAMS, SHORTENERS };
});
