/* Antigravity landing — UI interactions (header scroll state, sliders, video hover).
   Lightweight replacements for the original Angular component behaviours. */
(function () {
  'use strict';

  /* ---- header: toggle 'scrolled' background after a small scroll ---- */
  var header = document.querySelector('.header');
  if (header) {
    var onScroll = function () {
      if (window.scrollY > 24) header.classList.add('scrolled');
      else header.classList.remove('scrolled');
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ---- generic horizontal slider (track + prev/next buttons) ---- */
  function makeSlider(track, prevSel, nextSel, perStep) {
    if (!track) return;
    var prev = document.querySelector(prevSel);
    var next = document.querySelector(nextSel);
    var index = 0;
    function maxIndex() {
      var items = track.children.length;
      var visible = Math.max(1, Math.round(track.parentElement.offsetWidth / (track.children[0] ? track.children[0].offsetWidth : 1)));
      return Math.max(0, items - visible);
    }
    function apply() {
      var step = track.children[0] ? track.children[0].offsetWidth : 0;
      var gap = parseFloat(getComputedStyle(track).columnGap || getComputedStyle(track).gap || '0') || 0;
      track.style.transition = 'transform .5s cubic-bezier(.16,1,.3,1)';
      track.style.transform = 'translate3d(' + (-(step + gap) * index) + 'px,0,0)';
      if (prev) prev.disabled = index <= 0;
      if (next) next.disabled = index >= maxIndex();
    }
    if (prev) prev.addEventListener('click', function () { index = Math.max(0, index - (perStep || 1)); apply(); });
    if (next) next.addEventListener('click', function () { index = Math.min(maxIndex(), index + (perStep || 1)); apply(); });
    window.addEventListener('resize', function () { index = Math.min(index, maxIndex()); apply(); });
    apply();
  }

  makeSlider(document.querySelector('[data-blog-track]'), '[data-blog-prev]', '[data-blog-next]', 2);

  /* ---- use-cases slider: also swaps the active copy block ---- */
  (function () {
    var track = document.querySelector('[data-use-case-track]');
    if (!track) return;
    var prev = document.querySelector('[data-use-case-prev]');
    var next = document.querySelector('[data-use-case-next]');
    var copies = document.querySelectorAll('.slider-copy');
    var index = 0;
    function apply() {
      var step = track.children[0] ? track.children[0].offsetWidth : 0;
      var gap = parseFloat(getComputedStyle(track).columnGap || getComputedStyle(track).gap || '0') || 0;
      track.style.transition = 'transform .5s cubic-bezier(.16,1,.3,1)';
      track.style.transform = 'translate3d(' + (-(step + gap) * index) + 'px,0,0)';
      copies.forEach(function (c, i) { c.classList.toggle('is-active', i === index); });
      if (prev) prev.disabled = index <= 0;
      if (next) next.disabled = index >= track.children.length - 1;
    }
    if (prev) prev.addEventListener('click', function () { index = Math.max(0, index - 1); apply(); });
    if (next) next.addEventListener('click', function () { index = Math.min(track.children.length - 1, index + 1); apply(); });
    apply();
  })();

  /* ---- video / slide hover: reveal the play-control cursor ---- */
  document.querySelectorAll('.video-wrapper, .slide-image').forEach(function (el) {
    var ctrl = el.querySelector('.video-control-button');
    if (!ctrl) return;
    el.addEventListener('mouseenter', function () { ctrl.style.opacity = '1'; ctrl.style.transform = 'scale(1)'; });
    el.addEventListener('mouseleave', function () { ctrl.style.opacity = '0'; ctrl.style.transform = 'scale(.8)'; });
  });
})();
