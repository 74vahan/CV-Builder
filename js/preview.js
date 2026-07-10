/* Builds the live CV preview markup from state (shared by every template) */
window.CVApp = window.CVApp || {};

(function (App) {
  "use strict";

  var t = function (k) { return App.i18n.t(k); };

  function esc(str) {
    return String(str == null ? "" : str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  /* Preserve line breaks entered in textareas. */
  function multiline(str) {
    return esc(str).replace(/\n/g, "<br>");
  }

  function contactsBlock(d) {
    var items = [
      { icon: "✉", value: d.email },
      { icon: "☎", value: d.phone },
      { icon: "⚲", value: d.location },
      { icon: "🔗", value: d.website }
    ].filter(function (c) { return c.value; });

    if (!items.length) return "";

    var lis = items.map(function (c) {
      return '<li><span class="cv-ic">' + c.icon + "</span>" + esc(c.value) + "</li>";
    }).join("");

    return '<ul class="cv-contacts">' + lis + "</ul>";
  }

  function section(titleKey, inner, extraClass) {
    if (!inner) return "";
    return (
      '<section class="cv-section ' + (extraClass || "") + '">' +
      '<h2 class="cv-section-title">' + esc(t(titleKey)) + "</h2>" +
      inner +
      "</section>"
    );
  }

  function experienceBlock(list) {
    var rows = (list || []).filter(function (e) {
      return e.position || e.company || e.period || e.description;
    });
    if (!rows.length) return "";

    var html = rows.map(function (e) {
      return (
        '<div class="cv-entry">' +
        '<div class="cv-entry-head">' +
        '<span class="cv-entry-title">' + esc(e.position) + "</span>" +
        (e.period ? '<span class="cv-entry-period">' + esc(e.period) + "</span>" : "") +
        "</div>" +
        (e.company ? '<div class="cv-entry-sub">' + esc(e.company) + "</div>" : "") +
        (e.description ? '<div class="cv-entry-desc">' + multiline(e.description) + "</div>" : "") +
        "</div>"
      );
    }).join("");

    return html;
  }

  function educationBlock(list) {
    var rows = (list || []).filter(function (e) {
      return e.degree || e.institution || e.period;
    });
    if (!rows.length) return "";

    return rows.map(function (e) {
      return (
        '<div class="cv-entry">' +
        '<div class="cv-entry-head">' +
        '<span class="cv-entry-title">' + esc(e.degree) + "</span>" +
        (e.period ? '<span class="cv-entry-period">' + esc(e.period) + "</span>" : "") +
        "</div>" +
        (e.institution ? '<div class="cv-entry-sub">' + esc(e.institution) + "</div>" : "") +
        "</div>"
      );
    }).join("");
  }

  function skillsBlock(list) {
    var rows = (list || []).filter(Boolean);
    if (!rows.length) return "";
    var tags = rows.map(function (s) {
      return '<li class="cv-skill">' + esc(s) + "</li>";
    }).join("");
    return '<ul class="cv-skills">' + tags + "</ul>";
  }

  function languagesBlock(list) {
    var rows = (list || []).filter(function (l) { return l.name || l.level; });
    if (!rows.length) return "";
    var items = rows.map(function (l) {
      return (
        '<li class="cv-lang">' +
        '<span class="cv-lang-name">' + esc(l.name) + "</span>" +
        (l.level ? '<span class="cv-lang-level">' + esc(l.level) + "</span>" : "") +
        "</li>"
      );
    }).join("");
    return '<ul class="cv-langs">' + items + "</ul>";
  }

  var lastTemplate = null;

  function render() {
    var node = document.getElementById("cv");
    if (!node) return;

    var d = App.state.get();

    var name = d.fullName ? esc(d.fullName) : '<span class="cv-ph">' + esc(t("ph.fullName")) + "</span>";
    var title = d.jobTitle ? esc(d.jobTitle) : '<span class="cv-ph">' + esc(t("ph.jobTitle")) + "</span>";

    var photo = d.photo
      ? '<div class="cv-photo"><img src="' + d.photo + '" alt=""></div>'
      : "";

    var header =
      '<header class="cv-header">' +
      photo +
      '<div class="cv-headline">' +
      '<h1 class="cv-name">' + name + "</h1>" +
      '<p class="cv-title">' + title + "</p>" +
      contactsBlock(d) +
      "</div>" +
      "</header>";

    var body =
      section("cv.summary", d.summary ? '<p class="cv-summary">' + multiline(d.summary) + "</p>" : "", "s-summary") +
      section("cv.experience", experienceBlock(d.experience), "s-experience") +
      section("cv.education", educationBlock(d.education), "s-education") +
      section("cv.skills", skillsBlock(d.skills), "s-skills") +
      section("cv.languages", languagesBlock(d.languages), "s-languages");

    node.className = "cv tpl-" + d.template;
    node.innerHTML = header + '<div class="cv-body">' + body + "</div>";

    // User-picked accent overrides the template default; empty = default.
    if (d.accent) {
      node.style.setProperty("--cv-accent", d.accent);
    } else {
      node.style.removeProperty("--cv-accent");
    }

    // Play a subtle swap animation only when the design template changes,
    // not on every keystroke re-render.
    if (lastTemplate !== null && lastTemplate !== d.template) {
      node.classList.remove("cv-switch");
      // Force reflow so the animation restarts.
      void node.offsetWidth;
      node.classList.add("cv-switch");
      // Remove the class once done so the node is static again — html2canvas
      // clones #cv on export and would otherwise capture the animation's
      // initial (transparent) keyframe.
      node.addEventListener("animationend", function handler() {
        node.classList.remove("cv-switch");
        node.removeEventListener("animationend", handler);
      });
    }
    lastTemplate = d.template;
  }

  App.preview = { render: render };
})(window.CVApp);
