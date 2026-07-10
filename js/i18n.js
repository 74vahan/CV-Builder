/* i18n: translation lookup + applying translations to the DOM */
window.CVApp = window.CVApp || {};
window.CVApp.i18n = window.CVApp.i18n || { dict: {} };

(function (App) {
  "use strict";

  var i18n = App.i18n;
  var currentLang = "ru";
  var FALLBACK = "en";

  i18n.langs = ["en", "ru", "hy"];

  i18n.t = function (key) {
    var d = i18n.dict[currentLang] || {};
    if (Object.prototype.hasOwnProperty.call(d, key)) {
      return d[key];
    }
    var fb = i18n.dict[FALLBACK] || {};
    return Object.prototype.hasOwnProperty.call(fb, key) ? fb[key] : key;
  };

  i18n.getLang = function () {
    return currentLang;
  };

  i18n.setLang = function (lang) {
    if (i18n.dict[lang]) {
      currentLang = lang;
    }
    i18n.apply();
  };

  /* Replace text content / placeholders on all tagged elements. */
  i18n.apply = function (root) {
    var scope = root || document;

    scope.querySelectorAll("[data-i18n]").forEach(function (el) {
      el.textContent = i18n.t(el.getAttribute("data-i18n"));
    });

    scope.querySelectorAll("[data-i18n-ph]").forEach(function (el) {
      el.setAttribute("placeholder", i18n.t(el.getAttribute("data-i18n-ph")));
    });

    scope.querySelectorAll("[data-i18n-title]").forEach(function (el) {
      el.setAttribute("title", i18n.t(el.getAttribute("data-i18n-title")));
    });

    document.documentElement.setAttribute("lang", currentLang);
  };
})(window.CVApp);
