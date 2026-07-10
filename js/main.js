/* App bootstrap: wire modules together and handle topbar controls */
window.CVApp = window.CVApp || {};

(function (App) {
  "use strict";

  function initLanguage() {
    var stored = App.state.get().lang || "ru";
    App.i18n.setLang(stored);

    var select = document.getElementById("lang-select");
    if (select) {
      select.value = stored;
      select.addEventListener("change", function () {
        var lang = select.value;
        App.i18n.setLang(lang);
        // Persist choice and re-render preview (section titles are localized).
        App.state.set("lang", lang);
      });
    }
  }

  function initAccent() {
    var input = document.getElementById("accent-input");
    var reset = document.getElementById("accent-reset");
    if (!input) return;

    var stored = App.state.get().accent;
    if (stored) input.value = stored;

    input.addEventListener("input", function () {
      App.state.set("accent", input.value);
    });

    if (reset) {
      reset.addEventListener("click", function () {
        App.state.set("accent", "");
        input.value = "#3358ff";
      });
    }
  }

  function initReset() {
    var btn = document.getElementById("btn-reset");
    if (!btn) return;
    btn.addEventListener("click", function () {
      if (!window.confirm(App.i18n.t("confirm.reset"))) return;

      var lang = App.state.get().lang;
      var template = App.state.get().template;
      var accent = App.state.get().accent;
      App.state.reset();
      // Keep language, template and accent through a reset.
      App.state.get().lang = lang;
      App.state.get().template = template;
      App.state.get().accent = accent;
      App.state.save();

      // Rebuild the whole editor from the fresh state.
      App.form.init();
      App.fields.init();
      var photoInput = document.getElementById("photo-input");
      if (photoInput) photoInput.value = "";
      App.state.notify();
    });
  }

  function init() {
    App.state.load();

    // Preview reacts to any state change.
    App.state.subscribe(function () {
      App.preview.render();
    });

    // Build editor UI.
    App.form.init();
    App.fields.init();
    App.photo.init();
    App.templates.init();
    App.exporter.init();

    initLanguage();
    initAccent();
    initReset();

    // Initial paint.
    App.i18n.apply();
    App.templates.highlight();
    App.preview.render();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  App.init = init;
})(window.CVApp);
