/**
 * BIOLINK — ORQUESTADOR PRINCIPAL
 * Lee BIOLINK_CONFIG y renderiza todo el biolink
 */
(function () {
  'use strict';

  function hexToRgb(hex) {
    var m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!m) return '124,58,237';
    return parseInt(m[1],16)+','+parseInt(m[2],16)+','+parseInt(m[3],16);
  }

  function setVar(k, v) { document.documentElement.style.setProperty(k, v); }

  function applyTheme(cfg) {
    var c = cfg.colors || {};
    var t = cfg.theme  || {};

    setVar('--bl-primary',    c.primary    || '#7C3AED');
    setVar('--bl-secondary',  c.secondary  || '#EC4899');
    setVar('--bl-accent',     c.accent     || '#F59E0B');
    setVar('--bl-bg',         c.background || '#0F0F0F');
    setVar('--bl-surface',    c.surface    || '#1A1A1A');
    setVar('--bl-text',       c.text       || '#FFFFFF');
    setVar('--bl-muted',      c.textMuted  || '#A3A3A3');
    setVar('--bl-border',     c.border     || '#2A2A2A');
    setVar('--bl-primary-rgb', hexToRgb(c.primary || '#7C3AED'));

    var radMap = {none:'0',sm:'8px',md:'12px',lg:'20px',full:'9999px'};
    setVar('--bl-btn-radius', radMap[t.buttonRadius] || '9999px');

    var fH = t.fontHeading || 'Poppins';
    var fB = t.fontBody    || 'Inter';
    setVar('--bl-font-heading', "'" + fH + "',sans-serif");
    setVar('--bl-font-body',    "'" + fB + "',sans-serif");

    // Cargar Google Fonts
    var fonts = [fH, fB].filter(function(f,i,a){ return a.indexOf(f)===i; });
    var q = fonts.map(function(f){ return 'family='+f.replace(/ /g,'+') + ':wght@400;500;600;700;800'; }).join('&');
    var lk = document.getElementById('google-fonts');
    if (lk) lk.href = 'https://fonts.googleapis.com/css2?' + q + '&display=swap';

    // Modo claro/oscuro
    var mode = t.mode || 'dark';
    if (mode === 'auto') mode = window.matchMedia('(prefers-color-scheme:light)').matches ? 'light' : 'dark';
    if (mode === 'light') document.body.classList.add('bl-light');
    else document.body.classList.remove('bl-light');

    // Template
    if (cfg.template || t.template) document.body.setAttribute('data-template', cfg.template || t.template);

    // Estilo iconos de redes sociales
    document.body.classList.remove('bl-social-brand','bl-social-outline');
    var sStyle = t.socialIconStyle || 'default';
    if (sStyle === 'brand')   document.body.classList.add('bl-social-brand');
    if (sStyle === 'outline') document.body.classList.add('bl-social-outline');

    // Estilo de botones
    document.body.classList.remove('bl-button-brand');
    var bStyle = t.buttonStyle || 'glass';
    if (bStyle === 'brand') document.body.classList.add('bl-button-brand');

    // Posición de redes sociales
    document.body.classList.remove('bl-social-bottom','bl-social-left','bl-social-right','bl-social-corner-tl','bl-social-top-compact');
    var sPos = t.socialPosition || 'top';
    if (sPos !== 'top') document.body.classList.add('bl-social-' + sPos);

    // Imagen de fondo
    var page = document.querySelector('.bl-page');
    if (page && cfg.bgImage) {
      page.style.backgroundImage = 'url("' + cfg.bgImage + '")';
      page.style.backgroundSize  = 'cover';
      page.style.backgroundPosition = 'center';
    }
  }

  function applySEO(cfg) {
    var seo = cfg.seo || {};
    var p   = cfg.profile || {};
    var title = seo.title || p.name || 'BioLink';
    document.title = title;
    var tc = document.getElementById('meta-theme');
    if (tc) tc.content = seo.themeColor || (cfg.colors && cfg.colors.primary) || '#7C3AED';
  }

  function init() {
    var cfg = (typeof BIOLINK_CONFIG !== 'undefined') ? BIOLINK_CONFIG : null;
    if (!cfg) { console.error('BioLink: no se encontró BIOLINK_CONFIG'); return; }

    applyTheme(cfg);
    applySEO(cfg);
    BL_Renderer.render(cfg);
    BL_Animations.init(cfg);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();

})();
