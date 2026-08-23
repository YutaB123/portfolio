(function () {
  "use strict";

  function initTopbarNav() {
    var links = Array.prototype.slice.call(document.querySelectorAll(".topbar-nav a"))
      .filter(function (a) { return a.getAttribute("href").charAt(0) === "#"; });
    if (!links.length) return;
    var sections = links.map(function (a) {
      return document.querySelector(a.getAttribute("href"));
    });

    if (!("IntersectionObserver" in window)) {
      links[0].classList.add("is-active");
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        var i = sections.indexOf(entry.target);
        if (entry.isIntersecting && i !== -1) {
          links.forEach(function (l) { l.classList.remove("is-active"); });
          links[i].classList.add("is-active");
        }
      });
      // Top of the page sits above #about, so nothing is active there.
    }, { rootMargin: "-30% 0px -60% 0px" });

    sections.forEach(function (s) { if (s) observer.observe(s); });
  }

  function initCursorGlow() {
    var glow = document.querySelector(".cursor-glow");
    if (!glow || !matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    var raf = null;
    document.addEventListener("mousemove", function (e) {
      if (raf) return;
      raf = requestAnimationFrame(function () {
        glow.style.setProperty("--x", e.clientX + "px");
        glow.style.setProperty("--y", e.clientY + "px");
        raf = null;
      });
    });
  }

  function initReveal() {
    var reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    var items = document.querySelectorAll(".reveal");
    if (reduced || !("IntersectionObserver" in window)) {
      Array.prototype.forEach.call(items, function (el) { el.classList.add("is-visible"); });
      return;
    }

    // Items that scroll into view together (grid cards, timeline entries) look
    // better cascading than snapping in as one block. Stagger by position
    // within the batch, capped so a 12-card grid doesn't crawl.
    var observer = new IntersectionObserver(function (entries) {
      var batch = entries.filter(function (e) { return e.isIntersecting; });
      batch.sort(function (a, b) {
        return a.boundingClientRect.top - b.boundingClientRect.top;
      });
      batch.forEach(function (entry, i) {
        entry.target.style.transitionDelay = Math.min(i * 40, 240) + "ms";
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });

    Array.prototype.forEach.call(items, function (el) { observer.observe(el); });
  }

  document.addEventListener("DOMContentLoaded", function () {
    initTopbarNav();
    initCursorGlow();
    initReveal();
  });
})();
