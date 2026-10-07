// Gemeinsames Skript der Startseiten (de, en, ar): Version, Download-Links, Zustimmung vor dem Download, Download-Zähler.
(function () {
  // Nicht in fremden Seiten einbetten lassen (Schutz gegen gefälschte Rahmen-Seiten / Clickjacking)
  if (window.top !== window.self) { window.top.location = window.self.location.href; return; }
  var k = window.EMMOKE || {};
  var sprache = (document.documentElement.lang || "de").slice(0, 2);
  var T = {
    de: { bald: "Bald verfügbar", handbuch: "Handbuch folgt", kontakt: "Kontakt", handbuchName: "Handbuch", zahl: "de-DE",
          danke: "Dankeschön!", dankeText: "Ihr Download startet gleich. Viel Freude beim Testen von Emmoke!" },
    en: { bald: "Coming soon", handbuch: "Manual coming soon", kontakt: "Contact", handbuchName: "Manual", zahl: "en-GB",
          danke: "Thank you!", dankeText: "Your download is starting. Enjoy testing Emmoke!" },
    ar: { bald: "قريبًا", handbuch: "الدليل قريبًا", kontakt: "تواصل", handbuchName: "الدليل", zahl: "de-DE", win: "ويندوز", android: "أندرويد",
          danke: "شكرًا لك!", dankeText: "سيبدأ التنزيل الآن. نتمنى لك تجربة ممتعة مع إيموك!" }
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

  // Freiwillige Unterstützung: Abschnitt nur zeigen, wenn in konfig.js ein https-Link eingetragen ist
  var unterstuetzen = document.getElementById("unterstuetzen");
  if (unterstuetzen && /^https:\/\/[^\s"'<>]+$/.test(k.unterstuetzenLink || "")) {
    document.getElementById("unterstuetzen-link").href = k.unterstuetzenLink;
    unterstuetzen.hidden = false;
  }

  // SHA-256-Prüfsummen der Downloads (schreibt webseite_veroeffentlichen.ps1 in konfig.js) – zum Prüfen, dass die Datei unverändert ist
  // Dateiname (mit Version) + Prüfsumme direkt unter dem jeweiligen Download
  var datei = function (url) { return url ? decodeURIComponent(url.split("/").pop()) : ""; };
  [["sha-windows", k.sha256Windows, datei(k.downloadWindows)], ["sha-android", k.sha256Android, datei(k.downloadAndroid)], ["zert-android", k.zertifikatAndroid, ""]].forEach(function (p) {
    var e = document.getElementById(p[0]);
    if (!e || !p[1]) return;
    e.textContent = (p[2] ? p[2] + " · " : "") + (e.dataset.titel || "SHA-256") + ": " + p[1];
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
        if (!haken.checked) { e.preventDefault(); haken.focus(); if (hinweis) hinweis.hidden = false; haken.closest(".zustimmung").scrollIntoView({ block: "center" }); return; }
        danke();   // Download läuft normal weiter – nur ein Dankeschön darüber
      });
    });
    haken.addEventListener("change", freigeben);
    freigeben();
  }

  var ruhig = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var f = function (x) { return Math.round(x).toLocaleString(T.zahl); };

  // Zahl hochzählen lassen, sobald sie sichtbar wird
  function hochzaehlen(el, ziel) {
    el.textContent = f(ziel);   // die richtige Zahl steht immer da – die Animation ist nur Zugabe
    if (ruhig || !("IntersectionObserver" in window)) return;
    var start = function () {
      var t0 = performance.now(), dauer = 1400;
      (function schritt(t) {
        var p = Math.min(1, (t - t0) / dauer), e = 1 - Math.pow(1 - p, 3);
        el.textContent = f(ziel * e);
        if (p < 1) requestAnimationFrame(schritt);
      })(t0);
      setTimeout(function () { el.textContent = f(ziel); }, dauer + 300);   // falls der Browser Animationen anhält
    };
    var io = new IntersectionObserver(function (eintraege) {
      if (eintraege.some(function (x) { return x.isIntersecting; })) { io.disconnect(); start(); }
    }, { threshold: 0.4 });
    io.observe(el);
  }

  // Zähler: Downloads (GitHub, alle Versionen zusammen) und Besuche (GoatCounter, ohne Cookies – nur wenn in konfig.js eingetragen)
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
        document.getElementById("z-teile").textContent = (T.win || "Windows") + " " + f(n.win) + " · " + (T.android || "Android") + " " + f(n.android) + " · " + T.handbuchName + " " + f(n.pdf);
        z.hidden = false;
        hochzaehlen(document.getElementById("z-downloads"), n.win + n.android + n.pdf);
      })
      .catch(function () { });
  }
  if (/^[a-z0-9-]+$/.test(k.besucheCode || "")) {
    var basis = "https://" + k.besucheCode + ".goatcounter.com";
    // Besuch zählen: nur Seitenpfad und Titel, ohne Cookies
    new Image().src = basis + "/count?p=" + encodeURIComponent(location.pathname) + "&t=" + encodeURIComponent(document.title) + "&rnd=" + Math.random().toString(36).slice(2);
    if (z) fetch(basis + "/counter/TOTAL.json")
      .then(function (r) { return r.ok ? r.json() : Promise.reject(); })
      .then(function (j) {
        var zahl = parseInt(String(j.count).replace(/\D/g, ""), 10);
        if (!(zahl >= 0)) return;
        document.getElementById("z-besuche").hidden = false;
        z.hidden = false;
        hochzaehlen(document.getElementById("z-besuche-zahl"), zahl);
      })
      .catch(function () { });
  }

  // Dankeschön nach dem Klick auf einen Download – mit kleinem Konfetti
  function danke() {
    var alt = document.querySelector(".danke");
    if (alt) alt.remove();
    var box = document.createElement("div");
    box.className = "danke";
    box.setAttribute("role", "status");
    var karte = document.createElement("div");
    karte.className = "danke-karte";
    var h = document.createElement("b"); h.textContent = T.danke;
    var p = document.createElement("span"); p.textContent = T.dankeText;
    karte.appendChild(h); karte.appendChild(p);
    box.appendChild(karte);
    if (!ruhig) {
      var farben = ["#1F3864", "#2E75B6", "#2E7D32", "#E6A23C", "#3DDC84", "#C62828"];
      for (var i = 0; i < 36; i++) {
        var s = document.createElement("i");
        s.className = "konfetti";
        s.style.left = (Math.random() * 100) + "%";
        s.style.background = farben[i % farben.length];
        s.style.animationDelay = (Math.random() * 0.6) + "s";
        s.style.animationDuration = (1.8 + Math.random() * 1.4) + "s";
        s.style.transform = "rotate(" + Math.round(Math.random() * 360) + "deg)";
        box.appendChild(s);
      }
    }
    box.addEventListener("click", function () { box.remove(); });
    document.body.appendChild(box);
    setTimeout(function () { box.classList.add("weg"); }, 3800);
    setTimeout(function () { box.remove(); }, 4400);
  }
})();
