/* CV state: single source of truth + localStorage persistence + subscriptions */
window.CVApp = window.CVApp || {};

(function (App) {
  "use strict";

  var STORAGE_KEY = "cv-builder";

  function defaultData() {
    return {
      lang: "ru",
      template: "classic",
      accent: "", // "" = use each template's own default accent colour
      photo: "",
      fullName: "",
      jobTitle: "",
      email: "",
      phone: "",
      location: "",
      website: "",
      summary: "",
      experience: [{ position: "", company: "", period: "", description: "" }],
      education: [{ degree: "", institution: "", period: "" }],
      skills: [],
      languages: [{ name: "", level: "" }]
    };
  }

  var data = defaultData();
  var subscribers = [];

  function load() {
    try {
      var raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        var parsed = JSON.parse(raw);
        // Merge onto defaults so new fields never end up undefined.
        data = Object.assign(defaultData(), parsed);
      }
    } catch (e) {
      // Corrupted storage -> fall back to defaults silently.
      data = defaultData();
    }
    return data;
  }

  function save() {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      // Storage may be full (large photo) or disabled; ignore.
    }
  }

  function notify() {
    for (var i = 0; i < subscribers.length; i++) {
      subscribers[i](data);
    }
  }

  var State = {
    get: function () {
      return data;
    },
    set: function (key, value) {
      data[key] = value;
      save();
      notify();
    },
    replace: function (newData) {
      data = Object.assign(defaultData(), newData);
      save();
      notify();
    },
    reset: function () {
      data = defaultData();
      // Keep the currently selected language and template after a reset.
      save();
      notify();
    },
    subscribe: function (fn) {
      subscribers.push(fn);
    },
    load: load,
    save: save,
    notify: notify,
    defaultData: defaultData
  };

  App.state = State;
})(window.CVApp);
