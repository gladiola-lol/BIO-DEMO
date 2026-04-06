/**
 * BIOLINK — RENDERER
 * Construye el DOM de forma segura sin innerHTML con datos del usuario
 */
var BL_Renderer = (function () {
  'use strict';

  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text) e.textContent = text;
    return e;
  }

  function safeUrl(url) {
    if (!url) return '#';
    var u = url.trim();
    try {
      var p = new URL(u);
      if (['http:','https:','mailto:','tel:'].indexOf(p.protocol) !== -1) return u;
    } catch(e) {
      if (/^(assets\/|#)/.test(u)) return u;
    }
    return '#';
  }

  function resolveAssetPath(path) {
    if (!path || typeof path !== 'string') return path;
    if (path.startsWith('data:') || path.startsWith('http://') || path.startsWith('https://') || path.startsWith('/')) return path;
    var basePath = (typeof window !== 'undefined' && window.__biolink_basePath) ? window.__biolink_basePath : '';
    if (basePath) {
      if (path.startsWith(basePath + '/')) return path;
      if (path.startsWith(basePath.slice(1) + '/')) return '/' + path;
      return basePath + '/' + path;
    }
    return path;
  }

  // ─── BANNER ────────────────────────────────────────────────────
  function renderBanner(cfg) {
    var sec = document.getElementById('banner-section');
    if (!sec) return;
    var p = cfg.profile || {};
    if (!p.banner) return;
    var wrap = el('div', 'bl-banner');
    var img = document.createElement('img');
    img.src = p.banner;
    img.alt = '';
    img.loading = 'eager';
    img.onerror = function(){ sec.innerHTML = ''; };
    wrap.appendChild(img);
    sec.appendChild(wrap);
  }

  // ─── PERFIL ────────────────────────────────────────────────────
  function renderProfile(cfg) {
    var sec = document.getElementById('profile-section');
    if (!sec) return;
    var p = cfg.profile || {};
    var t = cfg.theme || {};

    var effect = t.avatarEffect || 'glow';
    var shape  = t.avatarShape  === 'rounded' ? ' rounded' : t.avatarShape === 'square' ? ' square' : '';

    var wrap = el('div', 'bl-avatar-wrap bl-avatar-' + effect);
    if (p.avatar) {
      var img = document.createElement('img');
      img.src = p.avatar;
      img.alt = p.name || '';
      img.className = 'bl-avatar' + shape;
      img.loading = 'eager';
      img.onerror = function(){
        var ph = el('div', 'bl-avatar bl-avatar-ph' + shape);
        ph.textContent = ((p.name || '?').charAt(0)).toUpperCase();
        wrap.replaceChild(ph, img);
      };
      wrap.appendChild(img);
    } else {
      var ph = el('div', 'bl-avatar bl-avatar-ph' + shape);
      ph.textContent = ((p.name || '?').charAt(0)).toUpperCase();
      wrap.appendChild(ph);
    }

    if (p.verified) {
      var badge = el('div', 'bl-verified');
      badge.innerHTML = BL_ICONS['verified'];
      wrap.appendChild(badge);
    }
    sec.appendChild(wrap);

    if (p.name) sec.appendChild(el('h1', 'bl-name', p.name));
    if (p.username) sec.appendChild(el('div', 'bl-username', p.username));
    if (p.bio) sec.appendChild(el('p', 'bl-bio', p.bio));
  }

  // ─── REDES SOCIALES ────────────────────────────────────────────
  function renderSocial(cfg) {
    var sec = document.getElementById('social-section');
    if (!sec) return;
    var s = cfg.social || {};
    var nets = ['instagram','tiktok','youtube','facebook','twitter','linkedin',
                'spotify','pinterest','telegram','whatsapp','github','email','website'];
    var hasAny = false;

    nets.forEach(function(net) {
      var val = s[net];
      if (!val) return;
      hasAny = true;
      var a = document.createElement('a');
      a.className = 'bl-social-link bl-social-' + net;
      a.setAttribute('aria-label', net);
      a.setAttribute('rel', 'noopener noreferrer');
      a.target = '_blank';

      if (net === 'email') a.href = 'mailto:' + val;
      else if (net === 'whatsapp') a.href = 'https://wa.me/' + String(val).replace(/\D/g,'');
      else a.href = safeUrl(val);

      a.innerHTML = BL_ICONS[net] || BL_ICONS['link'];
      sec.appendChild(a);
    });

    if (!hasAny) sec.style.display = 'none';
  }

  // ─── LINKS ─────────────────────────────────────────────────────
  function renderLinks(cfg) {
    var sec = document.getElementById('links-section');
    if (!sec) return;
    var links = (cfg.links || []).filter(function(l){ return l.visible !== false; });
    var t = cfg.theme || {};
    var bStyle = t.buttonStyle || 'glass';

    function getSocialPlatform(url) {
      if (!url) return null;
      var u = url.toLowerCase();
      if (u.includes('instagram.com')) return 'instagram';
      if (u.includes('tiktok.com')) return 'tiktok';
      if (u.includes('facebook.com') || u.includes('fb.com')) return 'facebook';
      if (u.includes('maps.google.com') || u.includes('goo.gl/maps') || u.includes('maps.app.goo.gl')) return 'location';
      return null;
    }

    links.forEach(function(lnk) {
      var a = document.createElement('a');
      var platform = getSocialPlatform(lnk.url);
      var linkClass = 'bl-link bl-link-' + bStyle;
      if (bStyle === 'brand' && platform) {
        linkClass += ' bl-link-' + platform;
      }
      if (lnk.highlight) linkClass += ' bl-link-highlight';
      a.className = linkClass;
      a.href = safeUrl(lnk.url);
      a.target = '_blank';
      a.rel = 'noopener noreferrer';

      // Imagen o icono
      if (lnk.image) {
        var img = document.createElement('img');
        img.src = resolveAssetPath(lnk.image);
        img.className = 'bl-link-img';
        img.alt = lnk.label || '';
        img.loading = 'lazy';
        img.onerror = function() {
          img.remove();
          var ic = el('div', 'bl-link-icon');
          ic.innerHTML = BL_ICONS[lnk.icon] || BL_ICONS['link'];
          a.insertBefore(ic, a.firstChild);
        };
        a.appendChild(img);
      } else {
        var ic = el('div', 'bl-link-icon');
        ic.innerHTML = BL_ICONS[lnk.icon] || BL_ICONS['link'];
        a.appendChild(ic);
      }

      var textWrap = el('span', 'bl-link-text');
      textWrap.appendChild(el('span', 'bl-link-title', lnk.label || ''));
      if (lnk.subtitle) textWrap.appendChild(el('span', 'bl-link-sub', lnk.subtitle));
      a.appendChild(textWrap);

      if (lnk.badge) {
        var badge = el('span', 'bl-link-badge', lnk.badge);
        if (lnk.badgeColor) badge.style.background = lnk.badgeColor;
        a.appendChild(badge);
      }

      var arr = el('span', 'bl-link-arrow');
      arr.innerHTML = BL_ICONS['arrow'];
      a.appendChild(arr);

      sec.appendChild(a);
    });
  }

  function renderForm(cfg) {
    var sec = document.getElementById('footer-section');
    if (!sec) return;
    var formCfg = cfg.form || {};
    if (!formCfg.enabled) return;
    var labels = String(formCfg.labels || '').split(',').map(function(label){ return label.trim(); }).filter(Boolean);
    if (!labels.length) return;

    var card = el('div', 'bl-form-card');
    var titleText = formCfg.buttonLabel && formCfg.buttonLabel.trim() ? formCfg.buttonLabel : 'Formulario';
    var title = el('h2', 'bl-form-title', titleText);
    card.appendChild(title);

    var formEl = document.createElement('form');
    formEl.className = 'bl-form';
    formEl.onsubmit = function(e){ e.preventDefault(); };

    labels.forEach(function(label, idx) {
      var field = el('div', 'bl-form-field');
      var lab = el('label', '', label);
      lab.className = 'bl-form-label';
      var input;
      if (/mensaje|comentario|consulta/i.test(label) && labels.length > 1) {
        input = document.createElement('textarea');
        input.className = 'bl-form-textarea';
      } else {
        input = document.createElement('input');
        input.type = 'text';
        input.className = 'bl-form-input';
      }
      input.placeholder = label;
      input.disabled = true;
      field.appendChild(lab);
      field.appendChild(input);
      formEl.appendChild(field);
    });

    var btn = document.createElement('button');
    btn.type = 'submit';
    btn.className = 'bl-form-btn';
    btn.textContent = formCfg.buttonLabel || 'Enviar';
    if (formCfg.buttonColor) btn.style.background = formCfg.buttonColor;
    formEl.appendChild(btn);

    card.appendChild(formEl);
    sec.appendChild(card);
  }

  // ─── FOOTER ────────────────────────────────────────────────────
  function renderFooter(cfg) {
    var sec = document.getElementById('footer-section');
    if (!sec) return;
    var fb = cfg.footer || null;
    if (!fb && cfg.poweredBy) {
      fb = {enabled:cfg.poweredBy.show,text:((cfg.poweredBy.label?cfg.poweredBy.label+' ':'')+(cfg.poweredBy.name||'')),url:cfg.poweredBy.url,color:'',location:''};
    }
    if (!fb || !fb.enabled || !fb.text) return;
    var footer = el('div', 'bl-footer');
    var content = el('div', 'bl-footer-content');
    var creditsP = el('p', 'bl-footer-credits');
    if (fb.color) creditsP.style.color = fb.color;
    if (fb.url) {
      var a = document.createElement('a');
      a.href = safeUrl(fb.url);
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      a.textContent = fb.text;
      a.className = 'bl-footer-link';
      if (fb.color) a.style.color = fb.color;
      creditsP.appendChild(a);
    } else {
      creditsP.textContent = fb.text;
    }
    content.appendChild(creditsP);
    if (fb.location) {
      var locP = el('p', 'bl-footer-location');
      if (fb.color) locP.style.color = fb.color;
      locP.innerHTML = '<svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M12 2a8 8 0 0 0-8 8c0 5.333 8 12 8 12s8-6.667 8-12a8 8 0 0 0-8-8zm0 12a4 4 0 1 1 0-8 4 4 0 0 1 0 8z"/></svg>' + fb.location;
      content.appendChild(locP);
    }
    footer.appendChild(content);
    sec.appendChild(footer);
  }

  // ─── VIDEO DE PRESENTACIÓN ─────────────────────────────────────
  function _toEmbedUrl(url) {
    if (!url) return null;
    var u = url.trim();
    console.log('[BioLink] _toEmbedUrl input:', u);
    
    // Si ya es una URL de embed, devolverla directamente
    if (u.includes('youtube.com/embed/') || u.includes('youtube-nocookie.com/embed/')) {
      console.log('[BioLink] _toEmbedUrl: Already embed URL, returning as-is');
      return u;
    }
    
    // Patrones para extraer ID de diferentes formatos
    var patterns = [
      /(?:youtube\.com\/watch\?v=)([A-Za-z0-9_-]{11})/,
      /(?:youtube\.com\/watch\?.*[&]v=)([A-Za-z0-9_-]{11})/,
      /(?:youtube\.com\/shorts\/)([A-Za-z0-9_-]{11})/,
      /(?:youtu\.be\/)([A-Za-z0-9_-]{11})/,
      /(?:youtube\.com\/v\/)([A-Za-z0-9_-]{11})/,
      /([A-Za-z0-9_-]{11})/,
    ];
    
    for (var i = 0; i < patterns.length; i++) {
      var match = u.match(patterns[i]);
      if (match && match[1]) {
        var embedUrl = 'https://www.youtube.com/embed/' + match[1];
        console.log('[BioLink] _toEmbedUrl matched ID:', match[1], '=> embed URL:', embedUrl);
        return embedUrl;
      }
    }
    
    console.log('[BioLink] _toEmbedUrl no match found');
    return null;
  }


  function _extractVideoId(embedUrl) {
    var m = embedUrl.match(/\/embed\/([A-Za-z0-9_-]{11})/);
    return m ? m[1] : null;
  }

  function renderPresentation(cfg) {
    var sec = document.getElementById('links-section');
    if (!sec) return;
    var pres = cfg.presentation;
    if (!pres || !pres.enabled || !pres.url) return;
    var embedUrl = _toEmbedUrl(pres.url);
    if (!embedUrl) return;

    var wrap = el('div', 'bl-video-wrap');
    if (pres.label) {
      var lbl = el('p', 'bl-video-label', pres.label);
      wrap.appendChild(lbl);
    }
    var iframeWrap = el('div', 'bl-video-frame');

    // En preview (srcdoc, origen null) YouTube bloquea todos los iframes con Error 153.
    // Mostrar thumbnail clicable en su lugar.
    var isNullOrigin = (typeof window !== 'undefined' && (window.origin === 'null' || window.origin === 'about:blank' || window.location.href === 'about:blank'));
    if (isNullOrigin) {
      var videoId = _extractVideoId(embedUrl);
      var thumb = document.createElement('a');
      thumb.href = pres.url;
      thumb.target = '_blank';
      thumb.rel = 'noopener noreferrer';
      thumb.className = 'bl-video-thumb-link';
      if (videoId) {
        var thumbImg = document.createElement('img');
        thumbImg.src = 'https://img.youtube.com/vi/' + videoId + '/hqdefault.jpg';
        thumbImg.alt = pres.label || 'Video';
        thumbImg.className = 'bl-video-thumb-img';
        thumb.appendChild(thumbImg);
      }
      var playBtn = el('div', 'bl-video-thumb-play');
      playBtn.innerHTML = '<svg viewBox="0 0 68 48" width="68" height="48"><path d="M66.52 7.74c-.78-2.93-2.49-5.41-5.42-6.19C55.79.13 34 0 34 0S12.21.13 6.9 1.55c-2.93.78-4.63 3.26-5.42 6.19C.06 13.05 0 24 0 24s.06 10.95 1.48 16.26c.78 2.93 2.49 5.41 5.42 6.19C12.21 47.87 34 48 34 48s21.79-.13 27.1-1.55c2.93-.78 4.64-3.26 5.42-6.19C67.94 34.95 68 24 68 24s-.06-10.95-1.48-16.26z" fill="#f00"/><path d="M45 24 27 14v20" fill="#fff"/></svg>';
      thumb.appendChild(playBtn);
      var note = el('p', 'bl-video-thumb-note', '▶ Vista previa — el video carga en el sitio publicado');
      iframeWrap.appendChild(thumb);
      iframeWrap.appendChild(note);
    } else {
      embedUrl += (embedUrl.indexOf('?') === -1 ? '?' : '&') + 'rel=0&modestbranding=1&fs=1';
      var iframe = document.createElement('iframe');
      iframe.src = embedUrl;
      iframe.setAttribute('title', pres.label || 'Video');
      iframe.setAttribute('frameborder', '0');
      iframe.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen');
      iframe.setAttribute('allowfullscreen', 'true');
      iframe.setAttribute('loading', 'lazy');
      iframe.setAttribute('referrerpolicy', 'strict-origin-when-cross-origin');
      iframeWrap.appendChild(iframe);
    }

    wrap.appendChild(iframeWrap);

    if (pres.position === 'before-links') {
      sec.insertBefore(wrap, sec.firstChild);
    } else {
      sec.appendChild(wrap);
    }
  }

  // ─── WHATSAPP FLOTANTE ─────────────────────────────────────────
  function renderWhatsApp(cfg) {
    var sec = document.getElementById('wa-float');
    if (!sec) return;
    var wa = cfg.whatsapp;
    if (!wa || !wa.enabled || !wa.number) return;
    var phone = String(wa.number).replace(/\D/g,'');
    var msg   = encodeURIComponent(wa.message || '');
    var a = document.createElement('a');
    a.className = 'bl-wa-btn';
    a.href = 'https://wa.me/' + phone + (msg ? '?text=' + msg : '');
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    a.innerHTML = BL_ICONS['whatsapp'];
    var lbl = el('span', '', wa.buttonLabel || 'Escríbeme');
    a.appendChild(lbl);
    sec.appendChild(a);
  }

  return {
    render: function(cfg) {
      ['banner-section','profile-section','social-section','links-section','footer-section','wa-float'].forEach(function(sid){
        var node=document.getElementById(sid);
        if(node){ node.innerHTML=''; node.style.display=''; }
      });
      renderBanner(cfg);
      renderProfile(cfg);
      renderSocial(cfg);
      renderLinks(cfg);
      renderForm(cfg);
      renderPresentation(cfg);
      renderWhatsApp(cfg);
      renderFooter(cfg);
    }
  };
})();
