(function () {
  "use strict";

  function initSidebarNav() {
    var links = Array.prototype.slice.call(document.querySelectorAll(".sidebar-nav a"))
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
    }, { rootMargin: "-40% 0px -55% 0px" });

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
      items.forEach(function (el) { el.classList.add("is-visible"); });
      return;
    }
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    items.forEach(function (el) { observer.observe(el); });
  }

  document.addEventListener("DOMContentLoaded", function () {
    initSidebarNav();
    initCursorGlow();
    initReveal();
  });
})();
