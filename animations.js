(function () {
  "use strict";

  function initNav() {
    var nav = document.getElementById("siteNav");
    if (!nav) return;
    var lastY = window.pageYOffset;

    window.addEventListener("scroll", function () {
      var y = window.pageYOffset;
      nav.classList.toggle("nav-shrink", y > 50);
      if (y > lastY && y > 150) {
        nav.classList.add("nav-hide");
      } else {
        nav.classList.remove("nav-hide");
      }
      lastY = y;
    }, { passive: true });
  }

  function initHamburger() {
    var btn = document.getElementById("hamburgerBtn");
    var menu = document.getElementById("mobileMenu");
    if (!btn || !menu) return;

    function close() {
      btn.setAttribute("aria-expanded", "false");
      menu.classList.remove("is-open");
      menu.setAttribute("aria-hidden", "true");
    }
    function open() {
      btn.setAttribute("aria-expanded", "true");
      menu.classList.add("is-open");
      menu.setAttribute("aria-hidden", "false");
    }

    btn.addEventListener("click", function () {
      var isOpen = btn.getAttribute("aria-expanded") === "true";
      isOpen ? close() : open();
    });
    menu.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", close);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") close();
    });
    document.addEventListener("click", function (e) {
      if (menu.classList.contains("is-open") && !menu.contains(e.target) && e.target !== btn && !btn.contains(e.target)) {
        close();
      }
    });
    window.addEventListener("resize", function () {
      if (window.innerWidth > 768) close();
    });
  }

  function initHeroStagger() {
    var lines = document.querySelectorAll(".reveal-line");
    if (!lines.length) return;
    var reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      lines.forEach(function (el) { el.classList.add("is-visible"); });
      return;
    }
    lines.forEach(function (el, i) {
      setTimeout(function () { el.classList.add("is-visible"); }, 300 + i * 150);
    });
  }

  function initTabs() {
    var list = document.querySelector(".tab-list");
    if (!list) return;
    var buttons = Array.prototype.slice.call(list.querySelectorAll(".tab-btn"));
    var panels = Array.prototype.slice.call(document.querySelectorAll(".tab-panel"));
    var highlight = list.querySelector(".tab-highlight");
    var tabHeightPx = parseInt(getComputedStyle(document.documentElement).getPropertyValue("--tab-height"), 10) || 42;
    var tabWidthPx = parseInt(getComputedStyle(document.documentElement).getPropertyValue("--tab-width"), 10) || 120;

    function activate(index) {
      buttons.forEach(function (b, i) {
        var active = i === index;
        b.classList.toggle("is-active", active);
        b.setAttribute("aria-selected", active ? "true" : "false");
        b.tabIndex = active ? 0 : -1;
      });
      panels.forEach(function (p, i) {
        var active = i === index;
        p.classList.toggle("is-active", active);
        p.hidden = !active;
      });
      var vertical = window.innerWidth > 600;
      highlight.style.transform = vertical
        ? "translateY(" + index * tabHeightPx + "px)"
        : "translateX(" + index * tabWidthPx + "px)";
    }

    buttons.forEach(function (btn, i) {
      btn.addEventListener("click", function () { activate(i); });
    });
    list.addEventListener("keydown", function (e) {
      var current = buttons.findIndex(function (b) { return b.classList.contains("is-active"); });
      if (e.key === "ArrowDown" || e.key === "ArrowRight") {
        e.preventDefault();
        var next = (current + 1) % buttons.length;
        activate(next);
        buttons[next].focus();
      } else if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
        e.preventDefault();
        var prev = (current - 1 + buttons.length) % buttons.length;
        activate(prev);
        buttons[prev].focus();
      }
    });
    window.addEventListener("resize", function () {
      var current = buttons.findIndex(function (b) { return b.classList.contains("is-active"); });
      activate(current);
    });
  }

  function initShowMore() {
    var grid = document.getElementById("projectsGrid");
    var btn = document.getElementById("showMoreBtn");
    if (!grid || !btn) return;
    btn.addEventListener("click", function () {
      var showing = grid.classList.toggle("show-all");
      btn.textContent = showing ? "Show Less" : "Show More";
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    initNav();
    initHamburger();
    initHeroStagger();
    initTabs();
    initShowMore();
  });
})();
