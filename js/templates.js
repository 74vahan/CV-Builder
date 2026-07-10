/* Template (design style) switching */
window.CVApp = window.CVApp || {};

(function (App) {
  "use strict";

  var TEMPLATES = ["classic", "modern", "minimal", "elegant"];

  function highlight() {
    var current = App.state.get().template;
    document.querySelectorAll("[data-template]").forEach(function (btn) {
      var active = btn.getAttribute("data-template") === current;
      btn.classList.toggle("is-active", active);
      btn.setAttribute("aria-pressed", active ? "true" : "false");
    });
  }

  function select(name) {
    if (TEMPLATES.indexOf(name) === -1) return;
    App.state.set("template", name);
    highlight();
  }

  function init() {
    document.querySelectorAll("[data-template]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        select(btn.getAttribute("data-template"));
      });
    });
    highlight();
  }

  App.templates = { init: init, highlight: highlight, list: TEMPLATES };
})(window.CVApp);
