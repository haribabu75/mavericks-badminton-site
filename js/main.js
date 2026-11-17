(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ---------- Smash click burst on buttons ----------
  if (!reduceMotion) {
    document.querySelectorAll(".btn").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var rect = btn.getBoundingClientRect();
        var cx = rect.left + rect.width / 2;
        var cy = rect.top + rect.height / 2;
        for (var i = 0; i < 10; i++) {
          var p = document.createElement("span");
          p.className = "smash-particle";
          var angle = Math.random() * 2 * Math.PI;
          var dist = 40 + Math.random() * 40;
          p.style.setProperty("--dx", Math.cos(angle) * dist + "px");
          p.style.setProperty("--dy", Math.sin(angle) * dist + "px");
          p.style.left = cx + "px";
          p.style.top = cy + "px";
          document.body.appendChild(p);
          p.addEventListener("animationend", function () { this.remove(); });
        }
      });
    });
  }

  // ---------- Tournament countdown ----------
  var cdEl = document.querySelector(".countdown-timer");
  if (cdEl) {
    var target = new Date(cdEl.getAttribute("data-target")).getTime();
    var dEl = document.getElementById("cd-days");
    var hEl = document.getElementById("cd-hours");
    var mEl = document.getElementById("cd-mins");
    var sEl = document.getElementById("cd-secs");
    var updateCd = function () {
      var diff = Math.max(target - Date.now(), 0);
      var d = Math.floor(diff / 86400000); diff -= d * 86400000;
      var h = Math.floor(diff / 3600000); diff -= h * 3600000;
      var m = Math.floor(diff / 60000); diff -= m * 60000;
      var s = Math.floor(diff / 1000);
      dEl.textContent = String(d).padStart(2, "0");
      hEl.textContent = String(h).padStart(2, "0");
      mEl.textContent = String(m).padStart(2, "0");
      sEl.textContent = String(s).padStart(2, "0");
    };
    updateCd();
    setInterval(updateCd, 1000);
  }

  // ---------- Liquid blob parallax ----------
  var blobs = document.querySelectorAll(".blob[data-speed]");
  if (blobs.length && !reduceMotion) {
    window.addEventListener("scroll", function () {
      var y = window.scrollY;
      blobs.forEach(function (b) {
        var speed = parseFloat(b.getAttribute("data-speed")) || 0.1;
        b.style.transform = "translateY(" + y * speed + "px)";
      });
    }, { passive: true });
  }

  // ---------- Stories bar modal ----------
  var storyModal = document.getElementById("story-modal");
  if (storyModal) {
    var storyText = document.getElementById("story-modal-text");
    document.querySelectorAll(".story-bubble").forEach(function (b) {
      b.addEventListener("click", function () {
        storyText.textContent = b.getAttribute("data-story");
        storyModal.hidden = false;
      });
    });
    storyModal.querySelectorAll("[data-close]").forEach(function (el) {
      el.addEventListener("click", function () { storyModal.hidden = true; });
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") storyModal.hidden = true;
    });
  }

  // ---------- Card detail modals (e.g. Junior Coaching) ----------
  document.querySelectorAll("[data-modal-target]").forEach(function (trigger) {
    var modal = document.getElementById(trigger.getAttribute("data-modal-target"));
    if (!modal) return;
    var open = function () { modal.hidden = false; };
    trigger.addEventListener("click", open);
    trigger.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(); }
    });
    modal.querySelectorAll("[data-close]").forEach(function (el) {
      el.addEventListener("click", function () { modal.hidden = true; });
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") modal.hidden = true;
    });
  });

  // ---------- Hero particle background ----------
  var particleCanvas = document.getElementById("hero-particles");
  if (particleCanvas && !reduceMotion) {
    var pctx = particleCanvas.getContext("2d");
    var particles = [];
    var heroSection = particleCanvas.closest(".hero");
    var resizeCanvas = function () {
      particleCanvas.width = heroSection.offsetWidth;
      particleCanvas.height = heroSection.offsetHeight;
    };
    var makeParticles = function () {
      var count = Math.min(36, Math.floor((particleCanvas.width * particleCanvas.height) / 22000));
      particles = [];
      for (var i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * particleCanvas.width,
          y: Math.random() * particleCanvas.height,
          r: 1.5 + Math.random() * 2.5,
          vy: 0.15 + Math.random() * 0.35,
          vx: (Math.random() - 0.5) * 0.3,
          o: 0.15 + Math.random() * 0.25
        });
      }
    };
    resizeCanvas();
    makeParticles();
    window.addEventListener("resize", function () {
      resizeCanvas();
      makeParticles();
    });
    (function drawParticles() {
      pctx.clearRect(0, 0, particleCanvas.width, particleCanvas.height);
      particles.forEach(function (p) {
        p.y -= p.vy;
        p.x += p.vx;
        if (p.y < -10) p.y = particleCanvas.height + 10;
        if (p.x < -10) p.x = particleCanvas.width + 10;
        if (p.x > particleCanvas.width + 10) p.x = -10;
        pctx.beginPath();
        pctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        pctx.fillStyle = "rgba(42, 169, 190, " + p.o + ")";
        pctx.fill();
      });
      requestAnimationFrame(drawParticles);
    })();
  }

  // ---------- Journey scroll reveal + shuttle position ----------
  var journeyTrack = document.querySelector(".journey-track");
  if (journeyTrack) {
    var journeyItems = journeyTrack.querySelectorAll(".journey-item");
    if ("IntersectionObserver" in window) {
      var jObs = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) entry.target.classList.add("in-view");
        });
      }, { threshold: 0.4 });
      journeyItems.forEach(function (it) { jObs.observe(it); });
    } else {
      journeyItems.forEach(function (it) { it.classList.add("in-view"); });
    }

    var shuttle = journeyTrack.querySelector("[data-journey-shuttle]");
    if (shuttle && !reduceMotion) {
      var moveShuttle = function () {
        var rect = journeyTrack.getBoundingClientRect();
        var vh = window.innerHeight;
        var progress = (vh - rect.top) / (rect.height + vh);
        progress = Math.max(0, Math.min(1, progress));
        shuttle.style.top = progress * (rect.height - 30) + "px";
      };
      moveShuttle();
      window.addEventListener("scroll", moveShuttle, { passive: true });
      window.addEventListener("resize", moveShuttle);
    }
  }
})();
