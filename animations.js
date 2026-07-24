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

  document.addEventListener("DOMContentLoaded", function () {
    initNav();
    initHamburger();
  });
})();
