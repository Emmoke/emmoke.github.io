// Projektanfrage: baut aus dem Formular eine E-Mail und öffnet das E-Mail-Programm. Es wird nichts an die Webseite übertragen.
// Dazu: Schrittführung 01–05, optionaler Terminbuchungs-Link (konfig.js) und Menü/Anfrage-Leiste am Handy.
(function () {
  // Menü-Knopf (☰) am Handy
  var kopf = document.querySelector(".kopf");
  var mk = document.querySelector(".menue-knopf");
  if (kopf && mk) {
    mk.addEventListener("click", function () {
      var offen = kopf.classList.toggle("offen");
      mk.setAttribute("aria-expanded", offen ? "true" : "false");
    });
    kopf.querySelectorAll(".haupt-links a").forEach(function (a) {
      a.addEventListener("click", function () { kopf.classList.remove("offen"); mk.setAttribute("aria-expanded", "false"); });
    });
  }

  // Terminbuchung: Knöpfe nur zeigen, wenn in konfig.js ein https-Link eines Buchungsdienstes eingetragen ist
  var termin = (window.EMMOKE || {}).terminLink || "";
  if (/^https:\/\/[^\s"'<>]+$/.test(termin)) {
    document.querySelectorAll("#termin-link, .termin-knopf, #termin-info").forEach(function (e) {
      if (e.tagName === "A") e.href = termin;
      e.hidden = false;
    });
  }

  // Anfrage-Leiste unten am Handy ausblenden, solange das Formular sichtbar ist
  var leiste = document.querySelector(".cta-leiste");
  var kontakt = document.getElementById("kontakt");
  if (leiste && kontakt && "IntersectionObserver" in window) {
    new IntersectionObserver(function (e) { leiste.classList.toggle("weg", e[0].isIntersecting); }).observe(kontakt);
  }

  var f = document.getElementById("anfrage");
  if (!f) return;
  var d = f.dataset;
  function gewaehlt(name) {
    return Array.prototype.map.call(f.querySelectorAll("input[name=" + name + "]:checked"), function (e) {
      return e.parentNode.textContent.trim();
    }).join(", ") || "–";
  }
  function wert(id) { var e = document.getElementById(id); return (e && e.value.trim()) || "–"; }

  // Schrittführung: immer nur ein Abschnitt, oben die Fortschrittsanzeige
  var stufen = f.querySelectorAll("fieldset");
  var namen = (d.lStufen || "").split("|");
  var knoepfe = f.querySelector(".anfrage-knoepfe");
  if (stufen.length > 1 && knoepfe) {
    f.classList.add("stufig");
    var leisteOl = document.createElement("ol");
    leisteOl.className = "fortschritt";
    var punkte = [];
    stufen.forEach(function (s, i) {
      var li = document.createElement("li");
      var b = document.createElement("button");
      b.type = "button";
      var nr = document.createElement("span"); nr.className = "nr"; nr.textContent = ("0" + (i + 1)).slice(-2);
      var tx = document.createElement("span"); tx.className = "txt"; tx.textContent = namen[i] || "";
      b.appendChild(nr); b.appendChild(tx);
      b.addEventListener("click", function () { zeige(i); });
      li.appendChild(b); leisteOl.appendChild(li); punkte.push(li);
    });
    f.insertBefore(leisteOl, f.firstChild);
    var nav = document.createElement("div");
    nav.className = "stufen-nav";
    var zur = document.createElement("button"); zur.type = "button"; zur.className = "knopf hell"; zur.textContent = d.lZurueck || "Zurück";
    var wei = document.createElement("button"); wei.type = "button"; wei.className = "knopf"; wei.textContent = d.lWeiter || "Weiter";
    nav.appendChild(zur); nav.appendChild(wei);
    f.insertBefore(nav, knoepfe);
    var akt = 0;
    var zeige = function (i) {
      akt = Math.max(0, Math.min(stufen.length - 1, i));
      stufen.forEach(function (s, k) { s.hidden = k !== akt; });
      punkte.forEach(function (li, k) {
        li.className = k < akt ? "erledigt" : (k === akt ? "aktiv" : "");
        if (k === akt) li.firstChild.setAttribute("aria-current", "step"); else li.firstChild.removeAttribute("aria-current");
      });
      zur.hidden = akt === 0;
      wei.hidden = akt === stufen.length - 1;
      knoepfe.hidden = akt !== stufen.length - 1;
    };
    zur.addEventListener("click", function () { zeige(akt - 1); leisteOl.scrollIntoView({ block: "nearest" }); });
    wei.addEventListener("click", function () { zeige(akt + 1); leisteOl.scrollIntoView({ block: "nearest" }); });
    zeige(0);
  }

  f.addEventListener("submit", function (ev) {
    ev.preventDefault();
    var text = d.lLeistung + ": " + gewaehlt("leistung") + "\n" +
      d.lUnterlagen + ": " + gewaehlt("unterlagen") + "\n" +
      d.lOrt + ": " + wert("a-ort") + "\n" +
      d.lTermin + ": " + wert("a-termin") + "\n" +
      d.lArt + ": " + gewaehlt("art") + "\n" +
      d.lZeit + ": " + wert("a-zeit") + "\n\n" +
      d.lName + ": " + wert("a-name") + "\n" +
      d.lTel + ": " + wert("a-tel") + "\n\n" +
      d.lNachricht + ":\n" + wert("a-nachricht") + "\n";
    location.href = "mailto:" + d.an + "?subject=" + encodeURIComponent(d.betreff) + "&body=" + encodeURIComponent(text);
    var ok = document.getElementById("anfrage-ok");
    if (ok) ok.hidden = false;
  });
})();
