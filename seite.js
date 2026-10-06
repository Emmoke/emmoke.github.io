// Gemeinsames Skript der Startseiten (de, en, ar): Version, Download-Links, Zustimmung vor dem Download, Download-Zähler.
(function () {
  // Nicht in fremden Seiten einbetten lassen (Schutz gegen gefälschte Rahmen-Seiten / Clickjacking)
  if (window.top !== window.self) { window.top.location = window.self.location.href; return; }
  var k = window.EMMOKE || {};
  var sprache = (document.documentElement.lang || "de").slice(0, 2);
  var T = {
    de: { bald: "Bald verfügbar", handbuch: "Handbuch folgt", kontakt: "Kontakt", zaehler: "Bisher heruntergeladen", handbuchName: "Handbuch", zahl: "de-DE" },
    en: { bald: "Coming soon", handbuch: "Manual coming soon", kontakt: "Contact", zaehler: "Downloads so far", handbuchName: "Manual", zahl: "en-GB" },
    ar: { bald: "قريبًا", handbuch: "الدليل قريبًا", kontakt: "تواصل", zaehler: "عدد التنزيلات حتى الآن", handbuchName: "الدليل", zahl: "ar-EG" }
  }[sprache] || {};

  document.querySelectorAll(".version").forEach(function (e) { e.textContent = k.version || ""; });
  function link(id, ziel, sonst) {
    var a = document.getElementById(id);
    if (!a) return;
    if (ziel) { a.href = ziel; } else { a.classList.add("aus"); a.textContent = sonst; a.removeAttribute("href"); }
  }
  link("dl-windows", k.downloadWindows, T.bald);
  link("dl-android", k.downloadAndroid, T.bald);
  link("dl-ios", k.downloadIos, T.bald);
  link("dl-handbuch", k.handbuch, T.handbuch);
  link("kontakt", k.kontaktEmail ? "mailto:" + k.kontaktEmail : "", T.kontakt);

  // SHA-256-Prüfsummen der Downloads (schreibt webseite_veroeffentlichen.ps1 in konfig.js) – zum Prüfen, dass die Datei unverändert ist
  [["sha-windows", k.sha256Windows], ["sha-android", k.sha256Android], ["zert-android", k.zertifikatAndroid]].forEach(function (p) {
    var e = document.getElementById(p[0]);
    if (!e || !p[1]) return;
    e.textContent = (e.dataset.titel || "SHA-256") + ": " + p[1];
    e.hidden = false;
  });

  // Downloads erst nach Zustimmung zu Nutzungsbedingungen und Datenschutz
  var haken = document.getElementById("zustimmung");
  var hinweis = document.getElementById("zustimmung-hinweis");
  if (haken) {
    var dl = ["dl-windows", "dl-android", "dl-handbuch"].map(function (id) { return document.getElementById(id); })
      .filter(function (a) { return a && a.hasAttribute("href"); });
    var freigeben = function () {
      dl.forEach(function (a) { a.classList.toggle("gesperrt", !haken.checked); a.setAttribute("aria-disabled", String(!haken.checked)); });
      if (hinweis) hinweis.hidden = haken.checked;
    };
    dl.forEach(function (a) {
      a.addEventListener("click", function (e) {
        if (!haken.checked) { e.preventDefault(); haken.focus(); if (hinweis) hinweis.hidden = false; haken.closest(".zustimmung").scrollIntoView({ block: "center" }); }
      });
    });
    haken.addEventListener("change", freigeben);
    freigeben();
  }

  // Wie oft heruntergeladen (Zähler von GitHub, alle Versionen zusammen, ohne Cookies)
  var z = document.getElementById("zaehler");
  if (z && k.zaehlerRepo) {
    fetch("https://api.github.com/repos/" + k.zaehlerRepo + "/releases?per_page=100")
      .then(function (r) { return r.ok ? r.json() : Promise.reject(); })
      .then(function (releases) {
        var n = { win: 0, android: 0, pdf: 0 };
        releases.forEach(function (rel) {
          (rel.assets || []).forEach(function (a) {
            if (/\.exe$/i.test(a.name)) n.win += a.download_count;
            else if (/\.apk$/i.test(a.name)) n.android += a.download_count;
            else if (/\.pdf$/i.test(a.name)) n.pdf += a.download_count;
          });
        });
        var f = function (x) { return x.toLocaleString(T.zahl); };
        z.textContent = T.zaehler + ": Windows " + f(n.win) + " · Android " + f(n.android) + " · " + T.handbuchName + " " + f(n.pdf);
        z.hidden = false;
      })
      .catch(function () { });
  }
})();
