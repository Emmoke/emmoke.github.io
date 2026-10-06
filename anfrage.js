// Projektanfrage: baut aus dem Formular eine E-Mail und öffnet das E-Mail-Programm. Es wird nichts an die Webseite übertragen.
(function () {
  var f = document.getElementById("anfrage");
  if (!f) return;
  var d = f.dataset;
  function gewaehlt(name) {
    return Array.prototype.map.call(f.querySelectorAll("input[name=" + name + "]:checked"), function (e) {
      return e.parentNode.textContent.trim();
    }).join(", ") || "–";
  }
  function wert(id) { var e = document.getElementById(id); return (e && e.value.trim()) || "–"; }
  f.addEventListener("submit", function (ev) {
    ev.preventDefault();
    var text = d.lLeistung + ": " + gewaehlt("leistung") + "\n" +
      d.lUnterlagen + ": " + gewaehlt("unterlagen") + "\n" +
      d.lOrt + ": " + wert("a-ort") + "\n" +
      d.lTermin + ": " + wert("a-termin") + "\n\n" +
      d.lNachricht + ":\n" + wert("a-nachricht") + "\n";
    location.href = "mailto:" + d.an + "?subject=" + encodeURIComponent(d.betreff) + "&body=" + encodeURIComponent(text);
    var ok = document.getElementById("anfrage-ok");
    if (ok) ok.hidden = false;
  });
})();
