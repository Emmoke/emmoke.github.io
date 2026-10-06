// Meinungen & Bewertungen: freigegebene Bewertungen anzeigen (aus bewertungen-daten.js) und neue per E-Mail senden.
// Kein Server, keine Cookies – die Eingaben gehen nur in die E-Mail, die der Besucher selbst abschickt.
(function () {
  var box = document.getElementById("bewertungen");
  if (!box) return;
  var k = window.EMMOKE || {}, liste = window.EMMOKE_BEWERTUNGEN || [];
  var sprache = (document.documentElement.lang || "de").slice(0, 2);
  var T = {
    de: { schnitt: "von 5 Sternen", anzahl: function (n) { return n === 1 ? "1 Bewertung" : n + " Bewertungen"; }, keine: "Noch keine Bewertungen – schreiben Sie die erste!",
          betreff: "Bewertung Emmoke Finanzplan", sterne: "Sterne", name: "Name zur Anzeige", text: "Meinung", zustimmung: "Ich bin einverstanden, dass meine Bewertung mit dem angegebenen Namen auf emmoke.github.io veröffentlicht wird.",
          fehlt: "Bitte Sterne wählen, eine Meinung schreiben und der Veröffentlichung zustimmen.", datum: "de-DE" },
    en: { schnitt: "out of 5 stars", anzahl: function (n) { return n === 1 ? "1 review" : n + " reviews"; }, keine: "No reviews yet – write the first one!",
          betreff: "Review Emmoke Finanzplan", sterne: "Stars", name: "Name to display", text: "Opinion", zustimmung: "I agree that my review may be published with the given name on emmoke.github.io.",
          fehlt: "Please choose stars, write your opinion and agree to publication.", datum: "en-GB" },
    ar: { schnitt: "من 5 نجوم", anzahl: function (n) { return n === 1 ? "تقييم واحد" : n + " تقييمات"; }, keine: "لا توجد تقييمات بعد – اكتب أول تقييم!",
          betreff: "Bewertung Emmoke Finanzplan", sterne: "النجوم", name: "الاسم للعرض", text: "الرأي", zustimmung: "أوافق على نشر تقييمي بالاسم المذكور على emmoke.github.io.",
          fehlt: "يرجى اختيار النجوم وكتابة رأيك والموافقة على النشر.", datum: "ar-EG-u-nu-latn" }
  }[sprache];

  function sternText(n) { return "★★★★★".slice(0, n) + "☆☆☆☆☆".slice(0, 5 - n); }

  // Anzeige: Durchschnitt und Karten (eigene Sprache zuerst, dann neueste)
  var gesamt = document.getElementById("bw-gesamt"), karten = document.getElementById("bw-liste");
  if (liste.length === 0) {
    gesamt.textContent = T.keine;
  } else {
    var schnitt = liste.reduce(function (s, b) { return s + b.sterne; }, 0) / liste.length;
    gesamt.textContent = "";
    var st = document.createElement("span"); st.className = "sterne gross-sterne"; st.textContent = sternText(Math.round(schnitt));
    var tx = document.createElement("span"); tx.textContent = " " + schnitt.toLocaleString(T.datum, { maximumFractionDigits: 1 }) + " " + T.schnitt + " · " + T.anzahl(liste.length);
    gesamt.appendChild(st); gesamt.appendChild(tx);
    liste.slice().sort(function (a, b) { return (b.sprache === sprache) - (a.sprache === sprache) || String(b.datum).localeCompare(String(a.datum)); })
      .forEach(function (b) {
        var c = document.createElement("article"); c.className = "karte bewertung";
        var s = document.createElement("div"); s.className = "sterne"; s.textContent = sternText(b.sterne);
        var p = document.createElement("p"); p.textContent = b.text;            // textContent: kein HTML aus Bewertungen
        var n = document.createElement("p"); n.className = "klein grau";
        n.textContent = (b.name || "–") + " · " + new Date(b.datum).toLocaleDateString(T.datum);
        c.appendChild(s); c.appendChild(p); c.appendChild(n);
        karten.appendChild(c);
      });
  }

  // Abgeben: Sterne wählen, Text, Name, Zustimmung → E-Mail mit allem vorbereitet
  var f = document.getElementById("bw-form"), gewaehlt = 0;
  var knoepfe = f.querySelectorAll(".stern-wahl button");
  function zeigeWahl(n) { knoepfe.forEach(function (b, i) { b.classList.toggle("an", i < n); b.setAttribute("aria-pressed", String(i < n)); }); }
  knoepfe.forEach(function (b, i) {
    b.addEventListener("click", function () { gewaehlt = i + 1; zeigeWahl(gewaehlt); });
    b.addEventListener("mouseenter", function () { zeigeWahl(i + 1); });
    b.addEventListener("mouseleave", function () { zeigeWahl(gewaehlt); });
  });
  f.addEventListener("submit", function (e) {
    e.preventDefault();
    var text = f.querySelector("[name=text]").value.trim(), name = f.querySelector("[name=name]").value.trim();
    var ok = f.querySelector("[name=zustimmung]").checked;
    var meldung = document.getElementById("bw-meldung");
    if (!gewaehlt || text.length < 3 || !ok) { meldung.textContent = T.fehlt; meldung.hidden = false; return; }
    meldung.hidden = true;
    var inhalt = T.sterne + ": " + gewaehlt + "/5 (" + sternText(gewaehlt) + ")\n" + T.name + ": " + (name || "anonym") + "\n" +
                 "Sprache: " + sprache + "\n\n" + T.text + ":\n" + text + "\n\n" + T.zustimmung + " ✔";
    location.href = "mailto:" + (k.kontaktEmail || "emmoke@outlook.de") + "?subject=" + encodeURIComponent(T.betreff) + "&body=" + encodeURIComponent(inhalt);
    document.getElementById("bw-danke").hidden = false;
  });
})();
