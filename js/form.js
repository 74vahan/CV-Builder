/* Binds the static form fields (personal info + skills) to state */
window.CVApp = window.CVApp || {};

(function (App) {
  "use strict";

  /* Simple text/textarea fields whose id matches the state key. */
  var SIMPLE_FIELDS = [
    "fullName", "jobTitle", "email", "phone",
    "location", "website", "summary"
  ];

  function bindSimple() {
    SIMPLE_FIELDS.forEach(function (key) {
      var el = document.getElementById("f-" + key);
      if (!el) return;
      el.value = App.state.get()[key] || "";
      el.addEventListener("input", function () {
        App.state.set(key, el.value);
      });
    });
  }

  function bindSkills() {
    var el = document.getElementById("f-skills");
    if (!el) return;
    // Skills are stored as an array; the textarea shows one per line.
    el.value = (App.state.get().skills || []).join("\n");
    el.addEventListener("input", function () {
      var list = el.value
        .split("\n")
        .map(function (s) { return s.trim(); })
        .filter(function (s) { return s.length > 0; });
      App.state.set("skills", list);
    });
  }

  function init() {
    bindSimple();
    bindSkills();
  }

  App.form = { init: init };
})(window.CVApp);
