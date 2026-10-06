// Anleitung Schritt für Schritt – gemeinsam für de, en, ar. Beschriftung „Weiter“/„Zum Download“ kommt aus data-weiter/data-ende am Knopf.
(function () {
  const karten = [...document.querySelectorAll('.karte-schritt')];
  const liste = document.getElementById('liste');
  const weiter = document.getElementById('weiter');
  const textWeiter = weiter.dataset.weiter || weiter.textContent;
  const textEnde = weiter.dataset.ende || 'Zum Download';
  const rtl = document.documentElement.dir === 'rtl';
  let i = 0;
  karten.forEach((k, n) => {
    const li = document.createElement('li');
    const b = document.createElement('button');
    b.textContent = k.dataset.titel;
    b.addEventListener('click', () => zeige(n));
    li.appendChild(b); liste.appendChild(li);
  });
  function zeige(n) {
    i = Math.max(0, Math.min(karten.length - 1, n));
    karten.forEach((k, m) => k.classList.toggle('sichtbar', m === i));
    [...liste.querySelectorAll('button')].forEach((b, m) => b.classList.toggle('aktiv', m === i));
    document.getElementById('balken').style.width = ((i + 1) / karten.length * 100) + '%';
    document.getElementById('zurueck').disabled = i === 0;
    weiter.textContent = i === karten.length - 1 ? textEnde : textWeiter;
    history.replaceState(null, '', '#schritt-' + (i + 1));
  }
  document.getElementById('zurueck').addEventListener('click', () => zeige(i - 1));
  weiter.addEventListener('click', () => { if (i === karten.length - 1) location.href = 'index.html#download'; else zeige(i + 1); });
  document.addEventListener('keydown', e => {
    if (e.key === 'ArrowRight') zeige(rtl ? i - 1 : i + 1);
    if (e.key === 'ArrowLeft') zeige(rtl ? i + 1 : i - 1);
  });
  const m = location.hash.match(/schritt-(\d+)/);
  zeige(m ? parseInt(m[1], 10) - 1 : 0);
})();
