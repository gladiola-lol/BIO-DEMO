/**
 * BIOLINK — ANIMACIONES Y EFECTOS DE FONDO
 */
var BL_Animations = (function () {
  'use strict';

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function initEntrance(type) {
    if (reduced || !type || type === 'none') return;
    var clsMap = { 'fade':'bl-anim-fade','slide-up':'bl-anim-slide','zoom':'bl-anim-zoom' };
    var cls = clsMap[type] || 'bl-anim-slide';
    var els = document.querySelectorAll('.bl-avatar-wrap,.bl-name,.bl-username,.bl-bio,.bl-social-link,.bl-link,.bl-wa-btn');
    els.forEach(function(e, i) {
      e.classList.add('bl-anim-in', cls);
      e.style.animationDelay = (i * 0.06) + 's';
    });
  }

  function initParticles(colors) {
    if (reduced) return;
    var c = document.getElementById('bg-fx');
    if (!c) return;
    for (var i = 0; i < 24; i++) {
      var p = document.createElement('div');
      p.className = 'bl-particle';
      var size = Math.random() * 4 + 2;
      p.style.cssText = [
        'width:' + size + 'px',
        'height:' + size + 'px',
        'left:' + (Math.random()*100) + '%',
        'background:' + colors[i % colors.length],
        'animation-duration:' + (Math.random()*18+14) + 's',
        'animation-delay:' + (-(Math.random()*30)) + 's',
      ].join(';');
      c.appendChild(p);
    }
  }

  function initAurora() {
    var c = document.getElementById('bg-fx');
    if (!c) return;
    var d = document.createElement('div');
    d.className = 'bl-aurora';
    c.appendChild(d);
  }

  function initGradient() {
    var c = document.getElementById('bg-fx');
    if (!c) return;
    var d = document.createElement('div');
    d.className = 'bl-grad-anim';
    c.appendChild(d);
  }

  function initMesh() {
    var c = document.getElementById('bg-fx');
    if (!c) return;
    ['bl-mesh-1','bl-mesh-2','bl-mesh-3'].forEach(function(cls){
      var d = document.createElement('div');
      d.className = 'bl-mesh-item ' + cls;
      c.appendChild(d);
    });
  }

  function initBgFx(cfg) {
    var fx     = (cfg.theme && cfg.theme.backgroundFx) || 'none';
    var colors = [(cfg.colors && cfg.colors.primary)||'#7C3AED', (cfg.colors && cfg.colors.secondary)||'#EC4899'];
    switch(fx) {
      case 'particles': initParticles(colors); break;
      case 'aurora':    initAurora();           break;
      case 'gradient':  initGradient();         break;
      case 'mesh':      initMesh();             break;
    }
  }

  return {
    init: function(cfg) {
      initBgFx(cfg);
      var anim = (cfg.theme && cfg.theme.animation) || 'slide-up';
      initEntrance(anim);
    }
  };
})();
