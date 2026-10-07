// Projektanfrage: erstellt die E-Mail lokal im Browser; es werden keine Formulardaten übertragen.
(function () {
  var kopf = document.querySelector(".kopf");
  var mk = document.querySelector(".menue-knopf");
  if (kopf && mk) {
    mk.addEventListener("click", function () {
      var offen = kopf.classList.toggle("offen");
      mk.setAttribute("aria-expanded", offen ? "true" : "false");
    });
    kopf.querySelectorAll(".haupt-links a").forEach(function (a) {
      a.addEventListener("click", function () {
        kopf.classList.remove("offen");
        mk.setAttribute("aria-expanded", "false");
      });
    });
  }

  var termin = (window.EMMOKE || {}).terminLink || "";
  if (/^https:\/\/[^\s"'<>]+$/.test(termin)) {
    document.querySelectorAll("#termin-link, .termin-knopf, #termin-info").forEach(function (e) {
      if (e.tagName === "A") e.href = termin;
      e.hidden = false;
    });
  }

  var leiste = document.querySelector(".cta-leiste");
  var kontakt = document.getElementById("kontakt");
  if (leiste && kontakt && "IntersectionObserver" in window) {
    new IntersectionObserver(function (e) {
      leiste.classList.toggle("weg", e[0].isIntersecting);
    }).observe(kontakt);
  }

  var f = document.getElementById("anfrage");
  if (!f) return;
  f.noValidate = true;
  var d = f.dataset;

  function wert(id) {
    var e = document.getElementById(id);
    return (e && e.value.trim()) || "–";
  }

  var terminInput = document.getElementById("a-termin");
  function pruefeTermin() {
    if (!terminInput) return true;
    var datum = terminInput.value;
    if (!datum) {
      terminInput.setCustomValidity("");
      return true;
    }
    var wochentag = new Date(datum + "T00:00:00").getDay();
    var heute = new Date();
    heute.setHours(0, 0, 0, 0);
    var ungueltig = datum < [heute.getFullYear(), ("0" + (heute.getMonth() + 1)).slice(-2), ("0" + heute.getDate()).slice(-2)].join("-") ||
      wochentag === 0 || wochentag === 6;
    terminInput.setCustomValidity(ungueltig ? (d.lTerminFehler || "Choose a future weekday.") : "");
    return !ungueltig;
  }
  if (terminInput) {
    var heute = new Date();
    terminInput.min = [heute.getFullYear(), ("0" + (heute.getMonth() + 1)).slice(-2), ("0" + heute.getDate()).slice(-2)].join("-");
    terminInput.addEventListener("change", pruefeTermin);
  }

  function gewaehlt(name) {
    return Array.prototype.map.call(f.querySelectorAll('input[name="' + name + '"]:checked'), function (e) {
      var text = e.closest("label").querySelector("span");
      return text ? text.textContent.trim() : "";
    }).filter(Boolean).join(", ") || "–";
  }

  var schritte = f.querySelectorAll(".anfrage-schritt");
  var knoepfe = f.querySelector(".anfrage-knoepfe");
  var kundenTypLabel = f.querySelector('input[name="kundentyp"]');
  kundenTypLabel = kundenTypLabel ? kundenTypLabel.closest("fieldset").querySelector("legend").textContent : "Customer type";
  if (schritte.length > 1 && knoepfe) {
    f.classList.add("stufig");
    var namen = (d.lStufen || "").split("|");
    var fortschritt = document.createElement("ol");
    fortschritt.className = "fortschritt";
    fortschritt.setAttribute("aria-label", d.lFortschritt || "Progress");
    schritte.forEach(function (_, i) {
      var li = document.createElement("li");
      var button = document.createElement("button");
      button.type = "button";
      button.dataset.schritt = i;
      var nr = document.createElement("span");
      nr.className = "nr";
      nr.textContent = ("0" + (i + 1)).slice(-2);
      var txt = document.createElement("span");
      txt.className = "txt";
      txt.textContent = namen[i] || "";
      button.appendChild(nr);
      button.appendChild(txt);
      li.appendChild(button);
      fortschritt.appendChild(li);
    });
    f.insertBefore(fortschritt, f.firstChild);

    var nav = document.createElement("div");
    nav.className = "stufen-nav";
    var zur = document.createElement("button");
    zur.type = "button";
    zur.className = "knopf hell";
    zur.textContent = d.lZurueck || "Zurück";
    var wei = document.createElement("button");
    wei.type = "button";
    wei.className = "knopf";
    wei.textContent = d.lWeiter || "Weiter";
    nav.appendChild(zur);
    nav.appendChild(wei);
    f.insertBefore(nav, knoepfe);

    var fehler = document.createElement("p");
    fehler.className = "anfrage-fehler";
    fehler.setAttribute("role", "alert");
    fehler.setAttribute("aria-live", "assertive");
    fehler.hidden = true;
    f.insertBefore(fehler, nav);

    var aktiv = 0;
    var punkte = fortschritt.querySelectorAll("li");
    var leistungstypen = [
      ["planung", "bau", "privat"],
      ["planung", "bau", "privat"],
      ["planung", "bau"],
      ["planung", "bau"],
      ["planung", "bau"],
      ["planung", "bau"],
      ["planung", "bau"],
      ["planung", "bau", "privat"],
      ["planung", "bau", "privat"],
      ["planung", "bau", "privat"]
    ];
    function filterLeistungen() {
      var typ = f.querySelector('input[name="kundentyp"]:checked');
      var gewaehlt = typ ? typ.value : "";
      f.querySelectorAll('input[name="leistung"]').forEach(function (input, index) {
        var kachel = input.closest(".kachel");
        var typen = leistungstypen[index] || [];
        var sichtbar = gewaehlt === "sonstiges" || typen.indexOf(gewaehlt) !== -1;
        kachel.hidden = !sichtbar;
        if (!sichtbar) input.checked = false;
      });
    }

    function zeige(i, fokus) {
      aktiv = Math.max(0, Math.min(schritte.length - 1, i));
      schritte.forEach(function (s, k) { s.hidden = k !== aktiv; });
      punkte.forEach(function (li, k) {
        li.className = k < aktiv ? "erledigt" : (k === aktiv ? "aktiv" : "");
        if (k === aktiv) li.firstChild.setAttribute("aria-current", "step");
        else li.firstChild.removeAttribute("aria-current");
      });
      zur.hidden = aktiv === 0;
      wei.hidden = aktiv === schritte.length - 1;
      knoepfe.hidden = aktiv !== schritte.length - 1;
      fehler.hidden = true;
      if (aktiv === schritte.length - 1) aktualisiereZusammenfassung();
      if (fokus) {
        var legend = schritte[aktiv].querySelector("legend");
        if (legend) {
          legend.tabIndex = -1;
          legend.focus();
        }
      }
    }

    function pruefeSchritt(index, rueckmeldung) {
      if (terminInput && !pruefeTermin()) {
        if (rueckmeldung !== false) {
          fehler.textContent = d.lTerminFehler || "Choose a future weekday.";
          fehler.hidden = false;
          terminInput.reportValidity();
          terminInput.focus();
        }
        return false;
      }
      var erforderlich = schritte[index].querySelectorAll("[required]");
      for (var i = 0; i < erforderlich.length; i++) {
        if (!erforderlich[i].checkValidity()) {
          if (rueckmeldung !== false) {
            fehler.textContent = d.lFehler || "Please complete the required fields.";
            fehler.hidden = false;
            erforderlich[i].reportValidity();
            erforderlich[i].focus();
          }
          return false;
        }
      }
      fehler.hidden = true;
      return true;
    }

    f.addEventListener("click", function (event) {
      var stepButton = event.target.closest("[data-schritt]");
      if (stepButton && fortschritt.contains(stepButton)) {
        var requested = Number(stepButton.dataset.schritt);
        if (requested < aktiv) zeige(requested, true);
        return;
      }
      if (event.target === zur) {
        zeige(aktiv - 1, true);
      } else if (event.target === wei && pruefeSchritt(aktiv)) {
        zeige(aktiv + 1, true);
      }
    });

    f.addEventListener("input", function () {
      fehler.hidden = true;
      if (aktiv === schritte.length - 1) aktualisiereZusammenfassung();
    });
    f.addEventListener("change", function (event) {
      var ausgewaehlt = event.target;
      if (ausgewaehlt.matches('input[name="kundentyp"]')) filterLeistungen();
      if (ausgewaehlt.matches('input[name="unterlagen"]')) {
        var keineUnterlagen = f.querySelector('input[name="unterlagen"][data-ohne-unterlagen]');
        if (ausgewaehlt === keineUnterlagen && keineUnterlagen.checked) {
          f.querySelectorAll('input[name="unterlagen"]:checked').forEach(function (e) {
            if (e !== keineUnterlagen) e.checked = false;
          });
        } else if (ausgewaehlt.checked && keineUnterlagen) {
          keineUnterlagen.checked = false;
        }
      }
      if (aktiv === schritte.length - 1) aktualisiereZusammenfassung();
    });
    filterLeistungen();

    function aktualisiereZusammenfassung() {
      var liste = f.querySelector(".anfrage-review dl");
      if (!liste) return;
      var zeilen = [
        [d.lName, wert("a-name")],
        [d.lEmail, wert("a-email")],
        [d.lTel, wert("a-tel")],
        [d.lOrt, wert("a-ort")],
        [d.lTermin, terminInput && terminInput.value ? terminInput.value + " (" + (d.lTerminzeit || "18:00–20:00") + ")" : "–"],
        [kundenTypLabel, gewaehlt("kundentyp")],
        [d.lLeistung, gewaehlt("leistung")],
        [d.lUnterlagen, gewaehlt("unterlagen")],
        [d.lArt, gewaehlt("art")],
        [d.lZeit, wert("a-zeit")],
        [d.lNachricht, wert("a-nachricht")]
      ];
      liste.textContent = "";
      zeilen.forEach(function (zeile) {
        var term = document.createElement("dt");
        var definition = document.createElement("dd");
        term.textContent = zeile[0] || "";
        definition.textContent = zeile[1];
        liste.appendChild(term);
        liste.appendChild(definition);
      });
    }

    function emailText() {
      return d.lName + ": " + wert("a-name") + "\n" +
        d.lEmail + ": " + wert("a-email") + "\n" +
        d.lTel + ": " + wert("a-tel") + "\n\n" +
        d.lOrt + ": " + wert("a-ort") + "\n" +
        d.lTermin + ": " + (terminInput && terminInput.value ? terminInput.value + " (" + (d.lTerminzeit || "18:00–20:00") + ")" : "–") + "\n" +
        kundenTypLabel + ": " + gewaehlt("kundentyp") + "\n" +
        d.lLeistung + ": " + gewaehlt("leistung") + "\n" +
        d.lUnterlagen + ": " + gewaehlt("unterlagen") + "\n" +
        d.lArt + ": " + gewaehlt("art") + "\n" +
        d.lZeit + ": " + wert("a-zeit") + "\n\n" +
        d.lNachricht + ":\n" + wert("a-nachricht") + "\n";
    }

    function bestaetigen(text) {
      if (!("HTMLDialogElement" in window) || typeof HTMLDialogElement.prototype.showModal !== "function") {
        return Promise.resolve(window.confirm((d.lConfirmText || "") + "\n\n" + text));
      }
      var dialog = document.createElement("dialog");
      dialog.className = "anfrage-bestaetigung";
      dialog.setAttribute("aria-labelledby", "anfrage-bestaetigung-titel");
      var title = document.createElement("h2");
      title.id = "anfrage-bestaetigung-titel";
      title.textContent = d.lConfirmTitle || "";
      var description = document.createElement("p");
      description.id = "anfrage-bestaetigung-beschreibung";
      description.textContent = d.lConfirmText || "";
      dialog.setAttribute("aria-describedby", description.id);
      var summary = document.createElement("pre");
      summary.textContent = text;
      var buttons = document.createElement("div");
      buttons.className = "anfrage-knoepfe";
      var cancel = document.createElement("button");
      cancel.type = "button";
      cancel.className = "knopf hell";
      cancel.textContent = d.lCancel || "Cancel";
      var send = document.createElement("button");
      send.type = "button";
      send.className = "knopf";
      send.textContent = d.lConfirm || "Continue";
      buttons.appendChild(cancel);
      buttons.appendChild(send);
      dialog.appendChild(title);
      dialog.appendChild(description);
      dialog.appendChild(summary);
      dialog.appendChild(buttons);
      document.body.appendChild(dialog);
      return new Promise(function (resolve) {
        cancel.addEventListener("click", function () { dialog.close("cancel"); });
        send.addEventListener("click", function () { dialog.close("send"); });
        dialog.addEventListener("close", function () {
          var accepted = dialog.returnValue === "send";
          dialog.remove();
          resolve(accepted);
        }, { once: true });
        dialog.showModal();
        send.focus();
      });
    }

    zeige(0, false);
    f.addEventListener("submit", async function (event) {
      event.preventDefault();
      if (aktiv < schritte.length - 1) {
        if (pruefeSchritt(aktiv)) zeige(aktiv + 1, true);
        return;
      }
      for (var i = 0; i < schritte.length; i++) {
        if (!pruefeSchritt(i, i === aktiv)) {
          zeige(i, true);
          var invalid = schritte[i].querySelector(":invalid");
          fehler.textContent = invalid === terminInput ? (d.lTerminFehler || "Choose a future weekday.") : (d.lFehler || "Please complete the required fields.");
          fehler.hidden = false;
          if (invalid) invalid.reportValidity();
          return;
        }
      }
      aktualisiereZusammenfassung();
      var text = emailText();
      if (!await bestaetigen(text)) return;
      window.location.href = "mailto:" + d.an + "?subject=" + encodeURIComponent(d.betreff) + "&body=" + encodeURIComponent(text);
      var ok = document.getElementById("anfrage-ok");
      if (ok) {
        ok.hidden = false;
        ok.tabIndex = -1;
        ok.focus();
      }
    });
  }
})();
