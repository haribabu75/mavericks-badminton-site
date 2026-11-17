(function () {
  "use strict";

  var WA = "447809350478";
  var JR = {
    beginner: { name: "Junior Beginners", when: "Fridays 5:30–7pm", meta: "Term time · St. Michael's School · fees per term" },
    inter:    { name: "Junior Intermediate", when: "Saturdays 5–7pm", meta: "Term time · 2 hours · fees per term" },
    adv:      { name: "Junior Advanced", when: "Saturdays 3:30–5pm", meta: "By assessment & invitation only · term time" }
  };
  var SOCIAL_TEEN = { name: "Social play (kids 11+)", when: "Fri 7–9pm or Sun 9–11am", meta: "Pay as you go £6/hour, or join a monthly membership" };

  var WHO = {
    kid:   { label: "my child (age 6–10)", q: "How much has your child played?", junior: true },
    teen:  { label: "my child (age 11–18)", q: "How much has your child played?", junior: true },
    woman: { label: "me", q: "How would you like to play?", junior: false, gender: "w" },
    man:   { label: "me", q: "How would you like to play?", junior: false, gender: "m" }
  };

  var LEVELS_JR = [
    { id: "beginner", text: "New to badminton", hint: "Never had coaching" },
    { id: "inter", text: "Can already rally", hint: "Some coaching or school play" },
    { id: "adv", text: "Plays competitively", hint: "Leagues or tournaments" }
  ];
  var LEVELS_AD = [
    { id: "payg", text: "Try it first", hint: "Pay as you go, £6/hour" },
    { id: "member", text: "Play every week", hint: "Monthly membership" }
  ];

  function recommend(who, level) {
    var w = WHO[who], main, alt = null, msg;
    var hi = "Hi Mavericks! I found you on your website. ";
    if (w.junior) {
      main = JR[level];
      if (level === "adv") {
        msg = hi + "I'd like to ask about an assessment for " + main.name + " (" + main.when + ") for " + w.label + ", who plays competitively. Is there space this term, and what are the fees?";
      } else {
        msg = hi + "I'd like " + w.label + ", " + (level === "beginner" ? "who is new to badminton" : "who can already rally") +
          ", to join " + main.name + " (" + main.when + "). Is there space this term, and what are the fees?";
      }
      if (who === "teen") alt = SOCIAL_TEEN;
      return { lbl: "Your session", main: main, alt: alt, msg: msg };
    }
    if (level === "payg") {
      main = w.gender === "w"
        ? { name: "Pay as you go · £6/hour", when: "Fri 7–9pm (mixed) or Sun 9–11am (ladies & kids)", meta: "Drop in, no commitment" }
        : { name: "Pay as you go · £6/hour", when: "Fri 7–9pm (mixed) or Sun 9–11am (mens)", meta: "Drop in, no commitment" };
      msg = hi + "I'd like to come along to a pay-as-you-go session (£6/hour). Which is best to start with: Friday 7–9pm or Sunday 9–11am?";
      return { lbl: "Start here", main: main, alt: null, msg: msg };
    }
    if (w.gender === "w") {
      main = { name: "Ladies & Kids membership · £28/month", when: "Fri 7–9pm & Sun 9–11am", meta: "Monthly rolling, by standing order" };
      alt = { name: "Ladies 1 hour · £18/month", when: "Sundays only", meta: "Ladies only" };
      msg = hi + "I'm interested in the Ladies & Kids monthly membership (£28/month). How do I join?";
    } else {
      main = { name: "Mens membership · £30/month", when: "Fri 7–9pm & Sun 9–11am", meta: "Monthly rolling, by standing order" };
      msg = hi + "I'm interested in the Mens monthly membership (£30/month). How do I join?";
    }
    return { lbl: "Best for you", main: main, alt: alt, msg: msg };
  }

  var finder = document.getElementById("finder");
  if (!finder) return;
  var steps = {};
  finder.querySelectorAll(".step").forEach(function (s) { steps[s.getAttribute("data-step")] = s; });
  var dots = finder.querySelectorAll(".finder-steps i");
  var levelOpts = document.getElementById("level-opts");
  var levelQ = document.getElementById("level-q");
  var resultBody = document.getElementById("result-body");
  var resultWa = document.getElementById("result-wa");
  var who = null;

  function show(name) {
    Object.keys(steps).forEach(function (k) { steps[k].hidden = k !== name; });
    var idx = { who: 0, level: 1, result: 2 }[name];
    dots.forEach(function (d, i) { d.classList.toggle("on", i <= idx); });
    var first = steps[name].querySelector("button, a");
    if (first && document.activeElement && finder.contains(document.activeElement)) first.focus({ preventScroll: true });
  }

  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }

  function card(m, lbl, cls) {
    return '<div class="match' + (cls ? " " + cls : "") + '"><span class="lbl">' + esc(lbl) + "</span><h3>" + esc(m.name) +
      '</h3><div class="when">' + esc(m.when) + '</div><p class="meta">' + esc(m.meta) + "</p></div>";
  }

  finder.addEventListener("click", function (e) {
    var b = e.target.closest("button");
    if (!b) return;
    if (b.hasAttribute("data-who")) {
      who = b.getAttribute("data-who");
      var lv = WHO[who].junior ? LEVELS_JR : LEVELS_AD;
      levelQ.textContent = WHO[who].q;
      levelOpts.className = "opts" + (lv.length === 3 ? " one-col" : "");
      levelOpts.innerHTML = lv.map(function (l) {
        return '<button type="button" data-level="' + l.id + '">' + esc(l.text) + "<small>" + esc(l.hint) + "</small></button>";
      }).join("");
      show("level");
    } else if (b.hasAttribute("data-level")) {
      var r = recommend(who, b.getAttribute("data-level"));
      resultBody.innerHTML = card(r.main, r.lbl) + (r.alt ? card(r.alt, "Also an option", "alt") : "");
      resultWa.href = "https://wa.me/" + WA + "?text=" + encodeURIComponent(r.msg);
      show("result");
    } else if (b.hasAttribute("data-back")) {
      show(b.getAttribute("data-back"));
    }
  });

  // Sticky mobile dock: show once the finder has scrolled out of view
  var dock = document.getElementById("dock");
  if (dock && "IntersectionObserver" in window) {
    new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { dock.classList.toggle("show", !en.isIntersecting && en.boundingClientRect.top < 0); });
    }).observe(finder);
  }
})();
