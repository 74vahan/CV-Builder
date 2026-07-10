/* Photo upload: read a file as a base64 data-URL and store it in state */
window.CVApp = window.CVApp || {};

(function (App) {
  "use strict";

  var MAX_BYTES = 4 * 1024 * 1024; // 4 MB guard so localStorage does not overflow.

  function init() {
    var input = document.getElementById("photo-input");
    var removeBtn = document.getElementById("photo-remove");

    if (input) {
      input.addEventListener("change", function () {
        var file = input.files && input.files[0];
        if (!file) return;

        if (file.size > MAX_BYTES) {
          window.alert("Max photo size is 4 MB.");
          input.value = "";
          return;
        }

        var reader = new FileReader();
        reader.onload = function () {
          App.state.set("photo", String(reader.result));
        };
        reader.readAsDataURL(file);
      });
    }

    if (removeBtn) {
      removeBtn.addEventListener("click", function () {
        App.state.set("photo", "");
        if (input) input.value = "";
      });
    }
  }

  App.photo = { init: init };
})(window.CVApp);
