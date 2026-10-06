// Beispielrechnung „Was bleibt vom Nebengewerbe?“ – liest die Tabelle aus rechner-daten.js,
// die mit dem Netto-Rechner des Programms erzeugt wird (gleiche Logik wie in der App). Keine Daten verlassen den Browser.
(function () {
  var R = window.EMMOKE_RECHNER, f = document.getElementById("rechner");
  if (!R || !f) return;
  var sprache = (document.documentElement.lang || "de").slice(0, 2);
  var zahl = { de: "de-DE", en: "en-GB", ar: "ar-EG" }[sprache] || "de-DE";
  var T = {
    de: { quote: "von jedem Gewinn-Euro zurücklegen", monat: "im Monat", brutto: "Bruttogehalt außerhalb 1.500–6.000 € – gerechnet mit dem nächsten Wert.",
          ku: "Kleinunternehmer möglich: keine Umsatzsteuer auf den Rechnungen (Umsatz bis 25.000 € im Vorjahr).",
          kuNein: "Umsatz über 25.000 € im Jahr: ab dem Folgejahr 19 % Umsatzsteuer auf die Rechnungen (dafür Vorsteuerabzug).",
          gew0: "Gewerbesteuer: 0 € – Gewinn unter dem Freibetrag von 24.500 € im Jahr.", gew: "Gewerbesteuer fällt an; sie wird größtenteils auf die Einkommensteuer angerechnet.",
          erkl: "Steuererklärung ist Pflicht (Nebeneinkünfte über 410 € im Jahr) – mit Anlage EÜR und Anlage G.",
          kv: "Krankenversicherung: Im Nebenberuf sind Sie über den Job versichert. Ob die Tätigkeit noch nebenberuflich ist, entscheidet Ihre Krankenkasse.",
          kam0: "Kammerbeitrag (IHK): bei diesem Gewinn keiner.", kam: "Kammerbeitrag (IHK): ca. {0} im Jahr.",
          ust: "Die Lohnsteuer im Job ändert sich nicht – die zusätzliche Einkommensteuer kommt als Nachzahlung mit dem Steuerbescheid. Deshalb monatlich zurücklegen." },
    en: { quote: "of every euro of profit to set aside", monat: "per month", brutto: "Gross salary outside €1,500–6,000 – calculated with the nearest value.",
          ku: "Small business scheme possible: no VAT on invoices (turnover up to €25,000 in the previous year).",
          kuNein: "Turnover above €25,000 per year: from the following year 19 % VAT on invoices (with input tax deduction).",
          gew0: "Trade tax: €0 – profit below the allowance of €24,500 per year.", gew: "Trade tax applies; it is largely credited against income tax.",
          erkl: "A tax return is mandatory (side income above €410 per year) – with forms EÜR and G.",
          kv: "Health insurance: as a side business you are insured through your job. Whether the activity is still a side activity is decided by your health insurer.",
          kam0: "Chamber fee (IHK): none at this profit.", kam: "Chamber fee (IHK): approx. {0} per year.",
          ust: "Wage tax from your job does not change – the additional income tax is due with the tax assessment. That is why you should set money aside monthly." },
    ar: { quote: "من كل يورو ربح للادخار", monat: "شهريًا", brutto: "الراتب خارج نطاق 1.500–6.000 يورو – تم الحساب بأقرب قيمة.",
          ku: "نظام المشاريع الصغيرة ممكن: بدون ضريبة مبيعات على الفواتير (إيرادات حتى 25.000 يورو في السنة السابقة).",
          kuNein: "إيرادات أكثر من 25.000 يورو سنويًا: من السنة التالية ضريبة مبيعات 19 % على الفواتير (مع خصم ضريبة المدخلات).",
          gew0: "الضريبة التجارية: 0 يورو – الربح أقل من الإعفاء البالغ 24.500 يورو سنويًا.", gew: "تُستحق ضريبة تجارية؛ ويُخصم معظمها من ضريبة الدخل.",
          erkl: "تقديم الإقرار الضريبي إلزامي (دخل جانبي أكثر من 410 يورو سنويًا) – مع نموذجي EÜR وG.",
          kv: "التأمين الصحي: في العمل الجانبي أنت مؤمَّن عبر وظيفتك. وتقرر شركة التأمين الصحي ما إذا كان النشاط لا يزال جانبيًا.",
          kam0: "رسوم الغرفة (IHK): لا شيء عند هذا الربح.", kam: "رسوم الغرفة (IHK): حوالي {0} سنويًا.",
          ust: "ضريبة الأجور في وظيفتك لا تتغير – ضريبة الدخل الإضافية تُستحق مع قرار الضريبة. لذلك ادّخر شهريًا." }
  }[sprache];
  var euro = function (x) { return Math.round(x).toLocaleString(zahl) + " €"; };
  var feld = function (n) { return f.querySelector("[name=" + n + "]"); };
  var aus = function (n) { return f.querySelector("[data-aus=" + n + "]"); };
  var stufen = R.werte["ledig_" + R.bruttos[0] + "_0"].length;
  var maxGewinn = (stufen - 1) * R.gewinnSchritt;

  // Jahreswerte [ESt, GewSt, KV, Kammer]: linear zwischen Gewinnstufen und zwischen Bruttostufen
  function zeile(profil, brutto, kirche, gewinnMonat) {
    var z = R.werte[profil + "_" + brutto + "_" + kirche];
    var pos = Math.max(0, Math.min(z.length - 1, gewinnMonat / R.gewinnSchritt));
    var i = Math.floor(pos), j = Math.min(z.length - 1, i + 1), t = pos - i;
    return z[i].map(function (v, k) { return v + (z[j][k] - v) * t; });
  }
  function werte(profil, brutto, kirche, gewinnMonat) {
    var b = R.bruttos, b0 = b[0], b1 = b[b.length - 1];
    var x = Math.max(b0, Math.min(b1, brutto));
    var u = b[0]; for (var n = 0; n < b.length; n++) if (b[n] <= x) u = b[n];
    var o = b[b.length - 1]; for (var m = b.length - 1; m >= 0; m--) if (b[m] >= x) o = b[m];
    var a = zeile(profil, u, kirche, gewinnMonat);
    if (o === u) return a;
    var c = zeile(profil, o, kirche, gewinnMonat), t = (x - u) / (o - u);
    return a.map(function (v, k) { return v + (c[k] - v) * t; });
  }

  function setze(n, monat) { var e = aus(n); if (e) e.textContent = euro(monat); var j = aus(n + "-jahr"); if (j) j.textContent = euro(monat * 12); }

  function rechnen() {
    var umsatz = Math.max(0, parseFloat(feld("umsatz").value) || 0);
    var kosten = Math.max(0, parseFloat(feld("kosten").value) || 0);
    var brutto = parseFloat(feld("brutto").value) || 0;
    var gewinn = Math.max(0, umsatz - kosten);
    feld("schieber").value = Math.min(6000, umsatz);
    f.querySelectorAll("[data-umsatz]").forEach(function (k) { k.classList.toggle("aktiv", parseFloat(k.dataset.umsatz) === umsatz); });
    aus("brutto-hinweis").hidden = brutto >= R.bruttos[0] && brutto <= R.bruttos[R.bruttos.length - 1];
    setze("gewinn", gewinn);
    var zuHoch = gewinn > maxGewinn;
    aus("grenze").hidden = !zuHoch;
    f.querySelector(".rechner-ergebnis").classList.toggle("gesperrt-rechnung", zuHoch);
    if (zuHoch) return;
    var w = werte(feld("profil").value, brutto, feld("kirche").checked ? 9 : 0, gewinn);   // Jahreswerte
    var est = w[0] / 12, gew = w[1] / 12, kv = w[2] / 12, kam = w[3] / 12;
    var ruecklage = est + gew + kv + kam, bleibt = gewinn - ruecklage;
    setze("steuer", est); setze("gewst", gew); setze("kv", kv); setze("kammer", kam); setze("ruecklage", ruecklage); setze("bleibt", bleibt);
    aus("quote").textContent = gewinn > 0 ? Math.round(ruecklage / gewinn * 100) + " % " + T.quote + " (" + euro(ruecklage) + " " + T.monat + ")" : "";
    var anteil = gewinn > 0 ? Math.max(0, Math.min(100, bleibt / gewinn * 100)) : 0;
    f.querySelector(".balken-bleibt").style.width = anteil + "%";
    f.querySelector(".balken-ruecklage").style.width = (gewinn > 0 ? 100 - anteil : 0) + "%";
    // Hinweise passend zu den Zahlen
    var h = [umsatz * 12 <= 25000 ? T.ku : T.kuNein, gewinn * 12 <= 24500 ? T.gew0 : T.gew];
    if (gewinn * 12 > 410) h.push(T.erkl);
    h.push(T.kv, w[3] > 0 ? T.kam.replace("{0}", euro(w[3])) : T.kam0, T.ust);
    var liste = aus("hinweise"); liste.textContent = "";
    h.forEach(function (s) { var li = document.createElement("li"); li.textContent = s; liste.appendChild(li); });
  }
  f.addEventListener("input", function (e) {
    if (e.target.name === "schieber") feld("umsatz").value = e.target.value;
    rechnen();
  });
  f.querySelectorAll("[data-umsatz]").forEach(function (k) {
    k.addEventListener("click", function () { feld("umsatz").value = k.dataset.umsatz; rechnen(); });
  });
  f.addEventListener("submit", function (e) { e.preventDefault(); });
  rechnen();
})();
