/* =====================================================================
   Mavericks Badminton Academy — V8
   ---------------------------------------------------------------------
   CONTACT DETAILS — change them HERE, in one place. Every phone, WhatsApp
   and email button/link on the site is built from this object.
     phoneDisplay : the only number shown on the page (as text)
     phoneTel     : the same number for the Call button (+44, no spaces)
     whatsapp     : WhatsApp number for wa.me links (country code, no + or spaces).
                    It is used for links only and is never printed on the page.
   ===================================================================== */
var CONTACT = {
  phoneDisplay: "07404 671992",
  phoneTel: "+447404671992",
  whatsapp: "447809350478",
  email: "hello@mavericks-badminton.com",
  juniorEmail: "mavericks.juniorclub@gmail.com",
  // The message WhatsApp opens with when a button has no message of its own
  messages: {
    juniors: "Hi Mavericks Badminton Academy, I'd like to ask about junior badminton coaching.",
    grownups: "Hi Mavericks Badminton Academy, I'd like to ask about the Ladies Club and Friday mixed badminton sessions."
  }
};

/* ---------------------------------------------------------------------
   THEMES — five themes live in css/style.css (midnight, dark, teal, royal, forest).
     - DEFAULT theme: the data-theme="dark" attribute on the <html> tag in index.html
       (change it to midnight / teal / royal / forest to change the default).
     - ?theme=name in the URL (e.g. /?theme=royal) always works, picker or not.
     - THEME_PICKER: false = no picker is shown and any theme saved in localStorage is IGNORED,
       so visitors always get the default (or the ?theme= in the URL).
       Set it to true to bring back the floating/menu "Colour theme" picker, which also remembers
       the visitor's choice in localStorage.
   --------------------------------------------------------------------- */
var THEME_PICKER = false;

/* Scroll-driven rally on a canvas court + the "Find your session" step flow
   + the Juniors / Grown-ups audience switch + the photo gallery.
   No dependencies, no build step. Animation is demand-driven (the canvas only
   redraws while something is moving) and pauses when the tab is hidden. */
