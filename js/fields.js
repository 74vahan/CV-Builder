/* Dynamic repeatable lists: experience, education, languages */
window.CVApp = window.CVApp || {};

(function (App) {
  "use strict";

  var t = function (k) { return App.i18n.t(k); };

  /* Schema describing each repeatable list type. */
  var SCHEMAS = {
    experience: {
      empty: function () { return { position: "", company: "", period: "", description: "" }; },
      fields: [
        { key: "position", label: "exp.position", type: "text" },
        { key: "company", label: "exp.company", type: "text" },
        { key: "period", label: "exp.period", type: "text" },
        { key: "description", label: "exp.description", type: "textarea" }
      ]
    },
    education: {
      empty: function () { return { degree: "", institution: "", period: "" }; },
      fields: [
        { key: "degree", label: "edu.degree", type: "text" },
        { key: "institution", label: "edu.institution", type: "text" },
        { key: "period", label: "edu.period", type: "text" }
      ]
    },
    languages: {
      empty: function () { return { name: "", level: "" }; },
      fields: [
        { key: "name", label: "lang.name", type: "text" },
        { key: "level", label: "lang.level", type: "text" }
      ]
    }
  };

  function makeField(type, listName, idx, field) {
    var wrap = document.createElement("label");
    wrap.className = "field";

    var span = document.createElement("span");
    span.className = "field-label";
    span.setAttribute("data-i18n", field.label);
    span.textContent = t(field.label);
    wrap.appendChild(span);

    var input;
    if (field.type === "textarea") {
      input = document.createElement("textarea");
      input.rows = 3;
    } else {
      input = document.createElement("input");
      input.type = "text";
    }
    input.value = App.state.get()[listName][idx][field.key] || "";
    input.setAttribute("data-list", listName);
    input.setAttribute("data-idx", String(idx));
    input.setAttribute("data-key", field.key);

    input.addEventListener("input", function () {
      var s = App.state.get();
      var i = parseInt(input.getAttribute("data-idx"), 10);
      s[listName][i][field.key] = input.value;
      App.state.save();
      App.state.notify();
    });

    wrap.appendChild(input);
    return wrap;
  }

  function makeItem(listName, idx) {
    var schema = SCHEMAS[listName];
    var item = document.createElement("div");
    item.className = "list-item";

    var head = document.createElement("div");
    head.className = "list-item-head";

    var num = document.createElement("span");
    num.className = "list-item-num";
    num.textContent = "#" + (idx + 1);
    head.appendChild(num);

    var remove = document.createElement("button");
    remove.type = "button";
    remove.className = "btn btn-ghost btn-remove";
    remove.setAttribute("data-i18n", "btn.remove");
    remove.textContent = t("btn.remove");
    remove.addEventListener("click", function () {
      var s = App.state.get();
      s[listName].splice(idx, 1);
      App.state.save();
      App.state.notify();
      render(listName);
    });
    head.appendChild(remove);
    item.appendChild(head);

    var grid = document.createElement("div");
    grid.className = "list-item-grid";
    schema.fields.forEach(function (field) {
      grid.appendChild(makeField(field.type, listName, idx, field));
    });
    item.appendChild(grid);

    return item;
  }

  function render(listName) {
    var container = document.getElementById(listName + "-list");
    if (!container) return;
    container.innerHTML = "";
    var arr = App.state.get()[listName] || [];
    arr.forEach(function (_, idx) {
      container.appendChild(makeItem(listName, idx));
    });
  }

  function add(listName) {
    var s = App.state.get();
    s[listName].push(SCHEMAS[listName].empty());
    App.state.save();
    App.state.notify();
    render(listName);
  }

  function init() {
    Object.keys(SCHEMAS).forEach(function (listName) {
      render(listName);
      var addBtn = document.getElementById(listName + "-add");
      if (addBtn) {
        addBtn.addEventListener("click", function () { add(listName); });
      }
    });
  }

  App.fields = { init: init, render: render };
})(window.CVApp);
