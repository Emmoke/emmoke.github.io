// Beispielrechnung „Was bleibt vom Nebengewerbe?“ – liest die Tabelle aus rechner-daten.js,
// die mit dem Netto-Rechner des Programms erzeugt wird (gleiche Logik wie in der App). Keine Daten verlassen den Browser.
(function () {
  var R = window.EMMOKE_RECHNER, f = document.getElementById("rechner");
  if (!R || !f) return;
  var sprache = (document.documentElement.lang || "de").slice(0, 2);
  var zahl = { de: "de-DE", en: "en-GB", ar: "ar-EG" }[sprache] || "de-DE";
  var T = {
    de: { quote: "von jedem Gewinn-Euro zurücklegen", monat: "im Monat" },
    en: { quote: "of every euro of profit to set aside", monat: "per month" },
    ar: { quote: "من كل يورو ربح للادخار", monat: "شهريًا" }
  }[sprache];
  var euro = function (x) { return Math.round(x).toLocaleString(zahl) + " €"; };
  var feld = function (n) { return f.querySelector("[name=" + n + "]"); };

  function wert(profil, brutto, gewinnMonat) {
    var zeile = R.werte[profil + "_" + brutto];
    var pos = Math.max(0, Math.min(zeile.length - 1, gewinnMonat / R.gewinnSchritt));
    var i = Math.floor(pos), j = Math.min(zeile.length - 1, i + 1), t = pos - i;
    return zeile[i].map(function (v, k) { return v + (zeile[j][k] - v) * t; });   // linear zwischen den Stufen
  }

  function rechnen() {
    var umsatz = Math.max(0, parseFloat(feld("umsatz").value) || 0);
    var kosten = Math.max(0, parseFloat(feld("kosten").value) || 0);
    var gewinn = Math.max(0, umsatz - kosten);
    var max = (R.werte.ledig_3000.length - 1) * R.gewinnSchritt;
    if (gewinn > max) {   // über der Tabelle keine Zahlen raten – nur der Hinweis
      f.querySelector("[data-aus=gewinn]").textContent = euro(gewinn);
      ["steuer", "abgaben", "bleibt", "quote"].forEach(function (n) { f.querySelector("[data-aus=" + n + "]").textContent = "—"; });
      f.querySelector("[data-aus=grenze]").hidden = false;
      f.querySelector(".balken-bleibt").style.width = "0%";
      f.querySelector(".balken-ruecklage").style.width = "0%";
      return;
    }
    var w = wert(feld("profil").value, feld("brutto").value, gewinn);   // Jahreswerte
    var steuer = w[0] / 12, abgaben = (w[1] + w[2] + w[3]) / 12;
    var ruecklage = steuer + abgaben, bleibt = gewinn - ruecklage;
    f.querySelector("[data-aus=gewinn]").textContent = euro(gewinn);
    f.querySelector("[data-aus=steuer]").textContent = "− " + euro(steuer);
    f.querySelector("[data-aus=abgaben]").textContent = "− " + euro(abgaben);
    f.querySelector("[data-aus=bleibt]").textContent = euro(bleibt);
    f.querySelector("[data-aus=quote]").textContent = gewinn > 0 ? Math.round(ruecklage / gewinn * 100) + " % " + T.quote + " (" + euro(ruecklage) + " " + T.monat + ")" : "";
    f.querySelector("[data-aus=grenze]").hidden = true;
    var anteil = gewinn > 0 ? Math.max(0, Math.min(100, bleibt / gewinn * 100)) : 0;
    f.querySelector(".balken-bleibt").style.width = anteil + "%";
    f.querySelector(".balken-ruecklage").style.width = (gewinn > 0 ? 100 - anteil : 0) + "%";
  }
  f.addEventListener("input", rechnen);
  f.addEventListener("submit", function (e) { e.preventDefault(); });
  rechnen();
})();