(function () {
  "use strict";

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return Math.max(a, Math.min(b, v)); };
  var lerp = function (a, b, t) { return a + (b - a) * t; };
  var smooth = function (t) { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); };
  var root = document.documentElement;

  /* ===================================================== AUDIENCE: Juniors (default) / Grown-ups
     Re-frames the page: hero copy, finder, schedule, pricing order and the chapter order all follow it.
     The grown-ups section (#grownups) is always in the HTML, so it also works without JS. */
  var AUD = (function () {
    var subs = [], me = { cur: root.getAttribute("data-aud") === "grownups" ? "grownups" : "juniors" };
    var holder = $(".chapters"), jr = $("#juniors"), ad = $("#grownups"), sched = $("#schedule"), join = $("#join");

    function order() { // Juniors: hero, finder, JUNIORS, schedule, grown-ups…  Grown-ups: hero, finder, GROWN-UPS, schedule, juniors…
      if (!holder || !jr || !ad || !sched || !join) return;
      if (me.cur === "grownups") { holder.insertBefore(ad, sched); holder.insertBefore(jr, join); }
      else { holder.insertBefore(jr, sched); holder.insertBefore(ad, join); }
      $$(".chapter", holder).forEach(function (c, i) {
        c.setAttribute("data-chapter", i);
        var n = $(".eyebrow .num", c); if (n) n.textContent = "0" + i;
      });
    }
    function paint() {
      root.setAttribute("data-aud", me.cur);
      $$(".aud-opt").forEach(function (a) {
        if (a.getAttribute("data-aud") === me.cur) a.setAttribute("aria-current", "true"); else a.removeAttribute("aria-current");
      });
    }
    me.on = function (fn) { subs.push(fn); };
    me.set = function (mode, opts) {
      mode = mode === "grownups" ? "grownups" : "juniors";
      opts = opts || {};
      if (mode !== me.cur) {
        me.cur = mode;
        try { sessionStorage.setItem("mav-aud", mode); } catch (e) { /* private mode: fine */ }
        paint(); order();
        if (holder && !reduce) { holder.classList.remove("swap"); void holder.offsetWidth; holder.classList.add("swap"); }
        subs.forEach(function (fn) { fn(mode); });
      }
      if (opts.top) window.scrollTo({ top: 0, behavior: reduce || window.scrollY < 80 ? "auto" : "smooth" });
    };
    if (holder) holder.addEventListener("animationend", function (e) { if (e.target === holder) holder.classList.remove("swap"); });

    paint(); order();
    document.addEventListener("click", function (e) {
      var a = e.target.closest && e.target.closest(".aud-opt, [data-aud-go]");
      if (!a) return;
      e.preventDefault();
      me.set(a.getAttribute("data-aud") || a.getAttribute("data-aud-go"), { top: true });
    });
    // arriving on / following a #grownups link: show grown-ups mode and land on that section
    function fromHash() {
      if (location.hash === "#grownups") { me.set("grownups"); if (ad) setTimeout(function () { ad.scrollIntoView({ behavior: "instant" }); }, 60); }
    }
    window.addEventListener("hashchange", fromHash);
    if (location.hash === "#grownups") window.addEventListener("load", fromHash);
    return me;
  })();

  /* ===================================================== CONTACT links (built from CONTACT at the top of this file) */
  var Contact = (function () {
    function wa(msg) { return "https://wa.me/" + CONTACT.whatsapp + (msg ? "?text=" + encodeURIComponent(msg) : ""); }
    function mail(key, subject, body) {
      var q = [];
      if (subject) q.push("subject=" + encodeURIComponent(subject));
      if (body) q.push("body=" + encodeURIComponent(body));
      return "mailto:" + CONTACT[key] + (q.length ? "?" + q.join("&") : "");
    }
    function apply() {
      $$("[data-wa]").forEach(function (el) {
        el.href = wa(el.getAttribute("data-wa") || CONTACT.messages[AUD.cur]);
        el.target = "_blank"; el.rel = "noopener";
      });
      $$("[data-call]").forEach(function (el) { el.href = "tel:" + CONTACT.phoneTel; });
      $$("[data-mailto]").forEach(function (el) { el.href = mail(el.getAttribute("data-mailto"), el.getAttribute("data-subject")); });
      $$("[data-text]").forEach(function (el) { el.textContent = el.getAttribute("data-text") === "phone" ? CONTACT.phoneDisplay : CONTACT[el.getAttribute("data-text")]; });
    }
    apply();
    AUD.on(apply);
    var ld = $("#ld-json");
    if (ld) { try { var o = JSON.parse(ld.textContent); o.telephone = CONTACT.phoneTel; o.email = CONTACT.email; ld.textContent = JSON.stringify(o); } catch (e) { /* leave as is */ } }
    return { wa: wa, mail: mail };
  })();

  /* ===================================================== Count-ups */
  function countTo(el, to, dur) {
    if (reduce) { el.textContent = to; return; }
    var start = null;
    function step(ts) {
      if (start === null) start = ts;
      var p = clamp((ts - start) / dur, 0, 1);
      el.textContent = Math.round(to * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  /* ===================================================== Reveal on scroll */
  (function reveal() {
    var targets = $$(".chapter-inner > :not(.aud-pane), .aud-pane > *, .gallery-head, .gallery-grid");
    var counters = $$("[data-count]");
    if (reduce || !("IntersectionObserver" in window)) return;
    targets.forEach(function (el, i) { el.classList.add("reveal"); el.style.transitionDelay = (i % 4) * 50 + "ms"; });
    counters.forEach(function (el) { el.textContent = "0"; el._to = parseInt(el.getAttribute("data-count"), 10); });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add("in");
        $$("[data-count]", e.target).forEach(function (c) { if (!c._done) { c._done = 1; countTo(c, c._to, 1000); } });
        if (e.target.hasAttribute("data-count") && !e.target._done) { e.target._done = 1; countTo(e.target, e.target._to, 1000); }
        io.unobserve(e.target);
      });
    }, { threshold: 0.12 });
    targets.forEach(function (el) { io.observe(el); });
  })();

  /* ===================================================== Card glow (fine pointers only, rAF-throttled) */
  (function pointer() {
    if (!finePointer || reduce) return;
    var pending = false, ev = null;
    window.addEventListener("pointermove", function (e) {
      ev = e;
      if (pending) return;
      pending = true;
      requestAnimationFrame(function () {
        pending = false;
        var card = ev.target.closest && ev.target.closest(".tilt-glow");
        if (card) {
          var r = card.getBoundingClientRect();
          card.style.setProperty("--px", ev.clientX - r.left + "px");
          card.style.setProperty("--py", ev.clientY - r.top + "px");
        }
      });
    }, { passive: true });
  })();

  /* ===================================================== Pause CSS animation when the tab is hidden / photo sheen only on-screen */
  (function pauseAndSheen() {
    document.addEventListener("visibilitychange", function () {
      root.classList.toggle("is-paused", document.hidden);
    });
    if (!("IntersectionObserver" in window)) return;
    var io = new IntersectionObserver(function (en) {
      en.forEach(function (e) { e.target.classList.toggle("live", e.isIntersecting); });
    }, { threshold: 0.1 });
    $$(".photo-slot").forEach(function (s) { io.observe(s); });
  })();

  /* ===================================================== Weekly schedule strip */
  (function schedule() {
    var host = $("#week"), data = $("#sched-data");
    if (!host || !data) return;
    var sessions = $$("li", data).map(function (li) {
      return { day: +li.dataset.day, start: li.dataset.start, end: li.dataset.end, kind: li.dataset.kind, title: li.dataset.title };
    });
    var names = [["Mon", "Monday", 1], ["Tue", "Tuesday", 2], ["Wed", "Wednesday", 3], ["Thu", "Thursday", 4], ["Fri", "Friday", 5], ["Sat", "Saturday", 6], ["Sun", "Sunday", 0]];
    var today = new Date().getDay();
    var mineKind = function () { return AUD.cur === "grownups" ? "adult" : "junior"; };

    host.innerHTML = '<div class="week-days" role="group" aria-label="Choose a day"></div>' +
      '<div class="week-legend" aria-hidden="true"></div>' +
      '<div class="week-detail" aria-live="polite"></div>';
    var days = $(".week-days", host), detail = $(".week-detail", host), legend = $(".week-legend", host);

    function nextDay() { // open on the next day that has a session for the chosen audience
      for (var i = 0; i < 7; i++) { var d = (today + i) % 7; if (sessions.some(function (s) { return s.day === d && s.kind === mineKind(); })) return d; }
      return today;
    }
    function buildDays() {
      days.innerHTML = "";
      names.forEach(function (n) {
        var list = sessions.filter(function (s) { return s.day === n[2]; });
        var mine = list.some(function (s) { return s.kind === mineKind(); });
        var b = document.createElement("button");
        b.type = "button"; b.className = "day" + (mine ? " mine" : ""); b.dataset.day = n[2];
        b.setAttribute("aria-pressed", "false");
        b.setAttribute("aria-label", n[1] + (list.length ? ": " + list.length + (list.length > 1 ? " sessions" : " session") : ": no sessions"));
        if (!list.length) b.disabled = true;
        b.innerHTML = (n[2] === today ? '<span class="today">Today</span>' : "") + "<span>" + n[0] + '</span><span class="dots">' +
          list.map(function (s) { return '<i class="dot' + (s.kind === "junior" ? "" : " ad") + (s.kind === mineKind() ? "" : " dim") + '"></i>'; }).join("") + "</span>";
        days.appendChild(b);
      });
      legend.innerHTML = AUD.cur === "grownups"
        ? '<span class="you"><i class="ad"></i>Grown-ups social play</span><span><i></i>Junior coaching (term time)</span>'
        : '<span class="you"><i></i>Junior coaching (term time)</span><span><i class="ad"></i>Grown-ups social play</span>';
    }

    function fmt(t) { var h = +t.split(":")[0], m = t.split(":")[1]; return { h12: h % 12 === 0 ? 12 : h % 12, m: m, ap: h >= 12 ? "PM" : "AM" }; }
    function hrs(t) { var p = t.split(":"); return +p[0] + +p[1] / 60; }
    function render(day) {
      $$(".day", days).forEach(function (b) { b.setAttribute("aria-pressed", String(+b.dataset.day === day)); });
      var list = sessions.filter(function (s) { return s.day === day; }).sort(function (a, b) {
        var am = a.kind === mineKind() ? 0 : 1, bm = b.kind === mineKind() ? 0 : 1; // the chosen audience first
        return am - bm || hrs(a.start) - hrs(b.start);
      });
      var min = 7, span = 15;
      detail.innerHTML = list.map(function (s) {
        var a = fmt(s.start), b = fmt(s.end);
        var time = '<b data-to="' + a.h12 + '">' + a.h12 + "</b>:" + a.m + (a.ap !== b.ap ? " " + a.ap : "") + " - " +
          '<b data-to="' + b.h12 + '">' + b.h12 + "</b>:" + b.m + "<small>" + b.ap + "</small>";
        var left = (hrs(s.start) - min) / span * 100, w = (hrs(s.end) - hrs(s.start)) / span * 100;
        var jr = s.kind === "junior";
        return '<article class="sess' + (jr ? " jr" : "") + (s.kind === mineKind() ? "" : " other") + '"><div class="sess-top"><div class="sess-time">' + time + '</div><span class="sess-kind">' +
          (jr ? "Junior · term time" : "Grown-ups · social play") + "</span></div><h4>" + s.title + "</h4>" +
          '<div class="track" aria-hidden="true"><i style="left:' + left + "%;width:" + w + '%"></i></div>' +
          '<div class="track-labels" aria-hidden="true"><span>7am</span><span>10am</span><span>1pm</span><span>4pm</span><span>7pm</span><span>10pm</span></div>' +
          '<p class="sess-note">' + (jr ? "Term time only · " : "") +
          '<a href="https://maps.app.goo.gl/BkREnDt3v22gYq8x8" target="_blank" rel="noopener">St. Michael\'s School</a></p></article>';
      }).join("") || '<p class="week-empty">No sessions this day.</p>';
      $$("b[data-to]", detail).forEach(function (el) { if (!reduce) el.textContent = "0"; countTo(el, +el.dataset.to, 600); });
    }
    days.addEventListener("click", function (e) { var b = e.target.closest(".day"); if (b && !b.disabled) render(+b.dataset.day); });
    days.addEventListener("keydown", function (e) {
      if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
      var btns = $$(".day:not(:disabled)", days), i = btns.indexOf(document.activeElement);
      if (i < 0) return;
      e.preventDefault();
      btns[(i + (e.key === "ArrowRight" ? 1 : btns.length - 1)) % btns.length].focus();
    });
    AUD.on(function () { buildDays(); render(nextDay()); });
    buildDays(); render(nextDay());
    host.hidden = false;
    data.hidden = true;
  })();

  /* ===================================================== Named photo slots: auto-fill from images/photos/photos.json
     + the data-driven "Club moments" gallery (the "gallery" list in the same file) */
  (function photos() {
    var PHOTO_DIR = "images/photos/";
    var grid = $("#gallery-grid");
    function url(f) { return PHOTO_DIR + String(f).split("/").map(encodeURIComponent).join("/"); }

    function fillSlots(map) {
      $$(".photo-slot[data-slot]").forEach(function (slot) {
        var f = map[slot.dataset.slot];
        if (!f || typeof f !== "string") return;
        var img = new Image();
        img.alt = map[slot.dataset.slot + "_alt"] || slot.textContent.trim();
        img.decoding = "async";
        img.onload = function () { slot.appendChild(img); slot.classList.add("has-img"); };
        img.src = url(f); // a missing file simply leaves the placeholder
      });
    }

    /* ---- gallery ---- */
    var items = []; // what the lightbox can show
    function setCount() {
      var n = $$(".g-item", grid).length;
      grid.setAttribute("data-n", String(Math.min(n, 5)));
    }
    function placeholders() {
      var ph = [["⚡", "Junior action", ""], ["🏸", "Ladies Club", " t"], ["🤝", "Friday mixed", ""], ["🏆", "Tournament day", " t"]];
      grid.innerHTML = ph.map(function (p) {
        return '<figure class="g-item ph' + p[2] + '"><div><i aria-hidden="true">' + p[0] + "</i><b>" + p[1] + "</b><span>Photo coming soon</span></div></figure>";
      }).join("");
      items = [];
      setCount();
    }
    function build(list) {
      var entries = (Array.isArray(list) ? list : []).map(function (e) {
        if (typeof e === "string") e = { file: e };
        return e && typeof e.file === "string" && e.file.trim() ? e : null;
      }).filter(Boolean);
      if (!entries.length) { placeholders(); return; }
      grid.innerHTML = "";
      items = [];
      entries.forEach(function (e, idx) {
        var alt = e.alt || e.caption || "Mavericks Badminton Club photo";
        var fig = document.createElement("figure"); fig.className = "g-item";
        var btn = document.createElement("button"); btn.type = "button"; btn.className = "g-btn";
        btn.setAttribute("aria-label", "View larger: " + alt);
        var img = new Image();
        var rec = { src: url(e.file), alt: alt, cap: e.caption || "" };
        img.alt = alt; img.loading = idx < 4 ? "eager" : "lazy"; img.decoding = "async";
        if (e.focus) img.style.objectPosition = e.focus;
        img.onload = function () { fig.classList.add("loaded"); };
        img.onerror = function () { // missing / broken file: drop the tile, keep the layout tidy
          var k = items.indexOf(rec); if (k > -1) items.splice(k, 1);
          fig.remove();
          if (!$$(".g-item", grid).length) placeholders(); else setCount();
        };
        items.push(rec);
        img.src = rec.src;
        btn.appendChild(img); fig.appendChild(btn);
        if (e.caption) { var fc = document.createElement("figcaption"); fc.textContent = e.caption; fig.appendChild(fc); }
        btn.addEventListener("click", function () { openBox(rec); });
        grid.appendChild(fig);
      });
      setCount();
    }

    /* ---- lightbox (native <dialog>) ---- */
    var box = $("#lightbox"), lbImg = $("#lb-img"), lbCap = $("#lb-cap"), cur = null;
    function show(rec) { cur = rec; lbImg.src = rec.src; lbImg.alt = rec.alt; lbCap.textContent = rec.cap; box.classList.toggle("single", items.length < 2); }
    function openBox(rec) { if (!box || typeof box.showModal !== "function") return; show(rec); box.showModal(); }
    function step(d) { var i = items.indexOf(cur); if (i < 0 || items.length < 2) return; show(items[(i + d + items.length) % items.length]); }
    if (box) {
      $(".lb-close", box).addEventListener("click", function () { box.close(); });
      $(".lb-prev", box).addEventListener("click", function () { step(-1); });
      $(".lb-next", box).addEventListener("click", function () { step(1); });
      box.addEventListener("click", function (e) { if (e.target === box) box.close(); });
      box.addEventListener("keydown", function (e) { if (e.key === "ArrowLeft") step(-1); else if (e.key === "ArrowRight") step(1); });
    }

    if (!grid) return;
    if (!window.fetch) { placeholders(); return; }
    fetch(PHOTO_DIR + "photos.json", { cache: "no-cache" })
      .then(function (r) { return r.ok ? r.json() : {}; })
      .then(function (map) { map = map && typeof map === "object" ? map : {}; fillSlots(map); build(map.gallery); })
      .catch(function () { placeholders(); }); // opened from disk, or the file is broken: placeholders stay
  })();

  /* ===================================================== THEME PICKER (single block — see THEME_PICKER at the top of this file) */
  (function themePicker() {
    if (typeof THEME_PICKER === "undefined" || !THEME_PICKER) return;
    var THEMES = [
      { id: "midnight", name: "Midnight & Coral", dots: ["#0b1b33", "#ff5e47", "#37c2d6"], bar: "#0b1b33" },
      { id: "dark", name: "Dark Cinematic", dots: ["#07090f", "#ffb02e", "#31e1d2"], bar: "#04060a" },
      { id: "teal", name: "Teal Fresh", dots: ["#06505e", "#10c3da", "#ffb81c"], bar: "#06505e" },
      { id: "royal", name: "Royal Navy & Gold", dots: ["#0b1634", "#e0b13a", "#2f55c9"], bar: "#0b1634" },
      { id: "forest", name: "Forest & Citrus", dots: ["#0e3a24", "#b5e02c", "#ff8a1f"], bar: "#0e3a24" }
    ];
    var meta = $('meta[name="theme-color"]');
    function byId(id) { return THEMES.filter(function (t) { return t.id === id; })[0]; }
    var def = byId(root.getAttribute("data-theme")) ? root.getAttribute("data-theme") : "midnight";
    try { // picker on: restore the saved choice unless the URL asked for a theme
      var saved = localStorage.getItem("mav-theme");
      if (saved && byId(saved) && !/[?&]theme=/.test(location.search)) root.setAttribute("data-theme", saved);
    } catch (e) { /* ignore */ }
    var fab = document.createElement("div"); fab.className = "theme-fab";
    fab.innerHTML = '<button type="button" class="theme-btn" aria-haspopup="true" aria-expanded="false" aria-controls="theme-pop" aria-label="Colour theme">' +
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 3a9 9 0 0 0 0 18c1.1 0 1.8-.9 1.5-1.9-.3-1 .4-2.1 1.5-2.1H17a4 4 0 0 0 4-4c0-5-4-10-9-10zM7.5 12a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm3-4a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm4.5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm3 4a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z"/></svg><span class="theme-label">Colour theme</span></button>' +
      '<div class="theme-pop" id="theme-pop" role="group" aria-labelledby="theme-h" hidden><h2 id="theme-h">Colour theme</h2>' +
      THEMES.map(function (t) {
        return '<button type="button" class="theme-opt" data-theme-id="' + t.id + '" aria-pressed="false"><span class="theme-dots" aria-hidden="true">' +
          t.dots.map(function (c) { return '<i style="background:' + c + '"></i>'; }).join("") + "</span>" + t.name + "</button>";
      }).join("") + "</div>";
    // Desktop: a small floating button. Phones: a row inside the burger menu (so nothing floats over the content).
    var mq = window.matchMedia("(max-width: 959px)"), navEl = $(".site-nav");
    function mount() { (mq.matches && navEl ? navEl : document.body).appendChild(fab); }
    mount();
    if (mq.addEventListener) mq.addEventListener("change", mount);
    var btn = $(".theme-btn", fab), pop = $(".theme-pop", fab);

    function apply(id, save) {
      if (!byId(id)) id = def;
      root.setAttribute("data-theme", id);
      $$(".theme-opt", fab).forEach(function (b) { b.setAttribute("aria-pressed", String(b.getAttribute("data-theme-id") === id)); });
      if (meta) meta.setAttribute("content", byId(id).bar);
      if (save) { try { localStorage.setItem("mav-theme", id); } catch (e) { /* private mode: fine */ } }
      window.dispatchEvent(new Event("mav-theme")); // the canvas court re-reads its colours
    }
    function toggle(open) {
      pop.hidden = !open; btn.setAttribute("aria-expanded", String(open));
      if (open) { var cur = $('.theme-opt[aria-pressed="true"]', pop) || $(".theme-opt", pop); cur.focus(); }
    }
    btn.addEventListener("click", function () { toggle(pop.hidden); });
    pop.addEventListener("click", function (e) { var b = e.target.closest(".theme-opt"); if (b) apply(b.getAttribute("data-theme-id"), true); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && !pop.hidden) { toggle(false); btn.focus(); } });
    document.addEventListener("click", function (e) { if (!pop.hidden && !fab.contains(e.target)) toggle(false); });
    apply(root.getAttribute("data-theme"), false);
  })();

  /* ===================================================== Mobile nav + dock */
  (function nav() {
    var t = $("#nav-toggle");
    $$(".site-nav a").forEach(function (a) { a.addEventListener("click", function () { t.checked = false; }); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") t.checked = false; });
    var dock = $("#dock"), fin = $("#finder");
    if (dock && fin && "IntersectionObserver" in window) {
      new IntersectionObserver(function (en) {
        var e = en[0];
        dock.classList.toggle("show", !e.isIntersecting && e.boundingClientRect.top < 0);
      }).observe(fin);
    }
  })();

  /* ===================================================== FIND YOUR SESSION */
  (function finder() {
    var rootEl = $("#finder-app"), ui = rootEl && $(".finder-ui", rootEl);
    if (!ui) return;

    var VENUE = "St. Michael's School, Aylesbury";

    var WHO = [
      { id: "kid", em: "🧒", t: "Child, 6–10", h: "Junior coaching", junior: true, band: "6-10",
        cheer: "Ace! 6–10s are our favourite players 🎉" },
      { id: "teen", em: "🧑‍🎓", t: "Young player, 11–18", h: "Junior coaching", junior: true, band: "11-18",
        cheer: "Smash! A brilliant age to level up 💥" },
      { id: "woman", em: "🙋‍♀️", t: "A woman", h: "Ladies Club & Friday mixed", junior: false, g: "w",
        cheer: "Lovely! Let's find your game 🌟" },
      { id: "man", em: "🙋‍♂️", t: "A man", h: "Friday mixed", junior: false, g: "m",
        cheer: "Great! Let's get you on court 🏸" }
    ];
    var LV_JR = [
      { id: "beginner", em: "🌱", t: "Brand new", h: "Never had coaching" },
      { id: "inter", em: "⚡", t: "Can already rally", h: "Some coaching or school play" },
      { id: "adv", em: "🏆", t: "Plays competitively", h: "Leagues or tournaments" }
    ];
    var LV_AD = [
      { id: "payg", em: "🎟️", t: "Try it first", h: "Pay as you go, £6/hr" },
      { id: "member", em: "📅", t: "Play every week", h: "Monthly membership" },
      { id: "short", em: "⏱️", t: "Just one hour", h: "Sundays, ladies only", only: "w" }
    ];

    var FEES_JR = "Fees per term — ask us";
    var JR = {
      beginner: { title: "Junior Beginners", day: "Fridays", time: "5:30–7pm", ask: "try the Friday beginners session", note: "Our friendly starting point for 6–18 year olds. Level 2 coach plus Level 1 assistants. 11–12 weeks per term, term time only." },
      inter: { title: "Junior Intermediate", day: "Saturdays", time: "5–7pm", ask: "try the Saturday intermediate session", note: "Two hours of coaching for players who can already rally. 11–12 weeks per term, term time only." },
      adv: { title: "Junior Advanced", day: "Saturdays", time: "3:30–5pm", ask: "ask about an assessment for the Saturday advanced session (3:30-5pm)", note: "Strict assessment & invitation only. Message or call us and we'll talk through an assessment.", flag: "By assessment & invitation" }
    };

    function jrCard(key, lbl, cls) {
      var s = JR[key];
      return { lbl: lbl, title: s.title, cls: "jr" + (cls ? " " + cls : ""),
        chips: ["📅 " + s.day + " " + s.time, "📍 " + VENUE].concat(s.flag ? ["🎯 " + s.flag] : []), price: "💷 " + FEES_JR, note: s.note };
    }
    var LISA = { lbl: "Train with an England player ⭐", cls: "jr alt", title: "Lisa Curtin sessions", chips: ["⭐ Elite England National Player"], price: "",
      note: "Special junior sessions are led by Elite England National Player Lisa Curtin. Ask us about the next one.",
      link: { text: "Ask about Lisa’s sessions", msg: "Hi Mavericks Badminton Academy, I'd like to know about the sessions with Lisa Curtin." } };
    var SOC_FRI = { title: "Friday Mixed Session", chips: ["📅 Fridays 7–9pm", "📍 " + VENUE], note: "Men, ladies, couples & kids 11+ all playing together." };
    var SOC_SUN = { title: "Ladies Club — Sunday Ladies & Kids", chips: ["📅 Sundays 9–11am", "📍 " + VENUE], note: "Mavericks Ladies Club: ladies & kids 11+ social play." };

    // Returns the result cards, a WhatsApp message builder (takes an optional exact age) and an email link.
    function result(who, level) {
      var cards = [], mailKey = "email", subj, body, wa;
      if (who.junior) {
        mailKey = "juniorEmail";
        cards.push(jrCard(level, "Your session 🎯"));
        if (level === "adv") cards.push(jrCard("inter", "Great place to start", "alt"));
        subj = JR[level].title + " enquiry";
        body = "Hi Mavericks Badminton Academy, I'd like to ask about " + JR[level].title + " (" + JR[level].day + " " + JR[level].time + ") for my child aged " + who.band + ". Is there space this term, and what are the fees?";
        wa = function (age) {
          return "Hi Mavericks Badminton Academy, my child is " + (age ? age : "aged " + who.band) + " and I'd like to " + JR[level].ask + ". Is there space this term, and what are the fees?";
        };
        cards.push(LISA);
        if (who.id === "teen") {
          cards.push({ lbl: "Also an option", cls: "alt", title: SOC_FRI.title, chips: SOC_FRI.chips, price: "💷 £6/hr pay as you go", note: "Kids 11+ can join the Friday mixed social session too." });
        }
      } else if (who.g === "w") {
        if (level === "payg") {
          cards.push({ lbl: "Start here 🎟️", title: SOC_FRI.title, chips: SOC_FRI.chips, price: "💷 £6/hr pay as you go", note: "Drop in, no commitment. " + SOC_FRI.note });
          cards.push({ lbl: "Or try", cls: "alt", title: SOC_SUN.title, chips: SOC_SUN.chips, price: "💷 £6/hr pay as you go", note: SOC_SUN.note });
          subj = "Pay as you go enquiry"; body = "Hi Mavericks Badminton Academy, I'd like to come along to a pay-as-you-go session (£6/hr). Which is best to start with: Friday 7-9pm or Sunday 9-11am?";
        } else if (level === "member") {
          cards.push({ lbl: "Best for you 📅", title: "Ladies & Kids Membership", chips: ["📅 Fri 7–9pm & Sun 9–11am", "📍 " + VENUE], price: "💷 £28/month", note: "2hr play. Monthly rolling contract, pre-paid by BACS / standing order." });
          subj = "Ladies & Kids membership enquiry"; body = "Hi Mavericks Badminton Academy, I'm interested in the Ladies & Kids monthly membership (£28/month). How do I join?";
        } else {
          cards.push({ lbl: "Best for you ⏱️", title: "Ladies 1hr (Sundays only)", chips: ["📅 Sundays", "📍 " + VENUE], price: "💷 £18/month", note: "1hr play, Sundays only, ladies only. Monthly rolling contract." });
          subj = "Ladies 1hr membership enquiry"; body = "Hi Mavericks Badminton Academy, I'm interested in the Ladies 1hr (Sundays only) membership (£18/month). How do I join?";
        }
        wa = function () { return body; };
      } else {
        if (level === "payg") {
          cards.push({ lbl: "Start here 🎟️", title: SOC_FRI.title, chips: SOC_FRI.chips, price: "💷 £6/hr pay as you go", note: "Drop in, no commitment. " + SOC_FRI.note });
          subj = "Pay as you go enquiry"; body = "Hi Mavericks Badminton Academy, I'd like to come along to the Friday 7-9pm mixed session as pay as you go (£6/hr).";
        } else {
          cards.push({ lbl: "Best for you 📅", title: "Mens Membership", chips: ["📅 Fridays 7–9pm", "📍 " + VENUE], price: "💷 £30/month", note: "2hr play. Monthly rolling contract, pre-paid by BACS / standing order." });
          subj = "Mens membership enquiry"; body = "Hi Mavericks Badminton Academy, I'm interested in the Mens monthly membership (£30/month). How do I join?";
        }
        wa = function () { return body; };
      }
      return { cards: cards, wa: wa, askAge: who.junior, mail: Contact.mail(mailKey, subj, body) };
    }

    var state = { step: "who", who: null, level: null, res: null };
    var STEPS = { who: 1, level: 2, result: 3 };

    function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
    function whoById(id) { return WHO.filter(function (w) { return w.id === id; })[0]; }
    function whoList() { return WHO.filter(function (w) { return AUD.cur === "grownups" ? !w.junior : w.junior; }); }

    function top() {
      var n = STEPS[state.step], pct = ((n - 1) / 2) * 100;
      return '<div class="finder-top"><span class="fcount">Step ' + n + ' of 3</span>' +
        '<div class="fprog" role="progressbar" aria-valuemin="1" aria-valuemax="3" aria-valuenow="' + n + '" aria-label="Progress">' +
        '<div class="fprog-fill" style="width:' + (pct || 4) + '%"></div><span class="fprog-shuttle" aria-hidden="true" style="left:' + Math.max(pct, 4) + '%">🏸</span></div></div>';
    }
    function opts(list, attr, one) {
      return '<div class="fopts' + (one ? " one" : "") + '">' + list.map(function (o) {
        return '<button type="button" class="fopt" data-' + attr + '="' + o.id + '"><span class="em" aria-hidden="true">' + o.em + '</span><span>' + esc(o.t) + '<small>' + esc(o.h) + '</small></span></button>';
      }).join("") + "</div>";
    }
    function ageSelect(who) {
      var from = who.id === "kid" ? 6 : 11, to = who.id === "kid" ? 10 : 18, o = '<option value="">Not sure / skip</option>';
      for (var a = from; a <= to; a++) o += '<option value="' + a + '">' + a + "</option>";
      return '<label class="fage">Their age (optional) <select id="f-age">' + o + "</select></label>";
    }
    function setWa(age) {
      var a = $("#f-wa", ui);
      if (a && state.res) a.href = Contact.wa(state.res.wa(age));
    }

    function render(focus) {
      var html = top(), w = state.who && whoById(state.who);
      if (state.step === "who") {
        var grown = AUD.cur === "grownups";
        html += '<div class="fstep"><h3 class="fq" tabindex="-1">Who&rsquo;s playing?</h3>' + opts(whoList(), "who") +
          '<p class="fswitch">' + (grown ? "Looking for junior coaching (6–18)?" : "Looking for badminton for yourself?") +
          ' <button type="button" data-switch="' + (grown ? "juniors" : "grownups") + '">' + (grown ? "Switch to Juniors" : "Switch to Grown-ups") + "</button></p></div>";
      } else if (state.step === "level") {
        var lv = w.junior ? LV_JR : LV_AD.filter(function (l) { return !l.only || l.only === w.g; });
        html += '<div class="fstep"><span class="fcheer">' + w.cheer + '</span><h3 class="fq" tabindex="-1">' +
          (w.junior ? "Have they played before?" : "How would you like to play?") + "</h3>" + opts(lv, "level", true) +
          '<button type="button" class="fback" data-back="who">← Back</button></div>';
      } else {
        var r = state.res = result(w, state.level);
        var cardHtml = function (c) {
          return '<article class="fmatch ' + (c.cls || "") + '"><span class="flbl">' + esc(c.lbl) + "</span><h4>" + esc(c.title) + '</h4><div class="fmeta">' +
            c.chips.map(function (x) { return '<span class="fchip">' + esc(x) + "</span>"; }).join("") +
            (c.price ? '<span class="fchip price">' + esc(c.price) + "</span>" : "") + "</div><p class=\"fnote\">" + esc(c.note) + "</p>" +
            (c.link ? '<p class="fmail"><a href="' + esc(Contact.wa(c.link.msg)) + '" target="_blank" rel="noopener">' + esc(c.link.text) + " →</a></p>" : "") + "</article>";
        };
        // the matched session first, then the WhatsApp / Call buttons (reachable without scrolling), then the extra suggestions
        html += '<div class="fstep"><span class="fcheer">Winner, winner! 🏆 Here&rsquo;s your match</span><h3 class="fq" tabindex="-1">' +
          (r.cards.length > 1 ? "Your sessions" : "Your session") + '</h3><div class="fresult">' + cardHtml(r.cards[0]) + "</div>" +
          (r.askAge ? ageSelect(w) : "") +
          '<div class="factions"><a class="btn btn-wa" id="f-wa" target="_blank" rel="noopener" href="' + esc(Contact.wa(r.wa())) + '"><svg class="ico" aria-hidden="true"><use href="#i-wa"/></svg><span>Message us on WhatsApp</span></a>' +
          '<a class="btn btn-call" href="tel:' + esc(CONTACT.phoneTel) + '"><svg class="ico" aria-hidden="true"><use href="#i-call"/></svg><span>Call ' + esc(CONTACT.phoneDisplay) + "</span></a></div>" +
          '<p class="fmail">Prefer email? <a href="' + esc(r.mail) + '">Email us instead</a></p>' +
          (r.cards.length > 1 ? '<h4 class="fmore">Also worth a look</h4><div class="fresult">' + r.cards.slice(1).map(cardHtml).join("") + "</div>" : "") +
          '<p class="ffine">Your answers are already written in the message &mdash; just press send. We usually reply within a day. Sessions are at St. Michael&rsquo;s School, Weedon Road, Aylesbury HP19 9PG.</p>' +
          '<button type="button" class="fback" data-back="who">↺ Start again</button></div>';
      }
      ui.innerHTML = html;
      if (focus) {
        var h = $(".fq", ui); if (h) h.focus({ preventScroll: true });
        if (state.step === "result") rootEl.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
      }
    }

    ui.setAttribute("aria-live", "polite");
    ui.addEventListener("change", function (e) { if (e.target.id === "f-age") setWa(e.target.value); });
    ui.addEventListener("click", function (e) {
      var b = e.target.closest("button");
      if (!b || b.disabled) return;
      if (b.hasAttribute("data-switch")) { AUD.set(b.getAttribute("data-switch")); return; }
      var go = null;
      if (b.hasAttribute("data-who")) { var id = b.getAttribute("data-who"); go = function () { state.who = id; state.level = null; state.step = "level"; }; }
      else if (b.hasAttribute("data-level")) { var lid = b.getAttribute("data-level"); go = function () { state.level = lid; state.step = "result"; }; }
      else if (b.hasAttribute("data-back")) { var to = b.getAttribute("data-back"); go = function () { state.step = to; }; }
      if (!go) return;
      var picked = b.classList.contains("fopt");
      if (picked) { b.classList.add("picked"); ui.style.pointerEvents = "none"; }
      setTimeout(function () { ui.style.pointerEvents = ""; go(); render(true); }, picked && !reduce ? 340 : 0);
    });

    // audience changed: start the finder again with that audience's options
    AUD.on(function () { state = { step: "who", who: null, level: null, res: null }; render(false); });

    render(false);
    ui.hidden = false;
  })();

  /* ===================================================== THE STAGE — top-down court + rally */
  (function stage() {
    var cv = $("#court"), stageEl = $(".stage"), cinema = $("#cinema");
    if (!cv || !cv.getContext) return;
    var ctx = cv.getContext("2d");
    var chapters = $$(".chapter");
    var N = chapters.length - 1; // 6 segments
    var hudNum = $("#hud-num"), hudZone = $("#hud-zone"), hudRail = $(".hud-rail");
    var navLinks = $$(".site-nav ul a");

    var W = 0, H = 0, dpr = 1, landscape = false;
    var G = {}, tops = [], heights = [];
    var L = 13.4, WD = 6.1, CX = 3.05, NET = 6.7;
    // zones: [L0, L1, X0, X1] — index = position in the page (labels and colours come from the chapter itself)
    var ZONES = [
      null,
      [0.76, 4.72, 0, 3.05],
      [0.76, 4.72, 3.05, 6.1],
      [8.68, 12.64, 0, 3.05],
      [8.68, 12.64, 3.05, 6.1],
      [4.72, 8.68, 0, 3.05],
      [4.72, 8.68, 3.05, 6.1]
    ];
    var WP = [[11.4, 4.5], [2.4, 1.5], [2.8, 4.6], [10.6, 1.5], [10.4, 4.6], [6.4, 1.5], [6.2, 4.6]];
    var ARC = [3.6, 1.8, 3.3, 3.0, 1.2, 2.4];
    var LINES = [
      [0, 0, 13.4, 0], [13.4, 0, 13.4, 6.1], [13.4, 6.1, 0, 6.1], [0, 6.1, 0, 0],
      [0, 0.46, 13.4, 0.46], [0, 5.64, 13.4, 5.64],
      [4.72, 0, 4.72, 6.1], [8.68, 0, 8.68, 6.1],
      [0, 3.05, 4.72, 3.05], [8.68, 3.05, 13.4, 3.05],
      [0.76, 0, 0.76, 6.1], [12.64, 0, 12.64, 6.1]
    ];
    // palette: read from the CSS custom properties at the top of style.css (r,g,b triplets)
    function rgbVar(name, fb) {
      var v = getComputedStyle(root).getPropertyValue(name).trim();
      return v ? v.replace(/\s+/g, "") : fb;
    }
    var INK, TEAL, TEALD, CORAL, CORALD, ACC, ACCD, COURT, COURTA;
    function readPalette() { // CORAL/TEAL = the junior / grown-up theme colours (whatever the current theme makes them)
      INK = rgbVar("--rgb-strong", "11,27,51"); TEAL = rgbVar("--rgb-ad", "55,194,214"); TEALD = rgbVar("--rgb-ad-d", "20,137,155");
      CORAL = rgbVar("--rgb-jr", "255,94,71"); CORALD = rgbVar("--rgb-jr-d", "226,67,43");
      ACC = rgbVar("--rgb-acc", CORAL); ACCD = rgbVar("--rgb-acc-d", CORALD);
      COURT = rgbVar("--rgb-court", "255,255,255"); COURTA = getComputedStyle(root).getPropertyValue("--court-a").trim() || "0.82";
    }
    readPalette();

    var P = [0, 0, 1], A = 0.55, F1 = 1 / (1 + A);
    function proj(l, x, z) {
      if (landscape) {
        P[0] = G.cx + (l - NET) * G.S;
        P[1] = G.cy + (x - CX) * G.S * 0.82 - z * G.S * 0.78;
        P[2] = 1;
      } else {
        var t = 1 - l / L, f = 1 / (1 + A * t), yn = (1 - f) / (1 - F1);
        P[0] = G.cx + (x - CX) * G.Sx * f;
        P[1] = G.bottom - G.H * yn - z * G.Sx * 0.85 * f;
        P[2] = f;
      }
      return P;
    }

    function resize() {
      var r = cv.getBoundingClientRect();
      W = Math.max(1, r.width); H = Math.max(1, r.height);
      landscape = window.innerWidth < 960;
      dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (landscape) {
        var left = W < 600 ? 104 : 0; // on phones keep the court clear of the "04 GROWN-UPS" label at the bottom-left
        G.S = Math.min((W - left) * 0.92 / L, (H * 0.74) / (WD * 0.82));
        G.cx = left + (W - left) / 2; G.cy = H * 0.62;
      } else {
        // the court lives in the strip to the LEFT of the text column (text ≈ 62%, court ≈ 38%)
        var pad = clamp(window.innerWidth * 0.05, 20, 72);
        var inner = $(".chapter-inner");
        var textLeft = inner ? inner.getBoundingClientRect().left : window.innerWidth * 0.4;
        var region = Math.max(200, textLeft - pad - 28);
        G.H = Math.min(H - 104 - 24, 780);
        var gut = 56; // keeps the HUD numeral clear of the court's far edge
        var nearW = Math.min(region - gut, G.H * 0.56);
        G.Sx = nearW / WD;
        G.cx = pad + gut + (region - gut) / 2;
        G.bottom = H - 24;
      }
      G.k = landscape ? clamp(G.S / 26, 0.7, 1.3) : clamp(G.Sx * WD / 417, 0.6, 1.3);
      measure();
    }
    function measure() {
      var sy = window.scrollY || window.pageYOffset;
      tops = chapters.map(function (c) { return c.getBoundingClientRect().top + sy; });
      heights = chapters.map(function (c) { return c.offsetHeight; });
    }

    var D1 = [0, 0.9, 0.6];
    function seg(i, t) {
      var u = t, z = 0.25, a = ARC[i];
      if (i === N - 1) { // smash: rises, then plunges at the net
        u = 1 - Math.pow(1 - t, 1.6);
        z += t < 0.28 ? a * smooth(t / 0.28) : a * (1 - Math.pow((t - 0.28) / 0.72, 1.4));
      } else if (i === 3 || i === 4) { u = t; z += a * 4 * t * (1 - t); }
      else { u = smooth(t); z += a * 4 * t * (1 - t); }
      D1[0] = u; D1[1] = z; return D1;
    }
    var pos = [0, 0, 0];
    function path(sp) {
      sp = clamp(sp, 0, N);
      var i = Math.min(Math.floor(sp), N - 1), t = sp - i;
      var s = seg(i, clamp((t - 0.12) / 0.76, 0, 1));
      pos[0] = lerp(WP[i][0], WP[i + 1][0], s[0]);
      pos[1] = lerp(WP[i][1], WP[i + 1][1], s[0]);
      pos[2] = s[1];
      return pos;
    }

    /* ---------- effects ---------- */
    var sparks = [], rings = [], flash = 0, rnd = Math.random;
    function spawnImpact(k) {
      var g = proj(WP[k + 1][0], WP[k + 1][1], 0.05), gx = g[0], gy = g[1], big = k === N - 1;
      var n = big ? 34 : 12;
      for (var i = 0; i < n && sparks.length < 120; i++) {
        var a = rnd() * Math.PI * 2, sp = (big ? 90 : 50) + rnd() * (big ? 260 : 150);
        sparks.push({ x: gx, y: gy, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp * 0.6 - sp * 0.45, life: 0, max: 0.5 + rnd() * 0.6 });
      }
      rings.push({ x: gx, y: gy, r: 0, max: (big ? 110 : 64) * G.k, life: 0 });
      if (big) { rings.push({ x: gx, y: gy, r: -16, max: 150 * G.k, life: 0 }); flash = 1; lastImpact[0] = gx; lastImpact[1] = gy; }
    }

    function line(l1, x1, l2, x2, frac) {
      var a = proj(l1, x1, 0), ax = a[0], ay = a[1], b = proj(l2, x2, 0);
      ctx.moveTo(ax, ay); ctx.lineTo(lerp(ax, b[0], frac), lerp(ay, b[1], frac));
    }
    function quad(z) {
      var a = proj(z[0], z[2], 0); ctx.beginPath(); ctx.moveTo(a[0], a[1]);
      var p = proj(z[0], z[3], 0); ctx.lineTo(p[0], p[1]);
      p = proj(z[1], z[3], 0); ctx.lineTo(p[0], p[1]);
      p = proj(z[1], z[2], 0); ctx.lineTo(p[0], p[1]);
      ctx.closePath();
    }

    var cur = 0, target = 0, prev = 0, introT = reduce ? 1 : 0, lastDir = [-0.5, -0.85], lastImpact = [0, 0], activeIdx = -1;

    function computeTarget() {
      var sy = window.scrollY || window.pageYOffset, vh = window.innerHeight, ref;
      if (landscape) { var sh = stageEl.getBoundingClientRect().height; ref = sy + sh + (vh - sh) * 0.32; }
      else ref = sy + vh * 0.5;
      if (ref < tops[0]) return 0;
      var i;
      for (i = chapters.length - 1; i > 0; i--) if (ref >= tops[i]) break;
      return clamp(i + clamp((ref - tops[i]) / heights[i], 0, 1) - 0.5, 0, N);
    }

    function draw(dt) {
      ctx.clearRect(0, 0, W, H);
      var sp = cur, w0 = smooth(1 - sp * 1.5), vis = smooth((introT - 0.45) * 2.2);

      // court surface
      ctx.beginPath();
      [[0, 0], [0, 6.1], [13.4, 6.1], [13.4, 0]].forEach(function (q, i) { var p = proj(q[0], q[1], 0); if (i) ctx.lineTo(p[0], p[1]); else ctx.moveTo(p[0], p[1]); });
      ctx.closePath();
      ctx.fillStyle = "rgba(" + COURT + "," + COURTA + ")"; ctx.fill();
      ctx.fillStyle = "rgba(" + TEAL + ",0.08)"; ctx.fill();

      // active zones (the Juniors chapter glows coral, every other chapter teal)
      for (var zi = 1; zi < ZONES.length; zi++) {
        var wz = reduce ? 0.2 : smooth(1 - Math.abs(sp - zi) * 1.7) * vis;
        if (wz < 0.01 || !chapters[zi]) continue;
        var z = ZONES[zi], isJr = chapters[zi].id === "juniors";
        quad(z); ctx.fillStyle = "rgba(" + (isJr ? CORAL : TEAL) + "," + 0.3 * wz + ")"; ctx.fill();
        ctx.lineWidth = 2; ctx.strokeStyle = "rgba(" + (isJr ? CORALD : TEALD) + "," + 0.95 * wz + ")";
        ctx.setLineDash([7, 6]); ctx.stroke(); ctx.setLineDash([]);
        var zc = proj((z[0] + z[1]) / 2, (z[2] + z[3]) / 2, 0);
        ctx.fillStyle = "rgba(" + INK + "," + wz + ")";
        ctx.font = "700 " + Math.round(9 + 2.5 * G.k) + "px Inter, system-ui, sans-serif";
        ctx.textAlign = "center"; ctx.textBaseline = "middle";
        if ("letterSpacing" in ctx) ctx.letterSpacing = "2px";
        ctx.fillText(("0" + zi + "  " + chapters[zi].getAttribute("data-zone")).toUpperCase(), zc[0], zc[1]);
        if ("letterSpacing" in ctx) ctx.letterSpacing = "0px";
      }

      // court lines (draw-in on load)
      ctx.lineCap = "round";
      ctx.beginPath();
      for (var i = 0; i < LINES.length; i++) {
        var fr = reduce ? 1 : smooth(introT * 2.4 - i * 0.14);
        if (fr <= 0) continue;
        var ln = LINES[i]; line(ln[0], ln[1], ln[2], ln[3], fr);
      }
      ctx.lineWidth = 1.6; ctx.strokeStyle = "rgba(" + INK + ",0.4)"; ctx.stroke();
      var oa = (0.45 + 0.5 * w0) * smooth(introT * 2);
      ctx.beginPath(); line(0, 0, 13.4, 0, 1); line(13.4, 0, 13.4, 6.1, 1); line(13.4, 6.1, 0, 6.1, 1); line(0, 6.1, 0, 0, 1);
      ctx.lineWidth = 3; ctx.strokeStyle = "rgba(" + INK + "," + oa * 0.85 + ")"; ctx.stroke();

      // net
      var na = smooth(introT * 2 - 0.5);
      if (na > 0) {
        var nb = proj(NET, 0, 0), nbx = nb[0], nby = nb[1];
        var nt = proj(NET, 0, 1.55), ntx = nt[0], nty = nt[1];
        var mb = proj(NET, 6.1, 0), mbx = mb[0], mby = mb[1];
        var mt = proj(NET, 6.1, 1.55), mtx = mt[0], mty = mt[1];
        ctx.beginPath();
        for (var m = 1; m < 20; m++) { var tt = m / 20; ctx.moveTo(lerp(nbx, mbx, tt), lerp(nby, mby, tt)); ctx.lineTo(lerp(ntx, mtx, tt), lerp(nty, mty, tt)); }
        ctx.lineWidth = 0.7; ctx.strokeStyle = "rgba(" + INK + "," + 0.18 * na + ")"; ctx.stroke();
        ctx.beginPath(); ctx.moveTo(nbx, nby); ctx.lineTo(mbx, mby); ctx.moveTo(nbx, nby); ctx.lineTo(ntx, nty); ctx.moveTo(mbx, mby); ctx.lineTo(mtx, mty);
        ctx.lineWidth = 2; ctx.strokeStyle = "rgba(" + ACC + "," + na + ")"; ctx.stroke();
        ctx.beginPath(); ctx.moveTo(ntx, nty); ctx.lineTo(mtx, mty);
        ctx.lineWidth = 3; ctx.strokeStyle = "rgba(" + INK + "," + 0.8 * na + ")"; ctx.stroke();
      }

      if (vis > 0.01) drawShuttle(vis);

      // impacts
      for (var r = rings.length - 1; r >= 0; r--) {
        var rg = rings[r]; rg.life += dt;
        var pr = rg.life / 0.8;
        if (pr >= 1) { rings.splice(r, 1); continue; }
        var rad = Math.max(0, lerp(rg.r, rg.max, 1 - Math.pow(1 - pr, 3)));
        ctx.beginPath(); ctx.ellipse(rg.x, rg.y, rad, rad * 0.42, 0, 0, Math.PI * 2);
        ctx.lineWidth = 2; ctx.strokeStyle = "rgba(" + ACCD + "," + (1 - pr) * 0.8 + ")"; ctx.stroke();
      }
      ctx.lineWidth = 1.8;
      for (var s = sparks.length - 1; s >= 0; s--) {
        var sk = sparks[s]; sk.life += dt;
        if (sk.life >= sk.max) { sparks.splice(s, 1); continue; }
        sk.vy += 520 * dt; sk.vx *= 0.985; sk.x += sk.vx * dt; sk.y += sk.vy * dt;
        var al = 1 - sk.life / sk.max;
        ctx.beginPath(); ctx.moveTo(sk.x, sk.y); ctx.lineTo(sk.x - sk.vx * 0.03, sk.y - sk.vy * 0.03);
        ctx.strokeStyle = "rgba(" + (s % 2 ? TEALD : CORALD) + "," + al + ")"; ctx.stroke();
      }
      if (flash > 0.01) {
        var fgr = ctx.createRadialGradient(lastImpact[0], lastImpact[1], 0, lastImpact[0], lastImpact[1], 200 * G.k);
        fgr.addColorStop(0, "rgba(" + ACC + "," + 0.35 * flash + ")"); fgr.addColorStop(1, "rgba(" + ACC + ",0)");
        ctx.fillStyle = fgr; ctx.fillRect(0, 0, W, H);
        flash *= Math.pow(0.02, dt);
      }
    }

    function drawShuttle(vis) {
      var k = G.k, steps = 16, prevX = 0, prevY = 0, i;
      for (i = 0; i <= steps; i++) { // trail
        var q = path(cur - i * 0.022), p = proj(q[0], q[1], q[2]);
        if (i > 0) {
          var a = 1 - i / steps;
          ctx.beginPath(); ctx.moveTo(prevX, prevY); ctx.lineTo(p[0], p[1]);
          ctx.lineWidth = 0.8 + 4 * a * k * p[2]; ctx.strokeStyle = "rgba(" + ACC + "," + 0.6 * a * vis + ")"; ctx.stroke();
        }
        prevX = p[0]; prevY = p[1];
      }
      var q0 = path(cur), hx = q0[0], hy = q0[1], hz = q0[2];
      var g = proj(hx, hy, 0), gx = g[0], gy = g[1], gf = g[2];
      var h = proj(hx, hy, hz), px = h[0], py = h[1], pf = h[2];
      var qb = path(cur - 0.02), pb = proj(qb[0], qb[1], qb[2]);
      var dx = px - pb[0], dy = py - pb[1], dl = Math.sqrt(dx * dx + dy * dy);
      if (dl > 0.35) { lastDir[0] = dx / dl; lastDir[1] = dy / dl; }
      var ux = lastDir[0], uy = lastDir[1];
      // ground shadow
      var sr = (11 + hz * 3) * k * gf;
      ctx.beginPath(); ctx.ellipse(gx, gy, sr, sr * 0.4, 0, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(" + INK + "," + 0.22 * vis / (1 + hz * 0.6) + ")"; ctx.fill();
      // accent glow
      var gl = ctx.createRadialGradient(px, py, 0, px, py, 34 * k * pf);
      gl.addColorStop(0, "rgba(" + ACC + "," + 0.55 * vis + ")"); gl.addColorStop(1, "rgba(" + ACC + ",0)");
      ctx.fillStyle = gl; ctx.fillRect(px - 40 * k, py - 40 * k, 80 * k, 80 * k);
      // skirt
      var len = 24 * k * pf, wid = 11 * k * pf, nx = -uy, ny = ux, bx = px - ux * len, by = py - uy * len;
      ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(bx + nx * wid, by + ny * wid); ctx.lineTo(bx - nx * wid, by - ny * wid); ctx.closePath();
      ctx.fillStyle = "rgba(" + COURT + "," + 0.95 * vis + ")"; ctx.fill();
      ctx.beginPath();
      for (var f = -2; f <= 2; f++) { ctx.moveTo(px, py); ctx.lineTo(bx + nx * wid * f * 0.5, by + ny * wid * f * 0.5); }
      ctx.lineWidth = 1.2; ctx.strokeStyle = "rgba(" + TEALD + "," + 0.9 * vis + ")"; ctx.stroke();
      ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(bx + nx * wid, by + ny * wid); ctx.lineTo(bx - nx * wid, by - ny * wid); ctx.closePath();
      ctx.strokeStyle = "rgba(" + INK + "," + 0.5 * vis + ")"; ctx.stroke();
      // head
      ctx.beginPath(); ctx.arc(px, py, 4.2 * k * pf + 0.8, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(" + INK + "," + vis + ")"; ctx.fill();
    }

    /* ---------- loop: demand-driven (stops completely once everything has settled) ---------- */
    var raf = 0, lastFrame = 0, visible = true;
    function busy() { return introT < 1 || Math.abs(target - cur) > 0.0004 || sparks.length || rings.length || flash > 0.01; }
    function tick(now) {
      raf = 0;
      if (!visible || document.hidden) return;
      if (now - lastFrame < 28) { raf = requestAnimationFrame(tick); return; } // ~35fps cap
      var dt = Math.min((now - (lastFrame || now - 16)) / 1000, 0.06); lastFrame = now;
      if (introT < 1) introT = Math.min(1, introT + dt / 2.1);
      target = computeTarget();
      var diff = target - cur;
      cur = Math.abs(diff) < 0.0004 ? target : cur + diff * (1 - Math.exp(-dt * 8));
      for (var k = 0; k < N; k++) {
        var e = k + 0.88;
        if ((prev < e && cur >= e) || (prev >= e && cur < e)) spawnImpact(k);
      }
      prev = cur;
      draw(dt);
      hud();
      if (busy()) raf = requestAnimationFrame(tick); else lastFrame = 0;
    }
    function wake() { if (!raf && visible && !document.hidden && !reduce) raf = requestAnimationFrame(tick); }
    function hud() {
      var idx = clamp(Math.round(cur), 0, N);
      hudRail.style.setProperty("--p", (cur / N).toFixed(3));
      if (idx !== activeIdx) {
        activeIdx = idx;
        hudNum.textContent = "0" + idx;
        hudZone.textContent = chapters[idx].getAttribute("data-zone");
        var id = "#" + chapters[idx].id;
        navLinks.forEach(function (a) { a.classList.toggle("is-active", a.getAttribute("href") === id); });
      }
    }
    function staticFrame() { cur = 0; prev = 0; introT = 1; draw(0.016); hudNum.textContent = "00"; hudZone.textContent = "Serve"; }

    resize();
    var rto = 0;
    window.addEventListener("resize", function () {
      clearTimeout(rto);
      rto = setTimeout(function () { resize(); if (reduce) staticFrame(); else wake(); }, 80);
    });
    if ("ResizeObserver" in window) new ResizeObserver(function () { measure(); wake(); }).observe($(".chapters"));
    window.addEventListener("load", function () { measure(); wake(); });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { measure(); if (reduce) staticFrame(); });

    window.addEventListener("mav-theme", function () { readPalette(); if (reduce) staticFrame(); else { draw(0.016); wake(); } });
    // the audience switch re-orders the chapters and re-colours the accent: refresh everything the stage knows
    AUD.on(function () {
      chapters = $$(".chapter"); readPalette(); activeIdx = -1; measure();
      if (reduce) { staticFrame(); } else { cur = target = prev = computeTarget(); wake(); }
    });

    if (reduce) { staticFrame(); return; }
    window.addEventListener("scroll", wake, { passive: true });
    cur = target = prev = computeTarget();
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (en) { visible = en[0].isIntersecting; if (visible) wake(); }, { threshold: 0 }).observe(cinema);
    }
    document.addEventListener("visibilitychange", function () { if (!document.hidden) wake(); });
    wake();
  })();
})();
