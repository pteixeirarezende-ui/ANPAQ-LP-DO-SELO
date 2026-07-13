// === STARS: generate twinkling stars in the transition section ===
(function(){
  const container = document.getElementById('stars');
  if (!container) return;
  const count = 70;
  const frag = document.createDocumentFragment();
  for (let i = 0; i < count; i++) {
    const star = document.createElement('div');
    star.className = 'star';
    const left = Math.random() * 100;
    const top = 35 + Math.random() * 60;
    const dur = 2 + Math.random() * 4;
    const del = Math.random() * 3;
    const size = 1 + Math.random() * 2;
    star.style.cssText = `left:${left}%;top:${top}%;--dur:${dur}s;--del:${del}s;width:${size}px;height:${size}px`;
    frag.appendChild(star);
  }
  container.appendChild(frag);
})();
