/* Export the CV: one-click PDF (html2canvas + jsPDF) and standalone HTML */
window.CVApp = window.CVApp || {};

(function (App) {
  "use strict";

  var t = function (k) { return App.i18n.t(k); };

  function fileBaseName() {
    var name = (App.state.get().fullName || "").trim();
    if (!name) return t("export.emptyName");
    return name.replace(/[\\/:*?"<>|]+/g, "_").replace(/\s+/g, "_");
  }

  function triggerDownload(blobUrl, filename, revoke) {
    var a = document.createElement("a");
    a.href = blobUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    if (revoke) {
      setTimeout(function () { URL.revokeObjectURL(blobUrl); }, 1000);
    }
  }

  function setBusy(busy) {
    var btn = document.getElementById("btn-pdf");
    if (btn) btn.disabled = busy;
    document.body.style.cursor = busy ? "progress" : "";
  }

  function toPdf() {
    var node = document.getElementById("cv");
    if (!node || typeof window.html2canvas !== "function" || !window.jspdf) {
      window.alert("Export libraries are not loaded.");
      return;
    }

    setBusy(true);
    // Ensure the sheet is in its static state (no running animation) so the
    // html2canvas clone does not capture a transition's initial keyframe.
    node.classList.remove("cv-switch");

    window.html2canvas(node, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#ffffff",
      logging: false
    }).then(function (canvas) {
      var jsPDF = window.jspdf.jsPDF;
      var pdf = new jsPDF("p", "mm", "a4");

      var pageW = 210;
      var pageH = 297;
      var imgW = pageW;
      var imgH = (canvas.height * imgW) / canvas.width;

      var imgData = canvas.toDataURL("image/jpeg", 0.95);
      var position = 0;
      var heightLeft = imgH;
      // Tolerance (mm) so sub-millimetre rounding does not add a blank page.
      var EPS = 1;

      pdf.addImage(imgData, "JPEG", 0, position, imgW, imgH);
      heightLeft -= pageH;

      while (heightLeft > EPS) {
        position -= pageH;
        pdf.addPage();
        pdf.addImage(imgData, "JPEG", 0, position, imgW, imgH);
        heightLeft -= pageH;
      }

      pdf.save(fileBaseName() + ".pdf");
    }).catch(function (err) {
      window.alert("Could not build the PDF: " + err);
    }).finally(function () {
      setBusy(false);
    });
  }

  /* Collect CSS text from same-origin stylesheets (best effort). */
  function collectCss() {
    var out = "";
    for (var i = 0; i < document.styleSheets.length; i++) {
      var sheet = document.styleSheets[i];
      try {
        var rules = sheet.cssRules;
        if (!rules) continue;
        for (var j = 0; j < rules.length; j++) {
          out += rules[j].cssText + "\n";
        }
      } catch (e) {
        // Cross-origin or blocked sheet — skip it.
      }
    }
    return out;
  }

  function toHtml() {
    var node = document.getElementById("cv");
    if (!node) return;

    var css = collectCss();
    var lang = App.i18n.getLang();
    var doc =
      "<!doctype html>\n" +
      '<html lang="' + lang + '">\n<head>\n' +
      '<meta charset="utf-8">\n' +
      '<meta name="viewport" content="width=device-width, initial-scale=1">\n' +
      "<title>" + fileBaseName() + "</title>\n" +
      "<style>\n" + css + "\n" +
      "body{margin:0;display:flex;justify-content:center;background:#e9ecf1;padding:24px;}\n" +
      "</style>\n</head>\n<body>\n" +
      node.outerHTML +
      "\n</body>\n</html>";

    var blob = new Blob([doc], { type: "text/html;charset=utf-8" });
    var url = URL.createObjectURL(blob);
    triggerDownload(url, fileBaseName() + ".html", true);
  }

  function init() {
    var pdfBtn = document.getElementById("btn-pdf");
    var htmlBtn = document.getElementById("btn-html");
    if (pdfBtn) pdfBtn.addEventListener("click", toPdf);
    if (htmlBtn) htmlBtn.addEventListener("click", toHtml);
  }

  App.exporter = { init: init, toPdf: toPdf, toHtml: toHtml };
})(window.CVApp);
